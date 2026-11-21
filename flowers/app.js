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

  /* ---------- Квіти поштучно ---------- */
  var byId = function (arr, id) { return arr.filter(function (x) { return x.id === id; })[0]; };
  var PAL = D.palette, FL = {};
  var fgrid = $("#flowerGrid");
  D.flowers.forEach(function (f) {
    FL[f.id] = { n: f.min || 5, c: f.colors[0] };
    var card = el("article", "fcard");
    card.dataset.id = f.id;
    card.innerHTML = '<div class="fcard__img"><img src="' + f.img + '" alt="' + esc(f.name) + '" loading="lazy"></div>' +
      '<div class="fcard__body"><div class="fcard__top"><h3>' + esc(f.name) + '</h3><span class="fcard__p">' + f.price + ' ₴<small>/шт</small></span></div>' +
      '<p class="fcard__note">' + esc(f.note) + '</p>' +
      '<div class="fcard__cols">' + (f.colors.length > 1 ? f.colors.map(function (c) { return '<button type="button" class="dot" data-c="' + c + '" style="background:' + PAL[c].hex + '" aria-label="' + PAL[c].name + '" title="' + PAL[c].name + '"></button>'; }).join("") + '<span class="fcard__cn"></span>' : '<span class="fcard__cn">' + PAL[f.colors[0]].name + "</span>") + "</div>" +
      '<div class="fcard__foot"><div class="qty"><button type="button" data-d="-1" aria-label="Менше">−</button><span></span><button type="button" data-d="1" aria-label="Більше">+</button></div>' +
      '<button type="button" class="btn btn--pink fcard__add">У кошик</button></div></div>';
    fgrid.appendChild(card);
  });
  function renderFlowers() {
    $$(".fcard", fgrid).forEach(function (card) {
      var st = FL[card.dataset.id], f = byId(D.flowers, card.dataset.id);
      $(".qty span", card).textContent = st.n;
      $(".fcard__cn", card).textContent = PAL[st.c].name;
      $$(".dot", card).forEach(function (d) { d.setAttribute("aria-pressed", d.dataset.c === st.c); });
      $(".fcard__add", card).textContent = "У кошик · " + money(f.price * st.n);
    });
  }
  renderFlowers();
  fgrid.addEventListener("click", function (e) {
    var card = e.target.closest(".fcard"); if (!card) return;
    var st = FL[card.dataset.id], f = byId(D.flowers, card.dataset.id);
    var dot = e.target.closest("[data-c]"), d = e.target.closest("[data-d]");
    if (dot) st.c = dot.dataset.c;
    else if (d) st.n = Math.max(1, Math.min(101, st.n + (+d.dataset.d)));
    else if (e.target.closest(".fcard__add")) {
      var colorName = f.colors.length > 1 ? PAL[st.c].name.toLowerCase() : "";
      addToCart({ key: "f-" + f.id + "-" + st.c, name: f.name + (colorName ? ", " + colorName : ""), desc: "Поштучно, " + money(f.price) + " за шт", price: f.price, img: f.img }, st.n);
      return;
    } else return;
    renderFlowers();
  });

  /* ---------- Tabs ---------- */
  function setTab(t) {
    $$(".tab").forEach(function (b) { b.setAttribute("aria-selected", b.dataset.tab === t); });
    $("#pane-bouquets").hidden = t !== "bouquets"; $("#pane-flowers").hidden = t !== "flowers";
    $$("#pane-" + t + " .reveal").forEach(function (n) { n.classList.add("in"); });
  }
  $$(".tab").forEach(function (b) { b.addEventListener("click", function () { setTab(b.dataset.tab); }); });
  $$("[data-tab-link]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      setTab(a.dataset.tabLink);
      if (a.tagName === "BUTTON") $("#shop").scrollIntoView({ behavior: "smooth" });
    });
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
  var cart = store.get("bl_cart3") || [];
  var cartBtn = $("#cartBtn"), drawer = $("#drawer"), toastEl = $("#toast"), tT;
  function hasLoose() { return cart.some(function (i) { return i.key.indexOf("f-") === 0; }); }
  function subtotal() { return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0) + (hasLoose() ? D.floristWork : 0); }
  function count() { return cart.reduce(function (s, i) { return s + i.qty; }, 0); }
  function toast(html) { toastEl.innerHTML = html; toastEl.classList.add("on"); clearTimeout(tT); tT = setTimeout(function () { toastEl.classList.remove("on"); }, 2200); }
  function saveCart() { store.set("bl_cart3", cart); renderCart(); }
  function addToCart(item, n) {
    n = n || 1;
    var ex = cart.filter(function (i) { return i.key === item.key; })[0];
    if (ex) ex.qty += n; else { item.qty = n; cart.push(item); }
    saveCart();
    cartBtn.classList.remove("bump"); void cartBtn.offsetWidth; cartBtn.classList.add("bump");
    toast("💐 «" + esc(item.name) + "» у кошику · <b>" + money(subtotal()) + "</b>");
  }
  function thumb(i) {
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
    if (hasLoose()) body.insertAdjacentHTML("beforeend", '<div class="ci-work"><span>Збирання букета з квітів поштучно (упаковка, зелень)</span><b>' + money(D.floristWork) + "</b></div>");
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
      (hasLoose() ? "<div><span>Збирання букета</span><span>" + money(D.floristWork) + "</span></div>" : "") +
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
      payload.items.map(function (i) { return "• " + esc(i.name) + (i.qty > 1 ? " × " + i.qty : "") + " — " + money(i.price * i.qty) + ""; }).join("\n") +
      (hasLoose() ? "\n• Збирання букета — " + money(D.floristWork) : "") +
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
