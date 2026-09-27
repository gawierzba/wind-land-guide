(() => {
  const script = document.currentScript;
  const siteRoot = script ? new URL("../", script.src) : new URL("/", location.href);
  const plRoot = new URL("pl/", siteRoot);

  const url = p => new URL(String(p || "").replace(/^\//, ""), siteRoot).href;

  function openSearch(initial = "") {
    let panel = document.querySelector("#global-search-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "global-search-panel";
      panel.className = "search-panel";
      panel.innerHTML = `
        <div class="search-dialog" role="dialog" aria-modal="true" aria-labelledby="search-title">
          <div class="search-head">
            <div><div class="eyebrow">Przeszukaj kompendium</div><h2 id="search-title">Czego szukasz?</h2></div>
            <button class="search-close" type="button" aria-label="Zamknij wyszukiwarkę">×</button>
          </div>
          <input class="search-input" type="search" placeholder="np. kabel, dopłaty, pełnomocnictwo…" autocomplete="off">
          <div class="search-hint">Wyszukiwanie obejmuje tytuły wszystkich materiałów GUIDE.</div>
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
        const query = (q || "").trim().toLocaleLowerCase("pl");
        const found = materials.filter(x => !query || (x.id + " " + x.title).toLocaleLowerCase("pl").includes(query)).slice(0, 12);
        if (!materials.length) return;
        if (!found.length) {
          results.innerHTML = '<p class="search-empty">Brak wyników. Spróbuj prostszego hasła.</p>';
          return;
        }
        results.innerHTML = found.map(x =>
          `<a class="search-result" href="${url(x.path)}"><span>${x.id}</span><strong>${escapeHtml(x.title)}</strong></a>`
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

  if (document.querySelector(".article")) {
    const article = document.querySelector(".article");
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