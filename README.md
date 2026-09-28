# Wind Land Guide

Robocze repozytorium neutralnego kompendium dla właścicieli gruntów dotyczącego udostępniania nieruchomości pod projekty energetyki wiatrowej w Polsce.

## Aktualna architektura

- `/pl/` — polska wersja źródłowa
- `/pl/zanim-podpiszesz/` — ścieżka pierwszego kontaktu z inwestorem
- `/pl/umowa/` — analiza umowy i cyklu życia projektu
- `/en/` — przygotowana warstwa angielska
- `/assets/` — wspólne style
- `content-index.json` — centralny indeks materiałów GUIDE

Aktualny rdzeń obejmuje GUIDE-001–GUIDE-050.

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
