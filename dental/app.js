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

  /* ---------- Плавний «повітряний» скрол на десктопі (Lenis) ---------- */
  var lenis = null;
  if (window.Lenis && !reduced && window.matchMedia("(pointer: fine)").matches) {
    lenis = new window.Lenis({ duration: 1.25, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    requestAnimationFrame(function raf(t) { lenis.raf(t); requestAnimationFrame(raf); });
    document.documentElement.classList.add("lenis");
  }
  function go(target, offset) {
    var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav")) || 72;
    var top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY - navH - (offset || 0);
    if (lenis) lenis.scrollTo(top, { duration: 1.4 }); else window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
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
     «Чому ми»: скрол-історія. Ліворуч розділи, праворуч сцена з анімацією,
     яка рухається разом зі скролом (на десктопі) або програється сама (на телефоні).
     ===================================================================== */
  var CH = [
    { k: "scan", tag: "3D-діагностика", t: "Бачимо все ще до лікування", d: "Перед лікуванням робимо 3D-знімок і цифрові зліпки. Ви бачите свої зуби на екрані разом з лікарем і розумієте, що і навіщо ми будемо робити." },
    { k: "calm", tag: "Комп'ютерна анестезія", t: "Без болю, навіть укол", d: "Анестетик подається повільно і рівномірно, тому укол майже не відчувається. Для тих, хто дуже хвилюється, є лікування в стані медикаментозного сну." },
    { k: "micro", tag: "Мікроскоп Carl Zeiss", t: "Лікуємо під збільшенням", d: "Канали і реставрації робимо під мікроскопом зі збільшенням до 25 разів. Це точніше і зберігає більше живого зуба." },
    { k: "steril", tag: "Автоклав класу B", t: "Стерильно, і ви це бачите", d: "Інструменти проходять чотири етапи обробки і стерилізуються при 134 °C. Запечатаний пакет відкриваємо при вас." },
    { k: "plan", tag: "Фіксований план", t: "Ціна відома до першого кроку", d: "Після діагностики ви отримуєте план з етапами і ціною на кожен. Сума не зміниться в процесі, а на роботу діє гарантія до 5 років." }
  ];
  var NS = "http://www.w3.org/2000/svg";

  /* Сцена 1: анатомічна 3D-модель верхньої щелепи (вид з боку жувальних поверхонь).
     Зуби будуються процедурно: моляри з чотирма горбами і фісурами, премоляри з двома, ікла з вершиною, різці лопатоподібні.
     Площина сканування проходить по моделі: до неї — «хмара точок», після — емаль з об'ємом; модель повертається в перспективі. */
  function sceneScan() {
    var el = document.createElement("div"); el.className = "scene scene--scan";
    var cx = 240, cy = 300, rx = 178, ry = 226;
    // [тип, ширина, глибина] від правого другого моляра до лівого
    var T = [["m", 39, 37], ["m", 41, 39], ["p", 27, 31], ["p", 27, 31], ["c", 26, 27], ["l", 22, 17], ["i", 28, 19], ["i", 28, 19], ["l", 22, 17], ["c", 26, 27], ["p", 27, 31], ["p", 27, 31], ["m", 41, 39], ["m", 39, 37]].map(function (t) { return [t[0], t[1] * 1.3, t[2] * 1.3]; });
    var FDI = ["17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27"];
    function sg(v) { return v < 0 ? -1 : 1; }
    function shape(t, w, h) {
      var pts = [], N = 56;
      for (var k = 0; k < N; k++) {
        var a = k / N * Math.PI * 2, c = Math.cos(a), s = Math.sin(a), n = t === "m" ? 3 : t === "p" ? 2.5 : t === "c" ? 2.2 : 2.6;
        var x = w / 2 * sg(c) * Math.pow(Math.abs(c), 2 / n), y = h / 2 * sg(s) * Math.pow(Math.abs(s), 2 / n), r = 1;
        if (t === "m") { r = 1 - .05 * Math.cos(4 * a); x *= 1 - .07 * y / (h / 2); }
        if (t === "p") { r = 1 - .045 * Math.cos(2 * a); }
        if (t === "c") { if (y < 0) { y *= 1.22; x *= 1 + .28 * y / h; } }
        if (t === "i" || t === "l") { x *= 1 - .42 * Math.max(0, y / (h / 2)); y -= (1 - Math.pow(x / (w / 2), 2)) * h * .22; }
        pts.push((x * r).toFixed(1) + " " + (y * r).toFixed(1));
      }
      return "M" + pts.join(" L") + "Z";
    }
    function detail(t, w, h) {
      var q = w / 4, v = h / 4, d = "", c = "";
      if (t === "m") {
        d = "M" + (-q) + " " + (-v * .2) + " Q0 " + (v * .35) + " " + q + " " + (-v * .2) + " M" + (-q) + " " + (-v * .2) + " l" + (-q * .7) + " " + (-v * .9) + " M" + (-q) + " " + (-v * .2) + " l" + (-q * .6) + " " + (v * 1.1) + " M" + q + " " + (-v * .2) + " l" + (q * .7) + " " + (-v * .9) + " M" + q + " " + (-v * .2) + " l" + (q * .6) + " " + (v * 1.1) + " M0 " + (v * .1) + " L" + (q * .2) + " " + (v * 1.6);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (o) { c += '<ellipse class="cusp" cx="' + (o[0] * q * 1.05) + '" cy="' + (o[1] * v * 1.05) + '" rx="' + (q * .78) + '" ry="' + (v * .78) + '"/>'; });
      } else if (t === "p") {
        d = "M" + (-q * 1.1) + " 0 Q0 " + (v * .3) + " " + (q * 1.1) + " 0";
        c = '<ellipse class="cusp" cx="0" cy="' + (-v * 1.05) + '" rx="' + (q * 1.25) + '" ry="' + (v * .8) + '"/><ellipse class="cusp" cx="0" cy="' + (v * 1.05) + '" rx="' + (q * 1.05) + '" ry="' + (v * .7) + '"/>';
      } else if (t === "c") {
        d = "M0 " + (-h * .52) + " L0 " + (h * .25) + " M" + (-q * 1.2) + " " + (-v * .2) + " L0 " + (-h * .5) + " L" + (q * 1.2) + " " + (-v * .2);
        c = '<ellipse class="cusp" cx="0" cy="' + (-v * .6) + '" rx="' + (q * 1.3) + '" ry="' + (v * 1.4) + '"/>';
      } else {
        d = "M" + (-w * .4) + " " + (-h * .18) + " Q0 " + (-h * .42) + " " + (w * .4) + " " + (-h * .18) + " M0 " + (h * .05) + " L0 " + (h * .36);
        c = '<ellipse class="cusp" cx="0" cy="' + (-h * .05) + '" rx="' + (w * .3) + '" ry="' + (h * .22) + '"/>';
      }
      return { fis: d, cusps: c };
    }
    // розставляємо зуби по довжині дуги, щоб проміжки були рівні
    var A0 = 4 * Math.PI / 180, A1 = 176 * Math.PI / 180, S = 400, len = [0];
    function at(a) { return [cx + rx * Math.cos(a), cy - ry * Math.sin(a)]; }
    for (var k = 1; k <= S; k++) { var p0 = at(A0 + (A1 - A0) * (k - 1) / S), p1 = at(A0 + (A1 - A0) * k / S); len.push(len[k - 1] + Math.hypot(p1[0] - p0[0], p1[1] - p0[1])); }
    var total = T.reduce(function (s, t) { return s + t[1]; }, 0), gap = 1.6, used = total + gap * 13, off = (len[S] - used) / 2, pos = off;
    function angAt(L) { for (var k = 1; k <= S; k++) if (len[k] >= L) return A0 + (A1 - A0) * k / S; return A1; }
    var teeth = "", defs = "", ys = [], meta = [];
    T.forEach(function (t, i) {
      var a = angAt(pos + t[1] / 2); pos += t[1] + gap;
      var P = at(a), nx = Math.cos(a) * ry, ny = -Math.sin(a) * rx, phi = Math.atan2(nx, -ny) * 180 / Math.PI;
      var d = shape(t[0], t[1], t[2]), dt = detail(t[0], t[1], t[2]), mesh = "", w = t[1], h = t[2];
      for (var m = -2; m <= 2; m++) mesh += "M" + (-w) + " " + (m * h / 5) + " L" + w + " " + (m * h / 5) + " M" + (m * w / 5) + " " + (-h) + " L" + (m * w / 5) + " " + h + " ";
      mesh += "M" + (-w) + " " + (-h) + " L" + w + " " + h + " M" + w + " " + (-h) + " L" + (-w) + " " + h;
      defs += '<clipPath id="tc' + i + '"><path d="' + d + '"/></clipPath>';
      ys.push(P[1]); meta.push(P);
      teeth += '<g class="tooth" transform="translate(' + P[0].toFixed(1) + " " + P[1].toFixed(1) + ") rotate(" + phi.toFixed(1) + ')">' +
        '<path class="t__cloud" d="' + d + '"/>' +
        '<g class="t__solid"><path class="t__shadow" d="' + d + '" transform="translate(1.5 3)"/><path class="t__enamel" d="' + d + '"/>' +
        '<g clip-path="url(#tc' + i + ')">' + dt.cusps + '<path class="t__fis" d="' + dt.fis + '"/>' + (i === 1 ? '<ellipse class="t__caries" cx="4" cy="5" rx="4.5" ry="3.6"/>' : "") + "</g>" +
        '<path class="t__rim" d="' + d + '"/></g>' +
        '<path class="t__mesh" clip-path="url(#tc' + i + ')" d="' + mesh + '"/></g>';
    });
    var gA = angAt(off) - .05, gB = angAt(off + used) + .05;
    var gum = "M" + at(gA).map(function (v) { return v.toFixed(1); }).join(" ") + " A" + rx + " " + ry + " 0 0 0 " + at(gB).map(function (v) { return v.toFixed(1); }).join(" ");
    el.innerHTML =
      '<div class="scan__model"><svg viewBox="20 40 440 300" class="scan__svg">' +
      '<defs>' + defs +
      '<radialGradient id="enamel" cx=".42" cy=".36" r=".75"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F3F6FB"/><stop offset="1" stop-color="#C9D5E6"/></radialGradient>' +
      '<radialGradient id="cusp" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".7" stop-color="#FFFFFF" stop-opacity=".2"/><stop offset="1" stop-color="#B8C6DA" stop-opacity=".35"/></radialGradient>' +
      '<linearGradient id="gum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F1D3DA"/><stop offset="1" stop-color="#E7BEC8"/></linearGradient>' +
      '<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A62E8" stop-opacity="0"/><stop offset="1" stop-color="#2A62E8" stop-opacity=".22"/></linearGradient>' +
      '<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#D3DEF0" stroke-width=".6"/></pattern></defs>' +
      '<rect x="-400" y="-300" width="1280" height="960" fill="url(#grid)" class="scan__grid"/>' +
      '<path class="scan__palate" d="' + gum + '"/>' +
      '<path class="scan__gum" d="' + gum + '"/>' +
      '<g class="scan__teeth">' + teeth + "</g>" +
      '<rect class="scan__band" x="-400" y="0" width="1280" height="70" fill="url(#beam)"/>' +
      '<line class="scan__line" x1="-400" x2="880" y1="0" y2="0"/>' +
      "</svg></div>" +
      '<div class="scan__hud"><span>CBCT · верхня щелепа</span><span class="scan__axis"><i></i><i></i></span></div>' +
      '<div class="scan__call"><b>Зуб 16</b><span>прихований карієс під старою пломбою</span></div>' +
      '<div class="readout readout--l"><span>Сканування</span><b class="scan__pct">0%</b></div>' +
      '<div class="readout readout--r"><span>Доза</span><b>0,03 мЗв</b></div>';
    var model = $(".scan__model", el), line = $(".scan__line", el), band = $(".scan__band", el), pct = $(".scan__pct", el), tg = $$(".tooth", el), call = $(".scan__call", el), fl = tg[1];
    function placeCall() {
      var r = el.getBoundingClientRect(), t = fl.getBoundingClientRect(); if (!r.width) return;
      call.style.left = (t.left - r.left + t.width * .1) + "px"; call.style.top = (t.top - r.top + t.height * .4) + "px";
    }
    return { el: el, set: function (p) {
      var e = ease(clamp(p, 0, 1)), y = 50 + p * 270;
      model.style.transform = "perspective(1100px) translateY(" + (4 - 4 * e) + "%) rotateX(" + (50 - 30 * e).toFixed(2) + "deg) rotateZ(" + (-9 + 9 * e).toFixed(2) + "deg) scale(" + (.9 + .12 * e).toFixed(3) + ")";
      line.setAttribute("y1", y); line.setAttribute("y2", y); band.setAttribute("y", y - 70);
      tg.forEach(function (g, i) { var dy = ys[i] - y; g.classList.toggle("on", dy < 0); g.classList.toggle("meshing", dy < 0 && dy > -46); });
      pct.textContent = Math.round(p * 100) + "%";
      var f = p > .86; fl.classList.toggle("flagged", f); call.classList.toggle("on", f);
      if (f) placeCall();
    } };
  }

  function sceneCalm() {
    var el = document.createElement("div"); el.className = "scene scene--calm ph";
    el.innerHTML = '<div class="scene__bg" style="background-image:url(img/calm.jpg)"></div>' +
      '<div class="calm__card"><div class="calm__top"><span>Відчуття під час уколу</span><b class="calm__val">7 / 10</b></div>' +
      '<svg viewBox="0 0 300 90" preserveAspectRatio="none"><line x1="0" x2="300" y1="45" y2="45" class="calm__axis"/><path class="calm__wave"/></svg>' +
      '<div class="calm__bot"><span>звичайний шприц</span><span class="calm__to">комп\'ютерна подача 0,3 мл/хв</span></div></div>';
    probe("img/calm.jpg", function () {}, function () { el.classList.add("noimg"); });
    var wave = $(".calm__wave", el), val = $(".calm__val", el), P = 0, ph = 0;
    function draw() {
      var A = 34 * Math.pow(1 - P, 1.6) + 2.5, d = "";
      for (var x = 0; x <= 300; x += 4) {
        var y = 45 + A * (Math.sin(x * .085 + ph) * .55 + Math.sin(x * .27 + ph * 1.9) * .3 + Math.sin(x * .6 + ph * 3.1) * .15 * (1 - P));
        d += (x ? "L" : "M") + x + " " + y.toFixed(1);
      }
      wave.setAttribute("d", d);
    }
    return { el: el, set: function (p) {
      P = p; var v = Math.round(7 - 6 * p); val.textContent = v + " / 10"; el.classList.toggle("is-calm", p > .7); draw();
    }, tick: function (dt) { ph += dt * (2.4 - P * 1.6); draw(); } };
  }

  function sceneMicro() {
    var el = document.createElement("div"); el.className = "scene scene--micro ph";
    el.innerHTML = '<div class="scene__bg micro__bg" style="background-image:url(img/micro.jpg)"></div>' +
      '<div class="lens"><div class="lens__in" style="background-image:url(img/micro.jpg)"></div><svg viewBox="0 0 100 100" class="lens__ui"><circle cx="50" cy="50" r="48"/><path d="M50 38v24M38 50h24"/></svg></div>' +
      '<div class="readout readout--l"><span>Збільшення</span><b class="micro__x">×4</b></div>' +
      '<div class="readout readout--r"><span>Точність</span><b>0,1 мм</b></div>';
    probe("img/micro.jpg", function () {}, function () { el.classList.add("noimg"); });
    var lens = $(".lens", el), inner = $(".lens__in", el), xr = $(".micro__x", el);
    return { el: el, set: function (p) {
      var W = el.clientWidth, H = el.clientHeight; if (!W) return;
      var r = Math.min(W, H) * .24, lx = W * (.28 + .44 * p), ly = H * (.56 - .16 * Math.sin(p * Math.PI)), s = 1.7 + 1.3 * p;
      lens.style.cssText = "width:" + 2 * r + "px;height:" + 2 * r + "px;left:" + (lx - r) + "px;top:" + (ly - r) + "px";
      inner.style.cssText = "width:" + W + "px;height:" + H + "px;left:" + (r - lx) + "px;top:" + (r - ly) + "px;transform-origin:" + lx + "px " + ly + "px;transform:scale(" + s.toFixed(3) + ");background-image:url(img/micro.jpg)";
      xr.textContent = "×" + Math.round(4 + 21 * p);
    } };
  }

  function sceneSteril() {
    var el = document.createElement("div"); el.className = "scene scene--steril";
    var steps = ["Дезінфекція", "Ультразвукове очищення", "Пакування і маркування", "Автоклав 134 °C"];
    var R = 104, cx = 150, cy = 180, arcs = "", track = "";
    function arc(a0, a1) {
      var p0 = [cx + R * Math.cos(a0), cy + R * Math.sin(a0)], p1 = [cx + R * Math.cos(a1), cy + R * Math.sin(a1)];
      return "M" + p0[0].toFixed(1) + " " + p0[1].toFixed(1) + " A" + R + " " + R + " 0 0 1 " + p1[0].toFixed(1) + " " + p1[1].toFixed(1);
    }
    for (var i = 0; i < 4; i++) {
      var a0 = -Math.PI / 2 + i * Math.PI / 2 + .06, a1 = a0 + Math.PI / 2 - .12;
      track += '<path d="' + arc(a0, a1) + '"/>'; arcs += '<path pathLength="1" d="' + arc(a0, a1) + '"/>';
    }
    el.innerHTML = '<svg viewBox="0 0 480 360"><g class="st__track">' + track + '</g><g class="st__arcs">' + arcs + "</g>" +
      '<text x="150" y="176" class="st__num">20°</text><text x="150" y="206" class="st__lbl">температура</text></svg>' +
      '<ol class="st__list">' + steps.map(function (s, i) { return '<li><i><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7"/></svg></i><span><small>Етап ' + (i + 1) + "</small>" + s + "</span></li>"; }).join("") + "</ol>" +
      '<div class="st__seal"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>Пакет відкриваємо при вас</div>';
    var ap = $$(".st__arcs path", el), li = $$(".st__list li", el), num = $(".st__num", el), seal = $(".st__seal", el);
    return { el: el, set: function (p) {
      ap.forEach(function (a, i) { var f = clamp(p * 4 - i, 0, 1); a.style.strokeDashoffset = 1 - f; li[i].classList.toggle("on", f >= 1); li[i].classList.toggle("cur", f > 0 && f < 1); });
      num.textContent = Math.round(20 + 114 * clamp((p - .72) / .26, 0, 1)) + "°";
      seal.classList.toggle("on", p > .97);
    } };
  }

  function scenePlan() {
    var el = document.createElement("div"); el.className = "scene scene--plan";
    var rows = [["3D-діагностика і консультація", "", 0, "600 ₴ → 0 ₴"], ["Лікування каналів під мікроскопом", "зуб 16", 4200], ["Керамічна вкладка E.max", "зуб 16", 9800], ["Професійна гігієна", "", 1900]];
    el.innerHTML = '<div class="plan"><div class="plan__head"><div><small>План лікування</small><b>Марина К.</b></div><span class="plan__id">№ 2417</span></div>' +
      '<ul class="plan__rows">' + rows.map(function (r) {
        return "<li><span>" + r[0] + (r[1] ? "<small>" + r[1] + "</small>" : "") + "</span><b>" + (r[3] || money(r[2])) + "</b></li>";
      }).join("") + "</ul>" +
      '<div class="plan__total"><span>Разом</span><b class="plan__sum">0 ₴</b></div>' +
      '<div class="plan__foot"><span>3 візити · 2 тижні</span><span>Гарантія 5 років</span></div>' +
      '<div class="stamp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Ціна фіксована</div></div>';
    var li = $$(".plan__rows li", el), sum = $(".plan__sum", el), stamp = $(".stamp", el);
    return { el: el, set: function (p) {
      var tot = 0;
      li.forEach(function (l, i) { var f = clamp((p - i * .17) / .17, 0, 1); l.style.opacity = f; l.style.transform = "translateY(" + (1 - f) * 12 + "px)"; tot += rows[i][2] * f; });
      sum.textContent = money(Math.round(tot / 10) * 10);
      stamp.classList.toggle("on", p > .8);
    } };
  }

  var builders = { scan: sceneScan, calm: sceneCalm, micro: sceneMicro, steril: sceneSteril, plan: scenePlan };
  var list = $("#storyList"), stage = $("#stage"), track = $("#storyTrack");
  list.innerHTML = CH.map(function (c, i) {
    return '<li class="ch" data-i="' + i + '"><button type="button" class="ch__h"><span class="ch__n">0' + (i + 1) + '</span><span class="ch__t">' + esc(c.t) + '</span></button>' +
      '<div class="ch__body"><div><p class="ch__tag">' + esc(c.tag) + "</p><p>" + esc(c.d) + '</p><span class="ch__bar"><i></i></span></div></div><div class="ch__slot"></div></li>';
  }).join("");
  var chEls = $$(".ch", list);
  var scenes = CH.map(function (c) { var s = builders[c.k](); s.p = -1; return s; });
  var desk = window.matchMedia("(min-width: 960px)"), mode = "";
  function setScene(s, p) { if (Math.abs(s.p - p) < .0005) return; s.p = p; s.set(p); }
  function layout() {
    var m = desk.matches && !reduced ? "desk" : "mob";
    if (m === mode) return; mode = m;
    document.documentElement.classList.toggle("story-desk", m === "desk");
    scenes.forEach(function (s, i) { (m === "desk" ? stage : $(".ch__slot", chEls[i])).appendChild(s.el); s.p = -1; });
    if (m === "desk") { track.style.height = (CH.length * 75 + 100) + "vh"; storyScroll(); }
    else {
      track.style.height = "";
      chEls.forEach(function (c) { c.classList.add("is-on"); });
      scenes.forEach(function (s) { s.el.classList.add("is-on"); setScene(s, reduced ? 1 : (s.played ? 1 : 0)); });
    }
  }
  var active = -1;
  function storyScroll() {
    if (mode !== "desk") return;
    var r = track.getBoundingClientRect(), len = track.offsetHeight - window.innerHeight;
    var prog = clamp(-r.top / len, 0, .9999), f = prog * CH.length, idx = Math.floor(f), lp = f - idx;
    if (idx !== active) {
      active = idx;
      chEls.forEach(function (c, i) { c.classList.toggle("is-on", i === idx); c.classList.toggle("is-past", i < idx); });
      scenes.forEach(function (s, i) { s.el.classList.toggle("is-on", i === idx); s.el.classList.toggle("is-past", i < idx); });
    }
    scenes.forEach(function (s, i) { setScene(s, i < idx ? 1 : i > idx ? 0 : clamp((lp - .06) / .72, 0, 1)); });
    chEls.forEach(function (c, i) { $(".ch__bar i", c).style.transform = "scaleX(" + (i < idx ? 1 : i > idx ? 0 : lp).toFixed(3) + ")"; });
  }
  list.addEventListener("click", function (e) {
    var b = e.target.closest(".ch__h"); if (!b || mode !== "desk") return;
    var i = +b.parentNode.dataset.i, len = track.offsetHeight - window.innerHeight;
    go(track.getBoundingClientRect().top + window.scrollY + (i + .5) / CH.length * len);
  });
  // телефон: сцена програється сама, коли з'являється на екрані
  function play(s) {
    if (s.played || reduced) return; s.played = true;
    var t0 = null, dur = 2600;
    requestAnimationFrame(function step(t) {
      if (mode !== "mob") return;
      if (!t0) t0 = t; var k = clamp((t - t0) / dur, 0, 1); setScene(s, ease(k));
      if (k < 1) requestAnimationFrame(step);
    });
  }
  var visible = {};
  if ("IntersectionObserver" in window) {
    var sio = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        var i = scenes.map(function (s) { return s.el; }).indexOf(x.target);
        visible[i] = x.isIntersecting;
        if (x.isIntersecting && x.intersectionRatio > .45 && mode === "mob") play(scenes[i]);
      });
    }, { threshold: [0, .45, .6] });
    scenes.forEach(function (s) { sio.observe(s.el); });
  }
  // постійний «подих» для хвилі
  var lastT = 0;
  function loop(t) {
    var dt = lastT ? Math.min(.05, (t - lastT) / 1000) : 0; lastT = t;
    scenes.forEach(function (s, i) { if (s.tick && visible[i] && (mode === "mob" || i === active)) s.tick(dt); });
    requestAnimationFrame(loop);
  }
  if (!reduced) requestAnimationFrame(loop);

  /* ---------- Цифри ---------- */
  /* Маніфест: слова «проявляються» під час скролу, цифри рахуються, коли до них доходить черга */
  var mani = $("#mani"), mWords = [];
  (function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); mWords.push(s);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) { n.classList.add("w"); mWords.push(n); }
    });
  })(mani);
  var maniLit = -1;
  function maniScroll() {
    var r = mani.getBoundingClientRect(), vh = window.innerHeight;
    var p = reduced ? 1 : clamp((vh * .88 - r.top) / (r.height + vh * .3), 0, 1), lit = Math.round(p * mWords.length * 1.15);
    if (lit === maniLit) return; maniLit = lit;
    mWords.forEach(function (w, i) {
      var on = i < lit;
      if (on && !w.classList.contains("on") && w.classList.contains("num")) countUp(w);
      w.classList.toggle("on", on);
    });
  }
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
  var svcCat = "all";
  function renderSvc() {
    $("#svcTabs").innerHTML = D.cats.map(function (c) { return '<button type="button" class="tab' + (c.id === svcCat ? " is-on" : "") + '" aria-pressed="' + (c.id === svcCat) + '" data-cat="' + c.id + '">' + esc(c.name) + "</button>"; }).join("");
    $("#svcGrid").innerHTML = D.services.filter(function (s) { return svcCat === "all" || s.cat === svcCat; }).map(function (s, i) {
      return '<article class="sc" style="--i:' + i + '"><span class="sc__ic">' + icon(s.icon) + "</span><h3>" + esc(s.name) + "</h3><p>" + esc(s.desc) + "</p>" +
        '<div class="sc__foot"><span class="sc__price"><small>від</small> ' + money(s.price) + (s.unit ? " <small>" + s.unit + "</small>" : "") + '</span><span class="sc__dur">' + s.dur + ' хв</span></div>' +
        '<button type="button" class="sc__go" data-book-svc="' + s.id + '" aria-label="Записатися: ' + esc(s.name) + '">' + arrow + "</button></article>";
    }).join("");
  }
  renderSvc();
  $("#svcTabs").addEventListener("click", function (e) { var t = e.target.closest(".tab"); if (!t) return; svcCat = t.dataset.cat; renderSvc(); });

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

  /* ---------- Відгуки ---------- */
  $("#revs").innerHTML = D.reviews.map(function (r, i) {
    return '<figure class="rv reveal" style="--rd:' + (i % 3) * .08 + 's"><span class="stars" aria-label="5 з 5">★★★★★</span><blockquote>' + esc(r.text) + "</blockquote>" +
      '<figcaption><span class="rv__av">' + esc(r.name[0]) + "</span><span><b>" + esc(r.name) + "</b><small>" + esc(r.when) + " · Google</small></span></figcaption></figure>";
  }).join("");

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

  /* ---------- Скрол: шапка, прогрес, параллакс hero, кроки ---------- */
  var arch = $("#heroArch img"), ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("is-scrolled", y > 10);
    bar.style.transform = "scaleX(" + (h > 0 ? y / h : 0).toFixed(4) + ")";
    mbar.classList.toggle("is-shown", y > window.innerHeight * .7);
    if (!reduced && y < window.innerHeight * 1.2) arch.style.transform = "translateY(" + (y * .08).toFixed(1) + "px) scale(1.08)";
    storyScroll(); stepsScroll(); maniScroll();
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", function () { layout(); scenes.forEach(function (s) { var p = s.p; s.p = -1; setScene(s, p < 0 ? 0 : p); }); onScroll(); });
  layout(); onScroll();
  document.documentElement.classList.add("is-loaded");
})();
