# Security Hardening v1

Status roboczy dla serwisu **Grunt i wiatr**.

## Zweryfikowany stan

- serwis jest statyczny (HTML/CSS/JS), bez bazy danych i bez serwera aplikacyjnego;
- domena publikacyjna: `gruntiwiatr.pl`;
- repozytorium GitHub jest publiczne;
- wersja robocza jest rozwijana przez pull requesty;
- workflow `Site QA` działa z minimalnym uprawnieniem `contents: read`;
- w chwili audytu gałęzie repozytorium nie miały ochrony, a repozytorium nie miało rulesetu.

## Zasada bezpieczeństwa

Najważniejsza jest integralność treści. Niedostępność serwisu jest mniej groźna niż niezauważona podmiana informacji prawnych lub umownych.

Zmiana publikowana do wersji głównej powinna przejść automatyczne testy przed wdrożeniem.

## Automatyczny audyt

`scripts/security-audit.mjs` kontroluje przy każdym PR:

- przypadkowe dodanie kluczy prywatnych i wybranych tokenów;
- obecność plików typu `.env`, `.pem`, `.key`, `.p12`, `.pfx`;
- ładowanie aktywnych zasobów przez nieszyfrowany HTTP;
- próby komunikacji JavaScript przez nieszyfrowany HTTP;
- zgodność pliku `CNAME` z domeną `gruntiwiatr.pl`;
- sygnalizuje zewnętrzne skrypty oraz użycie dynamicznych API JavaScript do ręcznego przeglądu.

## Kontrole wymagające ustawień właściciela

Te ustawienia nie są przechowywane w kodzie repozytorium i muszą być sprawdzone na kontach usług:

- [ ] GitHub: passkey lub 2FA inne niż wyłącznie SMS;
- [ ] GitHub: ruleset/ochrona gałęzi produkcyjnej przed force-push i usunięciem;
- [ ] GitHub: obowiązkowy przechodzący `Site QA` przed zmianą gałęzi produkcyjnej;
- [ ] GitHub Pages: wymuszony HTTPS;
- [ ] GitHub Pages: zweryfikowana domena własna;
- [ ] rejestrator domeny: 2FA i blokada transferu domeny;
- [ ] DNS: ograniczony dostęp administracyjny;
- [ ] po uruchomieniu Cloudflare: proxy, automatyczna ochrona DDoS i rozsądne reguły ograniczające boty.

## Procedura awaryjna

W przypadku podejrzenia podmiany treści:

1. wstrzymać dalsze publikacje;
2. ustalić ostatni zaufany commit;
3. przywrócić wersję publikacyjną do tego commitu;
4. unieważnić podejrzane tokeny/sesje i zabezpieczyć konto;
5. sprawdzić historię commitów i zmian DNS;
6. uruchomić pełny `Site QA` i audyt bezpieczeństwa;
7. dopiero po ustaleniu przyczyny wznowić publikowanie.

## Czego celowo nie dodajemy

Na obecnym etapie nie dodajemy panelu administratora, WordPressa, bazy danych ani publicznych kont użytkowników. Statyczna architektura pozostaje podstawowym zabezpieczeniem serwisu.
