/* Ferrum v2 — логіка сторінки: анімації, меню, відгуки, FAQ, онлайн-запис */
(function () {
  "use strict";
  var C = window.CONFIG, D = window.DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function money(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₴"; }
  function priceAt(s, lvl) { return Array.isArray(s.price) ? s.price[lvl] : s.price; }
  function minPrice(s) { return Array.isArray(s.price) ? s.price[0] : s.price; }
  function svcById(id) { for (var i = 0; i < D.services.length; i++) if (D.services[i].id === id) return D.services[i]; }
  function locById(id) { for (var i = 0; i < C.locations.length; i++) if (C.locations[i].id === id) return C.locations[i]; }
  function telOf(p) { return "tel:" + p.replace(/[^\d+]/g, ""); }
  function mapOf(l) { return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(l.mapQuery); }
  function barberById(id) { for (var i = 0; i < D.barbers.length; i++) if (D.barbers[i].id === id) return D.barbers[i]; }
  var tel = "tel:" + C.phone.replace(/[^\d+]/g, "");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function gen(n) { return /о$/.test(n) ? n.slice(0, -1) + "а" : n + "а"; } // Дмитро → Дмитра, Максим → Максима
  var arrowNE = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 11L11 3M5 3h6v6"/></svg>';

  /* ---------- Навігація, мобільна кнопка, чат ---------- */
  var nav = $("#nav"), burger = $("#burger"), links = $("#navLinks"), mbar = $("#mbar"), chat = $("#chatBtn");
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-solid", y > 40);
    var b = $("#booking").getBoundingClientRect();
    var hide = y < 400 || (b.top < window.innerHeight && b.bottom > 0);
    mbar.classList.toggle("is-hidden", hide); chat.classList.toggle("is-low", hide);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  burger.addEventListener("click", function () {
    var open = !links.classList.contains("is-open");
    links.classList.toggle("is-open", open); burger.setAttribute("aria-expanded", open);
  });
  $$("a", links).forEach(function (a) { a.addEventListener("click", function () { links.classList.remove("is-open"); burger.setAttribute("aria-expanded", false); }); });
  chat.href = C.telegram;

  /* ---------- «Шукаємо барберів» з пульсуючою точкою ---------- */
  if (C.hiring && C.hiring.on) { $("#hireText").textContent = C.hiring.text; $("#hireBtn").href = C.telegram; }
  else { $("#hireLink").hidden = true; $("#hiring").hidden = true; }

  /* ---------- Бігучий рядок ---------- */
  var tk = ["Точні фейди", "Моделювання бороди", "Гарячі рушники", "Комплекс «Ferrum»", "Без запису теж можна", "Кава або віскі", "Оболонь", "Золоті ворота"];
  var tkHtml = tk.map(function (t) { return "<span>" + t + "</span>"; }).join("");
  $("#ticker").innerHTML = tkHtml + tkHtml;

  /* ---------- Лічильники ---------- */
  $("#counters").innerHTML = D.stats.map(function (s) {
    return '<div><b data-count="' + s.n + '" data-suf="' + esc(s.suf) + '">0' + esc(s.suf) + "</b><span>" + esc(s.t) + "</span></div>";
  }).join("");
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function countUp(el) {
    var to = +el.dataset.count, suf = el.dataset.suf || "", t0 = null, dur = 1600;
    if (reduced) { el.textContent = fmt(to) + suf; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(to * e)) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Фірмовий ритуал ---------- */
  var sig = svcById(D.signature.id);
  $("#sigPrice").textContent = money(priceAt(sig, 1));
  $("#sigList").innerHTML = D.signature.includes.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
  $("#vipName").textContent = D.signature.vip.name;
  $("#vipPrice").textContent = money(D.signature.vip.price);
  $("#vipText").textContent = D.signature.vip.text;
  $("#vipDur").textContent = D.signature.vip.dur;

  /* ---------- Меню: вкладки + картки ---------- */
  var menuCat = "hair";
  var mainCats = D.categories.filter(function (c) { return c.id !== "extra"; });
  function renderMenu() {
    $("#menuTabs").innerHTML = D.categories.map(function (c) {
      return '<button type="button" class="tab' + (c.id === menuCat ? " is-on" : "") + '" aria-pressed="' + (c.id === menuCat) + '" data-cat="' + c.id + '">' + esc(c.name) + "</button>";
    }).join("");
    $("#menuGrid").innerHTML = D.services.filter(function (s) { return s.cat === menuCat; }).map(function (s, i) {
      var gold = s.id === D.signature.id;
      var text = (D.desc && D.desc[s.id]) || s.note || "";
      return '<a class="mc' + (gold ? " mc--gold" : "") + '" style="--i:' + i + '" href="#booking" data-svc="' + s.id + '">' +
        (gold ? '<span class="badge">Фірмовий</span>' : s.hit ? '<span class="badge">Хіт</span>' : "") +
        '<div class="mc__top"><h3>' + esc(s.name) + '</h3><span class="mc__p">' + (Array.isArray(s.price) ? '<small class="from">від</small>' : "") + minPrice(s) + " ₴</span></div>" +
        '<p class="mc__dur">' + s.dur + " хв</p>" + (text ? "<p>" + esc(text) + "</p>" : "") +
        '<span class="mc__go">Записатися ' + arrowNE + "</span></a>";
    }).join("");
  }
  $("#menuTabs").addEventListener("click", function (e) { var t = e.target.closest(".tab"); if (!t) return; menuCat = t.dataset.cat; renderMenu(); });
  renderMenu();

  /* ---------- Команда: фільтр за барбершопом ---------- */
  $("#teamGrid").innerHTML = D.barbers.map(function (b, i) {
    return '<article class="tm reveal" data-loc="' + b.loc + '" style="--rd:' + i * 0.08 + 's"><img src="' + b.photo + '" alt="' + esc(b.name) + '" loading="lazy">' +
      '<span class="tm__loc">' + esc(locById(b.loc).name) + "</span>" +
      '<div class="tm__info"><span class="tm__lvl">' + D.levels[b.level] + "</span><h3>" + esc(b.name) + "</h3><p>" + esc(b.exp) + " · " + esc(b.tags.join(", ")) + "</p>" +
      '<a class="btn btn--ghost" href="#booking" data-barber="' + b.id + '">Записатися<span class="hide-m"> до ' + esc(gen(b.name.split(" ")[0])) + "</span></a></div></article>";
  }).join("");
  var teamLoc = "all";
  function renderTeamTabs() {
    var opts = [{ id: "all", name: "Усі барбери" }].concat(C.locations);
    $("#teamTabs").innerHTML = opts.map(function (o) {
      return '<button type="button" class="tab' + (o.id === teamLoc ? " is-on" : "") + '" aria-pressed="' + (o.id === teamLoc) + '" data-loc="' + o.id + '">' + esc(o.name) + "</button>";
    }).join("");
    $$("#teamGrid .tm").forEach(function (el) { el.hidden = teamLoc !== "all" && el.dataset.loc !== teamLoc; });
  }
  $("#teamTabs").addEventListener("click", function (e) { var t = e.target.closest(".tab"); if (!t) return; teamLoc = t.dataset.loc; renderTeamTabs(); });
  renderTeamTabs();

  /* ---------- Відгуки: два ряди назустріч ---------- */
  var gIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 0 1-2.1 3.1v2.6h3.4c2-1.8 3.1-4.5 3.1-7.5z"/><path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.2 13.6a6 6 0 0 1 0-3.8V7.1H2.7a10 10 0 0 0 0 9z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.9.5 4 1.6l3-3A10 10 0 0 0 2.7 7.1l3.5 2.7C7 7.7 9.3 5.9 12 5.9z"/></svg>';
  function rvCard(r) {
    return '<article class="rv"><div class="rv__top"><span class="stars" aria-label="5 зірок">★★★★★</span><span class="rv__g">' + gIcon + "Google</span></div><p>«" + esc(r.text) + "»</p><footer><b>" + esc(r.name) + "</b><span>барбер " + esc(r.barber) + "</span></footer></article>";
  }
  var half = Math.ceil(D.reviews.length / 2);
  [["#rev1", D.reviews.slice(0, half)], ["#rev2", D.reviews.slice(half)]].forEach(function (p) {
    var h = p[1].map(rvCard).join("");
    $(p[0]).innerHTML = h + h.replace(/<article class="rv">/g, '<article class="rv" aria-hidden="true">');
  });

  /* ---------- FAQ-акордеон ---------- */
  $("#faqList").innerHTML = D.faq.map(function (f, i) {
    return '<div class="qa reveal"><button type="button" aria-expanded="false" aria-controls="qa' + i + '" id="qb' + i + '">' + esc(f.q) + '<span class="qa__ic" aria-hidden="true"></span></button>' +
      '<div class="qa__a" id="qa' + i + '" role="region" aria-labelledby="qb' + i + '"><div><p>' + esc(f.a) + "</p></div></div></div>";
  }).join("");
  $("#faqList").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var qa = b.parentNode, open = !qa.classList.contains("is-open");
    qa.classList.toggle("is-open", open); b.setAttribute("aria-expanded", open);
  });

  /* ---------- Контакти ---------- */
  var pin = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  $("#footLocs").innerHTML = C.locations.map(function (l) {
    return '<div class="foot__col"><p class="foot__since">' + esc(l.since) + "</p><h3>" + esc(l.name) + "</h3>" +
      '<p class="foot__addr">' + pin + esc(l.address) + '</p><p class="muted">' + esc(l.note) + "</p>" +
      "<p>" + esc(C.hoursText) + '</p><p><a class="link" href="' + telOf(l.phone) + '">' + esc(l.phone) + "</a></p>" +
      '<p class="muted">' + esc(l.extra) + '</p><a class="link" href="' + mapOf(l) + '" target="_blank" rel="noopener">Відкрити в Google Maps ↗</a></div>';
  }).join("");
  $("#giftBtn").href = C.telegram;
  var icons = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M21 4L3 11l6 2.5M21 4l-3.5 16-8.5-6.5M21 4L9 13.5v5.5l3-3.5"/></svg>',
    viber: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3c5 0 8 2.5 8 7.5S17 18 12 18l-4 3v-3.5C5.5 16.5 4 14 4 10.5 4 5.5 7 3 12 3z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/></svg>'
  };
  var sl = { instagram: [C.instagram, "Instagram"], telegram: [C.telegram, "Telegram"], viber: [C.viber, "Viber"], phone: [tel, "Зателефонувати"] };
  $("#socials").innerHTML = Object.keys(sl).map(function (k) {
    var ext = k === "instagram" || k === "telegram";
    return '<a href="' + esc(sl[k][0]) + '" aria-label="' + sl[k][1] + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + icons[k] + "</a>";
  }).join("");

  /* =========================================================
     ОНЛАЙН-ЗАПИС: послуга → барбер → дата і час
     Зайнятість у концепті генерується псевдовипадково (стабільно для дня й барбера).
     Для реального клієнта тут підключається його CRM (Altegio, Booksy тощо).
     ========================================================= */
  var st = { loc: C.locations[0].id, cat: "hair", svc: "cut", addons: [], barber: "any", day: 0, time: null };
  function locBarbers() { return D.barbers.filter(function (b) { return b.loc === st.loc; }); }
  var STEP = C.stepMin, CELLS = (C.close - C.open) * 60 / STEP;
  var DAYS = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  var MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];

  function dayDate(i) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; }
  function seedRand(seed) { var x = 0; for (var i = 0; i < seed.length; i++) x = (x * 31 + seed.charCodeAt(i)) | 0; return function () { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }
  var busyCache = {}; // зайнятість не змінюється, рахуємо один раз
  function busy(bid, di) {
    var d = dayDate(di), key = bid + d.toDateString();
    if (busyCache[key]) return busyCache[key];
    var b = barberById(bid), cells = [];
    for (var i = 0; i < CELLS; i++) cells.push(false);
    if (b.off === d.getDay()) { for (i = 0; i < CELLS; i++) cells[i] = true; return (busyCache[key] = cells); }
    var r = seedRand(key), load = di === 0 ? .7 : di < 3 ? .6 : .4, i2 = 0;
    while (i2 < CELLS) {
      var len = 1 + Math.floor(r() * 3);
      if (r() < load) for (var k = 0; k < len && i2 + k < CELLS; k++) cells[i2 + k] = true;
      i2 += len + (r() < .5 ? 1 : 0);
    }
    return (busyCache[key] = cells);
  }
  function totalDur() { var d = svcById(st.svc).dur; st.addons.forEach(function (a) { d += svcById(a).dur; }); return d; }
  function totalPrice(lvl) { var p = priceAt(svcById(st.svc), lvl); st.addons.forEach(function (a) { p += priceAt(svcById(a), lvl); }); return p; }
  function nowCell(di) {
    if (di !== 0) return 0;
    var n = new Date(), m = (n.getHours() - C.open) * 60 + n.getMinutes() + 30; // мінімум за 30 хв
    return Math.max(0, Math.ceil(m / STEP));
  }
  function freeAt(bid, di, cell) {
    var need = Math.ceil(totalDur() / STEP), cells = busy(bid, di);
    if (cell < nowCell(di) || cell + need > CELLS) return false;
    for (var k = 0; k < need; k++) if (cells[cell + k]) return false;
    return true;
  }
  function whoFree(di, cell) {
    var ids = st.barber === "any" ? locBarbers().map(function (b) { return b.id; }) : [st.barber];
    for (var i = 0; i < ids.length; i++) if (freeAt(ids[i], di, cell)) return ids[i];
    return null;
  }
  function cellTime(c) { var m = C.open * 60 + c * STEP; return Math.floor(m / 60) + ":" + ("0" + m % 60).slice(-2); }
  function dayLabel(di) { var d = dayDate(di); return di === 0 ? "сьогодні" : di === 1 ? "завтра" : DAYS[d.getDay()].toLowerCase() + ", " + d.getDate() + " " + MONTHS[d.getMonth()]; }
  function nextFree(bid) {
    for (var di = 0; di < C.daysAhead; di++) for (var c = 0; c < CELLS; c++) if (freeAt(bid, di, c)) return dayLabel(di) + " " + cellTime(c);
    return "немає вікон";
  }

  // 1. Барбершоп
  function renderLocs() {
    $("#bLocs").innerHTML = C.locations.map(function (l) {
      var on = l.id === st.loc, n = D.barbers.filter(function (b) { return b.loc === l.id; }).length;
      return '<button type="button" class="opt loc' + (on ? " is-on" : "") + '" aria-pressed="' + on + '" data-loc="' + l.id + '"><span><b class="loc__name">' + esc(l.name) + "</b><small>" + esc(l.address) + '</small><small class="loc__metro">' + esc(l.metro) + " · " + n + " барбери</small></span>" + '<span class="loc__dot" aria-hidden="true"></span></button>';
    }).join("");
  }
  function setLoc(id) {
    st.loc = id;
    var b = st.barber !== "any" && barberById(st.barber);
    if (b && b.loc !== id) st.barber = "any";
    renderLocs(); refresh();
  }
  $("#bLocs").addEventListener("click", function (e) { var o = e.target.closest(".loc"); if (!o) return; setLoc(o.dataset.loc); });

  // 2. Послуги
  function renderTabs() {
    $("#bTabs").innerHTML = mainCats.map(function (c) { return '<button type="button" class="tab' + (c.id === st.cat ? " is-on" : "") + '" aria-pressed="' + (c.id === st.cat) + '" data-cat="' + c.id + '">' + esc(c.name) + "</button>"; }).join("");
  }
  function renderServices() {
    $("#bServices").innerHTML = D.services.filter(function (s) { return s.cat === st.cat; }).map(function (s) {
      return '<button type="button" class="opt' + (s.id === st.svc ? " is-on" : "") + '" aria-pressed="' + (s.id === st.svc) + '" data-svc="' + s.id + '"><span><b>' + esc(s.name) + "</b><small>" + s.dur + " хв" + (s.note ? " · " + esc(s.note) : "") + '</small></span><span class="opt__p"><small class="from">від</small>' + minPrice(s) + " ₴</span></button>";
    }).join("");
  }
  function renderAddons() {
    $("#bAddons").innerHTML = D.services.filter(function (s) { return s.addon; }).map(function (s) {
      var on = st.addons.indexOf(s.id) > -1;
      return '<button type="button" class="chip' + (on ? " is-on" : "") + '" aria-pressed="' + on + '" data-add="' + s.id + '">' + esc(s.name) + " <i>+" + s.dur + " хв</i></button>";
    }).join("");
  }
  $("#bTabs").addEventListener("click", function (e) { var t = e.target.closest(".tab"); if (!t) return; st.cat = t.dataset.cat; renderTabs(); renderServices(); });
  $("#bServices").addEventListener("click", function (e) { var o = e.target.closest(".opt"); if (!o) return; st.svc = o.dataset.svc; renderServices(); refresh(); });
  $("#bAddons").addEventListener("click", function (e) {
    var c = e.target.closest(".chip"); if (!c) return; var id = c.dataset.add, i = st.addons.indexOf(id);
    if (i > -1) st.addons.splice(i, 1); else st.addons.push(id);
    renderAddons(); refresh();
  });

  // 3. Барбери
  function renderBarbers() {
    var any = '<button type="button" class="opt bopt' + (st.barber === "any" ? " is-on" : "") + '" aria-pressed="' + (st.barber === "any") + '" data-b="any"><span class="bopt__ph"><span class="bopt__any">F</span></span><span class="bopt__b"><b>Будь-хто вільний</b><small>найшвидше вікно</small><span class="bopt__p"><small class="from">від</small>' + money(totalPrice(0)) + "</span></span></button>";
    $("#bBarbers").innerHTML = any + locBarbers().map(function (b) {
      return '<button type="button" class="opt bopt' + (st.barber === b.id ? " is-on" : "") + '" aria-pressed="' + (st.barber === b.id) + '" data-b="' + b.id + '"><span class="bopt__ph"><img src="' + b.photo + '" alt=""></span><span class="bopt__b"><b>' + esc(b.name.split(" ")[0]) + "</b><small>" + D.levels[b.level] + '</small><span class="bopt__p">' + money(totalPrice(b.level)) + '</span><span class="bopt__next">Найближче: ' + nextFree(b.id) + "</span></span></button>";
    }).join("");
  }
  $("#bBarbers").addEventListener("click", function (e) { var o = e.target.closest(".bopt"); if (!o) return; st.barber = o.dataset.b; renderBarbers(); keepTime(); renderTimes(); renderSummary(); });

  // 4. Дата і час
  function renderDays() {
    var h = "";
    for (var i = 0; i < C.daysAhead; i++) {
      var d = dayDate(i);
      h += '<button type="button" class="day' + (i === st.day ? " is-on" : "") + '" aria-pressed="' + (i === st.day) + '" aria-label="' + dayLabel(i) + '" data-d="' + i + '"><small>' + (i === 0 ? "Сьогодні" : DAYS[d.getDay()]) + "</small><b>" + d.getDate() + "</b></button>";
    }
    $("#bDays").innerHTML = h;
  }
  function renderTimes() {
    var h = "", free = 0;
    for (var c = 0; c < CELLS; c++) {
      var ok = !!whoFree(st.day, c); if (ok) free++;
      h += '<button type="button" class="time' + (st.time === c ? " is-on" : "") + '" aria-pressed="' + (st.time === c) + '" data-c="' + c + '"' + (ok ? "" : ' disabled aria-label="' + cellTime(c) + ', зайнято"') + ">" + cellTime(c) + "</button>";
    }
    $("#bTimes").innerHTML = h;
    var note = $("#bTimesNote");
    if (!free) {
      var b = st.barber !== "any" && barberById(st.barber);
      note.textContent = b && b.off === dayDate(st.day).getDay() ? b.name.split(" ")[0] + " у цей день не працює. Обери інший день або іншого барбера." : "На цей день вільних вікон немає, обери інший.";
    } else note.textContent = "Тривалість візиту: " + totalDur() + " хв. Закреслений час уже зайнятий.";
  }
  function keepTime() { if (st.time != null && !whoFree(st.day, st.time)) st.time = null; }
  $("#bDays").addEventListener("click", function (e) { var d = e.target.closest(".day"); if (!d) return; st.day = +d.dataset.d; st.time = null; renderDays(); renderTimes(); renderSummary(); });
  $("#bTimes").addEventListener("click", function (e) {
    var t = e.target.closest(".time"); if (!t || t.disabled) return;
    st.time = +t.dataset.c; renderTimes(); renderSummary();
    // на телефоні квиток нижче екрана: показуємо його, щоб було видно, що далі
    if (window.matchMedia("(max-width: 860px)").matches) setTimeout(function () { $("#ticket").scrollIntoView({ behavior: "smooth", block: "start" }); }, 250);
  });

  // Підсумок
  function chosenBarber() {
    if (st.barber !== "any") return barberById(st.barber);
    return st.time != null ? barberById(whoFree(st.day, st.time)) : null;
  }
  function renderSummary() {
    var s = svcById(st.svc), b = chosenBarber();
    var adds = st.addons.map(function (a) { return svcById(a).name; });
    var row = function (k, v, empty) { return "<div><dt>" + k + '</dt><dd class="' + (empty ? "is-empty" : "") + '">' + v + "</dd></div>"; };
    var when = st.time != null ? dayLabel(st.day) + ", " + cellTime(st.time) : "";
    var bTxt = b ? esc(b.name) + (st.barber === "any" ? " (вільний)" : "") : st.barber === "any" ? "будь-хто вільний" : "";
    var L = locById(st.loc);
    $("#summary").innerHTML =
      row("Де", esc(L.name) + "<small>" + esc(L.address) + "</small>") +
      row("Послуга", esc(s.name) + (adds.length ? " + " + esc(adds.join(", ")).toLowerCase() : "")) +
      row("Барбер", bTxt || "не обрано", !bTxt) +
      row("Коли", when || "оберіть час", !when) +
      row("Тривалість", totalDur() + " хв");
    $("#sumTotal").innerHTML = b ? money(totalPrice(b.level)) : '<small class="from">від</small>' + money(totalPrice(0));
  }
  function refresh() { renderBarbers(); keepTime(); renderTimes(); renderSummary(); }

  renderLocs(); renderTabs(); renderServices(); renderAddons(); renderDays(); refresh();
  // якщо сьогодні вже нічого немає — завтра
  if (!$("#bTimes .time:not([disabled])")) { st.day = 1; renderDays(); renderTimes(); }

  // Переходи з прайсу і карток барберів
  function pickService(id) {
    var s = svcById(id); if (!s) return;
    if (s.addon) { if (st.addons.indexOf(id) < 0) st.addons.push(id); renderAddons(); }
    else { st.svc = id; st.cat = s.cat; renderTabs(); renderServices(); }
    refresh();
  }
  document.addEventListener("click", function (e) {
    var p = e.target.closest("a[data-svc]"); if (p) pickService(p.dataset.svc);
    var b = e.target.closest("a[data-barber]"); if (b) { st.barber = b.dataset.barber; setLoc(barberById(st.barber).loc); }
    var lb = e.target.closest("a[data-book-loc]"); if (lb) setLoc(lb.dataset.bookLoc);
  });

  // Телефон
  var fName = $("#fName"), fPhone = $("#fPhone"), fNote = $("#fNote"), err = $("#formErr");
  fPhone.addEventListener("focus", function () { if (!fPhone.value) fPhone.value = "+380 "; });
  fPhone.addEventListener("input", function () {
    var d = fPhone.value.replace(/\D/g, ""); if (d.indexOf("380") !== 0) d = "380" + d.replace(/^0/, "");
    d = d.slice(0, 12);
    var f = "+" + d.slice(0, 3); if (d.length > 3) f += " " + d.slice(3, 5); if (d.length > 5) f += " " + d.slice(5, 8); if (d.length > 8) f += " " + d.slice(8, 10); if (d.length > 10) f += " " + d.slice(10, 12);
    fPhone.value = f; fPhone.classList.remove("is-bad"); fPhone.removeAttribute("aria-invalid");
  });
  fName.addEventListener("input", function () { fName.classList.remove("is-bad"); fName.removeAttribute("aria-invalid"); });

  function send(text, payload) {
    if (C.bookingEndpoint) {
      return fetch(C.bookingEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); });
    }
    if (C.telegramBotToken && C.telegramChatId) {
      return fetch("https://api.telegram.org/bot" + C.telegramBotToken + "/sendMessage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: C.telegramChatId, text: text, parse_mode: "HTML" })
      }).then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw new Error(j.description); });
    }
    return new Promise(function (res) { setTimeout(res, 700); }); // демо-режим
  }

  var last = null;
  $("#bookForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var problems = [];
    if (st.time == null) problems.push("час візиту");
    var nameOk = fName.value.trim().length > 1, phoneOk = fPhone.value.replace(/\D/g, "").length === 12;
    if (!nameOk) { problems.push("ім'я"); fName.classList.add("is-bad"); fName.setAttribute("aria-invalid", "true"); }
    if (!phoneOk) { problems.push("телефон"); fPhone.classList.add("is-bad"); fPhone.setAttribute("aria-invalid", "true"); }
    if (problems.length) { err.textContent = "Вкажи, будь ласка, " + problems.join(", ") + "."; return; }

    var s = svcById(st.svc), b = chosenBarber(), d = dayDate(st.day), L = locById(st.loc);
    var adds = st.addons.map(function (a) { return svcById(a).name; });
    var payload = {
      location: L.name + ", " + L.address,
      service: s.name + (adds.length ? " + " + adds.join(", ") : ""), barber: b.name, price: money(totalPrice(b.level)),
      date: d.getDate() + " " + MONTHS[d.getMonth()] + " (" + DAYS[d.getDay()] + ")", time: cellTime(st.time), duration: totalDur(),
      name: fName.value.trim(), phone: fPhone.value, note: fNote.value.trim()
    };
    var text = "💈 <b>Новий запис з сайту</b>\n\n" +
      "Барбершоп: " + esc(payload.location) + "\n" +
      "Послуга: " + esc(payload.service) + "\nБарбер: " + esc(payload.barber) + "\n" +
      "Коли: " + payload.date + ", " + payload.time + " (" + payload.duration + " хв)\nЦіна: " + payload.price + "\n\n" +
      "Клієнт: " + esc(payload.name) + "\nТелефон: " + esc(payload.phone) + (payload.note ? "\nКоментар: " + esc(payload.note) : "");

    var btn = $("#submitBtn"); btn.disabled = true; btn.textContent = "Надсилаємо…"; err.textContent = "";
    send(text, payload).then(function () {
      var start = new Date(d); var m = C.open * 60 + st.time * STEP; start.setHours(Math.floor(m / 60), m % 60);
      last = { start: start, dur: payload.duration, title: "Ferrum: " + payload.service, desc: "Барбер " + payload.barber + ". " + payload.location, where: payload.location + ", Київ" };
      $("#doneText").textContent = payload.name + ", чекаємо тебе " + dayLabel(st.day) + " о " + payload.time + " у Ferrum " + L.name + " (" + L.address + "). Барбер: " + payload.barber + ". Найближчим часом напишемо в Telegram або зателефонуємо, щоб підтвердити.";
      $("#bookForm").hidden = true; $("#done").hidden = false;
      $("#done").scrollIntoView({ behavior: "smooth", block: "center" }); $("#icsBtn").focus({ preventScroll: true });
    }).catch(function () {
      var L2 = locById(st.loc); err.innerHTML = 'Не вдалося надіслати заявку. Зателефонуй нам: <a href="' + telOf(L2.phone) + '">' + esc(L2.phone) + "</a>";
    }).finally(function () { btn.disabled = false; btn.textContent = "Записатися"; });
  });
  $("#again").addEventListener("click", function () {
    $("#done").hidden = true; $("#bookForm").hidden = false; st.time = null; refresh();
  });
  $("#icsBtn").addEventListener("click", function () {
    if (!last) return;
    var f = function (dt) { return dt.getFullYear() + ("0" + (dt.getMonth() + 1)).slice(-2) + ("0" + dt.getDate()).slice(-2) + "T" + ("0" + dt.getHours()).slice(-2) + ("0" + dt.getMinutes()).slice(-2) + "00"; };
    var end = new Date(last.start.getTime() + last.dur * 60000);
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ferrum//UA", "BEGIN:VEVENT", "UID:" + Date.now() + "@ferrum", "DTSTART:" + f(last.start), "DTEND:" + f(end),
      "SUMMARY:" + last.title, "DESCRIPTION:" + last.desc, "LOCATION:" + last.where.replace(/,/g, "\\,"), "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Візит у барбершоп", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "ferrum.ics"; a.click();
  });


  /* ---------- Адреси: супутникова карта, що наближається з висоти до точки ----------
     Тайли Esri World Imagery вантажаться прямо в браузері. Шари на зумах 5, 8, 11, 14, 17;
     поточний зум плавно росте, кожен шар масштабується як 2^(z - рівень), наступний проявляється поверх. */
  var LEVELS = [5, 8, 11, 14, 17], Z0 = 5, Z1 = 17.6, ZOOM_MS = 4200;
  function tileUrl(z, x, y) { return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + z + "/" + y + "/" + x; }
  function worldPx(lat, lon, z) {
    var n = 256 * Math.pow(2, z), s = Math.sin(lat * Math.PI / 180);
    return [(lon + 180) / 360 * n, (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n];
  }
  function buildMap(box, l) {
    var W = box.clientWidth, H = box.clientHeight, html = "";
    LEVELS.forEach(function (z) {
      var p = worldPx(l.lat, l.lon, z), x0 = Math.floor((p[0] - W / 2) / 256), x1 = Math.floor((p[0] + W / 2) / 256),
        y0 = Math.floor((p[1] - H / 2) / 256), y1 = Math.floor((p[1] + H / 2) / 256), t = "";
      for (var tx = x0; tx <= x1; tx++) for (var ty = y0; ty <= y1; ty++)
        t += '<img alt="" decoding="async" src="' + tileUrl(z, tx, ty) + '" style="left:' + (tx * 256 - p[0] + W / 2).toFixed(1) + "px;top:" + (ty * 256 - p[1] + H / 2).toFixed(1) + 'px">';
      html += '<div class="lmap__layer" data-z="' + z + '">' + t + "</div>";
    });
    box.querySelector(".lmap__layers").innerHTML = html;
  }
  function paintZoom(box, z) {
    $$(".lmap__layer", box).forEach(function (el, i) {
      var L = +el.dataset.z, next = LEVELS[i + 1];
      var op = i === 0 ? 1 : Math.max(0, Math.min(1, (z - L) / 0.5)); // проявляється поверх, коли попередній шар уже розмитий
      el.style.opacity = op;
      el.style.visibility = op > 0 && (next == null || z < next + 0.2) ? "visible" : "hidden";
      el.style.transform = "scale(" + Math.pow(2, z - L).toFixed(4) + ")";
    });
    box.style.setProperty("--zl", ((z - Z0) / (Z1 - Z0)).toFixed(3));
  }
  function playZoom(box) {
    if (reduced) { paintZoom(box, Z1); return; }
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / ZOOM_MS), e = p < 1 ? 1 - Math.pow(1 - p, 3) : 1; // різко з висоти, м'яко в кінці
      paintZoom(box, Z0 + (Z1 - Z0) * e);
      if (p < 1) requestAnimationFrame(step); else box.classList.add("is-landed");
    }
    requestAnimationFrame(step);
  }
  var pinSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  var clockSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var phoneSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/></svg>';
  $("#lcards").innerHTML = C.locations.map(function (l, i) {
    return '<article class="lcard reveal" style="--rd:' + i * 0.1 + 's">' +
      '<div class="lmap" data-i="' + i + '"><div class="lmap__layers"></div><span class="lmap__pin" aria-hidden="true"></span>' +
      '<span class="lmap__tag">' + esc(l.name) + '</span><span class="lmap__src">© Esri, Maxar</span></div>' +
      '<h3>' + esc(l.name) + '</h3><ul class="lcard__info">' +
      "<li>" + pinSvg + "<span>" + esc(l.address) + "<small>" + esc(l.note) + "</small></span></li>" +
      "<li>" + clockSvg + "<span>" + esc(C.hoursText) + "</span></li>" +
      "<li>" + phoneSvg + '<a href="' + telOf(l.phone) + '">' + esc(l.phone) + "</a></li></ul>" +
      '<div class="lcard__btns"><a class="btn btn--acc" href="#booking" data-book-loc="' + l.id + '">Записатися сюди</a>' +
      '<a class="btn btn--ghost" href="' + mapOf(l) + '" target="_blank" rel="noopener">Маршрут ' + arrowNE + "</a></div></article>";
  }).join("");
  var maps = $$(".lmap");
  maps.forEach(function (box) { buildMap(box, C.locations[+box.dataset.i]); paintZoom(box, Z0); });
  var mapW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (Math.abs(window.innerWidth - mapW) < 40) return; mapW = window.innerWidth;
    maps.forEach(function (box) { buildMap(box, C.locations[+box.dataset.i]); paintZoom(box, box.classList.contains("is-landed") ? Z1 : Z0); });
  });
  if ("IntersectionObserver" in window) {
    var mio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { playZoom(x.target); mio.unobserve(x.target); } });
    }, { threshold: .55 });
    maps.forEach(function (m) { mio.observe(m); });
  } else maps.forEach(function (m) { paintZoom(m, Z1); m.classList.add("is-landed"); });

  /* ---------- Поява при скролі + запуск лічильників ---------- */
  var els = $$(".reveal"), counters = $$("[data-count]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    els.forEach(function (x) { io.observe(x); });
    var cio = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { countUp(x.target); cio.unobserve(x.target); } });
    }, { threshold: .6 });
    counters.forEach(function (x) { cio.observe(x); });
  } else { els.forEach(function (x) { x.classList.add("is-in"); }); counters.forEach(countUp); }
})();
