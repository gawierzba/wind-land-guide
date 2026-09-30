(() => {
  const root = document.querySelector("[data-money-calculator]");
  if (!root) return;

  const STORAGE_KEY = "grunt-i-wiatr:money-calculator:v1";

  const defaults = {
    project:"",
    amountLabel:"netto",
    entryFee:"",
    reservationYears:"",
    reservationAnnual:"",
    reservationIndex:"",
    mainYears:"30",
    mainMode:"fixed",
    baseAnnual:"",
    minAnnual:"",
    refMW:"5",
    actualMW:"",
    sharePct:"100",
    mainIndex:"",
    floorNegative:true,
    extraAnnual:"",
    extraIndexed:true,
    extraOneOff:"",
    repowerEnabled:false,
    repowerYear:"",
    repowerMW:"",
    repowerExtraPct:""
  };

  let state = {...defaults};

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const parse = value => {
    const n = Number(String(value ?? "").replace(/\\s/g,"").replace(",","."));
    return Number.isFinite(n) ? n : 0;
  };
  const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
  const money = value => new Intl.NumberFormat("pl-PL",{style:"currency",currency:"PLN",maximumFractionDigits:0}).format(Number.isFinite(value)?value:0);
  const pct = value => new Intl.NumberFormat("pl-PL",{maximumFractionDigits:2}).format(value) + "%";

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && typeof saved === "object") state = {...defaults,...saved};
    } catch {}
  }

  function applyProjectDefaults() {
    const shared = window.GruntWiatrProject?.defaultsForTools?.();
    if (!shared) return;
    if (!String(state.project || "").trim() && String(shared.project || "").trim()) {
      state.project = shared.project;
      save();
    }
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); } catch {}
  }

  function effectiveRate(raw) {
    const r = parse(raw);
    return state.floorNegative ? Math.max(0,r) : r;
  }

  function indexed(base,ratePct,yearNo) {
    if (!base) return 0;
    const rate = Math.max(-99.9,effectiveRate(ratePct)) / 100;
    return base * Math.pow(1 + rate, Math.max(0,yearNo - 1));
  }

  function mainBaseFor(yearNo) {
    const base = parse(state.baseAnnual);
    const minimum = parse(state.minAnnual);
    const shareRaw = String(state.sharePct ?? "").trim() === "" ? 100 : parse(state.sharePct);
    const share = clamp(shareRaw,0,1000) / 100;

    let current = base;
    let mw = parse(state.actualMW);

    if (state.repowerEnabled && parse(state.repowerYear) > 0 && yearNo >= parse(state.repowerYear)) {
      if (parse(state.repowerMW) > 0) mw = parse(state.repowerMW);
    }

    if (state.mainMode === "mw") {
      const ref = parse(state.refMW);
      current = ref > 0 && mw > 0 ? base * mw / ref : base;
    }

    current = Math.max(current,minimum);

    if (state.repowerEnabled && parse(state.repowerYear) > 0 && yearNo >= parse(state.repowerYear)) {
      current *= 1 + parse(state.repowerExtraPct) / 100;
    }

    return current * share;
  }

  function calculate(withIndexation=true) {
    const rows = [];
    const entry = parse(state.entryFee);
    const reservationYears = clamp(Math.floor(parse(state.reservationYears)),0,100);
    const mainYears = clamp(Math.floor(parse(state.mainYears)),0,100);
    const extraOneOff = parse(state.extraOneOff);

    let totalReservation = 0;
    let totalMain = 0;
    let totalExtra = 0;

    if (entry || extraOneOff) {
      rows.push({
        overall:0,
        stage:"Start / jednorazowe",
        rent:entry,
        extra:extraOneOff,
        total:entry + extraOneOff,
        detail:"czynsz wejściowy i inne świadczenia jednorazowe"
      });
      totalExtra += extraOneOff;
    }

    for (let i=1;i<=reservationYears;i++) {
      const base = parse(state.reservationAnnual);
      const rent = withIndexation ? indexed(base,state.reservationIndex,i) : base;
      rows.push({
        overall:i,
        stage:"Rezerwacja",
        rent,
        extra:0,
        total:rent,
        detail:"rok "+i+" rezerwacji"
      });
      totalReservation += rent;
    }

    for (let j=1;j<=mainYears;j++) {
      const year = reservationYears + j;
      const base = mainBaseFor(j);
      const rent = withIndexation ? indexed(base,state.mainIndex,j) : base;
      const extraBase = parse(state.extraAnnual);
      const extra = state.extraIndexed && withIndexation ? indexed(extraBase,state.mainIndex,j) : extraBase;
      rows.push({
        overall:year,
        stage:"Czynsz zasadniczy",
        rent,
        extra,
        total:rent + extra,
        detail:mainDetail(j)
      });
      totalMain += rent;
      totalExtra += extra;
    }

    const total = entry + totalReservation + totalMain + totalExtra;
    return {rows,entry,totalReservation,totalMain,totalExtra,total};
  }

  function mainDetail(yearNo) {
    const parts = ["rok "+yearNo+" etapu zasadniczego"];
    if (state.mainMode === "mw") {
      const rep = state.repowerEnabled && parse(state.repowerYear)>0 && yearNo>=parse(state.repowerYear);
      const mw = rep && parse(state.repowerMW)>0 ? parse(state.repowerMW) : parse(state.actualMW);
      if (mw) parts.push(mw+" MW");
    }
    if (state.repowerEnabled && parse(state.repowerYear)>0 && yearNo===parse(state.repowerYear)) parts.push("repowering / zmiana parametrów");
    return parts.join(" · ");
  }

  function input(id,label,type="number",hint="",attrs="") {
    return `
      <label class="money-field">
        <span>${label}</span>
        <input type="${type}" data-money-field="${id}" value="${esc(state[id])}" ${attrs} placeholder="${esc(hint)}">
      </label>`;
  }

  function select(id,label,options) {
    return `
      <label class="money-field">
        <span>${label}</span>
        <select data-money-field="${id}">
          ${options.map(([value,text])=>`<option value="${esc(value)}" ${state[id]===value?"selected":""}>${esc(text)}</option>`).join("")}
        </select>
      </label>`;
  }

  function render() {
    const result = calculate(true);
    const flat = calculate(false);
    const difference = result.total - flat.total;
    const maxYear = Math.max(1,...result.rows.map(r=>r.total));

    root.innerHTML = `
      <section class="money-shell">
        <div class="money-toolbar">
          <div class="money-save-note">Zmiany zapisują się lokalnie na tym urządzeniu.</div>
          <div class="money-toolbar-actions">
            <button type="button" class="button" data-money-print>Drukuj / PDF</button>
            <button type="button" class="button" data-money-reset>Wyczyść</button>
          </div>
        </div>

        <section class="money-input-card">
          <div class="money-section-title"><span>01</span><div><h2>Scenariusz i etap rezerwacji</h2><p>Wpisz własne stawki z propozycji inwestora lub z umowy.</p></div></div>
          <div class="money-fields">
            ${input("project","Projekt / działka","text","np. dz. 123/4, wariant A")}
            ${select("amountLabel","Sposób opisu kwot",[["netto","Kwoty netto"],["brutto","Kwoty brutto"],["inne","Inny / nieustalony"]])}
            ${input("entryFee","Czynsz / opłata wejściowa [zł]","number","0",'min="0" step="100"')}
            ${input("reservationYears","Liczba lat rezerwacji","number","0",'min="0" max="100" step="1"')}
            ${input("reservationAnnual","Czynsz rezerwacyjny rocznie [zł]","number","0",'min="0" step="100"')}
            ${input("reservationIndex","Założona waloryzacja rezerwacji [%/rok]","number","0",'step="0.1"')}
          </div>
        </section>

        <section class="money-input-card">
          <div class="money-section-title"><span>02</span><div><h2>Czynsz zasadniczy</h2><p>Możesz liczyć stałą kwotę albo wariant zależny od mocy turbiny.</p></div></div>
          <div class="money-fields">
            ${input("mainYears","Liczba lat czynszu zasadniczego","number","30",'min="0" max="100" step="1"')}
            ${select("mainMode","Model czynszu",[["fixed","Stała kwota roczna"],["mw","Proporcjonalnie do mocy MW"]])}
            ${input("baseAnnual",state.mainMode==="mw"?"Czynsz bazowy dla mocy referencyjnej [zł/rok]":"Czynsz bazowy [zł/rok]","number","0",'min="0" step="100"')}
            ${input("minAnnual","Minimum gwarantowane [zł/rok]","number","0",'min="0" step="100"')}
            ${state.mainMode==="mw" ? input("refMW","Moc referencyjna [MW]","number","5",'min="0.1" step="0.1"') : ""}
            ${state.mainMode==="mw" ? input("actualMW","Rzeczywista / planowana moc [MW]","number","",'min="0" step="0.1"') : ""}
            ${input("sharePct","Udział w pełnym czynszu [%]","number","100",'min="0" step="0.1"')}
            ${input("mainIndex","Założona waloryzacja [%/rok]","number","0",'step="0.1"')}
          </div>

          <label class="money-toggle">
            <input type="checkbox" data-money-check="floorNegative" ${state.floorNegative?"checked":""}>
            <span>Nie obniżaj płatności przy ujemnym założeniu waloryzacyjnym</span>
          </label>

          <div class="money-formula">
            <strong>Aktualny mechanizm:</strong>
            <span>${state.mainMode==="mw"
              ? "max(czynsz bazowy × moc / moc referencyjna, minimum gwarantowane) × udział %"
              : "max(czynsz bazowy, minimum gwarantowane) × udział %"}; następnie waloryzacja scenariuszowa.
            </span>
          </div>
        </section>

        <section class="money-input-card">
          <div class="money-section-title"><span>03</span><div><h2>Opłaty dodatkowe</h2><p>Nie mieszamy ich z odszkodowaniem za szkody — wpisujesz tylko świadczenia, które chcesz policzyć w scenariuszu.</p></div></div>
          <div class="money-fields">
            ${input("extraAnnual","Łączne opłaty dodatkowe rocznie [zł]","number","0",'min="0" step="100"')}
            ${input("extraOneOff","Inne opłaty jednorazowe [zł]","number","0",'min="0" step="100"')}
          </div>
          <label class="money-toggle">
            <input type="checkbox" data-money-check="extraIndexed" ${state.extraIndexed?"checked":""}>
            <span>Waloryzuj opłaty roczne tym samym założeniem co czynsz zasadniczy</span>
          </label>
          <div class="money-hint">Własną stawkę za kabel, drogę, place lub czasowe zajęcie najpierw policz według swojej umowy, a tutaj możesz wpisać ich łączny efekt roczny.</div>
        </section>

        <section class="money-input-card">
          <div class="money-section-title"><span>04</span><div><h2>Opcjonalny repowering / zwiększenie mocy</h2><p>Modeluje zmianę od wskazanego roku etapu zasadniczego.</p></div></div>
          <label class="money-toggle">
            <input type="checkbox" data-money-check="repowerEnabled" ${state.repowerEnabled?"checked":""}>
            <span>Uwzględnij zmianę parametrów w trakcie umowy</span>
          </label>
          ${state.repowerEnabled ? `
            <div class="money-fields money-repower-fields">
              ${input("repowerYear","Zmiana od roku etapu zasadniczego","number","",'min="1" max="100" step="1"')}
              ${state.mainMode==="mw" ? input("repowerMW","Nowa moc po zmianie [MW]","number","",'min="0" step="0.1"') : ""}
              ${input("repowerExtraPct","Dodatkowa uzgodniona podwyżka [%]","number","0",'step="0.1"')}
            </div>` : ""}
        </section>

        <section class="money-results">
          <div class="section-head">
            <div><div class="eyebrow">Wynik scenariusza</div><h2>Przebieg płatności</h2></div>
            <p>Kwoty ${esc(state.amountLabel)} · wartości nominalne · bez dyskontowania.</p>
          </div>

          <div class="money-summary">
            <div><span>Wejściowe</span><strong>${money(result.entry)}</strong></div>
            <div><span>Rezerwacja</span><strong>${money(result.totalReservation)}</strong></div>
            <div><span>Czynsz zasadniczy</span><strong>${money(result.totalMain)}</strong></div>
            <div><span>Opłaty dodatkowe</span><strong>${money(result.totalExtra)}</strong></div>
            <div class="money-summary-total"><span>Łącznie nominalnie</span><strong>${money(result.total)}</strong></div>
          </div>

          <div class="money-index-impact">
            <div><span>Ten sam scenariusz bez waloryzacji</span><strong>${money(flat.total)}</strong></div>
            <div><span>Różnica wynikająca z przyjętych założeń waloryzacyjnych</span><strong>${money(difference)}</strong></div>
          </div>

          <div class="money-chart" aria-label="Płatności roczne">
            ${result.rows.map(r=>`
              <div class="money-bar-row">
                <span>${r.overall===0 ? "START" : "R"+r.overall}</span>
                <div class="money-bar-track"><i style="width:${Math.max(1,r.total/maxYear*100)}%"></i></div>
                <strong>${money(r.total)}</strong>
              </div>`).join("")}
          </div>

          <div class="money-table-wrap">
            <table class="money-table">
              <thead><tr><th>Rok</th><th>Etap</th><th>Czynsz</th><th>Opłaty dodatkowe</th><th>Razem</th><th>Uwagi</th></tr></thead>
              <tbody>
                ${result.rows.map(r=>`
                  <tr>
                    <td>${r.overall===0 ? "start" : r.overall}</td>
                    <td>${esc(r.stage)}</td>
                    <td>${money(r.rent)}</td>
                    <td>${money(r.extra)}</td>
                    <td><strong>${money(r.total)}</strong></td>
                    <td>${esc(r.detail)}</td>
                  </tr>`).join("") || '<tr><td colspan="6">Wpisz stawki i okresy, aby zobaczyć przebieg.</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="money-notes">
            <p><strong>Nie uwzględniono automatycznie:</strong> odszkodowań za szkody, utraconych plonów, dopłat, podatków, kar umownych, odsetek ani innych świadczeń zależnych od konkretnego zdarzenia.</p>
            <p><strong>Produkcja energii nie jest parametrem kalkulatora.</strong> Narzędzie odpowiada modelowi, w którym ryzyko awarii, postoju lub ograniczeń produkcji nie obniża automatycznie czynszu zasadniczego.</p>
            <p><strong>Waloryzacja:</strong> stały procent wpisany powyżej jest wyłącznie scenariuszem. Nie jest prognozą GUS ani inflacji.</p>
          </div>

          <div class="actions money-links">
            <a class="button" href="/umowa/co-obejmuje-roczna-kwota/">GUIDE-011: mechanika czynszu</a>
            <a class="button" href="/umowa/jak-porownac-dwie-oferty/">GUIDE-012: porównywanie ofert</a>
            <a class="button" href="/porownaj-oferty/">Porównaj dwie oferty</a>
          </div>
        </section>
      </section>`;

    bind();
  }

  function bind() {
    root.querySelectorAll("[data-money-field]").forEach(el => {
      const handler = () => {
        state[el.dataset.moneyField] = el.value;
        save();
        render();
      };
      el.addEventListener("change",handler);
      if (el.tagName === "SELECT") return;
      el.addEventListener("blur",handler);
    });

    root.querySelectorAll("[data-money-check]").forEach(el => {
      el.addEventListener("change",() => {
        state[el.dataset.moneyCheck] = el.checked;
        save();
        render();
      });
    });

    root.querySelector("[data-money-print]").addEventListener("click",()=>window.print());
    root.querySelector("[data-money-reset]").addEventListener("click",()=>{
      if(!confirm("Wyczyścić cały scenariusz zapisany na tym urządzeniu?")) return;
      state={...defaults};
      save();
      render();
    });
  }

  load();
  applyProjectDefaults();
  render();
})();