(() => {
  const root = document.querySelector("[data-my-project]");
  if (!root || !window.GruntWiatrProject) return;

  const api = window.GruntWiatrProject;
  const WORKSPACE_KEYS = [
    api.KEY,
    "grunt-i-wiatr-audit-v1",
    "grunt-i-wiatr:compare-offers:v1",
    "grunt-i-wiatr:owner-protocols:v1",
    "grunt-i-wiatr:money-calculator:v1"
  ];

  const stageOptions = [
    ["","— wybierz etap —"],
    ["first-contact","Pierwszy kontakt / oferta"],
    ["negotiation","Negocjacje umowy"],
    ["preparation","Etap przygotowawczy / rezerwacja"],
    ["administrative","Projekt i procedury administracyjne"],
    ["construction","Budowa"],
    ["operation","Eksploatacja"],
    ["repowering","Modernizacja / repowering"],
    ["demolition","Demontaż"],
    ["reclamation","Rekultywacja"],
    ["closed","Projekt zakończony"]
  ];

  let profile = api.read();
  let saveTimer = null;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));

  function field(id,label,type="text",placeholder="") {
    const value = profile[id] || "";
    if (type === "textarea") {
      return `<label class="project-field wide"><span>${esc(label)}</span><textarea rows="4" data-project-field="${id}" placeholder="${esc(placeholder)}">${esc(value)}</textarea></label>`;
    }
    return `<label class="project-field"><span>${esc(label)}</span><input type="${type}" data-project-field="${id}" value="${esc(value)}" placeholder="${esc(placeholder)}"></label>`;
  }

  function select(id,label,options) {
    return `<label class="project-field"><span>${esc(label)}</span><select data-project-field="${id}">${options.map(([v,l]) => `<option value="${esc(v)}" ${String(profile[id]||"")===String(v)?"selected":""}>${esc(l)}</option>`).join("")}</select></label>`;
  }

  function nonEmptyCount() {
    return Object.values(profile).filter(v => String(v || "").trim()).length;
  }

  function projectTitle() {
    return api.projectLabel(profile) || "Jeszcze bez nazwy projektu";
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      profile = api.write(profile);
      refreshStatus();
    },180);
  }

  function refreshStatus() {
    const title = root.querySelector("[data-project-summary-title]");
    const count = root.querySelector("[data-project-summary-count]");
    const saved = root.querySelector("[data-project-saved]");
    if (title) title.textContent = projectTitle();
    if (count) count.textContent = nonEmptyCount();
    if (saved) {
      saved.textContent = "Zapisano lokalnie";
      saved.classList.add("saved");
      setTimeout(() => saved.classList.remove("saved"),700);
    }
  }

  function exportWorkspace() {
    const stores = {};
    WORKSPACE_KEYS.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw == null) return;
      try { stores[key] = JSON.parse(raw); }
      catch { stores[key] = raw; }
    });

    const payload = {
      format:"grunt-i-wiatr-workspace",
      version:1,
      exportedAt:new Date().toISOString(),
      stores
    };

    const safeName = (profile.projectName || "moj-projekt")
      .toLocaleLowerCase("pl")
      .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .replace(/ł/g,"l")
      .replace(/[^a-z0-9]+/g,"-")
      .replace(/^-|-$/g,"")
      .slice(0,60) || "moj-projekt";

    const blob = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `grunt-i-wiatr-${safeName}-kopia.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href),1000);
  }

  function importWorkspace(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || ""));
        if (!payload || payload.format !== "grunt-i-wiatr-workspace" || payload.version !== 1 || !payload.stores || typeof payload.stores !== "object") {
          throw new Error("Nieprawidłowy format kopii.");
        }

        const known = WORKSPACE_KEYS.filter(key => Object.prototype.hasOwnProperty.call(payload.stores,key));
        if (!known.length) throw new Error("Kopia nie zawiera danych rozpoznawanych przez serwis.");

        const when = payload.exportedAt ? new Date(payload.exportedAt).toLocaleString("pl-PL") : "bez daty";
        if (!confirm(`Zaimportować kopię warsztatu (${when})? Zapisane lokalnie dane w rozpoznanych narzędziach zostaną zastąpione.`)) return;

        known.forEach(key => {
          const value = payload.stores[key];
          localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
        });

        profile = api.read();
        render();
        alert("Kopia została zaimportowana do tej przeglądarki.");
      } catch (error) {
        alert("Nie udało się zaimportować kopii: " + (error?.message || "nieznany błąd"));
      }
    };
    reader.readAsText(file);
  }

  function render() {
    root.innerHTML = `
      <section class="project-shell">
        <div class="project-summary-card">
          <div>
            <div class="eyebrow">Aktywny projekt</div>
            <h2 data-project-summary-title>${esc(projectTitle())}</h2>
            <p><strong data-project-summary-count>${nonEmptyCount()}</strong> pól profilu ma wpisaną wartość. To licznik organizacyjny, nie ocena kompletności dokumentacji.</p>
          </div>
          <div class="project-summary-actions">
            <span data-project-saved>Zapis lokalny</span>
            <button type="button" class="button" data-project-print>Drukuj kartę</button>
          </div>
        </div>

        <section class="project-card">
          <div class="project-card-head"><span>01</span><div><h2>Projekt i inwestor</h2><p>Nazwa robocza, etap i podmiot, z którym prowadzisz rozmowy.</p></div></div>
          <div class="project-fields">
            ${field("projectName","Nazwa projektu / własna nazwa","text","np. Projekt Jaromierz — działki rodzinne")}
            ${select("stage","Etap projektu",stageOptions)}
            ${field("location","Miejscowość / lokalizacja","text","np. Jaromierz")}
            ${field("municipality","Gmina","text")}
            ${field("investorName","Inwestor / spółka projektowa","text")}
            ${field("investorKrs","KRS / identyfikator spółki","text")}
            ${field("investorContact","Osoba i kontakt po stronie inwestora","textarea","imię, telefon, e-mail, funkcja")}
          </div>
        </section>

        <section class="project-card">
          <div class="project-card-head"><span>02</span><div><h2>Właściciel i nieruchomość</h2><p>Dane, które najczęściej powtarzają się w protokołach i dokumentach terenowych.</p></div></div>
          <div class="project-fields">
            ${field("ownerName","Właściciel / wydzierżawiający","text")}
            ${field("farmName","Gospodarstwo / nazwa robocza","text")}
            ${field("ownerContact","Kontakt właściciela","text","telefon / e-mail — opcjonalnie")}
            ${field("cadastralDistrict","Obręb ewidencyjny","text")}
            ${field("area","Łączna powierzchnia objęta rozmowami","text","np. 12,34 ha")}
            ${field("plots","Działki ewidencyjne","textarea","po jednej w wierszu, np. 123/4")}
            ${field("landRegisters","Księgi wieczyste","textarea","po jednej w wierszu")}
          </div>
        </section>

        <section class="project-card">
          <div class="project-card-head"><span>03</span><div><h2>Umowa i ważne daty</h2><p>Nie zastępuje kalendarza ani treści umowy — to szybka karta orientacyjna.</p></div></div>
          <div class="project-fields">
            ${field("contractNumber","Numer / nazwa wersji umowy","text")}
            ${field("contractDate","Data podpisania umowy","date")}
            ${field("reservationUntil","Granica etapu rezerwacji / przygotowania","date")}
            ${field("mainRentFrom","Planowany / rzeczywisty start czynszu zasadniczego","date")}
            ${field("constructionStart","Planowany / rzeczywisty start budowy","date")}
            ${field("plannedOperationEnd","Planowany koniec eksploatacji / okresu podstawowego","date")}
          </div>
        </section>

        <section class="project-card">
          <div class="project-card-head"><span>04</span><div><h2>Dokumenty i własne notatki</h2><p>Miejsce na krótki indeks tego, co masz, czego brakuje i co trzeba sprawdzić.</p></div></div>
          <div class="project-fields">
            ${field("documents","Najważniejsze dokumenty / załączniki","textarea","np. umowa v3, mapa, Załącznik 6, pełnomocnictwo, polisa…")}
            ${field("notes","Notatki do projektu","textarea","pytania do inwestora, ustalenia ze spotkań, rzeczy do sprawdzenia…")}
          </div>
        </section>

        <section class="project-card project-integrations">
          <div class="project-card-head"><span>05</span><div><h2>Jak profil pomaga w innych narzędziach?</h2><p>Podpowiedzi trafiają tylko do pustych pól. Wpisanej wcześniej treści nie nadpisujemy.</p></div></div>
          <div class="project-integration-grid">
            <a href="/protokoly/"><span>PROTOKOŁY</span><strong>Projekt, działki, KW, właściciel i inwestor</strong><p>Najwięcej danych wspólnych dla dokumentów terenowych.</p></a>
            <a href="/kalkulator-czynszu/"><span>KALKULATOR</span><strong>Nazwa projektu i działki</strong><p>Scenariusz finansowy od razu ma właściwy nagłówek.</p></a>
            <a href="/porownaj-oferty/"><span>PORÓWNANIE</span><strong>Kontekst projektu</strong><p>Podpowiadamy projekt, ale nie narzucamy nazw ofert A i B.</p></a>
            <a href="/sprawdz-umowe/"><span>AUDYT</span><strong>Wspólny kontekst projektu</strong><p>Widzisz, dla którego projektu wykonujesz kartę kontrolną.</p></a>
          </div>
        </section>

        <section class="project-card project-backup">
          <div class="project-card-head"><span>06</span><div><h2>Kopia i przenoszenie danych</h2><p>Kopia może zawierać dane osobowe i treść Twoich notatek. Przechowuj plik tak jak inne dokumenty projektu.</p></div></div>
          <div class="project-backup-actions">
            <button type="button" class="button primary" data-project-export>Eksportuj kopię całego warsztatu</button>
            <label class="button project-import-button">Importuj kopię<input type="file" accept="application/json,.json" data-project-import></label>
            <button type="button" class="button" data-project-clear>Wyczyść tylko profil „Mój projekt”</button>
          </div>
          <p class="project-backup-note">Eksport obejmuje profil oraz lokalne dane audytu, porównywarki, protokołów i kalkulatora, jeżeli są zapisane w tej przeglądarce. Nie obejmuje zdjęć ani plików znajdujących się na urządzeniu.</p>
        </section>
      </section>`;

    bind();
  }

  function bind() {
    root.querySelectorAll("[data-project-field]").forEach(el => {
      const update = () => {
        profile[el.dataset.projectField] = el.value;
        scheduleSave();
      };
      el.addEventListener("input",update);
      el.addEventListener("change",update);
    });

    root.querySelector("[data-project-print]").addEventListener("click",() => window.print());
    root.querySelector("[data-project-export]").addEventListener("click",exportWorkspace);

    const importer = root.querySelector("[data-project-import]");
    importer.addEventListener("change",() => {
      const file = importer.files?.[0];
      if (file) importWorkspace(file);
      importer.value = "";
    });

    root.querySelector("[data-project-clear]").addEventListener("click",() => {
      if (!confirm("Wyczyścić profil „Mój projekt”? Dane zapisane w audycie, protokołach, porównywarce i kalkulatorze pozostaną bez zmian.")) return;
      api.clear();
      profile = api.read();
      render();
    });
  }

  render();
})();