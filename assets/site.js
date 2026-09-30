
(() => {
  function injectStructuredData() {
    if (location.pathname.startsWith("/pl/") || location.pathname.startsWith("/en/")) return;
    if (document.querySelector('script[data-structured-data="grunt-i-wiatr"]')) return;

    const canonical = document.querySelector('link[rel="canonical"]')?.href || location.href.split("#")[0];
    const description = document.querySelector('meta[name="description"]')?.content || "";
    const h1 = document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() || document.title;
    const path = new URL(canonical).pathname;
    const siteUrl = "https://gruntiwiatr.pl/";
    const siteId = "https://gruntiwiatr.pl/#website";
    const isGuide = /GUIDE-\d+/i.test(document.querySelector(".eyebrow")?.textContent || "");

    const sectionMap = [
      ["/zanim-podpiszesz/", "Zanim podpiszesz"],
      ["/umowa/", "Umowa"],
      ["/realizacja/", "Realizacja"],
      ["/koniec-inwestycji/", "Koniec inwestycji"],
      ["/projekt/", "Projekt"]
    ];

    const crumbs = [{ "@type": "ListItem", position: 1, name: "Grunt i wiatr", item: siteUrl }];
    const section = sectionMap.find(([prefix]) => path.startsWith(prefix));

    if (section && path !== "/") {
      crumbs.push({
        "@type": "ListItem",
        position: crumbs.length + 1,
        name: section[1],
        item: "https://gruntiwiatr.pl" + section[0]
      });
    }

    const currentAlreadyListed = crumbs.some(item => item.item === canonical);
    if (path !== "/" && !currentAlreadyListed) {
      crumbs.push({
        "@type": "ListItem",
        position: crumbs.length + 1,
        name: h1,
        item: canonical
      });
    }

    const page = {
      "@type": isGuide ? "Article" : "WebPage",
      "@id": canonical + "#page",
      url: canonical,
      name: h1,
      headline: isGuide ? h1 : undefined,
      description,
      inLanguage: "pl-PL",
      isPartOf: { "@id": siteId }
    };
    Object.keys(page).forEach(key => page[key] === undefined && delete page[key]);

    const graph = [
      {
        "@type": "WebSite",
        "@id": siteId,
        url: siteUrl,
        name: "Grunt i wiatr",
        description: "Niezależne kompendium dla właścicieli gruntów zainteresowanych energetyką wiatrową.",
        inLanguage: "pl-PL"
      },
      page
    ];

    if (crumbs.length > 1) {
      graph.push({
        "@type": "BreadcrumbList",
        "@id": canonical + "#breadcrumbs",
        itemListElement: crumbs
      });
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.dataset.structuredData = "grunt-i-wiatr";
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectStructuredData, { once: true });
  } else {
    injectStructuredData();
  }
})();

(() => {
  // Cloudflare Web Analytics — privacy-friendly, cookie-free pageview analytics.
  if (!document.querySelector('script[data-cf-beacon]')) {
    const beacon = document.createElement('script');
    beacon.type = 'module';
    beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    beacon.dataset.cfBeacon = JSON.stringify({ token: 'e045c3b1dd2b4fcc8bccfca023400ae0' });
    document.head.appendChild(beacon);
  }
})();

(() => {
  const siteRoot = new URL("/", location.href);
  const plRoot = siteRoot;
  let fullTextIndexPromise = null;

  const url = p => new URL(String(p || "").replace(/^\//, ""), siteRoot).href;

  function configureExternalLinks() {
    document.querySelectorAll("a[href]").forEach(a => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      let targetUrl;
      try {
        targetUrl = new URL(href, location.href);
      } catch {
        return;
      }

      if (!["http:", "https:"].includes(targetUrl.protocol)) return;
      if (targetUrl.origin === location.origin) return;

      a.target = "_blank";
      const rel = new Set((a.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
      rel.add("noopener");
      rel.add("noreferrer");
      a.setAttribute("rel", [...rel].join(" "));
    });
  }

  configureExternalLinks();

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
    if (!nav.querySelector(".nav-guides")) {
      const a = document.createElement("a");
      a.className = "nav-guides";
      a.href = new URL("guide/", siteRoot).href;
      a.textContent = "GUIDE-y";
      nav.insertBefore(a, nav.querySelector(".lang"));
    }
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
    <a href="${new URL("#sciezki", siteRoot).href}">Ścieżki</a>
    <button type="button" data-mobile-search>Szukaj</button>
    <a href="${new URL("zrodla/", siteRoot).href}">Źródła</a>`;
  document.body.append(dock);
  dock.querySelector("[data-mobile-search]").addEventListener("click", () => openSearch());

  document.querySelectorAll(".footer .shell").forEach(f => {
    if (!f.querySelector(".privacy-link")) {
      const sep = document.createTextNode(" · ");
      const a = document.createElement("a");
      a.className = "privacy-link";
      a.href = new URL("prywatnosc/", siteRoot).href;
      a.textContent = "Prywatność i cookies";
      f.append(sep, a);
    }
    if (!f.querySelector(".contact-link")) {
      const sep = document.createTextNode(" · ");
      const a = document.createElement("a");
      a.className = "contact-link";
      a.href = new URL("kontakt/", siteRoot).href;
      a.textContent = "Kontakt";
      a.dataset.contact = "contact@grunt-i-wiatr-marker";
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

(() => {
  function enhanceArticleTools() {
    const article = document.querySelector(".article");
    if (!article) return;

    const meta = article.querySelector(".meta");
    if (meta && !article.querySelector(".article-tools")) {
      const tools = document.createElement("div");
      tools.className = "article-tools";
      tools.setAttribute("aria-label", "Narzędzia artykułu");
      tools.innerHTML = `
        <button type="button" data-print-article>Drukuj / PDF</button>
        <button type="button" data-copy-page>Kopiuj link</button>
      `;
      meta.insertAdjacentElement("afterend", tools);

      tools.querySelector("[data-print-article]").addEventListener("click", () => window.print());
      tools.querySelector("[data-copy-page]").addEventListener("click", async event => {
        const button = event.currentTarget;
        const original = button.textContent;
        try {
          await navigator.clipboard.writeText(location.href);
          button.textContent = "Skopiowano";
        } catch {
          const area = document.createElement("textarea");
          area.value = location.href;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.opacity = "0";
          document.body.appendChild(area);
          area.select();
          document.execCommand("copy");
          area.remove();
          button.textContent = "Skopiowano";
        }
        setTimeout(() => { button.textContent = original; }, 1600);
      });
    }

    article.querySelectorAll("h2[id]").forEach(h => {
      if (h.querySelector(".section-link")) return;
      const a = document.createElement("a");
      a.className = "section-link";
      a.href = "#" + encodeURIComponent(h.id);
      a.setAttribute("aria-label", "Link do sekcji: " + h.textContent.trim());
      a.title = "Kopiuj lub otwórz link do tej sekcji";
      a.textContent = "#";
      h.append(" ", a);
    });

    if (!document.querySelector(".reading-progress")) {
      const bar = document.createElement("div");
      bar.className = "reading-progress";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = "<span></span>";
      document.body.appendChild(bar);
      const fill = bar.firstElementChild;

      const update = () => {
        const rect = article.getBoundingClientRect();
        const start = window.scrollY + rect.top;
        const max = Math.max(1, article.offsetHeight - window.innerHeight * 0.55);
        const progress = Math.min(1, Math.max(0, (window.scrollY - start + 90) / max));
        fill.style.transform = `scaleX(${progress})`;
      };
      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update, { passive: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceArticleTools, { once: true });
  } else {
    enhanceArticleTools();
  }
})();


(() => {
  function enhanceTrustLayer() {
    const article = document.querySelector(".article");
    if (article && /GUIDE-\d+/i.test(article.querySelector(".eyebrow")?.textContent || "") && !article.querySelector(".source-status")) {
      const meta = article.querySelector(".meta");
      if (meta) {
        const box = document.createElement("div");
        box.className = "source-status";
        const root = new URL("/", location.href);
        box.innerHTML = '<span>ŹRÓDŁA I STAN PRAWNY</span><strong>Weryfikacja: 28.09.2026</strong><a href="' +
          new URL("stan-prawny/", root).href +
          '">Zobacz rejestr weryfikacji →</a>';
        const tools = article.querySelector(".article-tools");
        (tools || meta).insertAdjacentElement("afterend", box);
      }
    }

    document.querySelectorAll(".footer .shell").forEach(f => {
      if (f.querySelector(".site-footer-links")) return;
      const root = new URL("/", location.href);
      const wrap = document.createElement("span");
      wrap.className = "site-footer-links";
      wrap.innerHTML =
        ' · <a href="' + new URL("metodologia/", root).href + '">Metodologia</a>' +
        ' · <a href="' + new URL("zrodla/", root).href + '">Źródła</a>' +
        ' · <a href="' + new URL("stan-prawny/", root).href + '">Stan prawny</a>' +
        ' · <a href="' + new URL("korekty/", root).href + '">Korekty</a>';
      f.appendChild(wrap);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceTrustLayer, { once: true });
  } else {
    enhanceTrustLayer();
  }
})();


(() => {
  function initContactPage() {
    const form = document.querySelector("[data-contact-form]");
    if (!form) return;

    const copy = document.querySelector("[data-copy-contact-email]");
    if (copy) {
      copy.addEventListener("click", async () => {
        const original = copy.textContent;
        try {
          await navigator.clipboard.writeText("kontakt@gruntiwiatr.pl");
          copy.textContent = "Skopiowano adres";
        } catch {
          copy.textContent = "kontakt@gruntiwiatr.pl";
        }
        setTimeout(() => { copy.textContent = original; }, 1800);
      });
    }

    form.addEventListener("submit", event => {
      event.preventDefault();

      const data = new FormData(form);
      const category = String(data.get("category") || "Inna sprawa");
      const name = String(data.get("name") || "").trim();
      const reply = String(data.get("reply") || "").trim();
      const page = String(data.get("page") || "").trim();
      const message = String(data.get("message") || "").trim();

      if (!message) {
        form.querySelector("[name='message']")?.focus();
        return;
      }

      const subject = "[Grunt i wiatr] " + category;
      const body = [
        "Dzień dobry,",
        "",
        message,
        "",
        page ? "Dotyczy strony: " + page : "",
        name ? "Imię / nazwa: " + name : "",
        reply ? "Adres do odpowiedzi: " + reply : "",
        "",
        "Wiadomość przygotowana przez formularz kontaktowy gruntiwiatr.pl"
      ].filter((line, i, arr) => line !== "" || (i > 0 && arr[i - 1] !== "")).join("\n");

      location.href = "mailto:kontakt@gruntiwiatr.pl?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContactPage, { once: true });
  } else {
    initContactPage();
  }
})();


(() => {
  async function initGuideCatalog() {
    const root = document.querySelector("[data-guide-catalog]");
    if (!root) return;

    const siteRoot = new URL("../", document.currentScript?.src || location.href);
    const escapeHtml = value => String(value || "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

    try {
      const response = await fetch(new URL("content-index.json", siteRoot));
      if (!response.ok) throw new Error("index");
      const data = await response.json();
      const guides = (data.materials || []).filter(item => /^GUIDE-\d+$/i.test(item.id || ""));
      const categories = [...new Set(guides.map(g => g.category).filter(Boolean))].sort((a,b) => a.localeCompare(b, "pl"));

      root.innerHTML = `
        <div class="guide-catalog-controls">
          <label class="guide-catalog-search">
            <span>Szukaj po temacie lub słowie</span>
            <input type="search" data-guide-filter placeholder="np. czynsz, kabel, pełnomocnictwo, demontaż…">
          </label>

          <div class="guide-catalog-chips" data-guide-categories>
            <button type="button" class="selected" data-category="">Wszystkie</button>
            ${categories.map(c => `<button type="button" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}
          </div>

          <div class="guide-catalog-mobilebar">
            <button type="button" class="guide-mobile-filter-button" data-guide-mobile-open aria-haspopup="dialog" aria-expanded="false">
              <span>Temat</span>
              <strong data-guide-mobile-label>Wszystkie tematy</strong>
              <b>Filtruj</b>
            </button>
          </div>

          <div class="guide-catalog-count" data-guide-count></div>
        </div>

        <div class="guide-filter-sheet" data-guide-filter-sheet aria-hidden="true">
          <button class="guide-filter-backdrop" type="button" data-guide-mobile-close aria-label="Zamknij wybór tematów"></button>
          <div class="guide-filter-panel" role="dialog" aria-modal="true" aria-labelledby="guide-filter-title">
            <div class="guide-filter-head">
              <div>
                <div class="eyebrow">Katalog GUIDE</div>
                <h2 id="guide-filter-title">Wybierz temat</h2>
              </div>
              <button type="button" class="guide-filter-close" data-guide-mobile-close aria-label="Zamknij">×</button>
            </div>
            <div class="guide-filter-options" data-guide-mobile-categories>
              <button type="button" class="selected" data-mobile-category="">Wszystkie tematy</button>
              ${categories.map(c => `<button type="button" data-mobile-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}
            </div>
          </div>
        </div>

        <div class="guide-catalog-grid" data-guide-list></div>`;

      const input = root.querySelector("[data-guide-filter]");
      const list = root.querySelector("[data-guide-list]");
      const count = root.querySelector("[data-guide-count]");
      const mobileOpen = root.querySelector("[data-guide-mobile-open]");
      const mobileLabel = root.querySelector("[data-guide-mobile-label]");
      const sheet = root.querySelector("[data-guide-filter-sheet]");
      let activeCategory = "";

      const closeMobileFilters = () => {
        sheet.classList.remove("open");
        sheet.setAttribute("aria-hidden", "true");
        mobileOpen.setAttribute("aria-expanded", "false");
        document.body.classList.remove("guide-filter-open");
      };

      const openMobileFilters = () => {
        sheet.classList.add("open");
        sheet.setAttribute("aria-hidden", "false");
        mobileOpen.setAttribute("aria-expanded", "true");
        document.body.classList.add("guide-filter-open");
        setTimeout(() => sheet.querySelector(".guide-filter-options .selected")?.focus(), 30);
      };

      const setCategory = category => {
        activeCategory = category || "";
        mobileLabel.textContent = activeCategory || "Wszystkie tematy";
        root.querySelectorAll("[data-category]").forEach(b => b.classList.toggle("selected", (b.dataset.category || "") === activeCategory));
        root.querySelectorAll("[data-mobile-category]").forEach(b => b.classList.toggle("selected", (b.dataset.mobileCategory || "") === activeCategory));
        render();
      };

      const normalize = v => String(v || "").toLocaleLowerCase("pl").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const render = () => {
        const query = normalize(input.value);
        const filtered = guides.filter(g => {
          const catOk = !activeCategory || g.category === activeCategory;
          const haystack = normalize([g.id,g.title,g.category,...(g.keywords || [])].join(" "));
          return catOk && (!query || haystack.includes(query));
        });

        count.textContent = `${filtered.length} z ${guides.length} materiałów`;
        list.innerHTML = filtered.length ? filtered.map(g => `
          <a class="guide-catalog-card" href="${escapeHtml(g.path)}">
            <div class="guide-catalog-meta"><span>${escapeHtml(g.id)}</span><span>${escapeHtml(g.category || "GUIDE")}</span></div>
            <h2>${escapeHtml(g.title)}</h2>
            <p>${escapeHtml((g.keywords || []).slice(0,6).join(" · "))}</p>
            <strong>Otwórz GUIDE →</strong>
          </a>`).join("") : '<div class="guide-catalog-empty">Nie znaleziono materiału dla tego hasła. Spróbuj innego słowa albo wybierz „Wszystkie”.</div>';
      };

      input.addEventListener("input", render);

      root.querySelectorAll("[data-category]").forEach(button => {
        button.addEventListener("click", () => setCategory(button.dataset.category || ""));
      });

      root.querySelectorAll("[data-mobile-category]").forEach(button => {
        button.addEventListener("click", () => {
          setCategory(button.dataset.mobileCategory || "");
          closeMobileFilters();
        });
      });

      mobileOpen.addEventListener("click", openMobileFilters);
      root.querySelectorAll("[data-guide-mobile-close]").forEach(button => button.addEventListener("click", closeMobileFilters));
      document.addEventListener("keydown", event => {
        if (event.key === "Escape" && sheet.classList.contains("open")) closeMobileFilters();
      });

      render();
    } catch (_) {
      root.innerHTML = '<div class="notice">Nie udało się wczytać katalogu. Skorzystaj z wyszukiwarki w górnym menu.</div>';
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGuideCatalog, { once:true });
  } else {
    initGuideCatalog();
  }
})();


(() => {
  const KEY = "grunt-i-wiatr:project-profile:v1";
  const defaults = {
    projectName:"",
    stage:"",
    location:"",
    municipality:"",
    cadastralDistrict:"",
    plots:"",
    landRegisters:"",
    area:"",
    ownerName:"",
    farmName:"",
    ownerContact:"",
    investorName:"",
    investorKrs:"",
    investorContact:"",
    contractNumber:"",
    contractDate:"",
    reservationUntil:"",
    mainRentFrom:"",
    constructionStart:"",
    plannedOperationEnd:"",
    documents:"",
    notes:""
  };

  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "null");
      return value && typeof value === "object" ? {...defaults,...value} : {...defaults};
    } catch {
      return {...defaults};
    }
  }

  function write(profile) {
    const clean = {...defaults,...(profile || {})};
    try {
      localStorage.setItem(KEY,JSON.stringify(clean));
      document.dispatchEvent(new CustomEvent("gruntwiatr:project-updated",{detail:clean}));
    } catch {}
    return clean;
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch {}
    document.dispatchEvent(new CustomEvent("gruntwiatr:project-updated",{detail:{...defaults}}));
  }

  function projectLabel(profile = read()) {
    const parts = [
      profile.projectName,
      profile.location,
      profile.plots ? "dz. " + profile.plots.replace(/\n+/g,", ") : ""
    ].map(v => String(v || "").trim()).filter(Boolean);
    return parts.join(" · ");
  }

  function defaultsForTools(profile = read()) {
    const plots = String(profile.plots || "").replace(/\n+/g,", ").trim();
    const district = String(profile.cadastralDistrict || "").trim();
    const plotLabel = [plots, district ? "obręb " + district : ""].filter(Boolean).join(", ");
    const kw = String(profile.landRegisters || "").replace(/\n+/g,", ").trim();
    return {
      project: projectLabel(profile),
      projectName: String(profile.projectName || "").trim(),
      plot: plotLabel,
      kw,
      owner: String(profile.ownerName || "").trim(),
      investor: String(profile.investorName || "").trim(),
      location: String(profile.location || "").trim(),
      municipality: String(profile.municipality || "").trim(),
      contractNumber: String(profile.contractNumber || "").trim(),
      contractDate: String(profile.contractDate || "").trim()
    };
  }

  window.GruntWiatrProject = {KEY,defaults:{...defaults},read,write,clear,projectLabel,defaultsForTools};

  function injectProjectContext() {
    const supported = ["/sprawdz-umowe/","/porownaj-oferty/","/protokoly/","/kalkulator-czynszu/"];
    if (!supported.some(path => location.pathname.startsWith(path))) return;
    if (document.querySelector(".project-context-bar")) return;

    const profile = read();
    const label = projectLabel(profile);
    if (!label) return;

    const target = document.querySelector("main .section .shell") || document.querySelector("main");
    if (!target) return;

    const bar = document.createElement("div");
    bar.className = "project-context-bar";
    bar.innerHTML = `<span>Pracujesz na projekcie: <strong></strong></span><a href="/moj-projekt/">Mój projekt →</a>`;
    bar.querySelector("strong").textContent = label;
    target.prepend(bar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded",injectProjectContext,{once:true});
  } else {
    injectProjectContext();
  }

  document.addEventListener("gruntwiatr:project-updated",() => {
    document.querySelector(".project-context-bar")?.remove();
    injectProjectContext();
  });
})();
