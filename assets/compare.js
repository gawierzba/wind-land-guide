(() => {
  const root = document.querySelector("[data-compare-offers]");
  if (!root) return;

  const STORAGE_KEY = "grunt-i-wiatr:compare-offers:v1";

  const sections = [
    {
      title:"1. Podmiot, grunt i czas",
      items:[
        {id:"investor",label:"Kto jest stroną umowy?",hint:"Pełna nazwa spółki, KRS, ewentualnie grupa / poręczyciel.",guide:"GUIDE-002",path:"/zanim-podpiszesz/kim-jest-inwestor/"},
        {id:"property",label:"Jakie działki i jaki zakres gruntu obejmuje oferta?",hint:"Działka, obręb, KW, powierzchnia i zgodność z mapą.",guide:"GUIDE-009",path:"/umowa/jak-czytac-mape/"},
        {id:"preparation",label:"Maksymalny okres przygotowania / rezerwacji",hint:"Nie tylko przewidywany czas — szukaj daty albo limitu granicznego.",guide:"GUIDE-007",path:"/umowa/na-ile-lat/"},
        {id:"term",label:"Łączny czas związania nieruchomości",hint:"Przygotowanie, budowa, eksploatacja, opcje przedłużenia i koniec.",guide:"GUIDE-007",path:"/umowa/na-ile-lat/"},
        {id:"retained",label:"Co właściciel zachowuje?",hint:"Rolnictwo, przejazdy, dopłaty, kontrola, korzystanie z części nieoddanych.",guide:"GUIDE-061",path:"/umowa/czego-wlasciciel-nie-oddaje/"}
      ]
    },
    {
      title:"2. Pieniądze i powierzchnie",
      items:[
        {id:"entry_fee",label:"Czynsz / opłata wejściowa",hint:"Kwota, termin i za co dokładnie jest należna.",guide:"GUIDE-011",path:"/umowa/co-obejmuje-roczna-kwota/"},
        {id:"reservation_rent",label:"Czynsz rezerwacyjny",hint:"Ile za samo związanie gruntu projektem i przez jaki okres.",guide:"GUIDE-011",path:"/umowa/co-obejmuje-roczna-kwota/"},
        {id:"main_rent",label:"Czynsz zasadniczy / minimum gwarantowane",hint:"Kwota bazowa, MW, minimum i warunki zwiększenia.",guide:"GUIDE-011",path:"/umowa/co-obejmuje-roczna-kwota/"},
        {id:"rent_start",label:"Co uruchamia pełny czynsz?",hint:"Budowa, pierwsze zajęcie, fundament, kabel, rozruch czy produkcja?",guide:"GUIDE-011",path:"/umowa/co-obejmuje-roczna-kwota/"},
        {id:"indexation",label:"Waloryzacja",hint:"Wskaźnik, częstotliwość, pierwszy rok, ujemny wskaźnik.",guide:"GUIDE-010",path:"/umowa/waloryzacja/"},
        {id:"extra_payments",label:"Droga, kabel, place i inne zajęcia — osobno czy w cenie?",hint:"Rozpisz każdą kategorię powierzchni i wynagrodzenia.",guide:"GUIDE-013",path:"/umowa/droga-kabel-place-osobno/"},
        {id:"damages_money",label:"Czy szkody są niezależne od czynszu?",hint:"Uprawy, gleba, drenarka, drogi, koszty i skutki ujawnione później.",guide:"GUIDE-024",path:"/umowa/szkody-i-odszkodowanie/"},
        {id:"subsidies_taxes",label:"Dopłaty, podatki i inne koszty gospodarstwa",hint:"Kto ponosi skutki inwestycji dla dopłat i obciążeń publicznych.",guide:"GUIDE-014",path:"/umowa/doplaty-rolne/"}
      ]
    },
    {
      title:"3. Prawa inwestora i dokumenty",
      items:[
        {id:"scope",label:"Zakres praw do gruntu",hint:"Trwałe i czasowe zajęcie, rotor, ograniczenia, dostęp.",guide:"GUIDE-008",path:"/umowa/co-dokladnie-oddaje-inwestorowi/"},
        {id:"kw",label:"KW, służebności i inne prawa rzeczowe",hint:"Co może zostać wpisane i kiedy ma zostać wykreślone.",guide:"GUIDE-017",path:"/umowa/ksiega-wieczysta/"},
        {id:"power",label:"Pełnomocnictwa i zgody",hint:"Zakres, czas, dalsze pełnomocnictwa, zgoda vs aneks.",guide:"GUIDE-018",path:"/umowa/pelnomocnictwo/"},
        {id:"project_change",label:"Zmiana technologii / repowering / dodatkowa infrastruktura",hint:"Co inwestor może zmienić bez nowej zgody i nowej ceny?",guide:"GUIDE-031",path:"/umowa/zmiana-technologii-turbiny/"},
        {id:"assignment",label:"Cesja, sprzedaż projektu i zmiana inwestora",hint:"Czy potrzebna jest zgoda, jakie warunki i co z zabezpieczeniami?",guide:"GUIDE-029",path:"/umowa/zmiana-inwestora/"},
        {id:"privacy",label:"Zdjęcia, drony, dane gospodarstwa i PR",hint:"Oddziel dokumentację techniczną od wykorzystania publicznego.",guide:"GUIDE-059",path:"/umowa/prywatnosc-zdjecia-dron-komunikacja/"}
      ]
    },
    {
      title:"4. Ochrona właściciela",
      items:[
        {id:"rent_security",label:"Gwarancja czynszowa / zabezpieczenie płatności",hint:"Kwota, wystawca, termin ważności i warunki wypłaty.",guide:"GUIDE-035",path:"/umowa/gwarancja-czynszowa/"},
        {id:"reclamation_security",label:"Gwarancja demontażu i rekultywacji",hint:"Czy środki istnieją zanim będą potrzebne po kilkudziesięciu latach?",guide:"GUIDE-036",path:"/umowa/gwarancja-rekultywacyjna/"},
        {id:"insurance",label:"Ubezpieczenia",hint:"OC, osoby trzecie, regres, roboty, transport, eksploatacja i demontaż.",guide:"GUIDE-034",path:"/umowa/ubezpieczenia/"},
        {id:"reporting",label:"Raporty i dokumenty przez cały projekt",hint:"Raport okresowy, zerowy, nadzwyczajny, polisy, mapy i wykonawcy.",guide:"GUIDE-037",path:"/umowa/dokumenty-ktore-powinien-dostawac-wlasciciel/"},
        {id:"breach",label:"Co gdy inwestor narusza umowę?",hint:"Dowód, wezwanie, termin, plan naprawczy, kontrola i wykonanie zastępcze.",guide:"GUIDE-057",path:"/umowa/inwestor-naruszyl-umowe/"},
        {id:"third_party",label:"Roszczenia sąsiada, urzędu albo wykonawcy",hint:"Kto broni właściciela, kto płaci i kto przekazuje dokumenty.",guide:"GUIDE-058",path:"/umowa/roszczenia-osob-trzecich/"},
        {id:"dispute",label:"Spór z inwestorem",hint:"Czy część bezsporna, naprawy i zabezpieczenia nadal działają?",guide:"GUIDE-060",path:"/umowa/spor-z-inwestorem/"}
      ]
    },
    {
      title:"5. Koniec inwestycji",
      items:[
        {id:"demolition",label:"Zakres demontażu",hint:"Turbina, fundament, kable, drogi, place, elementy podziemne.",guide:"GUIDE-030",path:"/umowa/co-usunac-po-inwestycji/"},
        {id:"reclamation",label:"Rekultywacja",hint:"Jaki efekt ma zostać osiągnięty i jak będzie sprawdzony?",guide:"GUIDE-025",path:"/umowa/rekultywacja/"},
        {id:"deadline_end",label:"Terminy końcowe",hint:"Demontaż, rekultywacja, dokumenty, KW, szkody i odbiory.",guide:"GUIDE-030",path:"/umowa/co-usunac-po-inwestycji/"},
        {id:"final_protocol",label:"Protokół demontażu i odbiór końcowy",hint:"Zdjęcia przed zasypaniem, geodezja, odpady i lista rzeczy pozostałych.",guide:"GUIDE-030",path:"/umowa/co-usunac-po-inwestycji/"}
      ]
    }
  ];

  let state = {
    meta:{a:"Oferta A",b:"Oferta B",project:""},
    values:{},
    onlyDifferences:false
  };

  const esc = value => String(value || "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") state = {...state,...saved,meta:{...state.meta,...(saved.meta||{})},values:saved.values||{}};
    } catch {}
  }

  function applyProjectDefaults() {
    const shared = window.GruntWiatrProject?.defaultsForTools?.();
    if (!shared) return;
    if (!String(state.meta.project || "").trim() && String(shared.project || "").trim()) {
      state.meta.project = shared.project;
      save();
    }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function itemState(id) {
    return state.values[id] || {a:"",b:"",note:""};
  }

  function statusFor(item) {
    const a = item.a.trim(), b = item.b.trim();
    if (a && b) return a === b ? "same" : "both";
    if (a) return "only-a";
    if (b) return "only-b";
    return "empty";
  }

  function counts() {
    const all = sections.flatMap(s => s.items).map(x => itemState(x.id));
    return {
      both:all.filter(x => x.a.trim() && x.b.trim()).length,
      onlyA:all.filter(x => x.a.trim() && !x.b.trim()).length,
      onlyB:all.filter(x => !x.a.trim() && x.b.trim()).length,
      empty:all.filter(x => !x.a.trim() && !x.b.trim()).length
    };
  }

  function render() {
    const count = counts();
    root.innerHTML = `
      <section class="compare-shell">
        <div class="compare-meta-card">
          <div>
            <div class="eyebrow">Nazwij porównanie</div>
            <label>Projekt / miejscowość<input data-meta="project" value="${esc(state.meta.project)}" placeholder="np. działka 123/4, obręb…"></label>
          </div>
          <label>Kolumna A<input data-meta="a" value="${esc(state.meta.a)}" placeholder="Oferta A"></label>
          <label>Kolumna B<input data-meta="b" value="${esc(state.meta.b)}" placeholder="Oferta B"></label>
        </div>

        <div class="compare-toolbar">
          <div class="compare-summary">
            <span><b>${count.both}</b> uzupełnione w obu</span>
            <span><b>${count.onlyA}</b> tylko A</span>
            <span><b>${count.onlyB}</b> tylko B</span>
            <span><b>${count.empty}</b> puste w obu</span>
          </div>
          <div class="compare-actions">
            <label class="compare-switch"><input type="checkbox" data-only-differences ${state.onlyDifferences ? "checked" : ""}><span>Pokaż tylko różnice / braki</span></label>
            <button type="button" class="button" data-print>Drukuj / PDF</button>
            <button type="button" class="button" data-reset>Wyczyść</button>
          </div>
        </div>

        <div class="compare-print-title">
          <strong>Grunt i wiatr · Karta porównania ofert</strong>
          <span>${esc(state.meta.project)}</span>
        </div>

        ${sections.map(section => `
          <section class="compare-section">
            <h2>${section.title}</h2>
            <div class="compare-list">
              ${section.items.map(q => {
                const v = itemState(q.id);
                const status = statusFor(v);
                if (state.onlyDifferences && status === "same") return "";
                return `
                  <article class="compare-row compare-status-${status}" data-item="${q.id}">
                    <div class="compare-topic">
                      <strong>${q.label}</strong>
                      <p>${q.hint}</p>
                      <a href="${q.path}">${q.guide} →</a>
                    </div>
                    <label><span data-column-label="a">${esc(state.meta.a || "Oferta A")}</span><textarea rows="3" data-value="a" placeholder="Wpisz zapis, kwotę, termin albo „brak”">${esc(v.a)}</textarea></label>
                    <label><span data-column-label="b">${esc(state.meta.b || "Oferta B")}</span><textarea rows="3" data-value="b" placeholder="Wpisz zapis, kwotę, termin albo „brak”">${esc(v.b)}</textarea></label>
                    <label class="compare-note"><span>Różnica / pytanie do wyjaśnienia</span><textarea rows="2" data-value="note" placeholder="Co trzeba doprecyzować?">${esc(v.note)}</textarea></label>
                  </article>`;
              }).join("")}
            </div>
          </section>`).join("")}

        <section class="compare-closing">
          <div class="eyebrow">Jak czytać wynik?</div>
          <h2>Nie szukaj „zwycięzcy”. Szukaj różnic w prawach, pieniądzach i ryzyku.</h2>
          <p>Puste pole nie oznacza automatycznie wady oferty — może oznaczać, że dana kwestia jest opisana gdzie indziej albo wymaga doprecyzowania. Różna treść nie mówi sama w sobie, która propozycja jest właściwsza dla Twojej sytuacji.</p>
          <div class="actions"><a class="button" href="/umowa/jak-porownac-dwie-oferty/">Przeczytaj GUIDE-012</a><a class="button" href="/guide/">Otwórz katalog GUIDE</a></div>
        </section>
      </section>`;

    bind();
  }

  function bind() {
    root.querySelectorAll("[data-meta]").forEach(input => {
      input.addEventListener("input", () => {
        state.meta[input.dataset.meta] = input.value;
        save();
        root.querySelectorAll('[data-column-label="'+input.dataset.meta+'"]').forEach(el => el.textContent = input.value || (input.dataset.meta === "a" ? "Oferta A" : "Oferta B"));
      });
    });

    root.querySelectorAll("[data-item]").forEach(row => {
      const id = row.dataset.item;
      row.querySelectorAll("[data-value]").forEach(field => {
        field.addEventListener("input", () => {
          state.values[id] = {...itemState(id),[field.dataset.value]:field.value};
          save();
          const st = statusFor(itemState(id));
          row.className = row.className.replace(/compare-status-\S+/g,"").trim()+" compare-status-"+st;
          const c = counts();
          const spans = root.querySelectorAll(".compare-summary span b");
          [c.both,c.onlyA,c.onlyB,c.empty].forEach((n,i) => { if(spans[i]) spans[i].textContent=n; });
          if (state.onlyDifferences && st === "same") render();
        });
      });
    });

    root.querySelector("[data-only-differences]").addEventListener("change", e => {
      state.onlyDifferences = e.target.checked;
      save();
      render();
    });

    root.querySelector("[data-print]").addEventListener("click", () => window.print());
    root.querySelector("[data-reset]").addEventListener("click", () => {
      if (!confirm("Wyczyścić całe porównanie zapisane na tym urządzeniu?")) return;
      state = {meta:{a:"Oferta A",b:"Oferta B",project:""},values:{},onlyDifferences:false};
      save();
      render();
    });
  }

  load();
  applyProjectDefaults();
  render();
})();