# Wind Land Guide

Robocze repozytorium neutralnego kompendium dla właścicieli gruntów dotyczącego udostępniania nieruchomości pod projekty energetyki wiatrowej w Polsce.

## Aktualna architektura

- `/pl/` — polska wersja źródłowa
- `/pl/zanim-podpiszesz/` — ścieżka pierwszego kontaktu z inwestorem
- `/pl/umowa/` — analiza umowy i cyklu życia projektu
- `/en/` — przygotowana warstwa angielska
- `/assets/` — wspólne style
- `content-index.json` — centralny indeks materiałów GUIDE

Aktualny rdzeń obejmuje GUIDE-001–GUIDE-061.

## Zasady redakcyjne

Treść rozdziela cztery kategorie:

- PRAWO — informacja wynikająca z przepisów lub oficjalnych źródeł,
- UMOWA — możliwe rozwiązanie kontraktowe,
- PRAKTYKA — działanie organizacyjne, dowodowe lub negocjacyjne warte rozważenia,
- SYTUACJA INDYWIDUALNA — zagadnienie zależne od konkretnej umowy, nieruchomości lub właściciela.

## Źródła

Preferowane są źródła pierwotne: ELI/Dziennik Ustaw, gov.pl, strony właściwych organów, rejestry publiczne, dokumenty planistyczne i orzeczenia.

Rozbudowany właścicielsko-ochronny wzorzec umowy wykorzystywany przy tworzeniu serwisu jest mapą możliwych zagadnień i mechanizmów umownych. Nie jest przedstawiany jako obowiązujący standard rynku.

## Prywatność

Do publicznego repozytorium i publicznej wersji strony **nie należy dodawać źródłowych prywatnych umów ani dokumentów zawierających dane osobowe właścicieli**, numery dokumentów, prywatne adresy, dane gospodarstw lub inne informacje niepotrzebne do celu edukacyjnego.

Publikowane materiały mają być opracowane i zanonimizowane.

## Technologia

Pierwsza wersja jest celowo statyczna: HTML + CSS, bez zewnętrznych frameworków i bez bazy danych. Ułatwia to audyt, hosting statyczny, bezpieczeństwo oraz późniejszą migrację do generatora statycznego, jeżeli skala treści będzie tego wymagała.

## Status

Wersja robocza. Treści i struktura są rozwijane na branchach i przeglądane przez pull requesty przed połączeniem z `main`.


## Wersja v0.4

Aktualna warstwa użyteczności obejmuje:

- wyszukiwarkę globalną po tytułach, obszarach i słowach kluczowych,
- mapę wiedzy na stronie głównej,
- ośmioobszarową mapę analizy umowy,
- GUIDE-006 jako wzorcowy pogłębiony przewodnik z kartą audytu, testem mapy i czerwonymi flagami,
- wspólny system nawigacji, spisów treści i mobilnego docka.

Kolejne GUIDE-y są pogłębiane według tego samego standardu, bez publikowania prywatnego źródłowego wzorca umowy ani danych osobowych.


### Wyszukiwanie v0.5

Wyszukiwarka działa pełnotekstowo: przy pierwszym użyciu wczytuje treść wszystkich GUIDE-ów i przeszukuje tytuły, śródtytuły, akapity, checklisty i tabele. Ręczne słowa kluczowe są wyłącznie warstwą pomocniczą i nie ograniczają tego, co użytkownik może wpisać. Wyszukiwanie toleruje brak polskich znaków, a wyniki pokazują fragment tekstu, w którym znaleziono trafienie.


### v0.6 — audyt umowy

Dodano narzędzie „Sprawdź swoją umowę w 5 minut”:
- 30 pytań w 8 obszarach,
- odpowiedzi TAK / NIE / NIE WIEM,
- bez punktacji i bez automatycznej oceny „dobra / zła umowa”,
- wynik w trzech grupach: odnalezione, sprawdź dokładniej, nie wiem / do ustalenia,
- każde pytanie prowadzi do właściwego GUIDE-a i podaje słowa, których można szukać w umowie,
- stan audytu zapisuje się lokalnie w przeglądarce,
- podsumowanie można wydrukować lub zapisać do PDF,
- narzędzie jest dostępne ze strony głównej, ze ścieżki „Umowa” i z wyszukiwarki.


### v0.7 — Karta analizy umowy

Podsumowanie audytu zostało przebudowane w drukowalną „Kartę analizy umowy”:
- opcjonalne oznaczenie projektu, inwestora, działki i wersji umowy,
- dane przechowywane wyłącznie lokalnie w przeglądarce,
- przekrój wszystkich 8 obszarów bez tworzenia punktacji lub rankingu,
- automatyczna „Lista do rozmowy” z odpowiedzi NIE / NIE WIEM / pominiętych,
- przy każdym punkcie miejsce na paragraf, załącznik i ustalenie ze spotkania,
- pełny zapis wszystkich 30 odpowiedzi dostępny na ekranie jako rozwijany aneks,
- wydruk A4 zoptymalizowany pod rozmowę z inwestorem lub doradcą,
- możliwość edycji opisu dokumentu po zakończeniu audytu bez utraty odpowiedzi.


### v0.8 — pogłębianie GUIDE-ów

Rozpoczęto drugi etap redakcyjny: zamiast zwiększać liczbę GUIDE-ów, pogłębiamy istniejące materiały przy zachowaniu lekkiej warstwy wejściowej.

Pierwsza pogłębiona paczka:
- GUIDE-050 — hierarchia dokumentów i wersji,
- GUIDE-048 — dokumenty do organów i status właściciela,
- GUIDE-036 — finansujący, direct agreement, SNDA i step-in,
- GUIDE-034 — ubezpieczenia,
- GUIDE-041 — ochrona gleby, upraw i melioracji.

Nowy standard pogłębienia obejmuje przykłady sytuacyjne, macierze kontrolne, tabele procesu, sygnały wymagające dodatkowego sprawdzenia oraz konkretne słowa do wyszukania we własnej umowie.


### v0.9 — rdzeń właścicielski

Druga paczka pogłębionych materiałów objęła siedem kluczowych GUIDE-ów:
- GUIDE-008 — rzeczywisty zakres praw do gruntu,
- GUIDE-009 — mapa jako połączenie praw, powierzchni i pieniędzy,
- GUIDE-011 — pełna mapa świadczeń i waloryzacji,
- GUIDE-020 — cały cykl wpisu do księgi wieczystej,
- GUIDE-022 — ciągłość odpowiedzialności przy zmianie inwestora,
- GUIDE-029 — proces demontażu i przywrócenia funkcji rolniczej,
- GUIDE-035 — mechanika gwarancji rekultywacyjnej.

W content-index dodano pole `depth`, aby śledzić postęp redakcyjny. Po v0.9 standard pogłębiony ma 13 z 50 GUIDE-ów.


### v0.12 — 34 z 50 GUIDE-ów pogłębionych

Kolejne trzy paczki redakcyjne objęły 21 GUIDE-ów i podniosły liczbę materiałów w standardzie `depth: deep` z 13 do 34.

Nowe warstwy pogłębione obejmują m.in.:
- pełnomocnictwa, wejście na grunt, protokół wejścia i dokumentowanie szkód,
- czas trwania i wypowiedzenie umowy,
- szkody, plony i koszty gospodarstwa,
- prawo do dysponowania na cele budowlane, służebności i zabezpieczenia płatności,
- podwykonawców, dokumentację właściciela, kary i wykonanie zastępcze,
- zmianę technologii, repowering, procedurę awaryjną i kontrolę wykonywania umowy,
- pierwszy dzień szkody, drenarkę, następstwo właściciela i dokładny zakres demontażu.

Standard pogłębienia pozostaje stały: przykład sytuacyjny, proces lub macierz kontrolna, tabela praktyczna, sygnały do sprawdzenia i frazy do wyszukania we własnej umowie.


### v1.0 — pełna biblioteka w standardzie pogłębionym

Biblioteka GUIDE-001–GUIDE-050 została doprowadzona do wspólnego standardu pogłębionego. W content-index wszystkie 50 materiałów ma status `depth: deep`.

Kontrola przekrojowa materiałów z początku, środka i końca biblioteki potwierdziła wspólny zestaw elementów redakcyjnych: przykłady sytuacyjne, macierze lub tabele kontrolne, sygnały do dodatkowego sprawdzenia oraz frazy do wyszukania we własnej umowie. GUIDE-006 pozostaje odrębnym wzorcem metody analizy i nie musi używać identycznych klas HTML jak pozostałe materiały.

Dodano również `EDITORIAL_STANDARD.md`, który opisuje zasady dalszej pracy: warstwę wejściową i pogłębioną, etykiety PRAWO / UMOWA / PRAKTYKA / SYTUACJA INDYWIDUALNA, zasadę CITE-SAFE, prywatność źródła i checklistę jakości przed publikacją.


### v1.1 — odbiór techniczny

Przeprowadzono pierwszy pełny odbiór techniczny serwisu przed publikacją.

Sprawdzone:
- 69 stron HTML,
- wewnętrzne linki i ścieżki zasobów,
- kotwice i duplikaty `id`,
- obecność `title`, meta description i pojedynczego H1 na stronach treści,
- składnia `assets/site.js` i `assets/audit.js`,
- spójność `content-index.json`,
- zachowanie tabel na małych ekranach,
- dostępność modalu wyszukiwarki,
- utrzymanie `noindex` w całej wersji draftowej.

Dodano własny workflow `Site QA` oraz `scripts/qa.mjs`, aby GitHub automatycznie wykonywał odbiór strukturalny po kolejnych zmianach.

Wydajność wyszukiwarki:
- wcześniejszy mechanizm pobierał treść 51 materiałów osobnymi żądaniami przy pierwszym wyszukiwaniu,
- v1.1 używa siedmiu statycznych paczek w `search-index/`,
- zachowano fallback do dynamicznego indeksowania stron, jeśli paczki nie załadują się prawidłowo.

Poprawki UX:
- lepsza czytelność tabel na telefonie,
- etykieta dostępności pola wyszukiwania,
- przywracanie fokusu do elementu, który otworzył wyszukiwarkę.

Stan publikacyjny:
- `noindex` pozostaje celowo włączony,
- zdejmowanie blokady indeksowania nastąpi dopiero po audycie źródeł prawnych i finalnym przeglądzie SEO.


### v1.2 — audyt prawa i źródeł

Przeprowadzono przekrojowy audyt aktualnego stanu prawnego i źródeł urzędowych na dzień 28.09.2026.

Zweryfikowane zostały m.in.:
- ustawa wiatrowa: 10H, minimum 700 m i odróżnienie zawetowanej propozycji 500 m od obowiązującego prawa,
- ustawa planistyczna i ZPI, w tym NSA II OSK 7/26,
- nowe rozporządzenie o przygotowaniu MPZP — Dz.U. 2026 poz. 1192 od 24.09.2026,
- ustawa OOŚ i rozporządzenie kwalifikacyjne wraz z Dz.U. 2026 poz. 706 oraz poz. 1185,
- Kodeks cywilny 2026: dzierżawa, pełnomocnictwo, służebność przesyłu, sprzedaż i dziedziczenie,
- KPC 2026 — art. 777,
- ustawa o księgach wieczystych i hipotece — Dz.U. 2026 poz. 1066,
- ustawa o kształtowaniu ustroju rolnego — Dz.U. 2026 poz. 941,
- ARiMR — zasady płatności 2026,
- PIT / ryczałt prywatnej dzierżawy oraz podatek od nieruchomości.

Korekty merytoryczne i źródłowe trafiły do GUIDE-014, GUIDE-015, GUIDE-020, GUIDE-051 i GUIDE-054 oraz do centralnego rejestru `/pl/stan-prawny/`.

Dodano `LEGAL_SOURCES_AUDIT.md`.

Stan biblioteki po dodaniu sekcji „Projekt”: 55 GUIDE-ów — 50 `depth: deep` i 5 nowych materiałów projektowo-proceduralnych `depth: standard`. Statyczny indeks wyszukiwarki został uzupełniony o GUIDE-051–055.

Serwis pozostaje na `noindex`. Przed publikacją wymagane są ponowne kontrole po 02.10.2026 (Prawo budowlane) oraz 20.10.2026 (art. 6g ustawy wiatrowej).


### v1.3 — domknięcie luk krytycznych

Dodano sześć GUIDE-ów wynikających z audytu pokrycia 360-stronicowego wzorca umowy:
- GUIDE-056 — uciążliwości eksploatacji: hałas, cień, lód, pomiary i serwis,
- GUIDE-057 — procedura po naruszeniu umowy, plan naprawczy i wykonanie zastępcze,
- GUIDE-058 — roszczenia osób trzecich, organów i wykonawców wobec właściciela,
- GUIDE-059 — prywatność gospodarstwa, zdjęcia, drony i komunikacja publiczna,
- GUIDE-060 — spór z inwestorem i ciągłość obowiązków niespornych,
- GUIDE-061 — prawa, których właściciel nie oddaje inwestorowi.

Po tej paczce macierz źródłowa nie zawiera już pozycji **BRAK**. Dalszy etap to pogłębienie pozostałych pozycji oznaczonych jako POGŁĘBIĆ, w pierwszej kolejności mechaniki czynszu i raportowania właścicielskiego.


### v1.4 — pieniądze i kontrola przez 30 lat

Pogłębiono dwa materiały kluczowe dla długoterminowej ochrony właściciela:
- GUIDE-011 — czynsz wejściowy, rezerwacyjny i zasadniczy; minimum gwarantowane; model zależny od MW; fundament i obszar rotora na różnych działkach; wzrost mocy i repowering; ryzyko produkcji po stronie inwestora,
- GUIDE-037 — raport zerowy, raportowanie zależne od etapu, planowane czynności, raport nadzwyczajny oraz praktyczny wzór raportu właścicielskiego.

Naprawiono również techniczną niespójność macierzy pokrycia po v1.3. Po ponownym przeliczeniu rzeczywistych statusów: 53 obszary są pokryte, 12 pozostaje do pogłębienia, 0 ma status BRAK i 0 pozostaje w priorytecie A.


### v1.5 — ubezpieczenia i pakiet podpisu

Pogłębiono dwa kolejne obszary wynikające z macierzy źródłowej:
- GUIDE-034 — OC osób trzecich i sąsiadów, regres ubezpieczyciela, transport, roboty ziemne, likwidacja szkody, dodatkowy ubezpieczony i ochrona podczas demontażu,
- GUIDE-050 — kompletność pakietu przed podpisem, pola „DO UZUPEŁNIENIA”, brakujące załączniki, wersjonowanie i zasada blokady działania do czasu uzupełnienia dokumentu.

Stan macierzy po v1.5: 57 obszarów POKRYTE, 8 POGŁĘBIĆ, 0 BRAK, 0 priorytetu A.


### v1.6 — czas projektu i harmonogram

Pogłębiono GUIDE-007 o pełny audyt czasu związania nieruchomości:
- etap przygotowawczy i jego maksymalny czas jako parametr do świadomego uzupełnienia,
- warunki przejścia do etapu projektowo-administracyjnego,
- daty graniczne dla decyzji, budowy, eksploatacji, demontażu i rekultywacji,
- reakcję na bezczynność inwestora,
- zasadę dalszych płatności i zabezpieczeń mimo opóźnienia,
- kalkulację „pesymistycznego maksymalnego czasu związania gruntu”,
- audyt 10 pytań do harmonogramu.

W materiale jawnie wskazano także wewnętrzną rozbieżność analizowanego wzorca między definicją Etapu Przygotowawczego w §1 a mechanizmem §6, zamiast sztucznie ją ujednolicać. Stan macierzy po v1.6: 59 POKRYTE, 6 POGŁĘBIĆ, 0 BRAK.


### v1.7 — nieruchomość i parametry inwestycji

Pogłębiono dwa obszary pozwalające porównać dokumenty „po jednej linijce”:
- GUIDE-009 — karta identyfikacji każdej działki: właściciel/współwłasność, KW, działka, obręb, jednostka, powierzchnia, użytki, dopłaty, melioracja, drogi i zgodność z mapą,
- GUIDE-031 — karta parametrów inwestycji: liczba turbin, moc, wysokość, rotor, łopaty, fundament, drogi, place, kable, infrastruktura dodatkowa oraz wersjonowanie parametrów.

Stan macierzy po v1.7: 61 POKRYTE, 4 POGŁĘBIĆ, 0 BRAK.


### v1.8 — definicje i podwykonawcy

Pogłębiono dwa kolejne obszary:
- GUIDE-006 — audyt definicji jako „silnika umowy”, z przykładami Inwestycji, Szkody, Podwykonawcy, Finansującego, Zabezpieczenia, Zgody Wydzierżawiającego i Siły Wyższej,
- GUIDE-033 — roszczenia podwykonawców wobec właściciela i nieruchomości, koszty obrony, zakaz tworzenia praw do gruntu oraz procedura po otrzymaniu wezwania od wykonawcy.

Stan macierzy po v1.8: 63 POKRYTE, 2 POGŁĘBIĆ, 0 BRAK.
