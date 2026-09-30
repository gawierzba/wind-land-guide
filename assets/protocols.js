(() => {
  const root = document.querySelector("[data-protocols-tool]");
  if (!root) return;

  const STORAGE_KEY = "grunt-i-wiatr:owner-protocols:v1";
  const yesNo = [
    ["","— wybierz —"],
    ["yes","Tak"],
    ["no","Nie"],
    ["unknown","Nie wiem / do ustalenia"]
  ];

  const common = () => ([
    {
      title:"Dane podstawowe",
      fields:[
        {id:"project",label:"Projekt / inwestycja",type:"text",placeholder:"np. farma wiatrowa / nazwa projektu"},
        {id:"date",label:"Data",type:"date"},
        {id:"time",label:"Godzina",type:"time"},
        {id:"place",label:"Miejsce sporządzenia",type:"text",placeholder:"miejscowość / pole / punkt orientacyjny"},
        {id:"plot",label:"Działka / obręb",type:"text",placeholder:"np. dz. 123/4, obręb …"},
        {id:"kw",label:"Księga wieczysta",type:"text",placeholder:"opcjonalnie"},
        {id:"owner",label:"Właściciel / wydzierżawiający",type:"text"},
        {id:"investor",label:"Inwestor / dzierżawca",type:"text"},
        {id:"contractor",label:"Wykonawca / podwykonawca",type:"text",placeholder:"jeżeli dotyczy"},
        {id:"participants",label:"Osoby obecne",type:"textarea",placeholder:"imię, nazwisko, firma, funkcja, telefon — po jednej osobie w wierszu"}
      ]
    }
  ]);

  const templates = [
    {
      id:"entry",
      title:"Protokół wejścia na grunt",
      short:"Stan przed pracami, trasy, sprzęt i zabezpieczenia",
      source:"Wzorzec umowy · Załącznik nr 8",
      sourceType:"source",
      guide:"GUIDE-024",
      path:"/umowa/protokol-wejscia/",
      sections:[
        ...common(),
        {
          title:"Podstawa i zakres wejścia",
          fields:[
            {id:"basis",label:"Podstawa wejścia",type:"textarea",placeholder:"§ umowy / załącznik / zgoda właściciela / decyzja"},
            {id:"insurance",label:"Dokument ubezpieczenia",type:"text",placeholder:"nr polisy / ważność"},
            {id:"security",label:"Zabezpieczenie wymagane przed wejściem",type:"text",placeholder:"np. gwarancja / kaucja / nie dotyczy"},
            {id:"purpose",label:"Cel wejścia",type:"textarea",placeholder:"oględziny, pomiary, geodezja, roboty, transport, serwis…"},
            {id:"allowed",label:"Czynności dopuszczone",type:"textarea"},
            {id:"forbidden",label:"Czynności wyraźnie niedopuszczone",type:"textarea"},
            {id:"from_to",label:"Okres / godziny wejścia",type:"text",placeholder:"od … do …"},
            {id:"route",label:"Dopuszczalna trasa przejazdu / przechodu",type:"textarea",placeholder:"opis + odniesienie do mapy/szkicu"},
            {id:"work_zones",label:"Miejsca postoju, rozładunku, składowania, wykopów lub poboru prób",type:"textarea"}
          ]
        },
        {
          title:"Ludzie, pojazdy i sprzęt",
          fields:[
            {id:"people",label:"Osoby dopuszczone do wejścia",type:"textarea",placeholder:"osoba / firma / funkcja / zakres czynności"},
            {id:"vehicles",label:"Pojazdy",type:"textarea",placeholder:"rodzaj, nr rej., masa/tonaż jeżeli ma znaczenie"},
            {id:"equipment",label:"Sprzęt i maszyny",type:"textarea",placeholder:"rodzaj, parametry istotne dla gruntu"},
            {id:"coordinator",label:"Koordynator po stronie inwestora",type:"text",placeholder:"imię, telefon"}
          ]
        },
        {
          title:"Stan nieruchomości przed wejściem",
          fields:[
            {id:"crop",label:"Uprawa i faza rozwoju",type:"textarea"},
            {id:"soil",label:"Stan gleby / uwilgotnienie / koleiny / nierówności",type:"textarea"},
            {id:"roads",label:"Stan dróg, zjazdów, przejazdów i przepustów",type:"textarea"},
            {id:"drainage",label:"Rowy, dreny, melioracja i odpływ wód",type:"textarea"},
            {id:"existing_damage",label:"Istniejące wcześniej uszkodzenia / zanieczyszczenia",type:"textarea"},
            {id:"weather",label:"Warunki pogodowe i terenowe",type:"textarea",placeholder:"opady, błoto, zastoiska, ryzyko ugniatania"}
          ]
        },
        {
          title:"Zabezpieczenia przed rozpoczęciem",
          fields:[
            {id:"protections",label:"Uzgodnione środki zabezpieczające",type:"textarea",placeholder:"maty, płyty, ograniczenie tonażu, zabezpieczenie drenów, rozdzielenie warstwy ornej…"},
            {id:"crop_protection",label:"Ochrona upraw",type:"textarea"},
            {id:"water_protection",label:"Ochrona melioracji i stosunków wodnych",type:"textarea"},
            {id:"road_protection",label:"Ochrona dróg rolniczych i przejezdności",type:"textarea"}
          ]
        },
        {
          title:"Dokumentacja zdjęciowa przed wejściem",
          checklist:[
            ["photo_general","Widok ogólny miejsca prac"],
            ["photo_crop","Uprawa i granice powierzchni narażonej"],
            ["photo_soil","Gleba, wilgotność, istniejące koleiny / zagłębienia"],
            ["photo_routes","Drogi, zjazdy, przejazdy i przepusty"],
            ["photo_drainage","Rowy, dreny, studzienki i inne widoczne elementy melioracji"],
            ["photo_refs","Punkty odniesienia pozwalające później ustalić lokalizację"],
            ["photo_existing","Istniejące wcześniej szkody lub nietypowe miejsca"]
          ]
        },
        {
          title:"Zastrzeżenia i podpisanie",
          fields:[
            {id:"reservations",label:"Zastrzeżenia właściciela",type:"textarea"},
            {id:"attachments",label:"Załączniki do protokołu",type:"textarea",placeholder:"mapa, szkic, lista osób, zdjęcia nr …"},
            {id:"signature_note",label:"Podpisy / odmowa podpisu / uwagi końcowe",type:"textarea"}
          ]
        }
      ]
    },
    {
      id:"damage",
      title:"Protokół szkody",
      short:"Zdarzenie, dowody, skutki, wycena i plan naprawczy",
      source:"Wzorzec umowy · Załącznik nr 9",
      sourceType:"source",
      guide:"GUIDE-025 / 026",
      path:"/umowa/szkoda-pierwszy-dzien/",
      sections:[
        ...common(),
        {
          title:"Zdarzenie i zakres szkody",
          fields:[
            {id:"event_date",label:"Data i godzina zdarzenia / ujawnienia szkody",type:"text"},
            {id:"event",label:"Opis zdarzenia",type:"textarea"},
            {id:"cause",label:"Przyczyna lub możliwa przyczyna",type:"textarea"},
            {id:"damage_type",label:"Rodzaj szkody",type:"textarea",placeholder:"uprawa / gleba / drenarka / droga / woda / zanieczyszczenie / inne"},
            {id:"area",label:"Powierzchnia / długość / lokalizacja szkody",type:"textarea"},
            {id:"crop_damage",label:"Uprawa — rodzaj, faza, % uszkodzenia, wpływ na plon",type:"textarea"},
            {id:"soil_damage",label:"Gleba — koleiny, zagęszczenie, zmieszanie warstw, zanieczyszczenie",type:"textarea"},
            {id:"drainage_damage",label:"Melioracja / woda — urządzenie, uszkodzenie, podtopienie, zastoiska, odpływ",type:"textarea"},
            {id:"road_damage",label:"Drogi / zjazdy / przepusty — rozmiar szkody i wpływ na przejezdność",type:"textarea"}
          ]
        },
        {
          title:"Działania natychmiastowe",
          fields:[
            {id:"security_actions",label:"Co zabezpieczono natychmiast?",type:"textarea",placeholder:"wstrzymanie prac, wykop, wyciek, dren, odpływ, zagrożenie…"},
            {id:"work_stopped",label:"Czy prace wstrzymano?",type:"select",options:yesNo},
            {id:"specialist",label:"Czy potrzebny jest specjalista / pomiar / badanie?",type:"textarea"},
            {id:"notifications",label:"Kogo zawiadomiono?",type:"textarea",placeholder:"inwestor, właściciel, ubezpieczyciel, organ…"}
          ]
        },
        {
          title:"Dokumentacja dowodowa",
          checklist:[
            ["photo_general","Widok ogólny miejsca szkody"],
            ["photo_detail","Szczegółowe ujęcia uszkodzeń"],
            ["photo_area","Granice / powierzchnia szkody"],
            ["photo_refs","Punkty odniesienia dla lokalizacji"],
            ["photo_vehicle","Pojazdy, maszyny lub ślady przejazdu"],
            ["photo_crop","Uprawa"],
            ["photo_soil","Gleba"],
            ["photo_drainage","Melioracja, rowy, dreny, przepusty"],
            ["photo_pollution","Zanieczyszczenia / odpady / wycieki"],
            ["photo_actions","Działania zabezpieczające lub naprawcze"]
          ],
          fields:[
            {id:"map_sketch",label:"Mapa / szkic / GPS / sposób oznaczenia miejsca",type:"textarea"},
            {id:"witnesses",label:"Świadkowie / osoby mające wiedzę o zdarzeniu",type:"textarea"}
          ]
        },
        {
          title:"Naprawa i wycena",
          fields:[
            {id:"repair_scope",label:"Uzgodnione działania naprawcze",type:"textarea"},
            {id:"repair_start",label:"Termin rozpoczęcia naprawy",type:"text"},
            {id:"repair_end",label:"Termin zakończenia naprawy",type:"text"},
            {id:"responsible",label:"Osoba odpowiedzialna po stronie inwestora",type:"text"},
            {id:"valuation",label:"Wstępna wycena szkody / sposób dalszej wyceny",type:"textarea"},
            {id:"undisputed",label:"Kwota / część bezsporna, jeżeli ustalona",type:"text"},
            {id:"hidden_effects",label:"Możliwe skutki ukryte lub odroczone",type:"textarea",placeholder:"plonowanie, zagęszczenie, drenarka, woda, dopłaty, podatki, kolejne sezony"}
          ]
        },
        {
          title:"Zastrzeżenia i podpisanie",
          fields:[
            {id:"owner_claims",label:"Żądania / stanowisko właściciela",type:"textarea"},
            {id:"reservations",label:"Zastrzeżenia do protokołu",type:"textarea"},
            {id:"attachments",label:"Załączniki i numery zdjęć",type:"textarea"},
            {id:"signature_note",label:"Podpisy / odmowa podpisu / uwagi końcowe",type:"textarea"}
          ]
        }
      ]
    },
    {
      id:"repair",
      title:"Karta naprawy szkody",
      short:"Czy naprawiono to, co zapisano w protokole szkody?",
      source:"Karta praktyczna · zbudowana z procedury szkody i dokumentacji powykonawczej",
      sourceType:"practice",
      guide:"GUIDE-057",
      path:"/umowa/inwestor-naruszyl-umowe/",
      sections:[
        ...common(),
        {
          title:"Odniesienie do szkody",
          fields:[
            {id:"damage_ref",label:"Protokół szkody / zgłoszenie",type:"text",placeholder:"data, numer lub opis"},
            {id:"damage_summary",label:"Co miało zostać naprawione?",type:"textarea"},
            {id:"agreed_method",label:"Uzgodniony sposób naprawy",type:"textarea"},
            {id:"deadline",label:"Uzgodniony termin",type:"text"},
            {id:"responsible",label:"Odpowiedzialny wykonawca / osoba",type:"text"}
          ]
        },
        {
          title:"Wykonanie naprawy",
          fields:[
            {id:"work_done",label:"Co rzeczywiście wykonano?",type:"textarea"},
            {id:"dates",label:"Daty wykonania prac",type:"text"},
            {id:"materials",label:"Materiały / technologia / sprzęt",type:"textarea"},
            {id:"measurements",label:"Pomiary, badania lub opinie",type:"textarea"},
            {id:"documents",label:"Dokumenty potwierdzające wykonanie",type:"textarea"}
          ]
        },
        {
          title:"Kontrola rezultatu",
          fields:[
            {id:"soil_after",label:"Stan gleby po naprawie",type:"textarea"},
            {id:"crop_after",label:"Stan upraw / możliwość dalszego użytkowania",type:"textarea"},
            {id:"drainage_after",label:"Stan drenarki, rowów i odpływu wód",type:"textarea"},
            {id:"roads_after",label:"Stan dróg / zjazdów / przejazdów",type:"textarea"},
            {id:"remaining",label:"Wady lub prace pozostałe do wykonania",type:"textarea"},
            {id:"monitoring",label:"Czy potrzebny jest dalszy monitoring?",type:"textarea"}
          ]
        },
        {
          title:"Zdjęcia przed i po naprawie",
          checklist:[
            ["photo_before","Stan przed naprawą / odniesienie do zdjęć protokołu szkody"],
            ["photo_during","Przebieg prac — elementy niewidoczne po zasypaniu"],
            ["photo_after","Stan bezpośrednio po naprawie"],
            ["photo_water","Melioracja / odpływ / miejsca po odkrywkach"],
            ["photo_refs","Ujęcia z tych samych punktów odniesienia"]
          ]
        },
        {
          title:"Odbiór naprawy",
          fields:[
            {id:"acceptance",label:"Stanowisko właściciela",type:"select",options:[["","— wybierz —"],["accepted","Naprawa odebrana w zakresie widocznym"],["conditional","Odbiór z zastrzeżeniami"],["notaccepted","Naprawa nieodebrana"]]},
            {id:"reservations",label:"Zastrzeżenia / skutki ukryte / dalsze roszczenia",type:"textarea"},
            {id:"next_deadline",label:"Termin usunięcia pozostałych wad",type:"text"},
            {id:"signature_note",label:"Podpisy / odmowa podpisu / uwagi końcowe",type:"textarea"}
          ]
        }
      ]
    },
    {
      id:"temporary",
      title:"Karta czasowego zajęcia i zejścia z gruntu",
      short:"Powierzchnia, czas, stan przed i po oraz przywrócenie terenu",
      source:"Karta praktyczna · zbudowana z protokołu wejścia i dokumentacji powykonawczej",
      sourceType:"practice",
      guide:"GUIDE-010",
      path:"/umowa/ile-ziemi-zajmie-inwestycja/",
      sections:[
        ...common(),
        {
          title:"Zakres czasowego zajęcia",
          fields:[
            {id:"purpose",label:"Cel zajęcia",type:"textarea"},
            {id:"area",label:"Powierzchnia i lokalizacja",type:"textarea"},
            {id:"map_ref",label:"Mapa / szkic / załącznik",type:"text"},
            {id:"start",label:"Data rozpoczęcia",type:"date"},
            {id:"planned_end",label:"Planowana data zakończenia",type:"date"},
            {id:"actual_end",label:"Faktyczna data zejścia",type:"date"},
            {id:"payment",label:"Uzgodniona opłata za zajęcie / przedłużenie",type:"textarea"},
            {id:"activities",label:"Dopuszczone czynności, sprzęt i sposób korzystania",type:"textarea"}
          ]
        },
        {
          title:"Stan przed zajęciem",
          fields:[
            {id:"before_crop",label:"Uprawa",type:"textarea"},
            {id:"before_soil",label:"Gleba / warstwa orna / uwilgotnienie",type:"textarea"},
            {id:"before_water",label:"Melioracja / rowy / odpływ",type:"textarea"},
            {id:"before_roads",label:"Drogi i dostęp",type:"textarea"}
          ]
        },
        {
          title:"Stan przy zejściu",
          fields:[
            {id:"work_summary",label:"Co wykonano na zajętej powierzchni?",type:"textarea"},
            {id:"after_soil",label:"Stan gleby po zejściu",type:"textarea"},
            {id:"after_crop",label:"Stan upraw / utrata plonu",type:"textarea"},
            {id:"after_water",label:"Stan melioracji i odpływu wód",type:"textarea"},
            {id:"after_roads",label:"Stan dróg, zjazdów i przejazdów",type:"textarea"},
            {id:"remaining_materials",label:"Materiały, odpady, utwardzenia lub sprzęt pozostawiony na miejscu",type:"textarea"},
            {id:"damage",label:"Szkody wymagające odrębnego protokołu",type:"textarea"},
            {id:"restoration",label:"Prace potrzebne do pełnego przywrócenia terenu",type:"textarea"}
          ]
        },
        {
          title:"Dokumentacja zdjęciowa",
          checklist:[
            ["photo_before","Stan powierzchni przed zajęciem"],
            ["photo_boundaries","Granice zajętej powierzchni"],
            ["photo_during","Prace i elementy ukrywane później w gruncie"],
            ["photo_after","Stan po zejściu"],
            ["photo_roads","Drogi, zjazdy i przejazdy"],
            ["photo_water","Rowy, dreny, przepusty i miejsca odpływu"]
          ]
        },
        {
          title:"Rozliczenie zejścia",
          fields:[
            {id:"overstay",label:"Przekroczenie terminu / dalsze korzystanie",type:"textarea"},
            {id:"settlement",label:"Należne opłaty, szkody i inne rozliczenia",type:"textarea"},
            {id:"reservations",label:"Zastrzeżenia właściciela",type:"textarea"},
            {id:"signature_note",label:"Podpisy / odmowa podpisu / uwagi końcowe",type:"textarea"}
          ]
        }
      ]
    },
    {
      id:"demolition",
      title:"Protokół demontażu",
      short:"Co usunięto, co zostało pod ziemią, odpady i dalsza rekultywacja",
      source:"Wzorzec umowy · Załącznik nr 10",
      sourceType:"source",
      guide:"GUIDE-030",
      path:"/umowa/co-usunac-po-inwestycji/",
      sections:[
        ...common(),
        {
          title:"Zakres demontażu",
          fields:[
            {id:"basis",label:"Podstawa demontażu",type:"textarea",placeholder:"koniec eksploatacji / wypowiedzenie / częściowa likwidacja / inna"},
            {id:"area",label:"Część nieruchomości i powierzchnia objęta demontażem",type:"textarea"},
            {id:"plan_ref",label:"Mapa / opis inwestycji / plan demontażu i rekultywacji",type:"textarea"},
            {id:"removed",label:"Elementy usunięte",type:"textarea",placeholder:"turbina, łopaty, wieża, fundament, kable, drogi, place, urządzenia…"},
            {id:"remaining",label:"Elementy pozostawione",type:"textarea"},
            {id:"remaining_basis",label:"Podstawa pisemnej zgody na pozostawienie każdego elementu",type:"textarea"}
          ]
        },
        {
          title:"Elementy podziemne i utwardzenia",
          fields:[
            {id:"foundation",label:"Fundament, kotwy i zbrojenie — zakres usunięcia",type:"textarea"},
            {id:"cables",label:"Kable, światłowody, rury, uziemienia, studnie — zakres usunięcia",type:"textarea"},
            {id:"depth",label:"Przebieg / długość / głębokość elementów pozostawionych lub usuniętych",type:"textarea"},
            {id:"roads",label:"Drogi, place, zjazdy, przepusty — zakres rozbiórki i odtworzenia",type:"textarea"},
            {id:"geodesy",label:"Dokumentacja geodezyjna / powykonawcza",type:"textarea"}
          ]
        },
        {
          title:"Odpady i pozostałości",
          fields:[
            {id:"waste",label:"Rodzaje i ilości odpadów",type:"textarea"},
            {id:"storage",label:"Miejsce czasowego gromadzenia i zabezpieczenie",type:"textarea"},
            {id:"waste_receiver",label:"Odbiorca / data wywozu / miejsce zagospodarowania",type:"textarea"},
            {id:"waste_docs",label:"Dokumenty potwierdzające zagospodarowanie",type:"textarea"},
            {id:"remaining_waste",label:"Pozostałości wymagające dalszego usunięcia",type:"textarea"}
          ]
        },
        {
          title:"Stan gruntu po demontażu",
          fields:[
            {id:"soil",label:"Powierzchnia, warstwa orna, podglebie, koleiny, nierówności",type:"textarea"},
            {id:"water",label:"Melioracja, rowy, przepusty, odpływ, zastoiska wodne",type:"textarea"},
            {id:"farm_access",label:"Drogi rolnicze, przejazdy i możliwość korzystania",type:"textarea"},
            {id:"damage",label:"Szkody ujawnione podczas demontażu",type:"textarea"},
            {id:"safe_use",label:"Czy teren może być bezpiecznie użytkowany przed zakończeniem rekultywacji?",type:"select",options:yesNo},
            {id:"temporary_security",label:"Zabezpieczenia tymczasowe pozostające po demontażu",type:"textarea"},
            {id:"reclamation_left",label:"Prace rekultywacyjne pozostające do wykonania",type:"textarea"}
          ]
        },
        {
          title:"Zdjęcia i dowody demontażu",
          checklist:[
            ["photo_general","Widok ogólny obszaru demontażu"],
            ["photo_turbine","Miejsce po turbinie"],
            ["photo_foundation","Miejsce po fundamencie"],
            ["photo_excavation_before","Wykopy PRZED zasypaniem"],
            ["photo_excavation_after","Wykopy PO zasypaniu"],
            ["photo_cables","Korytarze kablowe / elementy podziemne"],
            ["photo_roads","Drogi, place, zjazdy i przepusty"],
            ["photo_drainage","Rowy i urządzenia melioracyjne"],
            ["photo_waste","Miejsca składowania odpadów"],
            ["photo_damage","Miejsca ujawnionych szkód"],
            ["photo_remaining","Elementy pozostawione na nieruchomości"]
          ]
        },
        {
          title:"Sprawy pozostające po demontażu",
          fields:[
            {id:"open_items",label:"Lista czynności jeszcze niewykonanych",type:"textarea"},
            {id:"claims",label:"Nierozliczone szkody / roszczenia / płatności",type:"textarea"},
            {id:"reservations",label:"Zastrzeżenia właściciela",type:"textarea"},
            {id:"signature_note",label:"Podpisy / odmowa podpisu / uwagi końcowe",type:"textarea"}
          ]
        }
      ]
    },
    {
      id:"reclamation",
      title:"Końcowy odbiór rekultywacji",
      short:"Czy grunt naprawdę wrócił do funkcji rolniczej?",
      source:"Wzorzec umowy · Załącznik nr 11",
      sourceType:"source",
      guide:"GUIDE-030",
      path:"/umowa/co-usunac-po-inwestycji/",
      sections:[
        ...common(),
        {
          title:"Zakres odbioru",
          fields:[
            {id:"reclamation_area",label:"Obszar podlegający odbiorowi",type:"textarea"},
            {id:"demolition_ref",label:"Odniesienie do protokołu demontażu",type:"text"},
            {id:"works",label:"Zakres wykonanych prac rekultywacyjnych",type:"textarea"},
            {id:"agri_use",label:"Czy grunt nadaje się do normalnego użytkowania rolniczego?",type:"select",options:yesNo},
            {id:"remaining_limits",label:"Pozostałe ograniczenia w korzystaniu",type:"textarea"}
          ]
        },
        {
          title:"Gleba i warstwa orna",
          fields:[
            {id:"topsoil",label:"Stan warstwy ornej i podglebia",type:"textarea"},
            {id:"compaction",label:"Zagęszczenie, nierówności, kamienie, gruz, zanieczyszczenia",type:"textarea"},
            {id:"soil_tests",label:"Badania gleby — data, wykonawca, zakres, wyniki",type:"textarea"},
            {id:"soil_actions",label:"Dalsze zalecenia / zabiegi agrotechniczne",type:"textarea"}
          ]
        },
        {
          title:"Woda, melioracja i dostęp",
          fields:[
            {id:"drainage",label:"Dreny, rowy, przepusty, odpływy i drożność",type:"textarea"},
            {id:"water_effects",label:"Zastoiska, podtopienia, przesuszenie, zmiana odpływu",type:"textarea"},
            {id:"roads",label:"Drogi rolnicze, zjazdy, przejazdy i przepusty",type:"textarea"},
            {id:"specialist",label:"Czy potrzebna jest opinia specjalisty / dalsze badania?",type:"textarea"}
          ]
        },
        {
          title:"Co pozostało na nieruchomości?",
          fields:[
            {id:"remaining_elements",label:"Pozostawione elementy inwestycji",type:"textarea",placeholder:"nazwa, lokalizacja, wymiary, głębokość"},
            {id:"consent_basis",label:"Podstawa pisemnej zgody na pozostawienie",type:"textarea"},
            {id:"impact",label:"Wpływ pozostawionych elementów na rolnictwo, dopłaty, podatki i wartość gruntu",type:"textarea"},
            {id:"remaining_waste",label:"Odpady / gruz / beton / kable / inne pozostałości",type:"textarea"}
          ]
        },
        {
          title:"Dokumentacja końcowa",
          checklist:[
            ["photo_general","Widok ogólny po rekultywacji"],
            ["photo_soil","Gleba i warstwa orna"],
            ["photo_water","Melioracja, rowy, odpływy i miejsca wcześniej uszkodzone"],
            ["photo_roads","Drogi, zjazdy, przejazdy i przepusty"],
            ["photo_remaining","Każdy pozostawiony element inwestycji"],
            ["photo_reference","Ujęcia z tych samych punktów co przed budową / przed demontażem"]
          ],
          fields:[
            {id:"docs",label:"Badania, mapy, dokumenty odpadowe i inne załączniki",type:"textarea"},
            {id:"admin_actions",label:"Pozostałe czynności: KW, ewidencja, podatki, dopłaty, rejestry",type:"textarea"},
            {id:"monitoring",label:"Dalszy monitoring gleby, wody, melioracji lub dróg",type:"textarea"},
            {id:"securities",label:"Zabezpieczenia i ubezpieczenia utrzymywane po odbiorze",type:"textarea"}
          ]
        },
        {
          title:"Roszczenia i zastrzeżenia",
          fields:[
            {id:"open_claims",label:"Nierozliczone roszczenia i należności",type:"textarea"},
            {id:"reservations",label:"Zastrzeżenia do rekultywacji",type:"textarea"},
            {id:"hidden_effects",label:"Ryzyka szkód ukrytych / odroczonych",type:"textarea"},
            {id:"acceptance",label:"Stanowisko właściciela",type:"select",options:[["","— wybierz —"],["accepted","Odbiór w zakresie widocznym"],["conditional","Odbiór z zastrzeżeniami"],["notaccepted","Brak odbioru"]]},
            {id:"signature_note",label:"Podpisy / odmowa podpisu / uwagi końcowe",type:"textarea"}
          ]
        }
      ]
    }
  ];

  let state = {active:"", data:{}};

  const esc = value => String(value || "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") state = {...state,...saved,data:saved.data || {}};
    } catch {}
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function currentTemplate() {
    return templates.find(t => t.id === state.active) || null;
  }

  function protocolData(id) {
    if (!state.data[id]) state.data[id] = {fields:{},checks:{},checkNotes:{}};
    return state.data[id];
  }

  function allFieldIds(template) {
    return template.sections.flatMap(s => [
      ...(s.fields || []).map(f => f.id),
      ...(s.checklist || []).map(([id]) => id)
    ]);
  }

  function filledStats(template) {
    const d = protocolData(template.id);
    let total = 0, filled = 0;
    template.sections.forEach(s => {
      (s.fields || []).forEach(f => {
        total++;
        if (String(d.fields[f.id] || "").trim()) filled++;
      });
      (s.checklist || []).forEach(([id]) => {
        total++;
        if (d.checks[id]) filled++;
      });
    });
    return {filled,total};
  }

  function fieldHtml(f, value) {
    const commonAttr = `data-field="${f.id}"`;
    if (f.type === "textarea") {
      return `<textarea rows="3" ${commonAttr} placeholder="${esc(f.placeholder || "")}">${esc(value)}</textarea>`;
    }
    if (f.type === "select") {
      return `<select ${commonAttr}>${(f.options || []).map(([v,l]) => `<option value="${esc(v)}" ${String(value) === String(v) ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
    }
    return `<input type="${f.type || "text"}" ${commonAttr} value="${esc(value)}" placeholder="${esc(f.placeholder || "")}">`;
  }

  function renderStart() {
    root.innerHTML = `
      <section class="protocol-shell">
        <div class="section-head protocol-start-head">
          <div>
            <div class="eyebrow">Wybierz sytuację</div>
            <h2>Co chcesz dziś udokumentować?</h2>
          </div>
          <p>Cztery protokoły odpowiadają bezpośrednio załącznikom analizowanego wzorca. Dwie dodatkowe karty są praktycznym rozwinięciem jego obowiązków dokumentacyjnych.</p>
        </div>
        <div class="protocol-picker">
          ${templates.map(t => {
            const stats = filledStats(t);
            const has = stats.filled > 0;
            return `
              <button type="button" class="protocol-pick" data-open-protocol="${t.id}">
                <span class="protocol-source ${t.sourceType}">${t.sourceType === "source" ? "WZORZEC UMOWY" : "KARTA PRAKTYCZNA"}</span>
                <strong>${esc(t.title)}</strong>
                <p>${esc(t.short)}</p>
                <small>${esc(t.source)}</small>
                ${has ? `<b>W toku · ${stats.filled} pól zaznaczonych / uzupełnionych</b>` : "<b>Otwórz formularz →</b>"}
              </button>`;
          }).join("")}
        </div>
        <div class="notice protocol-method">
          <strong>Jak korzystać:</strong> formularz jest kartą dokumentacyjną właściciela. Jeżeli Twoja podpisana umowa ma własny wzór protokołu, porównaj z nim pola i użyj dokumentu wymaganego przez kontrakt. To narzędzie ma pomóc niczego nie przeoczyć — nie zastępuje formy wymaganej w konkretnej umowie.
        </div>
      </section>`;

    root.querySelectorAll("[data-open-protocol]").forEach(btn => {
      btn.addEventListener("click", () => {
        state.active = btn.dataset.openProtocol;
        save();
        renderProtocol();
        window.scrollTo({top:root.offsetTop - 70,behavior:"smooth"});
      });
    });
  }

  function renderProtocol() {
    const t = currentTemplate();
    if (!t) return renderStart();
    const d = protocolData(t.id);
    const stats = filledStats(t);

    root.innerHTML = `
      <section class="protocol-shell">
        <div class="protocol-toolbar">
          <button type="button" class="button" data-back>← Wybierz inny protokół</button>
          <div class="protocol-progress"><strong>${stats.filled}</strong> / ${stats.total} pól zaznaczonych lub uzupełnionych <span>· nie jest to ocena kompletności prawnej</span></div>
          <div class="protocol-actions">
            <button type="button" class="button" data-print>Drukuj / PDF</button>
            <button type="button" class="button" data-clear>Wyczyść ten formularz</button>
          </div>
        </div>

        <div class="protocol-print-head">
          <span>Grunt i wiatr · karta dokumentacyjna właściciela</span>
          <strong>${esc(t.title)}</strong>
        </div>

        <header class="protocol-title-card">
          <div>
            <span class="protocol-source ${t.sourceType}">${t.sourceType === "source" ? "WZORZEC UMOWY" : "KARTA PRAKTYCZNA"}</span>
            <h1>${esc(t.title)}</h1>
            <p>${esc(t.source)}</p>
          </div>
          <a class="button" href="${t.path}">${esc(t.guide)} →</a>
        </header>

        ${t.sections.map((section,sectionIndex) => `
          <section class="protocol-section">
            <div class="protocol-section-title">
              <span>${String(sectionIndex+1).padStart(2,"0")}</span>
              <h2>${esc(section.title)}</h2>
            </div>

            ${section.fields?.length ? `
              <div class="protocol-fields">
                ${section.fields.map(f => `
                  <label class="protocol-field ${f.type === "textarea" ? "wide" : ""}">
                    <span>${esc(f.label)}</span>
                    ${fieldHtml(f,d.fields[f.id] || "")}
                  </label>`).join("")}
              </div>` : ""}

            ${section.checklist?.length ? `
              <div class="protocol-checklist">
                ${section.checklist.map(([id,label]) => `
                  <div class="protocol-check-row">
                    <label class="protocol-check">
                      <input type="checkbox" data-check="${id}" ${d.checks[id] ? "checked" : ""}>
                      <span>${esc(label)}</span>
                    </label>
                    <input type="text" data-check-note="${id}" value="${esc(d.checkNotes[id] || "")}" placeholder="nr / nazwa zdjęcia albo krótka uwaga">
                  </div>`).join("")}
              </div>` : ""}
          </section>`).join("")}

        <section class="protocol-footer-note">
          <strong>Ważne:</strong> podpisanie protokołu dokumentacyjnego nie powinno być automatycznie utożsamiane ze zrzeczeniem się roszczeń dotyczących skutków ukrytych lub odroczonych. Znaczenie konkretnego podpisu zależy jednak od treści dokumentu i umowy.
        </section>
      </section>`;

    bindProtocol();
  }

  function bindProtocol() {
    const t = currentTemplate();
    const d = protocolData(t.id);

    root.querySelector("[data-back]").addEventListener("click", () => {
      state.active = "";
      save();
      renderStart();
    });

    root.querySelectorAll("[data-field]").forEach(el => {
      el.addEventListener("input", () => {
        d.fields[el.dataset.field] = el.value;
        save();
        refreshStats(t);
      });
      el.addEventListener("change", () => {
        d.fields[el.dataset.field] = el.value;
        save();
        refreshStats(t);
      });
    });

    root.querySelectorAll("[data-check]").forEach(el => {
      el.addEventListener("change", () => {
        d.checks[el.dataset.check] = el.checked;
        save();
        refreshStats(t);
      });
    });

    root.querySelectorAll("[data-check-note]").forEach(el => {
      el.addEventListener("input", () => {
        d.checkNotes[el.dataset.checkNote] = el.value;
        save();
      });
    });

    root.querySelector("[data-print]").addEventListener("click", () => window.print());

    root.querySelector("[data-clear]").addEventListener("click", () => {
      if (!confirm("Wyczyścić tylko ten protokół zapisany na tym urządzeniu?")) return;
      state.data[t.id] = {fields:{},checks:{},checkNotes:{}};
      save();
      renderProtocol();
    });
  }

  function refreshStats(t) {
    const s = filledStats(t);
    const box = root.querySelector(".protocol-progress");
    if (box) box.innerHTML = `<strong>${s.filled}</strong> / ${s.total} pól zaznaczonych lub uzupełnionych <span>· nie jest to ocena kompletności prawnej</span>`;
  }

  load();
  if (state.active && templates.some(t => t.id === state.active)) renderProtocol();
  else renderStart();
})();