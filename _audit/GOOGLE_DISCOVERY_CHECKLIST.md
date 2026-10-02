# Google discovery — checklista wdrożeniowa

Stan: 2026-09-30

## Co już robi serwis

- publiczne strony zwracają normalny HTML i są dostępne bez logowania,
- robots.txt zezwala na crawling i wskazuje sitemap.xml,
- każda główna strona ma canonical,
- dawne adresy /pl/ są stronami przejściowymi z noindex,follow i canonicalem do aktualnego URL,
- sitemap.xml zawiera aktualne adresy,
- GUIDE-y mają unikalne tytuły, H1 i meta description,
- katalog GUIDE ma statyczne linki HTML do wszystkich 61 materiałów jeszcze przed wykonaniem JavaScriptu,
- strona główna, Umowa, Start, Realizacja i Koniec mają opisowe tytuły i H1 odpowiadające intencjom wyszukiwania właścicieli gruntów,
- GUIDE-y otrzymują semantyczne linki do materiałów powiązanych,
- Article / WebSite / BreadcrumbList structured data są generowane w site.js,
- metodologia, źródła, stan prawny, korekty i prywatność są dostępne z całego serwisu.

## Search Console — po publikacji v2.7

1. Zweryfikować domenę gruntiwiatr.pl jako właściwość domenową.
2. W sekcji Sitemaps zgłosić:
   https://gruntiwiatr.pl/sitemap.xml
3. Narzędziem URL Inspection sprawdzić co najmniej:
   - https://gruntiwiatr.pl/
   - https://gruntiwiatr.pl/umowa/
   - https://gruntiwiatr.pl/guide/
   - https://gruntiwiatr.pl/umowa/co-obejmuje-roczna-kwota/
   - https://gruntiwiatr.pl/umowa/pelnomocnictwo/
   - https://gruntiwiatr.pl/umowa/drenarka/
   - https://gruntiwiatr.pl/umowa/co-usunac-po-inwestycji/
   - https://gruntiwiatr.pl/mapa-paragrafow/
4. Dla kilku najważniejszych nowych lub gruntownie zmienionych adresów użyć „Request indexing”.
5. W URL Inspection sprawdzić wyrenderowany HTML i potwierdzić, że Google widzi:
   - treść GUIDE,
   - linki do GUIDE-ów powiązanych,
   - structured data,
   - canonical.
6. Po pierwszych danych w Performance obserwować:
   - zapytania, dla których pojawia się serwis,
   - strony z dużą liczbą wyświetleń i niskim CTR,
   - zapytania, dla których pozycja jest 8–30 (kandydaci do dopracowania treści i linkowania),
   - różnicę między mobile i desktop.
7. Nie zmieniać tytułów tylko po to, by „upchnąć” zapytania. Najpierw patrzeć na realne query z Search Console.
8. Nie korzystać z Indexing API dla zwykłych artykułów; standardową drogą pozostają crawlable links, sitemap i URL Inspection.

## Kolejny etap po zebraniu danych

Po uzyskaniu 4–8 tygodni danych Search Console zrobić audyt:
- top 50 queries,
- top landing pages,
- CTR względem pozycji,
- strony „prawie na pierwszej stronie”,
- tematy wyszukiwane przez ludzi, których kompendium jeszcze nie ma,
- potencjalne kanibalizacje (dwa GUIDE-y na to samo query).

Dalsze tytuły, opisy i nowe materiały powinny wynikać przede wszystkim z rzeczywistych danych Search Console, a nie z zgadywania słów kluczowych.
