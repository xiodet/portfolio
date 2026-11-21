(function () {
  "use strict";
  var C = window.CONFIG, D = window.DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };
  var fmt = function (n) { return n.toLocaleString("uk-UA").replace(/[,  ]/g, " "); };
  var money = function (n) { return fmt(n) + " ₴"; };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- Nav, parallax ---------- */
  var nav = $("#nav"), burger = $("#burger"), mnav = $("#mnav"), heroBg = $("#heroBg"), hero = $("#hero");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-solid", y > hero.offsetHeight - 80 || mnav.classList.contains("is-open"));
    if (!reduce && y < hero.offsetHeight) heroBg.style.transform = "translate3d(0," + (y * 0.3) + "px,0) scale(" + (1 + y / 4000) + ")";
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  burger.addEventListener("click", function () {
    var open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", open); mnav.classList.toggle("is-open", open); onScroll();
  });
  mnav.addEventListener("click", function (e) { if (e.target.closest("a")) { burger.setAttribute("aria-expanded", "false"); mnav.classList.remove("is-open"); onScroll(); } });

  /* ---------- Reveal ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px" }) : null;
  function watch(n) { if (io) io.observe(n); else n.classList.add("in"); }
  $$(".reveal").forEach(watch);

  /* ---------- Shop ---------- */
  var PRICES = [{ id: "all", name: "Будь-яка ціна" }, { id: "lo", name: "до 1 000 ₴", t: [0, 999] }, { id: "mid", name: "1 000–2 000 ₴", t: [1000, 2000] }, { id: "hi", name: "від 2 000 ₴", t: [2001, 1e9] }];
  var f = { occ: "all", price: "all", color: "all" };
  function chip(label, val, pressed, sw) {
    var b = el("button", "chip", (sw ? '<span class="chip__sw" style="background:' + sw + '"></span>' : "") + esc(label));
    b.type = "button"; b.dataset.v = val; b.setAttribute("aria-pressed", pressed); return b;
  }
  var fOcc = $("#fOcc"), fPrice = $("#fPrice"), fColor = $("#fColor"), grid = $("#grid");
  fOcc.appendChild(chip("Усі букети", "all", true));
  D.occasions.forEach(function (o) { fOcc.appendChild(chip(o.name, o.id, false)); });
  PRICES.forEach(function (p, i) { fPrice.appendChild(chip(p.name, p.id, i === 0)); });
  D.colors.forEach(function (c) { fColor.appendChild(chip(c.name, c.id, false, c.hex)); });
  function bindFilter(box, key) {
    box.addEventListener("click", function (e) {
      var c = e.target.closest(".chip"); if (!c) return;
      var v = c.dataset.v;
      if (key === "color" && f.color === v) v = "all";
      f[key] = v;
      $$(".chip", box).forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.v === v); });
      renderGrid();
    });
  }
  bindFilter(fOcc, "occ"); bindFilter(fPrice, "price"); bindFilter(fColor, "color");
  $("#resetF").addEventListener("click", function () {
    f = { occ: "all", price: "all", color: "all" };
    [fOcc, fPrice, fColor].forEach(function (b) { $$(".chip", b).forEach(function (x, i) { x.setAttribute("aria-pressed", b !== fColor && i === 0); }); });
    renderGrid();
  });
  var TAGS = { "Хіт": "hit", "Новинка": "new", "Преміум": "prem" };
  function renderGrid() {
    grid.innerHTML = "";
    var pr = PRICES.filter(function (p) { return p.id === f.price; })[0];
    var list = D.bouquets.filter(function (b) {
      return (f.occ === "all" || b.occ.indexOf(f.occ) > -1) &&
        (!pr.t || (b.price >= pr.t[0] && b.price <= pr.t[1])) &&
        (f.color === "all" || b.color === f.color);
    });
    list.forEach(function (b, i) {
      var c = el("article", "card reveal",
        '<div class="card__img">' + (b.tag ? '<span class="tag tag--' + TAGS[b.tag] + '">' + esc(b.tag) + '</span>' : "") +
        '<img src="' + b.img + '" alt="Букет «' + esc(b.name) + '»" loading="lazy"></div>' +
        '<div class="card__body"><h3 class="card__name">' + esc(b.name) + '</h3><p class="card__desc">' + esc(b.desc) + '</p>' +
        '<div class="card__foot"><span class="price">' + fmt(b.price) + '<small>₴</small></span>' +
        '<button class="add" type="button" data-add="' + b.id + '" aria-label="Додати в кошик: ' + esc(b.name) + '">+</button></div></div>');
      c.style.transitionDelay = (i % 4) * 70 + "ms";
      grid.appendChild(c); watch(c);
    });
    $("#empty").hidden = list.length > 0;
  }
  renderGrid();
  // Букети за бюджетом
  function plural(n) { var a = n % 10, b = n % 100; return n + " " + (a === 1 && b !== 11 ? "букет" : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? "букети" : "букетів"); }
  $$("[data-cnt]").forEach(function (e) {
    var p = PRICES.filter(function (x) { return x.id === e.dataset.cnt; })[0];
    e.textContent = plural(D.bouquets.filter(function (b) { return b.price >= p.t[0] && b.price <= p.t[1]; }).length);
  });
  $$("[data-price]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      f.price = btn.dataset.price;
      $$(".chip", fPrice).forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.v === f.price); });
      renderGrid();
      $("#shop").scrollIntoView({ behavior: "smooth" });
    });
  });
  grid.addEventListener("click", function (e) {
    var a = e.target.closest("[data-add]"); if (!a) return;
    var b = D.bouquets.filter(function (x) { return x.id === +a.dataset.add; })[0];
    addToCart({ key: "b" + b.id, name: b.name, desc: b.desc, price: b.price, img: b.img });
    a.classList.add("ok"); a.textContent = "✓";
    setTimeout(function () { a.classList.remove("ok"); a.textContent = "+"; }, 1400);
  });

  /* ---------- Builder ---------- */
  var byId = function (arr, id) { return arr.filter(function (x) { return x.id === id; })[0]; };
  var PAL = D.palette;
  var B = { items: {}, wrap: "film", green: true };
  Object.keys(D.defaultMix).forEach(function (k) { B.items[k] = { n: D.defaultMix[k][0], c: D.defaultMix[k][1] }; });
  D.flowers.forEach(function (f) { if (!B.items[f.id]) B.items[f.id] = { n: 0, c: f.colors[0] }; });
  function shade(hex, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var m = function (v) { return Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); };
    return "#" + ((1 << 24) + (m(r) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
  }
  var f1 = function (v) { return Math.round(v * 10) / 10; };
  function flowerSVG(shape, x, y, r, c, anim, delay) {
    var d = shade(c, -.22), dd = shade(c, -.4), l = shade(c, .35), i, a;
    var g = '<g class="' + (anim ? "fl" : "") + '"' + (anim ? ' style="animation-delay:' + delay + 'ms"' : "") + ">";
    var C = function (cx, cy, rr, fill, extra) { return '<circle cx="' + f1(cx) + '" cy="' + f1(cy) + '" r="' + f1(rr) + '" fill="' + fill + '"' + (extra || "") + "/>"; };
    if (shape === "rose") {
      g += C(x, y, r, c) +
        '<path d="M' + f1(x - r * .72) + " " + f1(y + r * .1) + "a" + f1(r * .72) + " " + f1(r * .72) + " 0 0 1 " + f1(r * 1.44) + ' 0" fill="none" stroke="' + d + '" stroke-width="' + f1(r * .12) + '" stroke-linecap="round"/>' +
        C(x, y + r * .05, r * .45, d) +
        '<path d="M' + f1(x - r * .28) + " " + f1(y) + "a" + f1(r * .28) + " " + f1(r * .28) + " 0 1 1 " + f1(r * .4) + " " + f1(r * .2) + '" fill="none" stroke="' + dd + '" stroke-width="' + f1(r * .1) + '" stroke-linecap="round"/>' +
        C(x - r * .35, y - r * .45, r * .18, l, ' opacity=".6"');
    } else if (shape === "peony") {
      for (i = 0; i < 7; i++) { a = i / 7 * Math.PI * 2; g += C(x + Math.cos(a) * r * .55, y + Math.sin(a) * r * .5, r * .55, i % 2 ? c : l); }
      for (i = 0; i < 5; i++) { a = i / 5 * Math.PI * 2 + .4; g += C(x + Math.cos(a) * r * .28, y + Math.sin(a) * r * .25, r * .38, d); }
      g += C(x, y, r * .25, dd);
    } else if (shape === "tulip") {
      g += '<path d="M' + f1(x - r * .8) + " " + f1(y - r * .5) + "Q" + f1(x - r * .9) + " " + f1(y + r) + " " + f1(x) + " " + f1(y + r) + "Q" + f1(x + r * .9) + " " + f1(y + r) + " " + f1(x + r * .8) + " " + f1(y - r * .5) +
        "L" + f1(x + r * .4) + " " + f1(y - r * .1) + "L" + f1(x) + " " + f1(y - r * .8) + "L" + f1(x - r * .4) + " " + f1(y - r * .1) + 'Z" fill="' + c + '"/>' +
        '<path d="M' + f1(x) + " " + f1(y - r * .8) + "Q" + f1(x - r * .5) + " " + f1(y + r * .2) + " " + f1(x) + " " + f1(y + r) + "Q" + f1(x + r * .5) + " " + f1(y + r * .2) + " " + f1(x) + " " + f1(y - r * .8) + 'Z" fill="' + d + '"/>';
    } else if (shape === "hydr") {
      g += C(x, y, r, d);
      for (i = 0; i < 16; i++) {
        var rr = r * Math.sqrt((i + .5) / 16) * .82; a = i * 2.4;
        var px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr, s = r * .2;
        g += C(px - s * .5, py, s * .6, i % 3 ? c : l) + C(px + s * .5, py, s * .6, i % 3 ? c : l) + C(px, py - s * .5, s * .6, c) + C(px, py + s * .5, s * .6, c) + C(px, py, s * .25, dd);
      }
    } else if (shape === "carn") {
      g += C(x, y, r, c, ' stroke="' + l + '" stroke-width="' + f1(r * .25) + '" stroke-dasharray="' + f1(r * .18) + ' ' + f1(r * .12) + '"') +
        C(x, y, r * .62, d, ' stroke="' + c + '" stroke-width="' + f1(r * .18) + '" stroke-dasharray="' + f1(r * .14) + ' ' + f1(r * .1) + '"') + C(x, y, r * .25, dd);
    } else {
      var sun = shape === "sun", pc = sun ? "#FFC21A" : c, n = sun ? 14 : 12;
      for (i = 0; i < n; i++) g += '<ellipse cx="' + f1(x) + '" cy="' + f1(y - r * .58) + '" rx="' + f1(r * (sun ? .2 : .16)) + '" ry="' + f1(r * .45) + '" fill="' + (i % 2 ? pc : shade(pc, -.08)) + '" transform="rotate(' + (i * 360 / n) + " " + f1(x) + " " + f1(y) + ')"/>';
      g += sun ? C(x, y, r * .45, "#6B3E12") + C(x, y, r * .3, "#4A2A0A") : C(x, y, r * .3, "#F2B705");
    }
    return g + "</g>";
  }
  function heads(cfg) {
    var list = [];
    cfg.items.forEach(function (it) {
      var f = byId(D.flowers, it.id);
      for (var k = 0; k < it.n; k++) list.push({ shape: f.shape, c: PAL[it.c].hex, w: f.shape === "hydr" ? 2.6 : f.shape === "peony" ? 1.5 : 1, o: (k + .5) / it.n });
    });
    var total = list.reduce(function (s, h) { return s + h.w; }, 0);
    if (total > 40) { // показуємо пропорційну вибірку
      var k = 40 / total; list = list.filter(function (h, i) { return (Math.floor((i + 1) * k) - Math.floor(i * k)) > 0 || h.shape === "hydr"; });
    }
    list.sort(function (a, b) { return a.o - b.o; });
    return list;
  }
  function bouquetSVG(cfg, anim) {
    var wr = byId(D.wraps, cfg.wrap), hs = heads(cfg);
    var W = hs.reduce(function (s, h) { return s + h.w; }, 0) || 1;
    var cx = 200, cy = 170, rx = Math.min(140, 70 + Math.sqrt(W) * 12), ry = rx * .72;
    var R = Math.max(12, Math.min(28, rx * 1.05 / Math.sqrt(W)));
    var s = "", boxy = wr.id === "box", bask = wr.id === "basket";
    if (!boxy && !bask) {
      s += '<g stroke="#2E8B57" stroke-width="5" stroke-linecap="round">';
      for (var k = -3; k <= 3; k++) s += '<line x1="' + (cx + k * 12) + '" y1="250" x2="' + (cx + k * 3) + '" y2="425"/>';
      s += "</g>";
      s += '<path d="M' + (cx - rx - 18) + " " + (cy + 20) + "L" + (cx - 26) + " 400L" + (cx + 26) + " 400L" + (cx + rx + 18) + " " + (cy + 20) + "L" + (cx + 40) + " " + (cy + 60) + 'Z" fill="' + shade(wr.color, -.15) + '"/>';
    }
    if (bask) s += '<path d="M' + (cx - rx + 10) + " 260 C " + (cx - rx + 10) + " 40, " + (cx + rx - 10) + " 40, " + (cx + rx - 10) + ' 260" fill="none" stroke="' + shade(wr.color, -.2) + '" stroke-width="12"/>';
    if (cfg.green && hs.length) {
      for (var g = 0; g < 14; g++) {
        var ga = (g / 14) * Math.PI * 2, gx = f1(cx + Math.cos(ga) * (rx + 4)), gy = f1(cy + Math.sin(ga) * (ry + 6));
        s += '<ellipse cx="' + gx + '" cy="' + gy + '" rx="10" ry="26" fill="' + (g % 2 ? "#3FAE6B" : "#7FC8A0") + '" transform="rotate(' + Math.round(ga * 180 / Math.PI + 90) + " " + gx + " " + gy + ')"/>';
      }
    }
    // розкладка голівок: соняшникова спіраль з урахуванням ваги (гортензія займає більше місця)
    var acc = 0, pts = hs.map(function (h, i) {
      var r = Math.sqrt((acc + h.w / 2) / W); acc += h.w; var a = i * 2.39996;
      return { x: cx + Math.cos(a) * r * rx, y: cy + Math.sin(a) * r * ry, h: h };
    });
    pts.sort(function (a, b) { return (a.h.w > 1.5 ? -1 : 0) - (b.h.w > 1.5 ? -1 : 0) || a.y - b.y; });
    pts.forEach(function (p, idx) {
      var rr = R * (p.h.w > 2 ? 1.75 : p.h.w > 1 ? 1.25 : 1);
      s += flowerSVG(p.h.shape, p.x, p.y, rr, p.h.c, anim, idx * 18);
    });
    if (!hs.length) s += '<text x="200" y="150" text-anchor="middle" font-family="Manrope,sans-serif" font-weight="700" font-size="16" fill="rgba(255,255,255,.55)">Додайте квіти праворуч</text>';
    if (boxy) {
      s += '<rect x="' + (cx - rx - 4) + '" y="' + (cy + 40) + '" width="' + (2 * rx + 8) + '" height="' + (360 - cy) + '" rx="16" fill="' + wr.color + '"/>' +
        '<ellipse cx="' + cx + '" cy="' + (cy + 40) + '" rx="' + (rx + 4) + '" ry="14" fill="#33243F"/>' +
        '<text x="' + cx + '" y="' + (cy + 140) + '" text-anchor="middle" font-family="Playfair Display,serif" font-style="italic" font-weight="900" font-size="22" fill="#FF2E88">bloom lab</text>';
    } else if (bask) {
      s += '<path d="M' + (cx - rx - 10) + " " + (cy + 50) + "L" + (cx + rx + 10) + " " + (cy + 50) + "L" + (cx + rx - 20) + " 380L" + (cx - rx + 20) + ' 380Z" fill="' + wr.color + '"/>';
      for (var w = 0; w < 6; w++) s += '<line x1="' + (cx - rx) + '" y1="' + (cy + 70 + w * 30) + '" x2="' + (cx + rx) + '" y2="' + (cy + 70 + w * 30) + '" stroke="' + shade(wr.color, -.25) + '" stroke-width="3" stroke-dasharray="14 8"/>';
    } else {
      var op = wr.id === "film" ? ' fill-opacity=".92"' : "";
      s += '<path d="M' + (cx - rx - 26) + " " + (cy + 36) + "Q" + (cx - 40) + " " + (cy + 70) + " " + cx + " " + (cy + 64) + "Q" + (cx + 40) + " " + (cy + 70) + " " + (cx + rx + 26) + " " + (cy + 36) + "L" + (cx + 30) + " 380L" + (cx - 30) + ' 380Z" fill="' + wr.color + '"' + op + "/>" +
        '<path d="M' + (cx - rx - 26) + " " + (cy + 36) + "L" + (cx - 30) + ' 380" stroke="' + shade(wr.color, -.2) + '" stroke-width="3" fill="none"/>' +
        '<path d="M' + (cx - 46) + ' 300 q46 18 92 0 l-8 22 q-38 12 -76 0z" fill="#FF2E88"/>' +
        '<circle cx="' + cx + '" cy="312" r="9" fill="#E0186F"/>';
    }
    return s;
  }
  function snapshot() {
    return { items: D.flowers.filter(function (f) { return B.items[f.id].n > 0; }).map(function (f) { return { id: f.id, n: B.items[f.id].n, c: B.items[f.id].c }; }), wrap: B.wrap, green: B.green };
  }
  function stems(cfg) { return cfg.items.reduce(function (s, i) { return s + i.n; }, 0); }
  function bPrice(cfg) {
    var fl = cfg.items.reduce(function (s, i) { return s + byId(D.flowers, i.id).price * i.n; }, 0), wr = byId(D.wraps, cfg.wrap);
    var green = cfg.green ? D.greenPrice : 0;
    return { flowers: fl, green: green, wrap: wr.price, work: D.floristWork, total: fl ? fl + green + wr.price + D.floristWork : 0 };
  }
  function cfgDesc(cfg) {
    return cfg.items.map(function (i) { return byId(D.flowers, i.id).name + " ×" + i.n + (byId(D.flowers, i.id).colors.length > 1 ? " (" + PAL[i.c].name.toLowerCase() + ")" : ""); }).join(", ") +
      " · " + byId(D.wraps, cfg.wrap).name.toLowerCase() + (cfg.green ? " · зелень" : "");
  }

  var bFlowers = $("#bFlowers"), bWrap = $("#bWrap"), svg = $("#bldSvg");
  D.flowers.forEach(function (f) {
    var card = el("div", "fc");
    card.dataset.id = f.id;
    card.innerHTML = '<div class="fc__img"><img src="' + f.img + '" alt="' + esc(f.name) + '" loading="lazy"><span class="fc__n"></span></div>' +
      '<div class="fc__body"><div class="fc__top"><b>' + esc(f.name) + '</b><span>' + f.price + " ₴</span></div>" +
      '<small>' + esc(f.note) + "</small>" +
      (f.colors.length > 1 ? '<div class="fc__cols">' + f.colors.map(function (c) { return '<button type="button" class="dot" data-c="' + c + '" style="background:' + PAL[c].hex + '" aria-label="' + PAL[c].name + '"></button>'; }).join("") + "</div>" : '<div class="fc__cols fc__cols--one">' + PAL[f.colors[0]].name + "</div>") +
      '<div class="fc__qty"><button type="button" data-d="-1" aria-label="Менше">−</button><span></span><button type="button" data-d="1" aria-label="Більше">+</button></div></div>';
    bFlowers.appendChild(card);
  });
  bFlowers.addEventListener("click", function (e) {
    var card = e.target.closest(".fc"); if (!card) return;
    var it = B.items[card.dataset.id], dot = e.target.closest("[data-c]"), btn = e.target.closest("[data-d]");
    var total = stems(snapshot());
    if (dot) { it.c = dot.dataset.c; if (!it.n) it.n = 1; }
    else if (btn) { var dlt = +btn.dataset.d; if (dlt > 0 && total >= D.maxStems) { toast("Максимум " + D.maxStems + " квітка в одному букеті"); return; } it.n = Math.max(0, it.n + dlt); }
    else if (e.target.closest(".fc__img") && total < D.maxStems) it.n++;
    else return;
    renderBuilder(true);
  });
  D.wraps.forEach(function (x) { var b = el("button", "opt", "<b>" + esc(x.name) + "</b><span>" + (x.price ? "+" + x.price + " ₴" : "у вартості") + "</span>"); b.type = "button"; b.dataset.v = x.id; bWrap.appendChild(b); });
  bWrap.addEventListener("click", function (e) { var b = e.target.closest("button"); if (!b) return; B.wrap = b.dataset.v; renderBuilder(true); });
  $("#bGreen").addEventListener("change", function (e) { B.green = e.target.checked; renderBuilder(true); });
  $("#bClear").addEventListener("click", function () { D.flowers.forEach(function (f) { B.items[f.id].n = 0; }); renderBuilder(true); });
  var lastTotal = 0;
  function renderBuilder(anim) {
    $$(".fc", bFlowers).forEach(function (card) {
      var it = B.items[card.dataset.id];
      card.classList.toggle("is-on", it.n > 0);
      $(".fc__n", card).textContent = it.n ? "×" + it.n : "";
      $(".fc__qty span", card).textContent = it.n;
      $$(".dot", card).forEach(function (d) { d.setAttribute("aria-pressed", d.dataset.c === it.c); });
    });
    $$("button", bWrap).forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.v === B.wrap); });
    var cfg = snapshot(), p = bPrice(cfg), n = stems(cfg);
    svg.innerHTML = bouquetSVG(cfg, anim);
    $("#bCount").textContent = n ? n + " шт" : "";
    $("#bClear").hidden = !n;
    $("#bldCalc").innerHTML = cfg.items.map(function (i) { var f = byId(D.flowers, i.id); return "<li><span>" + esc(f.name) + " × " + i.n + "</span><span>" + money(f.price * i.n) + "</span></li>"; }).join("") +
      (n ? (B.green ? "<li><span>Зелень</span><span>" + money(p.green) + "</span></li>" : "") +
      "<li><span>" + esc(byId(D.wraps, B.wrap).name) + "</span><span>" + money(p.wrap) + "</span></li>" +
      "<li><span>Робота флориста</span><span>" + money(p.work) + "</span></li>" : '<li class="muted-li"><span>Оберіть хоча б одну квітку</span><span></span></li>') +
      "<li><span>Разом</span><span>" + money(p.total) + "</span></li>";
    var t = $("#bldTotal"); t.textContent = money(p.total);
    if (p.total !== lastTotal && lastTotal) { t.parentNode.classList.remove("pop"); void t.offsetWidth; t.parentNode.classList.add("pop"); }
    lastTotal = p.total;
    $("#bldAdd").disabled = !n; $("#barAdd").disabled = !n;
    $("#barSvg").innerHTML = bouquetSVG(cfg, false);
    $("#barCount").textContent = n ? "Ваш букет · " + n + " шт" : "Додайте квіти";
    $("#barTotal").textContent = money(p.total);
  }
  renderBuilder(false);
  $("#barAdd").addEventListener("click", function () { $("#bldAdd").click(); });
  $("#bldAdd").addEventListener("click", function () {
    var cfg = snapshot(); if (!stems(cfg)) return;
    addToCart({ key: "c" + JSON.stringify(cfg), name: "Ваш букет", desc: cfgDesc(cfg), price: bPrice(cfg).total, cfg: cfg });
  });

  /* ---------- Delivery ---------- */
  $("#zones").innerHTML = D.zones.map(function (z) {
    return "<li><b>" + esc(z.name) + "</b><span>" + esc(z.time) + "</span><em>" + (z.price ? z.price + " ₴" : "0 ₴") + "</em></li>";
  }).join("");

  /* ---------- Reviews ---------- */
  var AV = ["#FF2E88", "#FF7A1A", "#17B26A", "#8C6CFF", "#1C1326", "#E0186F"];
  $("#rv").innerHTML = D.reviews.map(function (r, i) {
    return '<figure class="rcard"><div class="stars">★★★★★</div><p>' + esc(r.text) + '</p><figcaption class="rcard__who"><span class="ava" style="background:' + AV[i % AV.length] + '">' + esc(r.name[0]) + "</span><div><b>" + esc(r.name) + "</b><small>" + esc(r.date) + " · Google</small></div></figcaption></figure>";
  }).join("");

  /* ---------- Contacts ---------- */
  var tel = "tel:" + C.phone.replace(/[^+\d]/g, "");
  $("#ctAddr").textContent = C.address.replace(", Київ", "");
  $("#ctHours").textContent = "Печерськ, 5 хв від метро Печерська · " + C.hours;
  var ph = $("#ctPhone"); ph.href = tel; ph.textContent = C.phone;
  var ICONS = {
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    telegram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 4L3 11l6 2.5M21 4l-3.5 16-8.5-6.5M21 4L9 13.5v5.5l3-3.5"/></svg>',
    viber: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3c5 0 8 2.5 8 8s-3 8-8 8c-1 0-2-.1-3-.4L5 21v-3.5C3.7 16 3 14 3 11c0-5.5 4-8 9-8z"/></svg>'
  };
  ["telegram", "viber", "instagram"].forEach(function (k) {
    var a = el("a", "soc", ICONS[k] + (k[0].toUpperCase() + k.slice(1))); a.href = C[k];
    if (k !== "viber") { a.target = "_blank"; a.rel = "noopener"; }
    $("#socials").appendChild(a);
  });
  var mapBox = $("#map"), mapLoaded = false;
  function loadMap() {
    if (mapLoaded) return; mapLoaded = true;
    var fr = document.createElement("iframe");
    fr.src = "https://www.google.com/maps?q=" + encodeURIComponent(C.mapQuery) + "&z=15&output=embed";
    fr.loading = "lazy"; fr.title = "Bloom Lab на мапі"; mapBox.appendChild(fr);
  }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { loadMap(); o.disconnect(); } }, { rootMargin: "400px" }).observe(mapBox);
  else loadMap();

  /* ---------- Cart ---------- */
  var cart = store.get("bl_cart2") || [];
  var cartBtn = $("#cartBtn"), drawer = $("#drawer"), toastEl = $("#toast"), tT;
  function subtotal() { return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0); }
  function count() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function toast(html) { toastEl.innerHTML = html; toastEl.classList.add("on"); clearTimeout(tT); tT = setTimeout(function () { toastEl.classList.remove("on"); }, 2200); }
  function saveCart() { store.set("bl_cart2", cart); renderCart(); }
  function addToCart(item) {
    var ex = cart.filter(function (i) { return i.key === item.key; })[0];
    if (ex) ex.qty++; else { item.qty = 1; cart.push(item); }
    saveCart();
    cartBtn.classList.remove("bump"); void cartBtn.offsetWidth; cartBtn.classList.add("bump");
    toast("💐 «" + esc(item.name) + "» у кошику · <b>" + money(subtotal()) + "</b>");
  }
  function thumb(i) {
    if (i.cfg) return '<div class="ci__img ci__img--custom"><svg viewBox="20 30 360 380">' + bouquetSVG(i.cfg, false) + "</svg></div>";
    return '<div class="ci__img"><img src="' + i.img + '" alt=""></div>';
  }
  function renderCart() {
    var n = count();
    $("#cartCount").textContent = n; cartBtn.classList.toggle("has", n > 0);
    var body = $("#cartBody"), foot = $("#cartFoot");
    if (!cart.length) {
      body.innerHTML = '<div class="cart-empty"><div>🌷</div><p>Тут поки порожньо.<br>Оберіть букет або зберіть свій.</p></div>';
      foot.innerHTML = '<a href="#shop" class="btn btn--pink btn--block" data-close>До букетів</a>'; return;
    }
    body.innerHTML = cart.map(function (i, idx) {
      return '<div class="ci">' + thumb(i) + '<div><div class="ci__name">' + esc(i.name) + '</div><div class="ci__desc">' + esc(i.desc) + '</div><div class="ci__price">' + money(i.price * i.qty) + '</div></div>' +
        '<div class="qty"><button type="button" data-q="-1" data-i="' + idx + '" aria-label="Менше">−</button><span>' + i.qty + '</span><button type="button" data-q="1" data-i="' + idx + '" aria-label="Більше">+</button></div></div>';
    }).join("");
    var st = subtotal(), left = C.freeDeliveryFrom - st;
    foot.innerHTML = '<div class="tot"><span>Разом</span><b>' + money(st) + "</b></div>" +
      '<div class="tot-bar"><i style="width:' + Math.min(100, st / C.freeDeliveryFrom * 100) + '%"></i></div>' +
      '<p class="tot-hint">' + (left > 0 ? "Ще " + money(left) + " до безкоштовної доставки" : "🎉 Доставка по Києву безкоштовна") + "</p>" +
      '<button class="btn btn--pink btn--lg btn--block" type="button" id="toCheckout">Оформити замовлення</button>';
  }
  $("#cartBody").addEventListener("click", function (e) {
    var b = e.target.closest("[data-q]"); if (!b) return;
    var i = cart[+b.dataset.i]; i.qty += +b.dataset.q;
    if (i.qty <= 0) cart.splice(+b.dataset.i, 1);
    saveCart();
  });
  function openLayer(n) { n.classList.add("is-open"); n.setAttribute("aria-hidden", "false"); document.body.classList.add("lock"); var x = $(".x", n); if (x) setTimeout(function () { x.focus(); }, 50); }
  function closeLayer(n) { n.classList.remove("is-open"); n.setAttribute("aria-hidden", "true"); if (!$(".is-open.drawer, .is-open.modal")) document.body.classList.remove("lock"); }
  cartBtn.addEventListener("click", function () { renderCart(); openLayer(drawer); });
  [drawer, $("#checkout")].forEach(function (n) {
    n.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) closeLayer(n); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") $$(".drawer.is-open, .modal.is-open").forEach(closeLayer); });
  $("#cartFoot").addEventListener("click", function (e) {
    if (e.target.id === "toCheckout") { closeLayer(drawer); openCheckout(); }
  });
  renderCart();

  /* ---------- Checkout ---------- */
  var co = $("#checkout"), form = $("#coForm"), err = $("#coErr");
  var O = { zone: "pechersk", date: 0, time: null, pay: "card" };
  var PAY = [{ id: "card", name: "Карткою онлайн" }, { id: "apple", name: "Apple / Google Pay" }, { id: "cash", name: "Готівкою кур'єру" }, { id: "transfer", name: "Переказ на картку" }];
  var DAYS = ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], MONTHS = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  var dates = [], now = new Date();
  for (var d = 0; d < C.daysAhead; d++) { var dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d); dates.push(dt); }
  function slots(di) {
    var out = [];
    for (var h = C.deliveryFrom; h + C.slotHours <= C.deliveryTo; h += C.slotHours) {
      var ok = true;
      if (di === 0) { var min = now.getHours() + now.getMinutes() / 60 + (O.zone === "pickup" ? 1 : 2); ok = h + C.slotHours - 0.01 > min && h >= Math.floor(min - 1); }
      out.push({ v: h + ":00–" + (h + C.slotHours) + ":00", ok: ok });
    }
    return out;
  }
  var cZone = $("#cZone"), cDate = $("#cDate"), cTime = $("#cTime"), cPay = $("#cPay");
  function chipSet(box, items, cur) {
    box.innerHTML = "";
    items.forEach(function (it) {
      var b = el("button", "chip" + (String(it.v) === String(cur) ? " is-on" : ""), it.html); b.type = "button"; b.dataset.v = it.v; if (it.dis) b.disabled = true; box.appendChild(b);
    });
  }
  function zoneFee(z) {
    var zone = byId(D.zones, z); if (!zone.price) return 0;
    return subtotal() >= C.freeDeliveryFrom ? 0 : zone.price;
  }
  function renderCo() {
    chipSet(cZone, D.zones.map(function (z) { return { v: z.id, html: esc(z.id === "center" ? "Центр" : z.id === "right" ? "Правий берег" : z.id === "left" ? "Лівий берег" : z.id === "pickup" ? "Самовивіз" : z.name) + " <small>" + (zoneFee(z.id) ? zoneFee(z.id) + " ₴" : "0 ₴") + "</small>" }; }), O.zone);
    $("#addrFld").hidden = O.zone === "pickup";
    chipSet(cDate, dates.map(function (dt, i) { return { v: i, html: i === 0 ? "Сьогодні" : i === 1 ? "Завтра" : DAYS[dt.getDay()] + ", " + dt.getDate() + "." + String(dt.getMonth() + 1).padStart(2, "0") }; }), O.date);
    var sl = slots(O.date);
    if (O.time && !sl.some(function (s) { return s.v === O.time && s.ok; })) O.time = null;
    chipSet(cTime, sl.map(function (s) { return { v: s.v, html: s.v, dis: !s.ok }; }), O.time);
    if (!sl.some(function (s) { return s.ok; })) cTime.insertAdjacentHTML("beforeend", '<span class="muted small">На сьогодні вже не встигнемо, оберіть інший день.</span>');
    chipSet(cPay, PAY.map(function (p) { return { v: p.id, html: p.name }; }), O.pay);
    var st = subtotal(), fee = zoneFee(O.zone);
    $("#coSum").innerHTML = cart.map(function (i) { return "<div><span>" + esc(i.name) + (i.qty > 1 ? " × " + i.qty : "") + "</span><span>" + money(i.price * i.qty) + "</span></div>"; }).join("") +
      "<div><span>" + (O.zone === "pickup" ? "Самовивіз" : "Доставка") + "</span><span>" + (fee ? money(fee) : "безкоштовно") + "</span></div>" +
      "<div><span>До сплати</span><span>" + money(st + fee) + "</span></div>";
  }
  function openCheckout() {
    if (!slots(0).some(function (s) { return s.ok; })) O.date = 1;
    form.hidden = false; $("#coDone").hidden = true; err.textContent = "";
    renderCo(); openLayer(co);
  }
  cZone.addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c) return; O.zone = c.dataset.v; renderCo(); });
  cDate.addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c) return; O.date = +c.dataset.v; renderCo(); });
  cTime.addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c || c.disabled) return; O.time = c.dataset.v; err.textContent = ""; renderCo(); });
  cPay.addEventListener("click", function (e) { var c = e.target.closest(".chip"); if (!c) return; O.pay = c.dataset.v; renderCo(); });
  $("#cOther").addEventListener("change", function (e) { $("#recipient").hidden = !e.target.checked; });
  $("#cCard").addEventListener("input", function (e) { $("#cardLeft").textContent = 200 - e.target.value.length; });
  function phoneMask(inp) {
    inp.addEventListener("focus", function () { if (!inp.value) inp.value = "+380 "; });
    inp.addEventListener("input", function () {
      var dg = inp.value.replace(/\D/g, "");
      if (dg.indexOf("380") !== 0) dg = "380" + dg.replace(/^0+/, "").replace(/^380/, "");
      dg = dg.slice(0, 12);
      inp.value = "+" + [dg.slice(0, 3), dg.slice(3, 5), dg.slice(5, 8), dg.slice(8, 10), dg.slice(10, 12)].filter(Boolean).join(" ");
      inp.classList.remove("is-bad");
    });
  }
  phoneMask($("#cPhone")); phoneMask($("#rPhone"));
  $$("#coForm input").forEach(function (i) { i.addEventListener("input", function () { i.classList.remove("is-bad"); }); });

  function send(text, payload) {
    if (C.orderEndpoint) return fetch(C.orderEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).then(function (r) { if (!r.ok) throw new Error(r.status); });
    if (C.telegramBotToken && C.telegramChatId) {
      return fetch("https://api.telegram.org/bot" + C.telegramBotToken + "/sendMessage", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: C.telegramChatId, text: text, parse_mode: "HTML" })
      }).then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw new Error(j.description); });
    }
    return new Promise(function (res) { setTimeout(res, 800); }); // демо-режим
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = [], v = function (id) { return $(id).value.trim(); }, mark = function (id) { $(id).classList.add("is-bad"); };
    if (!cart.length) bad.push("букет");
    if (v("#cName").length < 2) { bad.push("ім'я"); mark("#cName"); }
    if (v("#cPhone").replace(/\D/g, "").length !== 12) { bad.push("телефон"); mark("#cPhone"); }
    var other = $("#cOther").checked;
    if (other && v("#rPhone").replace(/\D/g, "").length !== 12) { bad.push("телефон отримувача"); mark("#rPhone"); }
    if (O.zone !== "pickup" && v("#cAddr").length < 5) { bad.push("адресу"); mark("#cAddr"); }
    if (!O.time) bad.push("час доставки");
    if (bad.length) { err.textContent = "Будь ласка, вкажіть " + bad.join(", ") + "."; return; }

    var zone = byId(D.zones, O.zone), fee = zoneFee(O.zone), st = subtotal(), dt = dates[O.date];
    var when = (O.date === 0 ? "сьогодні" : O.date === 1 ? "завтра" : "") + (O.date < 2 ? ", " : "") + dt.getDate() + " " + MONTHS[dt.getMonth()] + ", " + O.time;
    var payload = {
      items: cart.map(function (i) { return { name: i.name, desc: i.desc, qty: i.qty, price: i.price }; }),
      customer: { name: v("#cName"), phone: v("#cPhone") },
      recipient: other ? { name: v("#rName"), phone: v("#rPhone") } : null,
      zone: zone.name, address: O.zone === "pickup" ? "самовивіз" : v("#cAddr"), when: when,
      card: v("#cCard"), anonymous: $("#cAnon").checked, pay: byId(PAY, O.pay).name, delivery: fee, total: st + fee
    };
    var text = "💐 <b>Нове замовлення з сайту</b>\n\n" +
      payload.items.map(function (i) { return "• " + esc(i.name) + (i.qty > 1 ? " × " + i.qty : "") + " — " + money(i.price * i.qty) + (i.name === "Ваш букет" ? "\n   " + esc(i.desc) : ""); }).join("\n") +
      "\n\n🚚 " + esc(payload.zone) + (fee ? " (" + fee + " ₴)" : "") + "\n📍 " + esc(payload.address) + "\n🕐 " + esc(when) +
      "\n\n👤 " + esc(payload.customer.name) + ", " + esc(payload.customer.phone) +
      (payload.recipient ? "\n🎁 Отримувач: " + esc(payload.recipient.name || "—") + ", " + esc(payload.recipient.phone) : "") +
      (payload.card ? "\n✉️ Листівка: «" + esc(payload.card) + "»" : "") + (payload.anonymous ? "\n🤫 Анонімно" : "") +
      "\n💳 " + esc(payload.pay) + "\n\n<b>Разом: " + money(payload.total) + "</b>";

    var btn = $("#coSubmit"); btn.disabled = true; btn.textContent = "Надсилаємо…"; err.textContent = "";
    send(text, payload).then(function () {
      $("#doneText").textContent = payload.customer.name + ", дякуємо! " + (O.zone === "pickup" ? "Букет чекатиме на вас " : "Привеземо ") + when + ". Флорист напише вам протягом 10 хвилин і надішле фото букета перед відправкою.";
      form.hidden = true; $("#coDone").hidden = false;
      cart = []; saveCart(); form.reset(); $("#recipient").hidden = true; $("#cardLeft").textContent = 200; O.time = null;
    }).catch(function () {
      err.textContent = "Не вдалося надіслати. Зателефонуйте нам: " + C.phone;
    }).then(function () { btn.disabled = false; btn.textContent = "Замовити"; });
  });
})();
