/* Ясна — стоматологія. Vanilla JS, без бібліотек. */
(function () {
  var C = window.CONFIG, D = window.DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
  function money(n) { return fmt(n) + " ₴"; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function svcById(id) { return D.services.filter(function (s) { return s.id === id; })[0]; }
  function docById(id) { return D.doctors.filter(function (d) { return d.id === id; })[0]; }
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var arrow = '<svg class="arr" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>';
  document.documentElement.classList.add("js");

  /* ---------- Фото: якщо файлу ще немає, показуємо акуратну заглушку ---------- */
  function markNoImg(img) { var p = img.closest(".ph"); if (p) p.classList.add("noimg"); }
  window.addEventListener("error", function (e) { if (e.target && e.target.tagName === "IMG") markNoImg(e.target); }, true);
  function checkImgs(root) { $$("img", root).forEach(function (i) { if (i.complete && !i.naturalWidth) markNoImg(i); }); }
  function probe(src, ok, fail) { var i = new Image(); i.onload = ok; i.onerror = fail; i.src = src; }

  function go(target, offset) {
    var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav")) || 72;
    var top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY - navH - (offset || 0);
    window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute("href").length < 2) return;
    var t = document.getElementById(a.getAttribute("href").slice(1)); if (!t) return;
    e.preventDefault(); go(t.id === "top" ? 0 : t);
  });

  /* Заголовки розділів з'являються по словах */
  $$(".h2").forEach(function (h) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var s = document.createElement("span"); s.className = "hw"; s.style.setProperty("--wi", i++); s.textContent = part; frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(h);
  });

  /* ---------- Навігація, прогрес скролу ---------- */
  var nav = $("#nav"), bar = $("#progress"), mbar = $("#mbar");
  var burger = $("#burger"), links = $("#navLinks");
  burger.addEventListener("click", function () {
    var o = links.classList.toggle("is-open"); nav.classList.toggle("menu-open", o); burger.setAttribute("aria-expanded", o);
  });
  $$("a", links).forEach(function (a) { a.addEventListener("click", function () { links.classList.remove("is-open"); nav.classList.remove("menu-open"); burger.setAttribute("aria-expanded", false); }); });

  /* ---------- Hero: найближчий вільний час ---------- */
  (function () {
    var now = new Date(), h = C.hours[now.getDay()], m = now.getHours() * 60 + now.getMinutes() + 90;
    m = Math.ceil(m / 30) * 30;
    var txt;
    if (m <= (h[1] - 1) * 60) txt = "сьогодні о " + Math.floor(m / 60) + ":" + ("0" + m % 60).slice(-2);
    else { var t = new Date(now); t.setDate(t.getDate() + 1); txt = "завтра о " + C.hours[t.getDay()][0] + ":00"; }
    $("#heroSlot").textContent = txt;
  })();

  /* =====================================================================
     «Чому ми»: атлас. Кожен розділ — справжнє зображення як ілюстрація з підручника:
     виноски з підписами прорисовуються по черзі, «камера» наїжджає на деталь,
     кадри змінюються шторкою. Десктоп: усе прив'язано до скролу. Телефон: програється при появі.
     Координати виносок — у відсотках від зображення: x,y — точка на зображенні, lx,ly — де підпис.
     ===================================================================== */
  var CH = D.why;
  var track = $("#storyTrack"), figs = $("#whyFigs"), copy = $("#whyCopy"), mob = $("#whyMob");
  function figHTML(c, i) {
    var notes = (c.notes || []).map(function (n, k) {
      var right = n.side ? n.side === "r" : n.lx >= n.x;
      return '<g class="wn__g k' + k + '"><line x1="' + (n.x * c.ar).toFixed(2) + '" y1="' + n.y + '" x2="' + (n.lx * c.ar).toFixed(2) + '" y2="' + n.ly + '" pathLength="1"/><circle cx="' + n.x + '" cy="' + n.y + '" r=".9"/></g>';
    }).join("");
    var labels = (c.notes || []).map(function (n, k) {
      var right = n.side ? n.side === "r" : n.lx >= n.x;
      return '<span class="wn__l k' + k + (right ? "" : " wn__l--r") + '" style="left:' + n.lx + "%;top:" + n.ly + '%"><i>' + (k + 1) + "</i><span><b>" + esc(n.t) + "</b>" + (n.s ? "<small>" + esc(n.s) + "</small>" : "") + "</span></span>" +
        '<span class="wn__dot k' + k + '" style="left:' + n.x + "%;top:" + n.y + '%"></span>';
    }).join("");
    var fx = c.focus || [50, 50, 1.12];
    return '<figure class="wf' + (c.scan ? " wf--scan" : "") + (c.dark ? " wf--dark" : "") + '" data-i="' + i + '" style="--ar:' + c.ar + ";--fx:" + fx[0] + "%;--fy:" + fx[1] + "%;--fs:" + fx[2] + '">' +
      '<div class="wf__frame ph"><div class="wf__cam">' +
      '<img src="' + c.img + '" alt="' + esc(c.alt || c.t) + '" loading="lazy">' +
      (c.scan ? '<img class="wf__scanimg" src="' + c.img + '" alt=""><span class="wf__beam"></span>' : "") +
      '<svg class="wn" viewBox="0 0 ' + (100 * c.ar).toFixed(2) + ' 100" preserveAspectRatio="none" aria-hidden="true">' + notes + "</svg>" + labels +
      "</div></div>" +
      '<figcaption><span>Рис. ' + (i + 1) + "</span>" + esc(c.cap) + "</figcaption></figure>";
  }
  function copyHTML(c, i) {
    return '<div class="wc" data-i="' + i + '"><p class="wc__tag"><span>0' + (i + 1) + "</span>" + esc(c.tag) + '</p><h3 class="wc__t"><span>' + esc(c.t) + '</span></h3><p class="wc__d">' + esc(c.d) + "</p>" +
      (c.facts ? '<ul class="wc__facts">' + c.facts.map(function (f) { return "<li><b>" + esc(f[0]) + "</b>" + esc(f[1]) + "</li>"; }).join("") + "</ul>" : "") + "</div>";
  }
  figs.innerHTML = CH.map(figHTML).join("");
  copy.innerHTML = CH.map(copyHTML).join("") + '<div class="wprog" id="wprog">' + CH.map(function () { return "<i><b></b></i>"; }).join("") + "</div>";
  mob.innerHTML = CH.map(function (c, i) { return '<article class="wm">' + figHTML(c, i) + copyHTML(c, i) + "</article>"; }).join("");
  checkImgs(figs); checkImgs(mob);
  var dFigs = $$(".wf", figs), dCopy = $$(".wc", copy), dProg = $$("#wprog b");
  var desk = window.matchMedia("(min-width: 960px)"), mode = "", active = -1;
  // стан кадру: p — прогрес усередині розділу (0..1)
  function paint(f, p) {
    var c = CH[+f.dataset.i], n = (c.notes || []).length, e = ease(clamp(p / .85, 0, 1));
    f.style.setProperty("--z", e.toFixed(3));
    if (c.scan) f.style.setProperty("--scan", (clamp((p - .02) / .55, 0, 1) * 100).toFixed(1) + "%");
    for (var k = 0; k < n; k++) f.classList.toggle("n" + k, p > (c.scan ? .3 : .12) + k * (.6 / Math.max(n, 1)));
  }
  function layout() {
    var m = desk.matches && !reduced ? "desk" : "mob";
    if (m === mode) return; mode = m;
    document.documentElement.classList.toggle("story-desk", m === "desk");
    if (m === "desk") { track.style.height = (CH.length * 90 + 60) + "vh"; active = -1; storyScroll(); }
    else { track.style.height = ""; }
    if (reduced) $$(".wf", mob).forEach(function (f) { f.classList.add("is-on"); paint(f, 1); });
  }
  function storyScroll() {
    if (mode !== "desk") return;
    var r = track.getBoundingClientRect(), len = track.offsetHeight - window.innerHeight;
    var prog = clamp(-r.top / len, 0, .9999), fl = prog * CH.length, idx = Math.floor(fl), lp = fl - idx;
    if (idx !== active) {
      active = idx;
      dFigs.forEach(function (f, i) { f.classList.toggle("is-on", i <= idx); f.classList.toggle("is-cur", i === idx); });
      dCopy.forEach(function (c, i) { c.classList.toggle("is-on", i === idx); c.classList.toggle("is-past", i < idx); });
    }
    dFigs.forEach(function (f, i) { paint(f, i < idx ? 1 : i > idx ? 0 : lp); });
    dProg.forEach(function (b, i) { b.style.transform = "scaleX(" + (i < idx ? 1 : i > idx ? 0 : lp).toFixed(3) + ")"; });
  }
  $("#wprog").addEventListener("click", function (e) {
    var i = $$("#wprog i").indexOf(e.target.closest("i")); if (i < 0) return;
    var len = track.offsetHeight - window.innerHeight;
    go(track.getBoundingClientRect().top + window.scrollY + (i + .3) / CH.length * len);
  });
  // телефон: кадр розкривається і виноски малюються самі, коли кадр на екрані
  if ("IntersectionObserver" in window && !reduced) {
    var wio = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting || mode !== "mob") return;
        wio.unobserve(x.target); var f = $(".wf", x.target); f.classList.add("is-on");
        var t0 = null;
        requestAnimationFrame(function step(t) { if (!t0) t0 = t; var k = clamp((t - t0) / 3200, 0, 1); paint(f, k); if (k < 1) requestAnimationFrame(step); });
      });
    }, { threshold: .25 });
    $$(".wm", mob).forEach(function (f) { wio.observe(f); });
  }
  var scenes = [];
  function setScene() {}

  /* ---------- Цифри ---------- */
  /* Цифри: кожна цифра — барабан, що прокручується до свого значення (як табло) */
  $("#stats").innerHTML = D.stats.map(function (s, si) {
    var di = 0, num = s.v.split("").map(function (ch) {
      if (!/\d/.test(ch)) return ch === " " ? '<span class="odo__gap"></span>' : '<span class="odo__sep">' + esc(ch) + "</span>";
      var cells = ""; for (var k = 0; k < 20; k++) cells += "<i>" + (k % 10) + "</i>";
      return '<span class="odo__d" style="--n:' + (10 + +ch) + ";--di:" + (di++) + '"><span class="odo__s">' + cells + "</span></span>";
    }).join("");
    return '<div class="stat reveal" style="--rd:' + si * .1 + 's"><span class="stat__line" aria-hidden="true"></span>' +
      '<b class="odo" aria-label="' + esc(s.v + (s.suf ? " " + s.suf : "")) + '"><span aria-hidden="true">' + num + "</span>" + (s.suf ? '<span class="stat__suf" aria-hidden="true">' + esc(s.suf) + "</span>" : "") + "</b>" +
      "<span class=\"stat__lbl\">" + esc(s.label) + "</span></div>";
  }).join("");
  function countUp(el) {
    var n = +el.dataset.count, dec = +(el.dataset.dec || 0), plain = el.dataset.plain === "1", suf = el.dataset.suf || "", t0 = null, from = plain ? n - 10 : 0;
    function out(v) { return (dec ? v.toFixed(dec).replace(".", ",") : plain ? String(Math.round(v)) : fmt(Math.round(v))) + suf; }
    if (reduced) { el.textContent = out(n); return; }
    requestAnimationFrame(function step(t) { if (!t0) t0 = t; var k = clamp((t - t0) / 1600, 0, 1); el.textContent = out(from + (n - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); });
  }

  /* ---------- Послуги ---------- */
  var IC = {
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
    tooth: '<path d="M7.5 3.5c-2.2 0-4 1.8-4 4.4 0 2.6 1 4.4 1.8 7.2.7 2.6 1.1 5.4 2.7 5.4 1.8 0 1.7-4.5 4-4.5s2.2 4.5 4 4.5c1.6 0 2-2.8 2.7-5.4.8-2.8 1.8-4.6 1.8-7.2 0-2.6-1.8-4.4-4-4.4-1.9 0-2.7 1-4.5 1s-2.6-1-4.5-1z"/>',
    micro: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/>',
    implant: '<path d="M7 3.5h10l-1 5H8zM9 8.5h6M9.5 11h5M10 13.5h4M10.5 16h3M11 18.5h2L12 21z"/>',
    care: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    crown: '<path d="M4 17l-1-9 5 4 4-7 4 7 5-4-1 9zM5 20h14"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14c2.2 2.4 5.8 2.4 8 0M9 9.5v.5M15 9.5v.5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"/>',
    align: '<path d="M3 10c3 2.5 15 2.5 18 0M5 14.5c3 2 11 2 14 0M7 11.6v3.6M12 12.4v3.8M17 11.6v3.6"/>',
    kid: '<circle cx="12" cy="13" r="7.5"/><path d="M9 15c1.6 1.6 4.4 1.6 6 0M9.5 11.5v.3M14.5 11.5v.3M12 5.5c0-2 1.5-3 3-3"/>'
  };
  function icon(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (IC[k] || "") + "</svg>"; }
  /* ---------- Послуги і ціни: прайс-лист рядками + велике превью ---------- */
  var PCOL = { treat: ["#9DBBFF", "#C9D8FF", "#BDE3FF"], est: ["#C7B8FF", "#FFD3E6", "#BFD0FF"], surg: ["#9FE0E0", "#B9CCFF", "#CFE9FF"], kids: ["#FFD6A8", "#BFE3FF", "#FFE7C2"] };
  var SIMG = { consult: "w1", hyg: "smile1", caries: "micro", endo: "w3", impl: "w5", extr: "hero", crown: "smile3", ven: "ven-after", white: "smile2", align: "al-after", kids: "calm" };
  var svcCat = "all", pvId = null, tabsEl = $("#svcTabs"), plPv = $("#plPv"), svcList = $("#svcGrid");
  var check = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg>';
  function priceHTML(s) { return "<small>від</small> " + money(s.price) + (s.unit ? " <small>" + s.unit + "</small>" : ""); }
  tabsEl.innerHTML = D.cats.map(function (c) { return '<button type="button" class="tab' + (c.id === svcCat ? " is-on" : "") + '" aria-pressed="' + (c.id === svcCat) + '" data-cat="' + c.id + '">' + esc(c.name) + "</button>"; }).join("") + '<span class="tabs__ind" aria-hidden="true"></span>';
  plPv.innerHTML = D.services.map(function (s) {
    return '<div class="pv" data-id="' + s.id + '"><span class="pv__num">' + (D.services.indexOf(s) < 9 ? "0" : "") + (D.services.indexOf(s) + 1) + "</span>" +
      '<div class="pv__body"><p class="pv__dur">' + s.dur + " хв · " + esc(D.cats.filter(function (c) { return c.id === s.cat; })[0].name) + '</p><h3>' + esc(s.name) + '</h3><p class="pv__price">' + priceHTML(s) + "</p>" +
      (s.inc ? '<ul class="pv__inc">' + s.inc.map(function (x) { return "<li>" + check + esc(x) + "</li>"; }).join("") + "</ul>" : "") +
      '<button type="button" class="pv__book" data-book-svc="' + s.id + '">Записатися ' + arrow + "</button></div></div>";
  }).join("");
  function moveInd() {
    var t = $(".tab.is-on", tabsEl), ind = $(".tabs__ind", tabsEl); if (!t) return;
    ind.style.width = t.offsetWidth + "px"; ind.style.transform = "translateX(" + t.offsetLeft + "px)";
  }
  function setPv(id) {
    if (id === pvId) return;
    var prev = pvId; pvId = id;
    $$(".pv", plPv).forEach(function (p) { p.classList.toggle("was", p.dataset.id === prev); p.classList.toggle("is-on", p.dataset.id === id); });
    $$(".pr", svcList).forEach(function (r) { r.classList.toggle("is-on", r.dataset.id === id); });
    var s = svcById(id), col = PCOL[s.cat] || PCOL.treat, pane = plPv.parentNode;
    pane.style.setProperty("--c1", col[0]); pane.style.setProperty("--c2", col[1]); pane.style.setProperty("--c3", col[2]);
    // ціна «набирається» від попередньої
    var el = $('.pv[data-id="' + id + '"] .pv__price', plPv), from = prev ? svcById(prev).price : 0, to = s.price, t0 = null;
    if (reduced || !el) return;
    var tail = el.innerHTML.slice(el.innerHTML.indexOf("₴"));
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t; var k = clamp((t - t0) / 900, 0, 1), v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      el.innerHTML = "<small>від</small> " + fmt(v) + " " + tail;
      if (k < 1 && pvId === id) requestAnimationFrame(step);
    });
  }
  function renderSvc() {
    var list = D.services.filter(function (s) { return svcCat === "all" || s.cat === svcCat; });
    svcList.innerHTML = list.map(function (s, i) {
      return '<article class="pr" data-id="' + s.id + '" style="--i:' + i + '">' +
        '<button type="button" class="pr__main" aria-expanded="false"><span class="pr__n">' + (i < 9 ? "0" : "") + (i + 1) + '</span>' +
        '<span class="pr__name"><b>' + esc(s.name) + "</b><small>" + esc(s.desc) + '</small></span><span class="pr__dur">' + s.dur + ' хв</span><span class="pr__price">' + priceHTML(s) + "</span></button>" +
        '<button type="button" class="pr__go" data-book-svc="' + s.id + '" aria-label="Записатися: ' + esc(s.name) + '">' + arrow + "</button>" +
        '<div class="pr__more"><p>' + esc(s.desc) + "</p>" + (s.inc ? "<ul>" + s.inc.map(function (x) { return "<li>" + check + esc(x) + "</li>"; }).join("") + "</ul>" : "") + "</div></article>";
    }).join("");
    var keep = list.some(function (s) { return s.id === pvId; });
    var cur = keep ? pvId : list[0].id; pvId = keep ? null : pvId; setPv(cur);
  }
  renderSvc(); moveInd();
  window.addEventListener("load", moveInd);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInd);
  window.addEventListener("resize", moveInd);
  tabsEl.addEventListener("click", function (e) {
    var t = e.target.closest(".tab"); if (!t || t.dataset.cat === svcCat) return; svcCat = t.dataset.cat;
    $$(".tab", tabsEl).forEach(function (b) { var on = b === t; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on); });
    moveInd(); renderSvc();
  });
  var fine = window.matchMedia("(hover: hover) and (min-width: 960px)");
  svcList.addEventListener("mouseover", function (e) { if (!fine.matches) return; var r = e.target.closest(".pr"); if (r) setPv(r.dataset.id); });
  svcList.addEventListener("click", function (e) {
    var m = e.target.closest(".pr__main"); if (!m) return; var r = m.parentNode;
    setPv(r.dataset.id);
    if (!fine.matches) { var open = !r.classList.contains("is-open"); r.classList.toggle("is-open", open); m.setAttribute("aria-expanded", open); }
  });

  /* ---------- До / після ---------- */
  var baIdx = 0, frame = $("#baFrame"), handle = $("#baHandle");
  function setBA(x) { x = clamp(x, 2, 98); frame.style.setProperty("--x", x + "%"); handle.setAttribute("aria-valuenow", Math.round(x)); }
  function renderBA() {
    var c = D.cases[baIdx];
    $("#baTabs").innerHTML = D.cases.map(function (k, i) { return '<button type="button" class="tab' + (i === baIdx ? " is-on" : "") + '" aria-pressed="' + (i === baIdx) + '" data-i="' + i + '">' + esc(k.name) + "</button>"; }).join("");
    $("#baCase").innerHTML = "<p>" + esc(c.text) + '</p><ul class="meta">' + c.meta.map(function (m) { return "<li>" + esc(m) + "</li>"; }).join("") + '</ul><p class="ba__doc">Лікар: <b>' + esc(c.doctor) + "</b></p>";
    $$(".ph", frame).forEach(function (p) { p.classList.remove("noimg"); });
    $("#baAfter").src = c.img; $("#baBefore").src = c.before || c.img;
    frame.classList.toggle("is-sim", !c.before);
  }
  renderBA();
  $("#baTabs").addEventListener("click", function (e) { var t = e.target.closest(".tab"); if (!t) return; baIdx = +t.dataset.i; renderBA(); });
  var drag = false;
  function fromEvt(e) { var r = frame.getBoundingClientRect(); setBA((e.clientX - r.left) / r.width * 100); }
  frame.addEventListener("pointerdown", function (e) { drag = true; frame.classList.add("is-drag"); frame.setPointerCapture(e.pointerId); fromEvt(e); });
  frame.addEventListener("pointermove", function (e) { if (drag) fromEvt(e); });
  ["pointerup", "pointercancel"].forEach(function (n) { frame.addEventListener(n, function () { drag = false; frame.classList.remove("is-drag"); }); });
  handle.addEventListener("keydown", function (e) {
    var v = +handle.getAttribute("aria-valuenow");
    if (e.key === "ArrowLeft") { setBA(v - 5); e.preventDefault(); } else if (e.key === "ArrowRight") { setBA(v + 5); e.preventDefault(); }
  });
  setBA(50);
  function hintBA() {
    if (reduced) return;
    var keys = [[0, 50], [700, 24], [1500, 74], [2200, 50]], t0 = null;
    (function step(t) {
      if (!t0) t0 = t; var el = t - t0;
      if (drag) return;
      for (var i = 1; i < keys.length; i++) if (el <= keys[i][0]) { var k = (el - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]); setBA(keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * ease(k)); return requestAnimationFrame(step); }
      setBA(50);
    })(performance.now());
  }

  /* ---------- Лікарі ---------- */
  function yrs(n) { var a = n % 10, b = n % 100; return n + " " + (a === 1 && b !== 11 ? "рік" : a >= 2 && a <= 4 && (b < 12 || b > 14) ? "роки" : "років"); }
  $("#docs").innerHTML = D.doctors.map(function (d, i) {
    var ini = d.name.split(" ").map(function (w) { return w[0]; }).join("");
    return '<article class="doc reveal" style="--rd:' + (i % 3) * .08 + 's"><div class="doc__ph ph" data-ini="' + ini + '"><img src="' + d.photo + '" alt="' + esc(d.name) + '" loading="lazy" width="600" height="750"><span class="doc__yrs">' + yrs(d.years) + " досвіду</span></div>" +
      '<h3>' + esc(d.name) + '</h3><p class="doc__role">' + esc(d.role) + '</p><p class="doc__about">' + esc(d.about) + "</p>" +
      '<button type="button" class="link" data-book-doc="' + d.id + '">Записатися до лікаря ' + arrow + "</button></article>";
  }).join("");

  /* ---------- Перший візит ---------- */
  $("#steps").insertAdjacentHTML("beforeend", D.visit.map(function (s, i) {
    return '<div class="step" style="--rd:' + i * .1 + 's"><span class="step__n">' + (i + 1) + '</span><p class="step__min">' + (s.min ? s.min + " хв" : "у той самий день") + "</p><h3>" + esc(s.t) + "</h3><p>" + esc(s.d) + "</p></div>";
  }).join(""));
  var stepsEl = $("#steps"), stepEls = $$(".step", stepsEl);
  function stepsScroll() {
    var r = stepsEl.getBoundingClientRect(), vh = window.innerHeight;
    var p = reduced ? 1 : clamp((vh * .82 - r.top) / (r.height + vh * .2), 0, 1);
    stepsEl.style.setProperty("--p", p.toFixed(3));
    stepEls.forEach(function (s, i) { s.classList.toggle("is-on", p >= i / stepEls.length + .02 || p >= .98); });
  }

  /* ---------- FAQ ---------- */
  $("#faqList").innerHTML = D.faq.map(function (f, i) {
    return '<div class="qa reveal"><button type="button" class="qa__q" aria-expanded="false" aria-controls="qa' + i + '">' + esc(f.q) + '<i aria-hidden="true"></i></button><div class="qa__a" id="qa' + i + '"><div><p>' + esc(f.a) + "</p></div></div></div>";
  }).join("");
  $("#faqList").addEventListener("click", function (e) {
    var b = e.target.closest(".qa__q"); if (!b) return;
    var o = b.getAttribute("aria-expanded") !== "true"; b.setAttribute("aria-expanded", o); b.parentNode.classList.toggle("is-open", o);
  });

  /* ---------- Контакти ---------- */
  var IP = {
    pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    metro: '<path d="M4 18L8.5 6l3.5 7 3.5-7L20 18M3 18h5M16 18h5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/>',
    car: '<path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3zM5 11h14"/>'
  };
  function ii(k) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + IP[k] + "</svg>"; }
  var mapUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.mapQuery);
  $("#routeBtn").href = mapUrl;
  $("#cinfo").innerHTML =
    "<li>" + ii("pin") + "<span><b>" + esc(C.address) + "</b>" + esc(C.district) + "</span></li>" +
    "<li>" + ii("metro") + "<span><b>7 хвилин від метро</b>«Контрактова площа», вхід з вулиці</span></li>" +
    "<li>" + ii("clock") + "<span><b>Щодня</b>" + esc(C.hoursText) + "</span></li>" +
    "<li>" + ii("phone") + '<span><b><a href="tel:' + C.phone.replace(/[^\d+]/g, "") + '">' + esc(C.phone) + "</a></b>гострий біль приймаємо в день звернення</span></li>" +
    "<li>" + ii("car") + "<span><b>Парковка</b>" + esc(C.parking) + "</span></li>";
  var soc = { Telegram: C.telegram, Instagram: C.instagram, Viber: C.viber };
  $("#socials").innerHTML = Object.keys(soc).map(function (k) { return '<a href="' + soc[k] + '" target="_blank" rel="noopener">' + k + "</a>"; }).join("");

  // Карта: світло-сірі тайли Esri (без ключа) + підписи вулиць, плавне наближення з висоти до будинку
  var LEVELS = [11, 13, 15, 16], Z0 = 11, Z1 = 16.4, cmap = $("#cmap");
  function worldPx(lat, lon, z) { var n = 256 * Math.pow(2, z), s = Math.sin(lat * Math.PI / 180); return [(lon + 180) / 360 * n, (.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n]; }
  function buildMap() {
    var W = cmap.clientWidth, H = cmap.clientHeight, html = "";
    LEVELS.forEach(function (z) {
      var p = worldPx(C.lat, C.lon, z), t = "";
      for (var tx = Math.floor((p[0] - W / 2) / 256); tx <= Math.floor((p[0] + W / 2) / 256); tx++)
        for (var ty = Math.floor((p[1] - H / 2) / 256); ty <= Math.floor((p[1] + H / 2) / 256); ty++)
          { var pos = 'style="left:' + (tx * 256 - p[0] + W / 2).toFixed(1) + "px;top:" + (ty * 256 - p[1] + H / 2).toFixed(1) + 'px"', E = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_";
            t += '<img alt="" decoding="async" src="' + E + "Base/MapServer/tile/" + z + "/" + ty + "/" + tx + '" ' + pos + ">" + '<img alt="" class="lbl" decoding="async" src="' + E + "Reference/MapServer/tile/" + z + "/" + ty + "/" + tx + '" ' + pos + ">"; }
      html += '<div class="cmap__layer" data-z="' + z + '">' + t + "</div>";
    });
    $(".cmap__layers", cmap).innerHTML = html;
  }
  function paintZoom(z) {
    $$(".cmap__layer", cmap).forEach(function (el, i) {
      var L = +el.dataset.z, next = LEVELS[i + 1], op = i === 0 ? 1 : clamp((z - L) / .6, 0, 1);
      el.style.opacity = op; el.style.visibility = op > 0 && (next == null || z < next + .3) ? "visible" : "hidden";
      el.style.transform = "scale(" + Math.pow(2, z - L).toFixed(4) + ")";
    });
  }
  function playZoom() {
    if (reduced) { paintZoom(Z1); cmap.classList.add("is-landed"); return; }
    var t0 = null;
    requestAnimationFrame(function step(t) { if (!t0) t0 = t; var k = clamp((t - t0) / 3800, 0, 1); paintZoom(Z0 + (Z1 - Z0) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); else cmap.classList.add("is-landed"); });
  }
  buildMap(); paintZoom(Z0);
  var mapW = window.innerWidth;
  window.addEventListener("resize", function () { if (Math.abs(window.innerWidth - mapW) < 40) return; mapW = window.innerWidth; buildMap(); paintZoom(cmap.classList.contains("is-landed") ? Z1 : Z0); });

  /* =====================================================================
     Запис: послуга → лікар → день і час → контакти
     ===================================================================== */
  var DAYS = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], DAYSF = ["неділя", "понеділок", "вівторок", "середа", "четвер", "пʼятниця", "субота"];
  var MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  var st = { svc: "consult", doc: "any", day: 0, time: null };
  function dayDate(i) { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; }
  function docsFor(sid) { var sp = svcById(sid).spec; return D.doctors.filter(function (d) { return d.spec.indexOf(sp) >= 0; }); }
  function seed(str) { var x = 0; for (var i = 0; i < str.length; i++) x = (x * 31 + str.charCodeAt(i)) | 0; return function () { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }; }
  var busyCache = {};
  function busySet(did, di) {
    var k = did + di; if (busyCache[k]) return busyCache[k];
    var r = seed(k + "yasna"), s = {}; for (var c = 0; c < 30; c++) if (r() < .42) s[c] = 1;
    return (busyCache[k] = s);
  }
  function hoursOf(di) { return C.hours[dayDate(di).getDay()]; }
  function cells(di) {
    var h = hoursOf(di), dur = svcById(st.svc).dur, out = [];
    for (var m = h[0] * 60; m + dur <= h[1] * 60; m += C.stepMin) out.push(m);
    return out;
  }
  function freeFor(did, di, m) {
    var d = docById(did); if (dayDate(di).getDay() === d.off) return false;
    if (di === 0) { var n = new Date(); if (m < n.getHours() * 60 + n.getMinutes() + 60) return false; }
    var h = hoursOf(di), c = (m - h[0] * 60) / C.stepMin, need = Math.ceil(svcById(st.svc).dur / C.stepMin), b = busySet(did, di);
    for (var j = 0; j < need; j++) if (b[c + j]) return false;
    return true;
  }
  function whoFree(di, m) { var ids = st.doc === "any" ? docsFor(st.svc).map(function (d) { return d.id; }) : [st.doc]; for (var i = 0; i < ids.length; i++) if (freeFor(ids[i], di, m)) return ids[i]; return null; }
  function hm(m) { return Math.floor(m / 60) + ":" + ("0" + m % 60).slice(-2); }
  function dayLabel(di) { var d = dayDate(di); return di === 0 ? "сьогодні" : di === 1 ? "завтра" : DAYSF[d.getDay()] + ", " + d.getDate() + " " + MONTHS[d.getMonth()]; }
  function nextFree(did) {
    for (var di = 0; di < C.daysAhead; di++) { var cs = cells(di); for (var i = 0; i < cs.length; i++) if (freeFor(did, di, cs[i])) return (di === 0 ? "сьогодні" : di === 1 ? "завтра" : DAYS[dayDate(di).getDay()].toLowerCase() + " " + dayDate(di).getDate()) + " о " + hm(cs[i]); }
    return "немає вікон";
  }

  function renderSvcChips() {
    $("#bSvc").innerHTML = D.services.map(function (s) {
      var on = s.id === st.svc;
      return '<button type="button" class="chip' + (on ? " is-on" : "") + '" aria-pressed="' + on + '" data-svc="' + s.id + '">' + esc(s.name) + "</button>";
    }).join("") + '<p class="chips__hint">Не знаєте, що обрати? Беріть консультацію, лікар підкаже.</p>';
  }
  function renderDocs() {
    var ds = docsFor(st.svc);
    if (st.doc !== "any" && !ds.some(function (d) { return d.id === st.doc; })) st.doc = "any";
    var any = '<button type="button" class="bdoc bdoc--any' + (st.doc === "any" ? " is-on" : "") + '" data-doc="any"><span class="bdoc__av">' + icon("smile") + '</span><span><b>Будь-хто з вільних</b><small>найближчий вільний час</small></span></button>';
    $("#bDocs").innerHTML = any + ds.map(function (d) {
      var on = st.doc === d.id;
      return '<button type="button" class="bdoc' + (on ? " is-on" : "") + '" aria-pressed="' + on + '" data-doc="' + d.id + '"><span class="bdoc__av ph"><img src="' + d.photo + '" alt="" loading="lazy"></span><span><b>' + esc(d.name) + "</b><small>" + esc(d.role.split(",")[0]) + "</small><em>" + nextFree(d.id) + "</em></span></button>";
    }).join("");
    checkImgs($("#bDocs"));
  }
  function renderDays() {
    var h = "";
    for (var i = 0; i < C.daysAhead; i++) {
      var d = dayDate(i), has = cells(i).some(function (m) { return whoFree(i, m); });
      h += '<button type="button" class="day' + (i === st.day ? " is-on" : "") + (has ? "" : " is-off") + '" data-d="' + i + '"' + (has ? "" : " disabled") + '><small>' + (i === 0 ? "сьогодні" : i === 1 ? "завтра" : DAYS[d.getDay()]) + "</small><b>" + d.getDate() + "</b></button>";
    }
    $("#bDays").innerHTML = h;
  }
  function renderTimes() {
    var cs = cells(st.day), h = cs.map(function (m) {
      var f = whoFree(st.day, m);
      return '<button type="button" class="time' + (st.time === m ? " is-on" : "") + '" data-m="' + m + '"' + (f ? "" : " disabled") + ">" + hm(m) + "</button>";
    }).join("");
    $("#bTimes").innerHTML = h || '<p class="times__none">На цей день вільного часу немає</p>';
  }
  function chosenDoc() { if (st.time == null) return st.doc === "any" ? null : docById(st.doc); return docById(whoFree(st.day, st.time) || st.doc); }
  function renderSum() {
    var s = svcById(st.svc), d = chosenDoc();
    var row = function (k, v, empty) { return "<div><dt>" + k + '</dt><dd class="' + (empty ? "is-empty" : "") + '">' + v + "</dd></div>"; };
    $("#tSum").innerHTML = row("Послуга", esc(s.name)) +
      row("Лікар", d ? esc(d.name) : "будь-хто з вільних", !d) +
      row("Дата і час", st.time != null ? dayLabel(st.day) + ", " + hm(st.time) : "оберіть час", st.time == null) +
      row("Вартість", s.id === "consult" ? "600 ₴ <small>0 ₴ при лікуванні</small>" : "від " + money(s.price) + (s.unit ? " " + s.unit : "") + " <small>точно після огляду</small>");
  }
  function keepTime() { if (st.time != null && !whoFree(st.day, st.time)) st.time = null; }
  function refresh(all) { if (all) renderSvcChips(); renderDocs(); var hasDay = cells(st.day).some(function (m) { return whoFree(st.day, m); }); if (!hasDay) { for (var i = 0; i < C.daysAhead; i++) if (cells(i).some(function (m) { return whoFree(i, m); })) { st.day = i; break; } } keepTime(); renderDays(); renderTimes(); renderSum(); }
  refresh(true);
  $("#bSvc").addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c) return; st.svc = c.dataset.svc; refresh(true); });
  $("#bDocs").addEventListener("click", function (e) { var c = e.target.closest(".bdoc"); if (!c) return; st.doc = c.dataset.doc; refresh(); });
  $("#bDays").addEventListener("click", function (e) { var c = e.target.closest(".day"); if (!c) return; st.day = +c.dataset.d; st.time = null; renderDays(); renderTimes(); renderSum(); });
  $("#bTimes").addEventListener("click", function (e) {
    var c = e.target.closest(".time"); if (!c || c.disabled) return; st.time = +c.dataset.m; renderTimes(); renderSum();
    if (window.matchMedia("(max-width: 959px)").matches) setTimeout(function () { go($("#ticket"), 4); }, 200);
  });
  // кнопки «записатися» з послуг і лікарів
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-book-svc],[data-book-doc]"); if (!a) return;
    if (a.dataset.bookSvc) { st.svc = a.dataset.bookSvc; st.doc = "any"; }
    if (a.dataset.bookDoc) { var d = docById(a.dataset.bookDoc); st.doc = d.id; if (d.spec.indexOf(svcById(st.svc).spec) < 0) st.svc = D.services.filter(function (s) { return d.spec.indexOf(s.spec) >= 0; })[0].id; }
    st.time = null; refresh(true);
    go($("#booking"));
  });

  var form = $("#bForm"), err = $("#bErr"), last = null;
  form.addEventListener("submit", function (e) {
    e.preventDefault(); err.textContent = "";
    var name = form.name.value.trim(), phone = form.phone.value.replace(/[^\d+]/g, "");
    if (st.time == null) { err.textContent = "Оберіть день і час прийому."; return; }
    if (name.length < 2) { err.textContent = "Вкажіть, будь ласка, ім'я."; form.name.focus(); return; }
    if (phone.replace(/\D/g, "").length < 10) { err.textContent = "Перевірте номер телефону."; form.phone.focus(); return; }
    var s = svcById(st.svc), d = chosenDoc(), when = dayLabel(st.day) + ", " + hm(st.time);
    var msg = "🦷 Новий запис\n" + s.name + "\nЛікар: " + (d ? d.name : "будь-хто") + "\nКоли: " + when + "\nІм'я: " + name + "\nТел: " + phone + (form.first.checked ? "\nПерший візит" : "") + (form.note.value.trim() ? "\nКоментар: " + form.note.value.trim() : "");
    var btn = $("#bSubmit"); btn.disabled = true; btn.textContent = "Надсилаємо…";
    var start = dayDate(st.day); start.setMinutes(st.time);
    last = { start: start, dur: s.dur, title: s.name + " · Ясна", desc: "Лікар: " + (d ? d.name : "будь-хто з вільних") };
    function ok() {
      btn.disabled = false; btn.textContent = "Записатися";
      form.hidden = true; $("#tSum").hidden = true; $("#bDone").hidden = false;
      $("#bDoneText").textContent = when + ", " + s.name.toLowerCase() + (d ? ", " + d.name : "") + ". Ми зателефонуємо, щоб підтвердити запис.";
    }
    function fail() { btn.disabled = false; btn.textContent = "Записатися"; err.textContent = "Не вдалося надіслати. Зателефонуйте нам: " + C.phone; }
    if (C.bookingEndpoint) fetch(C.bookingEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: msg }) }).then(function (r) { r.ok ? ok() : fail(); }, fail);
    else if (C.telegramBotToken && C.telegramChatId) fetch("https://api.telegram.org/bot" + C.telegramBotToken + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: C.telegramChatId, text: msg }) }).then(function (r) { r.ok ? ok() : fail(); }, fail);
    else setTimeout(ok, 700);
  });
  $("#bAgain").addEventListener("click", function () { form.reset(); form.hidden = false; $("#tSum").hidden = false; $("#bDone").hidden = true; st.time = null; busyCache = {}; refresh(); });
  $("#bIcs").addEventListener("click", function () {
    if (!last) return;
    var f = function (t) { return t.getFullYear() + ("0" + (t.getMonth() + 1)).slice(-2) + ("0" + t.getDate()).slice(-2) + "T" + ("0" + t.getHours()).slice(-2) + ("0" + t.getMinutes()).slice(-2) + "00"; };
    var end = new Date(last.start.getTime() + last.dur * 60000);
    var ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Yasna//UA", "BEGIN:VEVENT", "UID:" + Date.now() + "@yasna", "DTSTART:" + f(last.start), "DTEND:" + f(end), "SUMMARY:" + last.title, "DESCRIPTION:" + last.desc,
      "LOCATION:" + (C.address + ", Київ").replace(/,/g, "\\,"), "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Візит до стоматолога", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "yasna.ics"; a.click();
  });

  /* ---------- Поява при скролі ---------- */
  checkImgs(document);
  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        x.target.classList.add("is-in"); io.unobserve(x.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    $$(".reveal").forEach(function (x) { io.observe(x); });
    var bio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { hintBA(); bio.disconnect(); } }, { threshold: .6 });
    bio.observe(frame);
    var mio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { playZoom(); mio.disconnect(); } }, { threshold: .5 });
    mio.observe(cmap);
    var bkio = new IntersectionObserver(function (en) { mbar.classList.toggle("is-hidden", en[0].isIntersecting); }, { threshold: 0 });
    bkio.observe($("#booking"));
  } else {
    $$(".reveal").forEach(function (x) { x.classList.add("is-in"); });
    reduced = true;
    paintZoom(Z1);
  }

  /* =====================================================================
     Заставка: власний векторний зуб.
     Зовні — глянцева емаль; під нею розріз: емаль, дентин, пульпа з нервами.
     Скрол: оболонка розходиться на дві половинки → шари розлітаються з підписами →
     шари збираються → камера пірнає в пульпу → сайт.
     ===================================================================== */
  var T_OUT = "M95 268C88 245 78 222 70 190C60 140 70 90 105 70C130 55 150 62 165 80C180 95 190 95 200 88C212 80 222 70 240 66C270 60 300 70 318 95C338 125 340 165 330 195C322 225 312 245 305 265C300 320 305 400 292 470C286 505 262 512 255 480C248 440 240 380 222 330C214 312 188 312 180 330C165 375 155 440 145 480C138 510 112 505 108 470C98 400 102 320 95 268Z";
  var T_EN = "M95 268C88 245 78 222 70 190C60 140 70 90 105 70C130 55 150 62 165 80C180 95 190 95 200 88C212 80 222 70 240 66C270 60 300 70 318 95C338 125 340 165 330 195C322 225 312 245 305 265C262 284 140 286 95 268Z";
  var T_PULP = "M150 178C144 152 149 128 160 126C169 128 173 148 181 158C191 167 209 167 219 158C228 148 232 126 242 126C253 130 257 152 250 180C246 200 240 215 245 240C252 300 262 380 272 470C273 478 268 481 265 473C251 400 238 322 222 266C214 244 186 244 178 266C162 322 147 400 133 473C130 481 125 478 126 470C134 380 145 300 152 240C157 215 154 200 150 178Z";
  function toothExt() {
    return '<path d="' + T_OUT + '" fill="url(#gExt)"/><path d="' + T_OUT + '" fill="url(#gRootX)"/>' +
      '<path d="M95 268C140 286 262 284 305 265" fill="none" stroke="#B9CCEE" stroke-width="1.2"/>' +
      '<g fill="none" stroke="#2A62E8" stroke-width="1" opacity=".2"><path d="M86 200C120 214 280 214 318 200"/><path d="M96 232C140 246 262 246 310 232"/><path d="M118 300C120 360 122 420 126 470"/><path d="M278 300C278 360 276 420 274 470"/><path d="M150 112C170 132 230 132 250 110"/><path d="M200 300C200 304 200 306 200 310"/></g>' +
      '<path d="M108 92C92 120 88 160 96 196" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M252 80C280 78 300 88 310 104" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="' + T_OUT + '" class="tz-line" fill="none" stroke="#2A62E8" stroke-width="1.6" pathLength="1"/>';
  }
  function lbl(k, x, y, x2, t, s) {
    var end = x2 < x, tx = end ? x2 - 10 : x2 + 10, a = end ? ' text-anchor="end"' : "";
    return '<g class="tz-lbl tz-lbl--' + k + '"><path d="M' + x + " " + y + "H" + x2 + '" pathLength="1"/><circle cx="' + x + '" cy="' + y + '" r="4"/>' +
      '<text x="' + tx + '" y="' + (y - 5) + '"' + a + ">" + t + '</text><text class="s" x="' + tx + '" y="' + (y + 16) + '"' + a + ">" + s + "</text></g>";
  }
  var toothSVG = '<svg class="tz" viewBox="-200 -60 800 680" aria-hidden="true"><defs>' +
    '<clipPath id="cOut"><path d="' + T_OUT + '"/></clipPath><clipPath id="cL"><rect x="-200" y="-60" width="400" height="680"/></clipPath><clipPath id="cR"><rect x="200" y="-60" width="400" height="680"/></clipPath>' +
    '<linearGradient id="gExt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#F1F5FC"/><stop offset="1" stop-color="#D3DFF4"/></linearGradient>' +
    '<linearGradient id="gRootX" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-color="#7C97C8" stop-opacity="0"/><stop offset="1" stop-color="#7C97C8" stop-opacity=".3"/></linearGradient>' +
    '<linearGradient id="gEn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#E6EEFB"/></linearGradient>' +
    '<linearGradient id="gDen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D6E3F8"/><stop offset="1" stop-color="#BFD1EF"/></linearGradient>' +
    '<linearGradient id="gCem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF3FB"/><stop offset="1" stop-color="#DCE6F6"/></linearGradient>' +
    '<radialGradient id="gPulp" cx=".5" cy=".28" r=".8"><stop offset="0" stop-color="#7AA3FF"/><stop offset=".45" stop-color="#2A62E8"/><stop offset="1" stop-color="#173B9E"/></radialGradient>' +
    "</defs>" +
    '<g class="tz-orbit"><circle cx="200" cy="290" r="290" class="o1"/><circle cx="200" cy="290" r="240" class="o2"/><circle cx="200" cy="290" r="340" class="o3"/></g>' +
    '<g class="tz-sec">' +
      '<path d="' + T_OUT + '" fill="url(#gCem)" stroke="#AFC4EA" stroke-width="1.2"/>' +
      '<g class="tz-en"><path d="' + T_EN + '" fill="url(#gEn)" stroke="#BFD0EE" stroke-width="1"/>' +
        '<g fill="none" stroke="#C9D8F2" stroke-width="1"><path d="M96 150Q120 160 130 190M110 100Q130 115 145 140M160 85Q170 100 180 125M240 80Q232 100 222 125M292 92Q275 110 262 135M318 150Q290 160 278 190"/></g>' +
        lbl(1, 82, 150, -30, "Емаль", "найтвердіша тканина тіла") + "</g>" +
      '<g clip-path="url(#cOut)"><path d="' + T_OUT + '" fill="url(#gDen)" transform="translate(200 300) scale(.86 .93) translate(-200 -300)"/>' +
        '<g stroke="#9FB7E4" stroke-width="1" fill="none" opacity=".6"><path d="M120 150Q105 170 100 200M132 120Q112 130 98 150M175 105Q168 90 160 82M225 105Q232 88 242 80M268 120Q288 128 302 150M280 150Q295 170 300 200M130 235Q112 240 104 255M270 235Q288 240 296 255M150 300Q128 305 118 320M250 300Q272 305 282 320M140 380Q124 385 116 395M262 380Q278 385 286 395"/></g></g>' +
      '<g class="tz-pulp"><path d="' + T_PULP + '" fill="url(#gPulp)"/>' +
        '<g class="tz-nerve" fill="none" stroke-linecap="round"><path d="M200 162C186 182 170 200 166 240C160 300 146 390 130 470" stroke="#C9DAFF" stroke-width="1.6" pathLength="1"/><path d="M200 162C214 182 232 200 236 240C244 300 258 390 268 470" stroke="#C9DAFF" stroke-width="1.6" pathLength="1"/><path d="M162 140C170 160 186 170 200 162C214 170 230 160 238 140" stroke="#fff" stroke-width="1.3" pathLength="1"/><path d="M174 250C168 320 156 400 142 468" stroke="#FF9DB0" stroke-width="1.1" pathLength="1"/><path d="M226 250C236 320 248 400 260 468" stroke="#FF9DB0" stroke-width="1.1" pathLength="1"/></g></g>' +
      lbl(2, 296, 330, 430, "Дентин", "70% мінералів") + lbl(3, 238, 205, 430, "Пульпа", "нерв, тут діє анестезія") + lbl(4, 126, 430, -30, "Корені", "канали до 0,2 мм") +
    "</g>" +
    '<g class="tz-shell tz-shell--l"><g clip-path="url(#cL)">' + toothExt() + "</g></g>" +
    '<g class="tz-shell tz-shell--r"><g clip-path="url(#cR)">' + toothExt() + "</g></g>" +
    '<g class="tz-scan"><rect x="40" y="0" width="320" height="2" rx="1"/></g>' +
    "</svg>";
  var intro = $("#intro"), iTooth = $("#introTooth");
  iTooth.innerHTML = toothSVG;
  var tzMq = window.matchMedia("(max-width: 959px)");
  function tzBox() { $(".tz", iTooth).setAttribute("viewBox", tzMq.matches ? "-130 -60 660 680" : "-200 -60 800 680"); }
  tzBox(); if (tzMq.addEventListener) tzMq.addEventListener("change", tzBox);
  var tz = $(".tz", iTooth), tzL = $(".tz-shell--l", tz), tzR = $(".tz-shell--r", tz), tzEn = $(".tz-en", tz), tzPulp = $(".tz-pulp", tz),
    tzLbl = $$(".tz-lbl", tz), tzNerve = $(".tz-nerve", tz), tzOrbit = $(".tz-orbit", tz), tzScan = $(".tz-scan", tz),
    iTitle = $(".intro__head", intro), iVeil = $(".intro__veil", intro), iHint = $(".intro__hint", intro);
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function sm(x) { return x * x * (3 - 2 * x); }
  function introScroll() {
    var r = intro.getBoundingClientRect(), len = intro.offsetHeight - window.innerHeight;
    if (r.bottom < -50) return;
    var p = reduced ? 0 : clamp(-r.top / len, 0, 1);
    var a = sm(seg(p, 0, .16)),        // назва йде вгору, зуб у центр
      b = sm(seg(p, .12, .34)),         // оболонка розходиться
      c = sm(seg(p, .3, .46)),           // шари розлітаються
      d = sm(seg(p, .64, .74)),          // шари збираються
      e = seg(p, .7, .97);             // пірнання в пульпу
    iTitle.style.transform = "translateY(" + (-a * 34).toFixed(2) + "vh) scale(" + (1 - a * .25).toFixed(3) + ")";
    iTitle.style.opacity = (1 - a * 1.3).toFixed(3);
    iHint.style.opacity = (1 - a * 3).toFixed(3);
    var dive = Math.pow(e, 3.2) * 60;
    iTooth.style.transform = "translate(-50%, -50%) translateY(" + (-a * 12).toFixed(2) + "vh) scale(" + (1 + a * (tzMq.matches ? -.04 : .22) + dive).toFixed(3) + ") rotate(" + ((1 - a) * -6).toFixed(2) + "deg)";
    tzL.style.transform = "translateX(" + (-b * 120).toFixed(1) + "px) rotate(" + (-b * 14).toFixed(2) + "deg)";
    tzR.style.transform = "translateX(" + (b * 120).toFixed(1) + "px) rotate(" + (b * 14).toFixed(2) + "deg)";
    tzL.style.opacity = tzR.style.opacity = (1 - sm(seg(p, .22, .36))).toFixed(3);
    var ex = c * (1 - d);
    tzEn.style.transform = "translateY(" + (-ex * 150).toFixed(1) + "px) rotate(" + (-ex * 4).toFixed(2) + "deg)";
    tzPulp.style.transform = "scale(" + (1 + ex * .06).toFixed(3) + ")";
    tzNerve.style.setProperty("--n", (1 - seg(p, .3, .52)).toFixed(3));
    tzLbl.forEach(function (l, i) { var on = seg(p, .34 + i * .035, .42 + i * .035) * (1 - seg(p, .62, .67)); l.style.opacity = on.toFixed(3); l.style.setProperty("--l", (1 - on).toFixed(3)); });
    tzOrbit.style.opacity = (1 - seg(p, .6, .7)).toFixed(3);
    tzOrbit.style.transform = "rotate(" + (p * 120).toFixed(1) + "deg) scale(" + (1 + b * .12).toFixed(3) + ")";
    var sc = seg(p, .02, .2); tzScan.style.transform = "translateY(" + (60 + sc * 460).toFixed(1) + "px)"; tzScan.style.opacity = (sc > 0 && sc < 1 ? 1 : 0);
    iVeil.style.opacity = seg(p, .9, .99).toFixed(3);
  }
  // hero з'являється, коли до нього доскролили
  var heroEl = $("#hero"), heroImg = $("#heroBg img");
  if ("IntersectionObserver" in window && !reduced) {
    var hio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { heroEl.classList.add("is-in"); hio.disconnect(); } }, { threshold: .25 });
    hio.observe(heroEl);
  } else heroEl.classList.add("is-in");
  function heroScroll() {
    if (reduced) return;
    var r = heroEl.getBoundingClientRect(); if (r.bottom < 0 || r.top > window.innerHeight) return;
    heroImg.style.translate = "0 " + (-r.top * .12).toFixed(1) + "px";
  }

  /* ---------- Скрол: шапка, прогрес, параллакс hero, кроки ---------- */
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("is-scrolled", y > 10);
    bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0).toFixed(4) + ")";
    mbar.classList.toggle("is-shown", y > window.innerHeight * .7);
    introScroll(); heroScroll();
    storyScroll(); stepsScroll();
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", function () { layout(); onScroll(); });
  layout(); onScroll();
  document.documentElement.classList.add("is-loaded");
})();
