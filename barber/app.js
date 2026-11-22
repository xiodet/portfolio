/* Ferrum Barbershop — логіка сторінки */
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
  function barberById(id) { for (var i = 0; i < D.barbers.length; i++) if (D.barbers[i].id === id) return D.barbers[i]; }
  var tel = "tel:" + C.phone.replace(/[^\d+]/g, "");

  /* ---------- Nav ---------- */
  var nav = $("#nav"), burger = $("#burger"), links = $("#navLinks"), mbar = $("#mbar");
  function onScroll() {
    nav.classList.toggle("is-solid", window.scrollY > 40);
    var b = $("#booking").getBoundingClientRect();
    mbar.classList.toggle("is-hidden", window.scrollY < 300 || (b.top < window.innerHeight && b.bottom > 0));
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  burger.addEventListener("click", function () {
    var open = !links.classList.contains("is-open");
    links.classList.toggle("is-open", open); burger.setAttribute("aria-expanded", open);
  });
  $$("a", links).forEach(function (a) { a.addEventListener("click", function () { links.classList.remove("is-open"); burger.setAttribute("aria-expanded", false); }); });

  /* ---------- Stats, ticker ---------- */
  $("#stats").innerHTML = D.stats.map(function (s) { return '<div class="stat reveal"><b>' + esc(s.n) + "</b><span>" + esc(s.t) + "</span></div>"; }).join("");
  var tk = ["Стрижки", "Фейди", "Борода", "Королівське гоління", "Камуфляж сивини", "Батько + син", "Кава і віскі"];
  var tkHtml = tk.map(function (t) { return "<span>" + t + " <i>✦</i></span>"; }).join("");
  $("#ticker").innerHTML = tkHtml + tkHtml;

  /* ---------- Price board ---------- */
  $("#priceList").innerHTML = D.categories.map(function (c) {
    return '<h3 class="pcat">' + esc(c.name) + "</h3>" + D.services.filter(function (s) { return s.cat === c.id; }).map(function (s) {
      var prices = Array.isArray(s.price)
        ? s.price.map(function (p) { return '<span class="pr__p">' + p + "<small>₴</small></span>"; }).join("")
        : '<span class="pr__p pr__p--one">' + s.price + "<small>₴</small></span>";
      var label = s.name + ", " + s.dur + " хв: " + (Array.isArray(s.price) ? D.levels.map(function (l, i) { return l.toLowerCase() + " " + s.price[i]; }).join(", ") : s.price) + " гривень. Записатися";
      return '<a class="pr" href="#booking" data-svc="' + s.id + '" aria-label="' + esc(label) + '"><span class="pr__name">' + esc(s.name) +
        (s.hit ? ' <span class="hit">Хіт</span>' : "") +
        "<small>" + s.dur + " хв" + (s.note ? " · " + esc(s.note) : "") + "</small></span>" + prices + "</a>";
    }).join("");
  }).join("") + '<p class="board__foot">Кава, чай або келих віскі входять у кожен візит</p>';

  /* ---------- Team ---------- */
  $("#teamGrid").innerHTML = D.barbers.map(function (b) {
    return '<article class="barber reveal"><div class="barber__ph"><img src="' + b.photo + '" alt="' + esc(b.name) + '" loading="lazy"><span class="barber__lvl">' + D.levels[b.level] + "</span></div>" +
      '<div class="barber__b"><h3>' + esc(b.name) + '</h3><p class="barber__exp">' + esc(b.exp) + "</p>" +
      '<ul class="tags">' + b.tags.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" +
      '<a class="btn btn--ghost" href="#booking" data-barber="' + b.id + '">Записатися</a></div></article>';
  }).join("");

  /* ---------- Gallery + lightbox ---------- */
  var gal = $("#gallery"), lb = $("#lb"), lbI = 0;
  gal.innerHTML = D.gallery.map(function (g, i) {
    return '<button type="button" class="reveal" data-i="' + i + '"><img src="' + g.src + '" alt="' + esc(g.cap) + '" loading="lazy"><span>' + esc(g.cap) + "</span></button>";
  }).join("");
  function lbShow(i) { lbI = (i + D.gallery.length) % D.gallery.length; $("#lbImg").src = D.gallery[lbI].src; $("#lbImg").alt = D.gallery[lbI].cap; $("#lbCap").textContent = D.gallery[lbI].cap; }
  var lbFrom = null;
  gal.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; lbFrom = b; lbShow(+b.dataset.i); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lbX").focus(); });
  function lbClose() { lb.hidden = true; document.body.style.overflow = ""; if (lbFrom) lbFrom.focus(); }
  $("#lbX").addEventListener("click", lbClose);
  lb.addEventListener("click", function (e) { if (e.target === lb) lbClose(); });
  $("#lbPrev").addEventListener("click", function () { lbShow(lbI - 1); });
  $("#lbNext").addEventListener("click", function () { lbShow(lbI + 1); });
  document.addEventListener("keydown", function (e) { if (lb.hidden) return; if (e.key === "Escape") lbClose(); if (e.key === "ArrowLeft") lbShow(lbI - 1); if (e.key === "ArrowRight") lbShow(lbI + 1); });

  /* ---------- Reviews ---------- */
  $("#revList").innerHTML = D.reviews.map(function (r) {
    return '<article class="rv reveal"><span class="stars" aria-label="5 зірок">★★★★★</span><p>' + esc(r.text) + "</p><footer><b>" + esc(r.name) + "</b><span>барбер " + esc(r.barber) + " · " + esc(r.date) + "</span></footer></article>";
  }).join("");

  /* ---------- Contacts ---------- */
  $("#cAddr").textContent = C.address; $("#cAddrNote").textContent = C.addressNote; $("#cHours").textContent = C.hoursText;
  $("#cPhone").textContent = C.phone; $("#cPhone").href = tel;
  var icons = {
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M21 4L3 11l6 2.5M21 4l-3.5 16-8.5-6.5M21 4L9 13.5v5.5l3-3.5"/></svg>',
    viber: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3c5 0 8 2.5 8 7.5S17 18 12 18l-4 3v-3.5C5.5 16.5 4 14 4 10.5 4 5.5 7 3 12 3z"/></svg>'
  };
  var sl = { phone: [tel, "Зателефонувати"], instagram: [C.instagram, "Instagram"], telegram: [C.telegram, "Telegram"], viber: [C.viber, "Viber"] };
  $("#socials").innerHTML = Object.keys(sl).map(function (k) {
    var ext = k === "instagram" || k === "telegram";
    return '<a href="' + esc(sl[k][0]) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" + icons[k] + sl[k][1] + "</a>";
  }).join("");
  function loadMap() {
    var btn = $("#mapLoad"); if (!btn) return;
    var f = document.createElement("iframe");
    f.src = "https://www.google.com/maps?q=" + encodeURIComponent(C.mapQuery) + "&z=16&output=embed";
    f.loading = "lazy"; f.title = "Карта"; $("#map").appendChild(f); btn.remove();
  }
  $("#mapLoad").addEventListener("click", loadMap);
  if ("IntersectionObserver" in window) {
    var mio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { loadMap(); mio.disconnect(); } }, { rootMargin: "300px" });
    mio.observe($("#map"));
  }

  /* =========================================================
     ОНЛАЙН-ЗАПИС: послуга → барбер → дата і час
     Зайнятість у концепті генерується псевдовипадково (стабільно для дня й барбера).
     Для реального клієнта тут підключається його CRM (Altegio, Booksy тощо).
     ========================================================= */
  var st = { cat: "hair", svc: "cut", addons: [], barber: "any", day: 0, time: null, assigned: null };
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
    var ids = st.barber === "any" ? D.barbers.map(function (b) { return b.id; }) : [st.barber];
    for (var i = 0; i < ids.length; i++) if (freeAt(ids[i], di, cell)) return ids[i];
    return null;
  }
  function cellTime(c) { var m = C.open * 60 + c * STEP; return Math.floor(m / 60) + ":" + ("0" + m % 60).slice(-2); }
  function dayLabel(di) { var d = dayDate(di); return di === 0 ? "сьогодні" : di === 1 ? "завтра" : DAYS[d.getDay()].toLowerCase() + ", " + d.getDate() + " " + MONTHS[d.getMonth()]; }
  function nextFree(bid) {
    for (var di = 0; di < C.daysAhead; di++) for (var c = 0; c < CELLS; c++) if (freeAt(bid, di, c)) return dayLabel(di) + " " + cellTime(c);
    return "немає вікон";
  }

  // 1. Послуги
  var mainCats = D.categories.filter(function (c) { return c.id !== "extra"; });
  function renderTabs() {
    $("#bTabs").innerHTML = mainCats.map(function (c) { return '<button type="button" class="tab' + (c.id === st.cat ? " is-on" : "") + '" aria-pressed="' + (c.id === st.cat) + '" data-cat="' + c.id + '">' + esc(c.name) + "</button>"; }).join("");
  }
  function renderServices() {
    $("#bServices").innerHTML = D.services.filter(function (s) { return s.cat === st.cat; }).map(function (s) {
      return '<button type="button" class="opt' + (s.id === st.svc ? " is-on" : "") + '" aria-pressed="' + (s.id === st.svc) + '" data-svc="' + s.id + '"><span><b>' + esc(s.name) + "</b><small>" + s.dur + " хв" + (s.note ? " · " + esc(s.note) : "") + '</small></span><span class="opt__p">від ' + minPrice(s) + " ₴</span></button>";
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

  // 2. Барбери
  function renderBarbers() {
    var any = '<button type="button" class="opt bopt' + (st.barber === "any" ? " is-on" : "") + '" aria-pressed="' + (st.barber === "any") + '" data-b="any"><span class="bopt__ph"><span class="bopt__any">F</span></span><span class="bopt__b"><b>Будь-хто вільний</b><small>найшвидше вікно</small><span class="bopt__p">від ' + money(totalPrice(0)) + "</span></span></button>";
    $("#bBarbers").innerHTML = any + D.barbers.map(function (b) {
      return '<button type="button" class="opt bopt' + (st.barber === b.id ? " is-on" : "") + '" aria-pressed="' + (st.barber === b.id) + '" data-b="' + b.id + '"><span class="bopt__ph"><img src="' + b.photo + '" alt=""></span><span class="bopt__b"><b>' + esc(b.name.split(" ")[0]) + "</b><small>" + D.levels[b.level] + '</small><span class="bopt__p">' + money(totalPrice(b.level)) + '</span><span class="bopt__next">Найближче: ' + nextFree(b.id) + "</span></span></button>";
    }).join("");
  }
  $("#bBarbers").addEventListener("click", function (e) { var o = e.target.closest(".bopt"); if (!o) return; st.barber = o.dataset.b; renderBarbers(); keepTime(); renderTimes(); renderSummary(); });

  // 3. Дата і час
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
    $("#summary").innerHTML =
      row("Послуга", esc(s.name) + (adds.length ? " + " + esc(adds.join(", ")).toLowerCase() : "")) +
      row("Барбер", bTxt || "не обрано", !bTxt) +
      row("Коли", when || "оберіть час", !when) +
      row("Тривалість", totalDur() + " хв");
    $("#sumTotal").textContent = b ? money(totalPrice(b.level)) : "від " + money(totalPrice(0));
  }
  function refresh() { renderBarbers(); keepTime(); renderTimes(); renderSummary(); }

  renderTabs(); renderServices(); renderAddons(); renderDays(); refresh();
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
    var p = e.target.closest("[data-svc].pr"); if (p) pickService(p.dataset.svc);
    var b = e.target.closest("a[data-barber]"); if (b) { st.barber = b.dataset.barber; refresh(); }
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

    var s = svcById(st.svc), b = chosenBarber(), d = dayDate(st.day);
    var adds = st.addons.map(function (a) { return svcById(a).name; });
    var payload = {
      service: s.name + (adds.length ? " + " + adds.join(", ") : ""), barber: b.name, price: money(totalPrice(b.level)),
      date: d.getDate() + " " + MONTHS[d.getMonth()] + " (" + DAYS[d.getDay()] + ")", time: cellTime(st.time), duration: totalDur(),
      name: fName.value.trim(), phone: fPhone.value, note: fNote.value.trim()
    };
    var text = "💈 <b>Новий запис з сайту</b>\n\n" +
      "Послуга: " + esc(payload.service) + "\nБарбер: " + esc(payload.barber) + "\n" +
      "Коли: " + payload.date + ", " + payload.time + " (" + payload.duration + " хв)\nЦіна: " + payload.price + "\n\n" +
      "Клієнт: " + esc(payload.name) + "\nТелефон: " + esc(payload.phone) + (payload.note ? "\nКоментар: " + esc(payload.note) : "");

    var btn = $("#submitBtn"); btn.disabled = true; btn.textContent = "Надсилаємо…"; err.textContent = "";
    send(text, payload).then(function () {
      var start = new Date(d); var m = C.open * 60 + st.time * STEP; start.setHours(Math.floor(m / 60), m % 60);
      last = { start: start, dur: payload.duration, title: "Ferrum: " + payload.service, desc: "Барбер " + payload.barber + ". " + C.address };
      $("#doneText").textContent = payload.name + ", чекаємо тебе " + dayLabel(st.day) + " о " + payload.time + ". Барбер: " + payload.barber + ". Найближчим часом напишемо в Telegram або зателефонуємо, щоб підтвердити.";
      $("#bookForm").hidden = true; $("#done").hidden = false;
      $("#done").scrollIntoView({ behavior: "smooth", block: "center" }); $("#icsBtn").focus({ preventScroll: true });
    }).catch(function () {
      err.innerHTML = 'Не вдалося надіслати заявку. Зателефонуй нам: <a href="' + tel + '">' + esc(C.phone) + "</a>";
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
      "SUMMARY:" + last.title, "DESCRIPTION:" + last.desc, "LOCATION:" + C.address, "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Візит у барбершоп", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "ferrum.ics"; a.click();
  });

  /* ---------- Reveal ---------- */
  var els = $$(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    els.forEach(function (x) { io.observe(x); });
  } else els.forEach(function (x) { x.classList.add("is-in"); });
})();
