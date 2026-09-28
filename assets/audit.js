(() => {
  const script = document.currentScript;
  const siteRoot = script ? new URL("../", script.src) : new URL("/", location.href);
  const STORAGE_KEY = "grunt-i-wiatr-audit-v1";

  const sections = [
    { id: "pakiet", no: "01", title: "Strony i dokumenty", desc: "Najpierw sprawdź, co właściwie podpisujesz i z kim." },
    { id: "grunt", no: "02", title: "Grunt i mapa", desc: "To, co wolno zrobić na działce, powinno dać się wskazać palcem na mapie." },
    { id: "czas", no: "03", title: "Czas i etapy", desc: "Rezerwacja, budowa, eksploatacja i koniec powinny mieć własne reguły." },
    { id: "pieniadze", no: "04", title: "Pieniądze", desc: "Nie tylko ile, ale za co, od kiedy, jak długo i jak waloryzowane." },
    { id: "gospodarstwo", no: "05", title: "Gospodarstwo i szkody", desc: "Rolnicze korzystanie z gruntu nie znika dlatego, że powstaje projekt." },
    { id: "prawa", no: "06", title: "Prawa, dokumenty i zmiany", desc: "Pełnomocnictwa, księga wieczysta, cesja, bank i zmiany projektu." },
    { id: "zabezpieczenia", no: "07", title: "Zabezpieczenia", desc: "Obietnica zapłaty to nie to samo co realne źródło zapłaty." },
    { id: "koniec", no: "08", title: "Koniec inwestycji", desc: "Najtrudniejsze obowiązki zaczynają być ważne wtedy, gdy projekt przestaje zarabiać." }
  ];

  const questions = [
    {
      id:"q01", section:"pakiet",
      text:"Czy masz kompletny pakiet: umowę, wszystkie załączniki, mapy, tabele wynagrodzeń i dokumenty, do których umowa odsyła?",
      why:"Brakujący załącznik może zawierać zakres gruntu, opłaty, zabezpieczenia albo obowiązki, których nie widać w głównym tekście.",
      terms:"załącznik, integralna część umowy, mapa, tabela, harmonogram",
      guide:"GUIDE-006", path:"/pl/umowa/jak-czytac-umowe-dzierzawy/"
    },
    {
      id:"q02", section:"pakiet",
      text:"Czy wiesz dokładnie, która spółka podpisuje umowę i kto jest uprawniony do jej reprezentowania?",
      why:"Marka grupy i spółka projektowa to nie zawsze ten sam podmiot. Warto wiedzieć, kto faktycznie bierze na siebie obowiązki.",
      terms:"Dzierżawca, spółka, KRS, reprezentacja, pełnomocnik",
      guide:"GUIDE-002", path:"/pl/zanim-podpiszesz/kim-jest-inwestor/"
    },
    {
      id:"q03", section:"pakiet",
      text:"Czy umowa jasno wskazuje, które dokumenty mają pierwszeństwo, gdy tekst, mapa, aneks albo późniejsze pismo są ze sobą sprzeczne?",
      why:"Przy wieloletniej umowie wersji dokumentów będzie przybywać. Hierarchia pomaga ustalić, który zapis ma rozstrzygać konflikt.",
      terms:"pierwszeństwo, sprzeczność, hierarchia, aneks, załącznik",
      guide:"GUIDE-050", path:"/pl/umowa/hierarchia-dokumentow-i-wersji/"
    },
    {
      id:"q04", section:"pakiet",
      text:"Czy dokumenty, które masz podpisać później, są opisane co do celu i zakresu zamiast pozostawiać ogólne zobowiązanie do podpisania wszystkiego, czego zażąda inwestor?",
      why:"Wieloletnie projekty generują kolejne zgody i oświadczenia. Dobrze wiedzieć z góry, do czego właściciel ma być zobowiązany.",
      terms:"dalsze dokumenty, zgoda, oświadczenie, zobowiązuje się podpisać",
      guide:"GUIDE-048", path:"/pl/umowa/dokumenty-do-organow-i-status-wlasciciela/"
    },

    {
      id:"q05", section:"grunt",
      text:"Czy umowa precyzyjnie określa, jaka część nieruchomości jest faktycznie oddawana inwestorowi do korzystania?",
      why:"Numer całej działki nie mówi jeszcze, czy inwestor dostaje prawo do całej nieruchomości, czy tylko do wyznaczonych fragmentów.",
      terms:"Przedmiot Dzierżawy, część nieruchomości, powierzchnia, granice",
      guide:"GUIDE-008", path:"/pl/umowa/co-dokladnie-oddaje-inwestorowi/"
    },
    {
      id:"q06", section:"grunt",
      text:"Czy mapa rozróżnia zajęcie trwałe i czasowe?",
      why:"Plac używany przez kilka miesięcy i teren zajęty na dziesięciolecia to różne sposoby korzystania z gruntu i mogą wymagać różnych zasad.",
      terms:"trwałe zajęcie, czasowe zajęcie, etap budowy, powierzchnia",
      guide:"GUIDE-009", path:"/pl/umowa/jak-czytac-mape/"
    },
    {
      id:"q07", section:"grunt",
      text:"Czy na mapie można osobno odnaleźć turbinę lub fundament, drogę, kable, place, zjazdy oraz inne strefy ograniczające korzystanie z gruntu?",
      why:"Każde fizyczne prawo inwestora powinno mieć możliwie czytelny ślad w dokumentacji przestrzennej.",
      terms:"fundament, droga technologiczna, korytarz kablowy, plac, zjazd, rotor",
      guide:"GUIDE-010", path:"/pl/umowa/ile-ziemi-zajmie-inwestycja/"
    },
    {
      id:"q08", section:"grunt",
      text:"Czy dodatkowe zajęcie gruntu poza wskazanym zakresem wymaga odrębnego uzgodnienia, a jego skutki finansowe są opisane?",
      why:"Projekt w toku może potrzebować nowych tras, placów albo powierzchni. Warto wiedzieć, czy zakres może rozszerzyć się jednostronnie.",
      terms:"dodatkowe zajęcie, zgoda właściciela, aneks, dodatkowe wynagrodzenie",
      guide:"GUIDE-013", path:"/pl/umowa/droga-kabel-place-osobno/"
    },

    {
      id:"q09", section:"czas",
      text:"Czy umowa podaje maksymalny czas etapu przygotowawczego lub rezerwacyjnego, zanim inwestycja rzeczywiście ruszy?",
      why:"Właściciel powinien wiedzieć, jak długo grunt może pozostawać związany projektem, który jeszcze nie wszedł w budowę.",
      terms:"etap przygotowawczy, okres rezerwacyjny, termin, przedłużenie",
      guide:"GUIDE-007", path:"/pl/umowa/na-ile-lat/"
    },
    {
      id:"q10", section:"czas",
      text:"Czy potrafisz wskazać, od jakiego zdarzenia zaczynają się poszczególne etapy i kiedy kończy się cała umowa?",
      why:"Samo podanie liczby lat nie zawsze odpowiada na pytanie, od kiedy ten okres jest liczony.",
      terms:"wejście w życie, rozpoczęcie budowy, eksploatacja, okres obowiązywania, wygaśnięcie",
      guide:"GUIDE-007", path:"/pl/umowa/na-ile-lat/"
    },
    {
      id:"q11", section:"czas",
      text:"Czy umowa opisuje, co dzieje się z gruntem i prawami inwestora, gdy projekt nie powstanie, zostanie porzucony albo umowa zostanie wcześniej zakończona?",
      why:"Koniec projektu przed budową też powinien mieć procedurę: zwrot gruntu, dokumenty, wpisy i nierozliczone należności.",
      terms:"wypowiedzenie, rozwiązanie, wygaśnięcie, rezygnacja z projektu",
      guide:"GUIDE-039", path:"/pl/umowa/wypowiedzenie-umowy/"
    },

    {
      id:"q12", section:"pieniadze",
      text:"Czy z umowy wynika dokładnie, za co płacona jest główna roczna kwota?",
      why:"Jedna liczba może obejmować bardzo różny zakres praw. Porównywanie ofert ma sens dopiero po rozłożeniu kwoty na to, co faktycznie kupuje inwestor.",
      terms:"czynsz, wynagrodzenie roczne, obejmuje, należność",
      guide:"GUIDE-011", path:"/pl/umowa/co-obejmuje-roczna-kwota/"
    },
    {
      id:"q13", section:"pieniadze",
      text:"Czy zasady waloryzacji są kompletne: wskaźnik, data bazowa, częstotliwość i sposób obliczenia?",
      why:"Sformułowanie „czynsz będzie waloryzowany” bez mechanizmu może pozostawiać ważne pytania bez odpowiedzi.",
      terms:"waloryzacja, wskaźnik, GUS, rok bazowy, indeksacja",
      guide:"GUIDE-011", path:"/pl/umowa/co-obejmuje-roczna-kwota/"
    },
    {
      id:"q14", section:"pieniadze",
      text:"Czy umowa rozdziela wynagrodzenie za turbinę od korzystania z drogi, kabla, placów, powierzchni czasowych albo dodatkowego zajęcia gruntu?",
      why:"Różne elementy infrastruktury mogą obciążać grunt w inny sposób i przez inny czas.",
      terms:"droga, kabel, plac, zajęcie czasowe, dodatkowe wynagrodzenie",
      guide:"GUIDE-013", path:"/pl/umowa/droga-kabel-place-osobno/"
    },
    {
      id:"q15", section:"pieniadze",
      text:"Czy odszkodowania za szkody, utracone plony, dopłaty, dodatkowe podatki i koszty gospodarstwa są rozliczane niezależnie od zwykłego czynszu?",
      why:"Czynsz za korzystanie z gruntu i wyrównanie konkretnej szkody pełnią inne funkcje. Warto sprawdzić, czy umowa ich nie zlewa.",
      terms:"szkoda, plon, dopłaty, podatek, koszty, odszkodowanie",
      guide:"GUIDE-016", path:"/pl/umowa/szkoda-plon-koszty/"
    },

    {
      id:"q16", section:"gospodarstwo",
      text:"Czy zasady wejścia na grunt określają powiadomienie, cel, trasę, czas i sytuacje awaryjne?",
      why:"Prawo wejścia na nieruchomość może być potrzebne, ale jego zakres i tryb mogą mieć duże znaczenie dla normalnej pracy gospodarstwa.",
      terms:"wejście na grunt, zawiadomienie, dojazd, dostęp, awaria",
      guide:"GUIDE-017", path:"/pl/umowa/wejscie-na-grunt/"
    },
    {
      id:"q17", section:"gospodarstwo",
      text:"Czy przed robotami ma powstać protokół i dokumentacja stanu gruntu, upraw, dróg, drenów i innych elementów gospodarstwa?",
      why:"Im lepiej udokumentowany stan wyjściowy, tym łatwiej później rozmawiać o tym, co zostało uszkodzone.",
      terms:"protokół wejścia, stan początkowy, zdjęcia, drenarka, gleba",
      guide:"GUIDE-024", path:"/pl/umowa/protokol-wejscia/"
    },
    {
      id:"q18", section:"gospodarstwo",
      text:"Czy procedura szkody obejmuje także szkody ujawnione później, np. w glebie, drenach albo stosunkach wodnych?",
      why:"Nie każdy skutek robót jest widoczny w dniu odbioru. Część problemów może pojawić się dopiero po opadach albo w kolejnym sezonie.",
      terms:"szkoda ukryta, szkoda późniejsza, drenarka, stosunki wodne, gleba",
      guide:"GUIDE-026", path:"/pl/umowa/dokumentowanie-szkody/"
    },
    {
      id:"q19", section:"gospodarstwo",
      text:"Czy odpowiedzialność za uszkodzenie drenarki, zmianę stosunków wodnych, zagęszczenie gleby i odtworzenie warstwy ornej jest wyraźnie opisana?",
      why:"Przy ciężkim transporcie i robotach ziemnych właśnie te skutki mogą najbardziej wpływać na dalszą produkcję rolną.",
      terms:"drenarka, melioracja, zagęszczenie gleby, humus, stosunki wodne",
      guide:"GUIDE-041", path:"/pl/umowa/ochrona-gleby-upraw-melioracji/"
    },
    {
      id:"q20", section:"gospodarstwo",
      text:"Czy umowa opisuje odpowiedzialność za utratę albo ograniczenie dopłat rolnych i obowiązek przekazywania danych potrzebnych właścicielowi?",
      why:"Inwestycja może zmieniać sposób wykorzystania części działki. Właściciel powinien wiedzieć, kto odpowiada za skutki i dokumentację.",
      terms:"dopłaty, ARiMR, płatności rolne, powierzchnia kwalifikowana",
      guide:"GUIDE-014", path:"/pl/umowa/doplaty-rolne/"
    },

    {
      id:"q21", section:"prawa",
      text:"Czy każde pełnomocnictwo ma określony cel, zakres, czas obowiązywania i zasady jego wykorzystania?",
      why:"Pełnomocnictwo jest osobnym narzędziem prawnym. Warto czytać je równie uważnie jak samą umowę.",
      terms:"pełnomocnictwo, umocowanie, odwołanie, zakres, substytucja",
      guide:"GUIDE-018", path:"/pl/umowa/pelnomocnictwo/"
    },
    {
      id:"q22", section:"prawa",
      text:"Czy wiesz, jakie prawa lub roszczenia mają zostać wpisane do księgi wieczystej i jak zostaną usunięte po zakończeniu umowy?",
      why:"Wpis w księdze wieczystej może oddziaływać na nieruchomość również wobec kolejnych właścicieli i finansujących.",
      terms:"księga wieczysta, dział III, wpis, roszczenie, wykreślenie",
      guide:"GUIDE-020", path:"/pl/umowa/ksiega-wieczysta/"
    },
    {
      id:"q23", section:"prawa",
      text:"Czy sprzedaż projektu lub przeniesienie umowy na inną spółkę wymaga zachowania obowiązków i zabezpieczeń wobec właściciela?",
      why:"Przy projekcie trwającym dziesięciolecia zmiana podmiotu jest realnym scenariuszem. Ważne jest, co przechodzi razem z projektem.",
      terms:"cesja, przeniesienie praw i obowiązków, następca, zmiana inwestora",
      guide:"GUIDE-022", path:"/pl/umowa/zmiana-inwestora/"
    },
    {
      id:"q24", section:"prawa",
      text:"Czy prawa banku lub finansującego są opisane tak, aby było wiadomo, kiedy może wejść w miejsce inwestora i jakie obowiązki wtedy przejmuje?",
      why:"Finansowanie projektu może wymagać dodatkowych praw dla banku. Właściciel powinien rozumieć ich zakres i skutki.",
      terms:"finansujący, bank, step-in, przejęcie, zawiadomienie",
      guide:"GUIDE-036", path:"/pl/umowa/finansujacy-step-in/"
    },
    {
      id:"q25", section:"prawa",
      text:"Czy zmiana turbiny, przebiegu drogi lub kabla, repowering albo dodanie nowej technologii wymaga jasno określonej procedury i rozliczenia?",
      why:"Projekt po kilkunastu latach może wyglądać inaczej niż w dniu podpisania umowy. Warto wiedzieć, które zmiany mieszczą się w umowie, a które wymagają nowych ustaleń.",
      terms:"zmiana technologii, repowering, magazyn energii, GPZ, aneks",
      guide:"GUIDE-031", path:"/pl/umowa/zmiana-technologii-turbiny/"
    },

    {
      id:"q26", section:"zabezpieczenia",
      text:"Czy zapłata czynszu jest zabezpieczona czymś więcej niż samym zobowiązaniem spółki projektowej do zapłaty?",
      why:"Zabezpieczenie ma największe znaczenie wtedy, gdy spółka nie płaci dobrowolnie albo jej sytuacja finansowa się pogarsza.",
      terms:"gwarancja czynszowa, gwarancja bankowa, egzekucja, poręczenie",
      guide:"GUIDE-023", path:"/pl/umowa/zabezpieczenie-platnosci/"
    },
    {
      id:"q27", section:"zabezpieczenia",
      text:"Czy umowa wymaga utrzymywania odpowiednich ubezpieczeń i przekazywania właścicielowi dokumentów potwierdzających ich obowiązywanie?",
      why:"Samo zdanie „inwestor jest ubezpieczony” nie mówi jeszcze, jaki jest zakres, suma, wyłączenia i okres ochrony.",
      terms:"ubezpieczenie, polisa, OC, suma ubezpieczenia, certyfikat",
      guide:"GUIDE-034", path:"/pl/umowa/ubezpieczenia/"
    },
    {
      id:"q28", section:"zabezpieczenia",
      text:"Czy istnieje odrębne, aktualizowane zabezpieczenie finansowe na demontaż i rekultywację, niezależne od bieżącego czynszu?",
      why:"Koszty końca inwestycji pojawiają się po wielu latach. Warto sprawdzić nie tylko obowiązek demontażu, ale również realne źródło jego finansowania.",
      terms:"gwarancja rekultywacyjna, demontaż, kosztorys, aktualizacja zabezpieczenia",
      guide:"GUIDE-035", path:"/pl/umowa/gwarancja-rekultywacyjna/"
    },

    {
      id:"q29", section:"koniec",
      text:"Czy umowa dokładnie wskazuje, co po zakończeniu ma zostać usunięte: turbina, fundament, kable, drogi, place, zjazdy i pozostałości techniczne?",
      why:"Samo słowo „demontaż” nie rozstrzyga, co dzieje się z fundamentem, infrastrukturą podziemną czy drogami.",
      terms:"demontaż, fundament, kable, drogi, place, usunięcie",
      guide:"GUIDE-030", path:"/pl/umowa/co-usunac-po-inwestycji/"
    },
    {
      id:"q30", section:"koniec",
      text:"Czy po zakończeniu są określone terminy rekultywacji, możliwość wykonania zastępczego oraz zasady rozliczenia szkód ujawnionych już po odbiorze?",
      why:"Odbiór prac nie powinien pozostawiać niejasności co do opóźnień, niewykonania obowiązków i skutków, które ujawnią się później.",
      terms:"rekultywacja, termin, wykonanie zastępcze, szkoda ukryta, protokół końcowy",
      guide:"GUIDE-029", path:"/pl/umowa/kto-zaplaci-za-demontaz/"
    }
  ];

  let answers = {};
  let current = 0;
  let started = false;

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved && saved.answers && typeof saved.answers === "object") {
        answers = saved.answers;
        current = Math.max(0, Math.min(Number(saved.current) || 0, questions.length - 1));
        started = Boolean(saved.started);
      }
    } catch (_) {}
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, current, started, updated: Date.now() }));
    } catch (_) {}
  }

  function clearState() {
    answers = {};
    current = 0;
    started = false;
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  const root = document.querySelector("[data-audit-app]");
  if (!root) return;
  loadState();

  function href(path) {
    return new URL(String(path).replace(/^\//, ""), siteRoot).href;
  }

  function sectionFor(id) {
    return sections.find(s => s.id === id);
  }

  function answeredCount() {
    return questions.filter(q => answers[q.id]).length;
  }

  function renderIntro() {
    const resumed = answeredCount() > 0;
    root.innerHTML = `
      <section class="audit-intro">
        <div class="eyebrow">Narzędzie właściciela gruntu</div>
        <h1>Sprawdź swoją umowę w 5 minut</h1>
        <p class="audit-lead">30 prostych pytań pomaga przejść przez najważniejsze obszary umowy dotyczącej projektu wiatrowego. To nie jest automat oceniający umowę i nie daje wyniku „dobra / zła”. Pokazuje, co już odnalazłeś, czego nie widzisz i które tematy warto sprawdzić dokładniej.</p>
        <div class="audit-principles">
          <div><strong>30 pytań</strong><span>TAK · NIE · NIE WIEM</span></div>
          <div><strong>Bez punktacji</strong><span>zamiast oceny — mapa zagadnień</span></div>
          <div><strong>Prywatnie</strong><span>odpowiedzi zostają w tej przeglądarce</span></div>
        </div>
        <div class="audit-note"><strong>Jak odpowiadać?</strong> Zaznacz „TAK” tylko wtedy, gdy potrafisz odnaleźć odpowiedni zapis albo dokument. „NIE WIEM” jest pełnoprawną odpowiedzią — właśnie po to jest ten audyt.</div>
        <div class="audit-sections">
          ${sections.map(s => `<span><b>${s.no}</b> ${s.title}</span>`).join("")}
        </div>
        <div class="actions audit-actions">
          <button class="button primary" type="button" data-audit-start>${resumed ? "Wznów audyt" : "Zaczynam"}</button>
          ${resumed ? '<button class="button" type="button" data-audit-reset>Rozpocznij od nowa</button>' : ""}
        </div>
        <p class="audit-privacy">Narzędzie nie wysyła odpowiedzi ani treści Twojej umowy na serwer. Stan audytu jest zapisywany wyłącznie lokalnie w przeglądarce, aby można było wrócić do niego później.</p>
      </section>`;

    root.querySelector("[data-audit-start]").addEventListener("click", () => {
      started = true; saveState(); renderQuestion();
    });
    root.querySelector("[data-audit-reset]")?.addEventListener("click", () => {
      clearState(); renderIntro();
    });
  }

  function renderQuestion() {
    const q = questions[current];
    const section = sectionFor(q.section);
    const selected = answers[q.id] || "";
    const progress = Math.round((answeredCount() / questions.length) * 100);

    root.innerHTML = `
      <section class="audit-shell">
        <div class="audit-topline">
          <button class="audit-text-button" type="button" data-audit-home>← Wróć do wprowadzenia</button>
          <span>${answeredCount()} / ${questions.length} odpowiedzi</span>
        </div>
        <div class="audit-progress" aria-label="Postęp audytu"><span style="width:${progress}%"></span></div>

        <div class="audit-question-card">
          <div class="audit-section-label"><span>${section.no}</span> ${section.title}</div>
          <div class="audit-question-no">Pytanie ${current + 1} z ${questions.length}</div>
          <h2>${q.text}</h2>

          <div class="audit-answer-grid" role="group" aria-label="Odpowiedź">
            <button type="button" class="audit-answer ${selected === "yes" ? "selected" : ""}" data-answer="yes"><b>TAK</b><span>Mam taki zapis lub dokument</span></button>
            <button type="button" class="audit-answer ${selected === "no" ? "selected" : ""}" data-answer="no"><b>NIE</b><span>Nie widzę tego w umowie</span></button>
            <button type="button" class="audit-answer ${selected === "unknown" ? "selected" : ""}" data-answer="unknown"><b>NIE WIEM</b><span>Nie potrafię tego odnaleźć lub ocenić</span></button>
          </div>

          <details class="audit-help">
            <summary>Dlaczego o to pytamy?</summary>
            <p>${q.why}</p>
            <p><strong>Słówka, których możesz szukać w umowie:</strong> ${q.terms}.</p>
            <a href="${href(q.path)}">${q.guide}: przeczytaj powiązany GUIDE →</a>
          </details>
        </div>

        <div class="audit-nav">
          <button class="button" type="button" data-prev ${current === 0 ? "disabled" : ""}>← Poprzednie</button>
          <button class="button primary" type="button" data-next>${current === questions.length - 1 ? "Zobacz podsumowanie" : "Następne →"}</button>
        </div>

        <div class="audit-section-note"><strong>${section.title}</strong> — ${section.desc}</div>
      </section>`;

    root.querySelectorAll("[data-answer]").forEach(button => {
      button.addEventListener("click", () => {
        answers[q.id] = button.dataset.answer;
        saveState();
        if (current < questions.length - 1) {
          current += 1;
          saveState();
          renderQuestion();
        } else {
          renderResults();
        }
      });
    });

    root.querySelector("[data-prev]").addEventListener("click", () => {
      if (current > 0) { current -= 1; saveState(); renderQuestion(); }
    });
    root.querySelector("[data-next]").addEventListener("click", () => {
      if (current < questions.length - 1) {
        current += 1; saveState(); renderQuestion();
      } else {
        renderResults();
      }
    });
    root.querySelector("[data-audit-home]").addEventListener("click", renderIntro);
  }

  function groupResults(status) {
    return sections.map(section => ({
      section,
      items: questions.filter(q => q.section === section.id && (answers[q.id] || "unknown") === status)
    })).filter(group => group.items.length);
  }

  function resultCard(q, status) {
    const labels = {
      yes: "Odnalezione",
      no: "Sprawdź dokładniej",
      unknown: "Do ustalenia"
    };
    return `
      <article class="audit-result-item audit-result-${status}">
        <div class="audit-result-status">${labels[status]}</div>
        <h4>${q.text}</h4>
        <p>${status === "yes"
          ? "Wskazałeś, że ten element znajduje się w Twojej dokumentacji. Warto jeszcze sprawdzić, czy zapis jest konkretny i spójny z załącznikami."
          : status === "no"
            ? q.why
            : "Nie udało Ci się potwierdzić tego elementu. Wróć do umowy i załączników albo zaznacz ten temat do rozmowy ze specjalistą."}</p>
        <div class="audit-result-links">
          <span>Szukaj: ${q.terms}</span>
          <a href="${href(q.path)}">${q.guide} →</a>
        </div>
      </article>`;
  }

  function renderResultGroups(status, title, intro) {
    const groups = groupResults(status);
    const count = groups.reduce((sum, g) => sum + g.items.length, 0);
    return `
      <section class="audit-result-group audit-group-${status}">
        <div class="audit-result-heading">
          <div><div class="eyebrow">${count} ${count === 1 ? "punkt" : "punktów"}</div><h2>${title}</h2></div>
          <p>${intro}</p>
        </div>
        ${groups.length ? groups.map(g => `
          <div class="audit-result-section">
            <h3><span>${g.section.no}</span> ${g.section.title}</h3>
            <div class="audit-result-list">${g.items.map(q => resultCard(q, status)).join("")}</div>
          </div>`).join("") : '<p class="audit-empty-result">Brak pozycji w tej kategorii.</p>'}
      </section>`;
  }

  function renderResults() {
    started = true;
    saveState();
    const unanswered = questions.filter(q => !answers[q.id]).length;
    const attention = questions.filter(q => answers[q.id] === "no").length;
    const unknown = questions.filter(q => !answers[q.id] || answers[q.id] === "unknown").length;
    const yes = questions.filter(q => answers[q.id] === "yes").length;

    root.innerHTML = `
      <section class="audit-results">
        <div class="audit-results-hero">
          <div class="eyebrow">Twoja mapa umowy</div>
          <h1>Nie dostajesz oceny. Dostajesz listę rzeczy do sprawdzenia.</h1>
          <p>Odpowiedzi poniżej nie przesądzają, czy zapis jest prawidłowy, korzystny albo zgodny z prawem. Pokazują jedynie, które elementy udało Ci się odnaleźć w dokumentacji, a które wymagają powrotu do tekstu umowy lub dalszej analizy.</p>
          <div class="audit-summary-cards">
            <div><strong>${yes}</strong><span>odnalezionych</span></div>
            <div><strong>${attention}</strong><span>do sprawdzenia</span></div>
            <div><strong>${unknown}</strong><span>nie wiem / brak odpowiedzi</span></div>
          </div>
          ${unanswered ? `<div class="audit-note"><strong>Uwaga:</strong> ${unanswered} pytań nie ma jeszcze odpowiedzi. W podsumowaniu traktujemy je jako „do ustalenia”.</div>` : ""}
          <div class="actions audit-actions">
            <button class="button primary" type="button" data-print>Drukuj / zapisz jako PDF</button>
            <button class="button" type="button" data-review>Wróć do pytań</button>
            <button class="button" type="button" data-reset>Wyczyść odpowiedzi</button>
          </div>
        </div>

        ${renderResultGroups("no", "Sprawdź dokładniej", "Tu zaznaczyłeś „NIE”. To nie jest automatycznie wada umowy, ale warto odnaleźć odpowiedni mechanizm albo świadomie ustalić, że go nie ma.")}
        ${renderResultGroups("unknown", "Nie wiem / do ustalenia", "To naturalna część czytania trudnej umowy. Poniżej masz słowa, których możesz szukać, i materiały pomagające zrozumieć temat.")}
        ${renderResultGroups("yes", "Elementy, które odnalazłeś", "„TAK” oznacza, że potrafisz wskazać odpowiedni zapis lub dokument. Audyt nie ocenia jednak jego jakości ani skuteczności.")}

        <div class="audit-final-note">
          <strong>Co dalej?</strong>
          <p>Najbardziej praktycznie jest wydrukować to podsumowanie, zaznaczyć konkretne paragrafy i załączniki przy każdej odpowiedzi oraz z listą „sprawdź dokładniej / do ustalenia” wrócić do inwestora, prawnika, doradcy podatkowego albo technicznego — zależnie od zagadnienia.</p>
        </div>
      </section>`;

    root.querySelector("[data-print]").addEventListener("click", () => window.print());
    root.querySelector("[data-review]").addEventListener("click", () => {
      const firstOpen = questions.findIndex(q => !answers[q.id] || answers[q.id] !== "yes");
      current = firstOpen >= 0 ? firstOpen : 0;
      saveState(); renderQuestion();
    });
    root.querySelector("[data-reset]").addEventListener("click", () => {
      if (confirm("Wyczyścić wszystkie odpowiedzi tego audytu?")) {
        clearState(); renderIntro();
      }
    });
  }

  if (started) renderQuestion();
  else renderIntro();
})();