(function () {
  "use strict";
  var C = window.CONFIG, D = window.DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  var money = function (n) { return n.toLocaleString("uk-UA").replace(/,/g, " ") + " грн"; };
  var dur = function (m) { var h = Math.floor(m / 60), r = m % 60; return "≈ " + (h ? h + " год" : "") + (h && r ? " " : "") + (r ? r + " хв" : ""); };

  /* ---------- Nav ---------- */
  var nav = $("#nav"), burger = $("#burger"), mnav = $("#mnav"), fab = $("#fab");
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-solid", y > 30);
    var book = $("#booking").getBoundingClientRect();
    var inBooking = book.top < window.innerHeight * .8 && book.bottom > 0;
    var ha = $("#heroActions").getBoundingClientRect();
    var heroCtaVisible = ha.top < window.innerHeight && ha.bottom > 0;
    fab.classList.toggle("is-on", !heroCtaVisible && !inBooking);
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  burger.addEventListener("click", function () {
    var open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", open); mnav.classList.toggle("is-open", open); nav.classList.add("is-solid");
  });
  mnav.addEventListener("click", function (e) { if (e.target.closest("a")) { burger.setAttribute("aria-expanded", "false"); mnav.classList.remove("is-open"); } });

  /* ---------- Services ---------- */
  var tabs = $("#svcTabs"), list = $("#svcList");
  D.categories.forEach(function (c, i) {
    var t = el("button", "tab", esc(c.name));
    t.type = "button"; t.setAttribute("role", "tab"); t.setAttribute("aria-selected", i === 0); t.dataset.cat = c.id;
    tabs.appendChild(t);
    var g = el("div", "price-group" + (i === 0 ? " is-active" : "")); g.dataset.cat = c.id; g.setAttribute("role", "tabpanel");
    D.services.forEach(function (s, idx) {
      if (s.cat !== c.id) return;
      var card = el(s.addon ? "div" : "button", "pcard" + (s.hit ? " pcard--hit" : ""),
        (s.hit ? '<span class="pcard__tag">Хіт</span>' : "") +
        '<span class="pcard__name">' + esc(s.name) + '</span>' +
        (s.note ? '<span class="pcard__note">' + esc(s.note) + '</span>' : "") +
        '<span class="pcard__price">' + (s.from ? "<small>від</small>" : "") + s.price.toLocaleString("uk-UA").replace(/,/g, " ") + '<span>₴</span></span>' +
        '<span class="pcard__foot"><span>' + (s.dur ? dur(s.dur) : "доповнення") + '</span>' + (s.addon ? "" : '<span class="pcard__go" aria-hidden="true">→</span>') + '</span>');
      if (!s.addon) { card.type = "button"; card.dataset.svc = idx; card.setAttribute("aria-label", "Записатися: " + s.name); }
      g.appendChild(card);
    });
    list.appendChild(g);
  });
  tabs.addEventListener("click", function (e) {
    var t = e.target.closest(".tab"); if (!t) return;
    tabs.querySelectorAll(".tab").forEach(function (x) { x.setAttribute("aria-selected", x === t); });
    list.querySelectorAll(".price-group").forEach(function (g) { g.classList.toggle("is-active", g.dataset.cat === t.dataset.cat); });
  });

  /* ---------- Gallery + lightbox ---------- */
  var gal = $("#gallery-list");
  D.gallery.forEach(function (g, i) {
    var b = el("button", "gallery__item", '<img src="' + g.src + '" alt="' + esc(g.cap) + '" loading="lazy"><span>' + esc(g.cap) + '</span>');
    b.type = "button"; b.dataset.i = i; gal.appendChild(b);
  });
  var lb = $("#lb"), lbImg = $("#lbImg"), lbCap = $("#lbCap"), cur = 0, lastFocus;
  function show(i) { cur = (i + D.gallery.length) % D.gallery.length; lbImg.src = D.gallery[cur].src; lbImg.alt = D.gallery[cur].cap; lbCap.textContent = D.gallery[cur].cap + "  ·  " + (cur + 1) + " / " + D.gallery.length; }
  function openLb(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lbClose").focus(); }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }
  gal.addEventListener("click", function (e) { var b = e.target.closest(".gallery__item"); if (b) openLb(+b.dataset.i); });
  $("#lbClose").onclick = closeLb; $("#lbPrev").onclick = function () { show(cur - 1); }; $("#lbNext").onclick = function () { show(cur + 1); };
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb(); else if (e.key === "ArrowLeft") show(cur - 1); else if (e.key === "ArrowRight") show(cur + 1);
  });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) { if (tx == null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 40) show(cur + (dx < 0 ? 1 : -1)); tx = null; });

  /* ---------- Team ---------- */
  var team = $("#teamList");
  D.masters.forEach(function (m) {
    team.appendChild(el("article", "member reveal",
      '<div class="member__photo"><img src="' + m.photo + '" alt="' + esc(m.name) + '" loading="lazy"></div>' +
      '<h3>' + esc(m.name) + '</h3><p>' + esc(m.role) + '</p><span class="member__exp">' + esc(m.exp) + '</span>'));
  });

  /* ---------- Reviews ---------- */
  var rv = $("#reviewList");
  D.reviews.forEach(function (r) {
    rv.appendChild(el("article", "review",
      '<span class="stars" aria-label="5 з 5">★★★★★</span><p>' + esc(r.text) + '</p>' +
      '<footer><span class="review__av">' + esc(r.name[0]) + '</span><div><b>' + esc(r.name) + '</b><small>' + esc(r.date) + ' · Google</small></div></footer>'));
  });

  /* ---------- Contacts ---------- */
  var icons = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M21 4L3 11l6 2.5M21 4l-3.5 16-8.5-6.5M21 4L9 13.5v5.5l3-3.5"/></svg>',
    viber: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 3c5 0 8 2.5 8 7.5S17 18 12 18c-.8 0-1.6-.1-2.3-.2L6 21v-4C4.5 15.6 4 13.3 4 10.5 4 5.5 7 3 12 3z"/><path d="M9.5 7.5c-.6.5-.7 1.4-.2 2.4a8 8 0 0 0 4 3.9c1 .4 1.8.2 2.2-.4l-1.5-1.2-.9.6a4.5 4.5 0 0 1-2.2-2.2l.6-.9z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>'
  };
  var tel = "tel:" + C.phone.replace(/[^\d+]/g, "");
  var links = { instagram: C.instagram, telegram: C.telegram, viber: C.viber, phone: tel };
  var labels = { phone: "Зателефонувати", instagram: "Instagram", telegram: "Telegram", viber: "Viber" };
  var soc = $("#socials");
  ["phone", "instagram", "telegram", "viber"].forEach(function (k) {
    var a = el("a", "social", icons[k] + "<span>" + labels[k] + "</span>"); a.href = links[k];
    if (k === "instagram" || k === "telegram") { a.target = "_blank"; a.rel = "noopener"; }
    soc.appendChild(a);
  });
  document.querySelectorAll("[data-social]").forEach(function (a) { a.href = links[a.dataset.social]; if (a.dataset.social === "instagram") { a.target = "_blank"; a.rel = "noopener"; } });
  $("#phoneText").textContent = C.phone;
  function loadMap() {
    var btn = $("#mapLoad"); if (!btn) return;
    var f = document.createElement("iframe");
    f.src = "https://www.google.com/maps?q=" + encodeURIComponent(C.mapQuery) + "&z=16&output=embed";
    f.loading = "lazy"; f.title = "Карта"; f.referrerPolicy = "no-referrer-when-downgrade";
    $("#map").appendChild(f); btn.remove();
  }
  $("#mapLoad").addEventListener("click", loadMap);
  if ("IntersectionObserver" in window) {
    var mio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { loadMap(); mio.disconnect(); } }, { rootMargin: "300px" });
    mio.observe($("#map"));
  }

  /* ---------- Booking ---------- */
  var fService = $("#fService"), fMaster = $("#fMaster"), fDate = $("#fDate"), fTime = $("#fTime");
  var fName = $("#fName"), fPhone = $("#fPhone"), fNote = $("#fNote"), err = $("#formErr"), sum = $("#summary");
  var st = { service: null, master: null, date: null, time: null };
  var DAYS = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  var MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];

  fService.innerHTML = '<option value="" disabled selected>Оберіть послугу</option>' + D.categories.map(function (c) {
    return '<optgroup label="' + esc(c.name) + '">' + D.services.map(function (s, i) {
      return s.cat === c.id && !s.addon ? '<option value="' + i + '">' + esc(s.name) + " — " + (s.from ? "від " : "") + money(s.price) + "</option>" : "";
    }).join("") + "</optgroup>";
  }).join("");

  function chip(container, html, val, cls) {
    var b = el("button", "chip" + (cls ? " " + cls : ""), html); b.type = "button"; b.setAttribute("role", "radio");
    b.setAttribute("aria-checked", "false"); b.dataset.v = val; container.appendChild(b); return b;
  }
  function select(container, val) {
    container.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-checked", c.dataset.v === String(val)); });
  }

  function renderMasters() {
    fMaster.innerHTML = "";
    var svc = D.services[st.service];
    var ms = D.masters.filter(function (m) { return !svc || m.cats.indexOf(svc.cat) > -1; });
    chip(fMaster, "<i>✦</i>Будь-який вільний", "any", "chip--master");
    ms.forEach(function (m) { chip(fMaster, '<img src="' + m.photo + '" alt="">' + esc(m.name), D.masters.indexOf(m), "chip--master"); });
    if (st.master !== "any" && !ms.some(function (m) { return String(D.masters.indexOf(m)) === String(st.master); })) st.master = "any";
    select(fMaster, st.master);
  }

  var dates = [];
  (function () {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 0; i < C.daysAhead; i++) { var x = new Date(d); x.setDate(d.getDate() + i); dates.push(x); }
    dates.forEach(function (x, i) {
      var top = i === 0 ? "Сьогодні" : i === 1 ? "Завтра" : DAYS[x.getDay()];
      chip(fDate, "<small>" + top + "</small><b>" + x.getDate() + "</b>", i, "chip--date");
    });
  })();

  // Імітація зайнятих слотів, щоб графік виглядав живим
  function busy(dateIdx, hour) {
    var seed = (dateIdx + 3) * 31 + hour * 17 + (st.master === "any" ? 5 : (+st.master + 1) * 13);
    return (seed * 9301 + 49297) % 233280 / 233280 < .28;
  }
  function renderTimes() {
    fTime.innerHTML = "";
    if (st.date == null) { fTime.innerHTML = '<span class="muted" style="grid-column:1/-1;font-size:14px">Спочатку оберіть дату</span>'; return; }
    var d = dates[st.date], h = d.getDay() === 0 ? C.hours.sunday : C.hours.weekday;
    var dur = st.service != null ? D.services[st.service].dur : 60;
    var now = new Date(), free = 0;
    for (var m = h[0] * 60; m + Math.max(dur, 30) <= h[1] * 60; m += C.slotStepMin) {
      var hh = Math.floor(m / 60), label = hh + ":" + String(m % 60).padStart(2, "0");
      var b = chip(fTime, label, label);
      var past = st.date === 0 && (hh * 60 + m % 60) <= now.getHours() * 60 + now.getMinutes() + 30;
      if (past || busy(st.date, hh)) b.disabled = true; else free++;
    }
    if (!free) fTime.innerHTML = '<span class="muted" style="grid-column:1/-1;font-size:14px">На цей день вільних вікон немає, оберіть інший.</span>';
    if (st.time && !fTime.querySelector('.chip[data-v="' + st.time + '"]:not([disabled])')) st.time = null;
    select(fTime, st.time);
  }

  function fmtDate(i) { var d = dates[i]; return DAYS[d.getDay()].toLowerCase() + ", " + d.getDate() + " " + MONTHS[d.getMonth()]; }
  function masterName() { return st.master === "any" || st.master == null ? "будь-який вільний майстер" : D.masters[st.master].name; }
  function renderSummary() {
    if (st.service == null) { sum.innerHTML = ""; return; }
    var s = D.services[st.service];
    sum.innerHTML = "<b>" + esc(s.name) + "</b> · " + (s.from ? "від " : "") + money(s.price) +
      "<br>" + esc(masterName()) + (st.date != null ? " · " + fmtDate(st.date) : "") + (st.time ? " о " + st.time : "");
  }

  fService.addEventListener("change", function () { st.service = +fService.value; renderMasters(); renderTimes(); renderSummary(); err.textContent = ""; });
  fMaster.addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c) return; st.master = c.dataset.v; select(fMaster, st.master); renderTimes(); renderSummary(); });
  fDate.addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c) return; st.date = +c.dataset.v; select(fDate, st.date); renderTimes(); renderSummary(); });
  fTime.addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c || c.disabled) return; st.time = c.dataset.v; select(fTime, st.time); renderSummary(); err.textContent = ""; });

  // Картки прайсу: клік → запис на цю послугу
  list.addEventListener("click", function (e) {
    var c = e.target.closest("[data-svc]"); if (!c) return;
    fService.value = c.dataset.svc; fService.dispatchEvent(new Event("change"));
    $("#booking").scrollIntoView({ behavior: "smooth" });
  });

  // Маска телефону
  fPhone.addEventListener("focus", function () { if (!fPhone.value) fPhone.value = "+380 "; });
  fPhone.addEventListener("input", function () {
    var d = fPhone.value.replace(/\D/g, "");
    if (d.indexOf("380") !== 0) d = "380" + d.replace(/^0+/, "").replace(/^380/, "");
    d = d.slice(0, 12);
    var p = [d.slice(0, 3), d.slice(3, 5), d.slice(5, 8), d.slice(8, 10), d.slice(10, 12)].filter(Boolean);
    fPhone.value = "+" + p.join(" ");
    fPhone.classList.remove("is-bad");
  });
  fName.addEventListener("input", function () { fName.classList.remove("is-bad"); });

  renderMasters(); st.master = "any"; select(fMaster, "any");
  st.date = 0; select(fDate, 0);
  renderTimes();
  // якщо сьогодні вже все зайнято — обрати завтра
  if (!fTime.querySelector(".chip:not([disabled])")) { st.date = 1; select(fDate, 1); renderTimes(); }

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

  $("#bookForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var problems = [];
    if (st.service == null) problems.push("послугу");
    if (!st.time) problems.push("час");
    var nameOk = fName.value.trim().length > 1, phoneOk = fPhone.value.replace(/\D/g, "").length === 12;
    if (!nameOk) { problems.push("ім'я"); fName.classList.add("is-bad"); }
    if (!phoneOk) { problems.push("телефон"); fPhone.classList.add("is-bad"); }
    if (problems.length) { err.textContent = "Будь ласка, вкажіть " + problems.join(", ") + "."; return; }

    var s = D.services[st.service];
    var payload = { service: s.name, price: (s.from ? "від " : "") + money(s.price), master: masterName(), date: fmtDate(st.date), time: st.time, name: fName.value.trim(), phone: fPhone.value, note: fNote.value.trim() };
    var text = "🗓 <b>Новий запис з сайту</b>\n\n" +
      "Послуга: " + esc(payload.service) + " (" + payload.price + ")\n" +
      "Майстер: " + esc(payload.master) + "\n" +
      "Коли: " + payload.date + ", " + payload.time + "\n\n" +
      "Клієнт: " + esc(payload.name) + "\nТелефон: " + esc(payload.phone) +
      (payload.note ? "\nКоментар: " + esc(payload.note) : "");

    var btn = $("#submitBtn"); btn.disabled = true; btn.textContent = "Надсилаємо…"; err.textContent = "";
    send(text, payload).then(function () {
      $("#doneText").textContent = payload.name + ", чекаємо вас " + payload.date + " о " + payload.time + ". Адміністратор зв'яжеться з вами для підтвердження.";
      $("#bookForm").hidden = true; $("#done").hidden = false;
      $("#done").scrollIntoView({ behavior: "smooth", block: "center" });
    }).catch(function () {
      err.innerHTML = 'Не вдалося надіслати заявку. Зателефонуйте нам: <a class="link" href="' + tel + '">' + esc(C.phone) + "</a>";
    }).finally(function () { btn.disabled = false; btn.textContent = "Записатися"; });
  });
  $("#again").addEventListener("click", function () {
    $("#done").hidden = true; $("#bookForm").hidden = false; st.time = null; renderTimes(); renderSummary();
  });

  /* ---------- Reveal on scroll ---------- */
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    els.forEach(function (x) { io.observe(x); });
  } else els.forEach(function (x) { x.classList.add("is-in"); });
})();
