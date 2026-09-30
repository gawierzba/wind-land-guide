(() => {
  const root = document.querySelector("[data-paragraph-map]");
  if (!root) return;

  let data = null;
  let mode = "paragraphs";
  let query = "";
  let scope = "all";

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));

  const normalize = value => String(value || "")
    .toLocaleLowerCase("pl")
    .replace(/ł/g,"l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9§]+/g," ")
    .replace(/\s+/g," ")
    .trim();

  function currentCounts() {
    return {
      paragraphs:data?.paragraphs?.length || 0,
      guides:data?.guides?.length || 0,
      mapped:data?.guides?.filter(g=>g.paragraphs.length).length || 0,
      unmapped:data?.guides?.filter(g=>!g.paragraphs.length).length || 0
    };
  }

  function matchesParagraph(p) {
    const hay = normalize([
      "§"+p.paragraph,
      p.title,
      p.kind,
      p.pdfPage,
      ...p.guides.flatMap(g=>[g.id,g.title,g.category])
    ].join(" "));
    return !query || hay.includes(normalize(query));
  }

  function matchesGuide(g) {
    const hay = normalize([
      g.id,g.title,g.category,
      ...g.paragraphs.flatMap(p=>["§"+p.paragraph,p.title,p.pdfPage])
    ].join(" "));
    const scopeOk = scope === "all" || (scope === "mapped" && g.paragraphs.length) || (scope === "unmapped" && !g.paragraphs.length);
    return scopeOk && (!query || hay.includes(normalize(query)));
  }

  function paragraphCard(p) {
    return `
      <article class="paragraph-map-row" id="paragraf-${p.paragraph}">
        <div class="paragraph-map-source">
          <div class="paragraph-map-number">§ ${p.paragraph}</div>
          <div>
            <span>${esc(p.kind)}</span>
            <h2>${esc(p.title)}</h2>
            <small>Wzorzec: s. ${p.pdfPage} PDF</small>
          </div>
        </div>
        <div class="paragraph-map-guides">
          ${p.guides.length ? p.guides.map(g=>`
            <a class="paragraph-guide-link" href="${esc(g.path)}">
              <span>${esc(g.id)}</span>
              <strong>${esc(g.title)}</strong>
              <small>${esc(g.category || "")}</small>
            </a>`).join("") : '<div class="paragraph-map-empty">Brak bezpośredniego przypisania GUIDE w aktualnej macierzy.</div>'}
        </div>
        <details class="paragraph-map-detail">
          <summary>Dlaczego uznano ten obszar za pokryty?</summary>
          <p>${esc(p.auditNote)}</p>
        </details>
      </article>`;
  }

  function guideCard(g) {
    return `
      <article class="guide-map-row ${g.paragraphs.length ? "" : "guide-map-unmapped"}" id="${esc(g.id.toLowerCase())}">
        <div class="guide-map-head">
          <div>
            <span>${esc(g.id)}</span>
            <h2><a href="${esc(g.path)}">${esc(g.title)}</a></h2>
            <small>${esc(g.category || "")}</small>
          </div>
          <a class="button" href="${esc(g.path)}">Otwórz GUIDE →</a>
        </div>
        <div class="guide-map-paragraphs">
          ${g.paragraphs.length ? g.paragraphs.map(p=>`
            <a href="#paragraf-${p.paragraph}" data-switch-to-paragraph="${p.paragraph}">
              <b>§ ${p.paragraph}</b>
              <span>${esc(p.title)}</span>
              <small>s. ${p.pdfPage} PDF</small>
            </a>`).join("") :
            '<div class="paragraph-map-empty"><strong>Materiał przekrojowy / startowy.</strong><br>W aktualnej macierzy nie ma jednego bezpośredniego przypisania do konkretnego §. To nie znaczy, że GUIDE nie korzysta z problemów obecnych we wzorcu.</div>'}
        </div>
      </article>`;
  }

  function render() {
    const counts = currentCounts();
    const paragraphList = (data.paragraphs || []).filter(matchesParagraph);
    const guideList = (data.guides || []).filter(matchesGuide);

    root.innerHTML = `
      <section class="paragraph-map-shell">
        <div class="paragraph-map-controls">
          <div class="paragraph-map-mode" role="tablist" aria-label="Kierunek mapy">
            <button type="button" class="${mode==="paragraphs"?"selected":""}" data-mode="paragraphs">§ → GUIDE</button>
            <button type="button" class="${mode==="guides"?"selected":""}" data-mode="guides">GUIDE → §</button>
          </div>

          <label class="paragraph-map-search">
            <span>Szukaj w mapie</span>
            <input type="search" data-map-search value="${esc(query)}" placeholder="${mode==="paragraphs" ? "np. §18, szkoda, gwarancja, kabel…" : "np. GUIDE-030, demontaż, pełnomocnictwo…"}">
          </label>

          ${mode==="guides" ? `
            <div class="paragraph-map-filter">
              <button type="button" class="${scope==="all"?"selected":""}" data-scope="all">Wszystkie</button>
              <button type="button" class="${scope==="mapped"?"selected":""}" data-scope="mapped">Z przypisaniem §</button>
              <button type="button" class="${scope==="unmapped"?"selected":""}" data-scope="unmapped">Przekrojowe</button>
            </div>` : ""}

          <div class="paragraph-map-stats">
            <span><strong>${counts.paragraphs}</strong> pozycji wzorca</span>
            <span><strong>${counts.guides}</strong> GUIDE-ów</span>
            <span><strong>${counts.mapped}</strong> GUIDE-ów z bezpośrednim przypisaniem</span>
            <span><strong>${counts.unmapped}</strong> przekrojowych / bez bezpośredniego przypisania</span>
          </div>
        </div>

        ${mode==="paragraphs" ? `
          <div class="paragraph-map-section-legend">
            <span><b>§1–§36</b> część główna umowy</span>
            <span><b>§37–§65</b> załączniki i dokumenty wykonawcze</span>
          </div>
          <div class="paragraph-map-list">
            ${paragraphList.length ? paragraphList.map(paragraphCard).join("") : '<div class="paragraph-map-empty">Nie znaleziono paragrafu ani GUIDE-a dla tego hasła.</div>'}
          </div>` : `
          <div class="guide-map-list">
            ${guideList.length ? guideList.map(guideCard).join("") : '<div class="paragraph-map-empty">Nie znaleziono GUIDE-a dla tego hasła lub filtra.</div>'}
          </div>`}

        <section class="paragraph-map-method">
          <h2>Co dokładnie oznacza przypisanie?</h2>
          <p>Przypisanie oznacza, że dany GUIDE został w audycie redakcyjnym użyty do pokrycia problemu występującego w konkretnym paragrafie albo załączniku wzorca. Nie oznacza, że GUIDE jest streszczeniem całego paragrafu linijka po linijce.</p>
          <p>Jeżeli jeden GUIDE pojawia się przy kilku paragrafach, oznacza to, że łączy ich wspólny problem właścicielski. Jeżeli GUIDE nie ma bezpośredniego przypisania, jest zwykle materiałem wejściowym, porównawczym albo przekrojowym.</p>
        </section>
      </section>`;

    bind();
  }

  function bind() {
    root.querySelectorAll("[data-mode]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        mode=btn.dataset.mode;
        query="";
        scope="all";
        render();
      });
    });

    const search=root.querySelector("[data-map-search]");
    search?.addEventListener("input",()=>{
      query=search.value;
      render();
      const next=root.querySelector("[data-map-search]");
      if(next){
        next.focus();
        next.setSelectionRange(query.length,query.length);
      }
    });

    root.querySelectorAll("[data-scope]").forEach(btn=>{
      btn.addEventListener("click",()=>{
        scope=btn.dataset.scope;
        render();
      });
    });

    root.querySelectorAll("[data-switch-to-paragraph]").forEach(link=>{
      link.addEventListener("click",e=>{
        e.preventDefault();
        const no=link.dataset.switchToParagraph;
        mode="paragraphs";
        query="§"+no;
        scope="all";
        render();
        setTimeout(()=>root.querySelector("#paragraf-"+no)?.scrollIntoView({behavior:"smooth",block:"start"}),30);
      });
    });
  }

  fetch("/contract-guide-map.json")
    .then(r=>{if(!r.ok) throw new Error("map"); return r.json();})
    .then(json=>{data=json;render();})
    .catch(()=>{root.innerHTML='<div class="notice">Nie udało się wczytać mapy § ↔ GUIDE.</div>';});
})();