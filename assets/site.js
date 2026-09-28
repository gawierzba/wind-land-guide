(() => {
  const script = document.currentScript;
  const siteRoot = script ? new URL("../", script.src) : new URL("/", location.href);
  const plRoot = new URL("pl/", siteRoot);

  const url = p => new URL(String(p || "").replace(/^\//, ""), siteRoot).href;
  const normalize = value => String(value || "")
    .toLocaleLowerCase("pl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  function scoreMaterial(material, rawQuery) {
    const query = normalize(rawQuery);
    if (!query) return 1;

    const tokens = query.split(/\s+/).filter(Boolean);
    const title = normalize(material.title);
    const keywords = normalize((material.keywords || []).join(" "));
    const category = normalize(material.category || "");
    const haystack = normalize([
      material.id,
      material.title,
      material.category,
      ...(material.keywords || [])
    ].join(" "));

    if (!tokens.every(token => haystack.includes(token))) return 0;

    let score = 10;
    if (title.includes(query)) score += 30;
    if (keywords.includes(query)) score += 18;
    if (category.includes(query)) score += 8;
    tokens.forEach(token => {
      if (title.includes(token)) score += 6;
      if (keywords.includes(token)) score += 4;
    });
    return score;
  }

  function openSearch(initial = "") {
    let panel = document.querySelector("#global-search-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "global-search-panel";
      panel.className = "search-panel";
      panel.innerHTML = `
        <div class="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
          <div class="search-head">
            <div><div class="eyebrow">Przeszukaj kompendium</div><h2 id="search-title">Czego chcesz się dowiedzieć?</h2></div>
            <button class="search-close" type="button" aria-label="Zamknij wyszukiwarkę">×</button>
          </div>
          <input class="search-input" type="search" placeholder="np. czynsz, dopłaty, kabel, księga wieczysta, demontaż…" autocomplete="off">
          <div class="search-hint">Szukamy po tytułach, obszarach i słowach kluczowych wszystkich materiałów GUIDE.</div>
          <div class="search-results" aria-live="polite"></div>
        </div>`;
      document.body.append(panel);

      const input = panel.querySelector(".search-input");
      const results = panel.querySelector(".search-results");
      let materials = [];

      fetch(url("content-index.json"))
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => { materials = data.materials || []; render(input.value); })
        .catch(() => { results.innerHTML = '<p class="search-empty">Nie udało się wczytać indeksu materiałów.</p>'; });

      function render(q) {
        if (!materials.length) return;

        const query = (q || "").trim();
        const found = materials
          .map(x => ({...x, _score: scoreMaterial(x, query)}))
          .filter(x => x._score > 0)
          .sort((a, b) => b._score - a._score || a.id.localeCompare(b.id))
          .slice(0, 14);

        if (!found.length) {
          results.innerHTML = '<p class="search-empty">Brak trafienia. Spróbuj prostszego hasła, np. „czynsz”, „kabel”, „dopłaty”, „bank” albo „demontaż”.</p>';
          return;
        }

        results.innerHTML = found.map(x =>
          `<a class="search-result" href="${url(x.path)}">
            <span>${escapeHtml(x.id)}</span>
            <span class="search-result-copy">
              <strong>${escapeHtml(x.title)}</strong>
              ${x.category ? `<small>${escapeHtml(x.category)}</small>` : ""}
            </span>
          </a>`
        ).join("");
      }

      input.addEventListener("input", () => render(input.value));
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
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
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
      openSearch(q);
    });
  });

  document.querySelectorAll("[data-search-query]").forEach(trigger => {
    trigger.addEventListener("click", e => {
      e.preventDefault();
      openSearch(trigger.dataset.searchQuery || trigger.textContent || "");
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
      e.preventDefault(); openSearch();
    }
    if (e.key === "Escape") closeSearch();
  });
})();