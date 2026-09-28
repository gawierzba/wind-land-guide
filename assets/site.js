(() => {
  const script = document.currentScript;
  const siteRoot = script ? new URL("../", script.src) : new URL("/", location.href);
  const plRoot = new URL("pl/", siteRoot);
  let fullTextIndexPromise = null;

  const url = p => new URL(String(p || "").replace(/^\//, ""), siteRoot).href;

  const normalize = value => String(value || "")
    .toLocaleLowerCase("pl")
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  }

  function extractArticle(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const article = doc.querySelector("article.article") || doc.querySelector("main") || doc.body;
    article.querySelectorAll("script,style,nav,.mobile-dock").forEach(el => el.remove());
    const text = (article.textContent || "").replace(/\s+/g, " ").trim();
    const headings = [...article.querySelectorAll("h1,h2,h3")]
      .map(h => (h.textContent || "").replace(/\s+/g, " ").trim())
      .filter(Boolean);
    return { text, headings };
  }

  function prepareSearchMaterial(material) {
    return {
      ...material,
      titleNorm: normalize(material.title || ""),
      categoryNorm: normalize(material.category || ""),
      keywordsNorm: normalize((material.keywords || []).join(" ")),
      headingsNorm: normalize((material.headings || []).join(" ")),
      textNorm: normalize(material.text || "")
    };
  }

  async function buildFullTextIndex() {
    const metaResponse = await fetch(url("content-index.json"));
    if (!metaResponse.ok) throw new Error("content-index");
    const data = await metaResponse.json();

    if (Array.isArray(data.searchIndexParts) && data.searchIndexParts.length) {
      try {
        const parts = await Promise.all(data.searchIndexParts.map(async part => {
          const response = await fetch(url(part));
          if (!response.ok) throw new Error(part);
          return response.json();
        }));
        return parts.flat().map(prepareSearchMaterial);
      } catch (_) {
        // Bezpieczny fallback: jeśli paczka indeksu nie załaduje się,
        // wyszukiwarka nadal może zbudować indeks z samych stron.
      }
    }

    const materials = [...(data.tools || []), ...(data.materials || [])];
    const loaded = await Promise.allSettled(materials.map(async material => {
      const response = await fetch(url(material.path));
      if (!response.ok) throw new Error(material.path);
      const html = await response.text();
      const extracted = extractArticle(html);
      return prepareSearchMaterial({
        ...material,
        text: extracted.text,
        headings: extracted.headings
      });
    }));

    return loaded
      .filter(result => result.status === "fulfilled")
      .map(result => result.value);
  }

  function getFullTextIndex() {
    if (!fullTextIndexPromise) fullTextIndexPromise = buildFullTextIndex();
    return fullTextIndexPromise;
  }

  function scoreMaterial(material, rawQuery) {
    const query = normalize(rawQuery);
    if (!query) return { score: 0, matched: 0, total: 0 };

    const tokens = query.split(/\s+/).filter(Boolean);
    const fields = [
      material.titleNorm,
      material.headingsNorm,
      material.textNorm,
      material.categoryNorm,
      material.keywordsNorm
    ];
    const matchedTokens = tokens.filter(token => fields.some(field => field.includes(token)));

    if (!matchedTokens.length) return { score: 0, matched: 0, total: tokens.length };

    let score = matchedTokens.length * 20;
    if (matchedTokens.length === tokens.length) score += 70;
    if (material.titleNorm.includes(query)) score += 90;
    if (material.headingsNorm.includes(query)) score += 55;
    if (material.textNorm.includes(query)) score += 35;
    if (material.categoryNorm.includes(query)) score += 18;
    if (material.keywordsNorm.includes(query)) score += 12;

    tokens.forEach(token => {
      if (material.titleNorm.includes(token)) score += 18;
      if (material.headingsNorm.includes(token)) score += 10;
      if (material.textNorm.includes(token)) score += 4;
    });

    return { score, matched: matchedTokens.length, total: tokens.length };
  }

  function makeSnippet(material, rawQuery) {
    const original = material.text || "";
    if (!original) return "";

    const query = normalize(rawQuery);
    const tokens = query.split(/\s+/).filter(Boolean);
    const lower = original.toLocaleLowerCase("pl");
    const candidates = [
      String(rawQuery || "").trim().toLocaleLowerCase("pl"),
      ...tokens
    ].filter(Boolean);

    let position = -1;
    for (const candidate of candidates) {
      position = lower.indexOf(candidate);
      if (position >= 0) break;
    }

    if (position < 0) {
      const normalizedText = normalize(original);
      for (const token of tokens) {
        const normalizedPos = normalizedText.indexOf(token);
        if (normalizedPos >= 0) {
          const ratio = normalizedText.length ? normalizedPos / normalizedText.length : 0;
          position = Math.floor(original.length * ratio);
          break;
        }
      }
    }

    if (position < 0) position = 0;
    const start = Math.max(0, position - 95);
    const end = Math.min(original.length, position + 220);
    let snippet = original.slice(start, end).trim();
    if (start > 0) snippet = "…" + snippet;
    if (end < original.length) snippet += "…";
    return snippet;
  }

  function openSearch(initial = "", trigger = document.activeElement) {
    if (trigger && trigger !== document.body) lastSearchTrigger = trigger;
    let panel = document.querySelector("#global-search-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "global-search-panel";
      panel.className = "search-panel";
      panel.innerHTML = `
        <div class="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
          <div class="search-head">
            <div><div class="eyebrow">Przeszukaj całe kompendium</div><h2 id="search-title">Wpisz dowolne słowo lub pytanie</h2></div>
            <button class="search-close" type="button" aria-label="Zamknij wyszukiwarkę">×</button>
          </div>
          <input class="search-input" type="search" aria-label="Szukaj w całym kompendium" placeholder="Np. koleiny, fundament, odsetki, mokre pole albo całe pytanie…" autocomplete="off">
          <div class="search-hint">Wyszukiwarka przegląda pełną treść wszystkich GUIDE-ów — tytuły, śródtytuły, akapity, checklisty i tabele.</div>
          <div class="search-results" aria-live="polite"><p class="search-empty">Ładowanie pełnego indeksu treści…</p></div>
        </div>`;
      document.body.append(panel);

      const input = panel.querySelector(".search-input");
      const results = panel.querySelector(".search-results");
      let materials = [];
      let ready = false;
      let debounce;

      function render(q) {
        const query = (q || "").trim();
        if (!ready) {
          results.innerHTML = '<p class="search-empty">Przeszukuję i indeksuję wszystkie materiały GUIDE…</p>';
          return;
        }
        if (!query) {
          results.innerHTML = '<p class="search-empty">Wpisz dowolne słowo, fragment zdania albo całe pytanie. Nie musisz znać przygotowanych haseł.</p>';
          return;
        }

        const found = materials
          .map(x => ({...x, _match: scoreMaterial(x, query)}))
          .filter(x => x._match.score > 0)
          .sort((a, b) =>
            b._match.matched - a._match.matched ||
            b._match.score - a._match.score ||
            a.id.localeCompare(b.id)
          )
          .slice(0, 16);

        if (!found.length) {
          results.innerHTML = '<p class="search-empty">Nie znalazłem tego słowa w treści GUIDE-ów. Spróbuj innej formy wyrazu albo krótszego fragmentu pytania.</p>';
          return;
        }

        results.innerHTML = found.map(x => `
          <a class="search-result" href="${url(x.path)}">
            <span>${escapeHtml(x.id)}</span>
            <span class="search-result-copy">
              <strong>${escapeHtml(x.title)}</strong>
              ${x.category ? `<small>${escapeHtml(x.category)}</small>` : ""}
              <em>${escapeHtml(makeSnippet(x, query))}</em>
            </span>
          </a>`
        ).join("");
      }

      getFullTextIndex()
        .then(index => {
          materials = index;
          ready = true;
          render(input.value);
        })
        .catch(() => {
          ready = true;
          results.innerHTML = '<p class="search-empty">Nie udało się wczytać pełnej treści kompendium.</p>';
        });

      input.addEventListener("input", () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => render(input.value), 80);
      });
      panel.querySelector(".search-close").addEventListener("click", closeSearch);
      panel.addEventListener("click", e => { if (e.target === panel) closeSearch(); });
    }

    panel.classList.add("open");
    document.body.classList.add("search-open");
    const input = panel.querySelector(".search-input");
    input.value = initial;
    input.dispatchEvent(new Event("input"));
    setTimeout(() => input.focus(), 30);
  }

  function closeSearch() {
    const panel = document.querySelector("#global-search-panel");
    if (panel) panel.classList.remove("open");
    document.body.classList.remove("search-open");
    if (lastSearchTrigger && typeof lastSearchTrigger.focus === "function") {
      setTimeout(() => lastSearchTrigger.focus(), 0);
    }
  }

  document.querySelectorAll(".navlinks").forEach(nav => {
    if (!nav.querySelector(".nav-search")) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "nav-search";
      b.textContent = "Szukaj";
      b.addEventListener("click", () => openSearch());
      nav.insertBefore(b, nav.querySelector(".lang"));
    }
  });

  document.querySelectorAll("[data-search-form]").forEach(form => {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const q = form.querySelector("input")?.value || "";
      openSearch(q, e.currentTarget);
    });
  });

  document.querySelectorAll("[data-search-query]").forEach(trigger => {
    trigger.addEventListener("click", e => {
      e.preventDefault();
      openSearch(trigger.dataset.searchQuery || trigger.textContent || "", trigger);
    });
  });

  if (document.querySelector(".article")) {
    const article = document.querySelector(".article");

    article.querySelectorAll("h2").forEach(h => {
      h.textContent = h.textContent.replace(/^\s*\d+\.\s+/, "");
    });
    const headings = [...article.querySelectorAll("h2")].filter(h => !h.closest(".related"));
    if (headings.length >= 3 && !article.querySelector(".article-toc")) {
      headings.forEach((h, i) => { if (!h.id) h.id = "sekcja-" + (i + 1); });
      const toc = document.createElement("nav");
      toc.className = "article-toc";
      toc.setAttribute("aria-label", "Spis treści");
      toc.innerHTML = '<div class="eyebrow">Na tej stronie</div><ol>' +
        headings.map(h => `<li><a href="#${h.id}">${escapeHtml(h.textContent)}</a></li>`).join("") +
        '</ol>';
      const meta = article.querySelector(".meta");
      (meta || article.querySelector("h1")).insertAdjacentElement("afterend", toc);
    }
  }

  const dock = document.createElement("nav");
  dock.className = "mobile-dock";
  dock.setAttribute("aria-label", "Nawigacja mobilna");
  dock.innerHTML = `
    <a href="${plRoot.href}">Start</a>
    <a href="${new URL("pl/#sciezki", siteRoot).href}">Ścieżki</a>
    <button type="button" data-mobile-search>Szukaj</button>
    <a href="${new URL("pl/zrodla/", siteRoot).href}">Źródła</a>`;
  document.body.append(dock);
  dock.querySelector("[data-mobile-search]").addEventListener("click", () => openSearch());

  document.querySelectorAll(".footer .shell").forEach(f => {
    if (!f.querySelector(".privacy-link")) {
      const sep = document.createTextNode(" · ");
      const a = document.createElement("a");
      a.className = "privacy-link";
      a.href = new URL("pl/prywatnosc/", siteRoot).href;
      a.textContent = "Prywatność i cookies";
      f.append(sep, a);
    }
  });

  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault(); openSearch("", document.activeElement);
    }
    if (e.key === "Escape") closeSearch();
  });
})();