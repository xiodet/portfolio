(function () {
  var D = window.DATA;
  // always open at the top: drop a leftover #hash and the browser's restored scroll
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  window.scrollTo(0, 0);
  // in-page links scroll smoothly without writing #hash into the address bar
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href");
    if (id === "#") return;
    var el = id === "#top" ? document.body : document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  var f = new URLSearchParams(location.search).get("f");
  if (f === "2" || f === "3") document.documentElement.setAttribute("data-font", f);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var fmt = function (n) { return n.toLocaleString("uk-UA").replace(/ /g, " ") + " ₴"; };
  var durTxt = function (m) {
    if (!m) return "";
    var h = Math.floor(m / 60), r = m % 60;
    return (h ? h + " год" : "") + (h && r ? " " : "") + (r ? r + " хв" : "");
  };
  var pick = function (v, i) { return Array.isArray(v) ? v[i] : v; };

  // hero video: vertical file for phones, landscape crop for wider screens
  var vid = $("#heroVideo");
  if (vid) {
    var mob = window.matchMedia("(max-width: 680px)").matches;
    if (mob) vid.poster = vid.getAttribute("data-pm");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) {
      vid.src = vid.getAttribute(mob ? "data-m" : "data-d");
      var p = vid.play(); if (p && p.catch) p.catch(function () {});
    }
  }

  // phones: lock the hero to a fixed pixel height. In-app browsers (Google, Instagram) resize the
  // viewport when their toolbars hide, so any vh/svh/lvh hero jumps while you scroll.
  // Height = full screen (so the next band never peeks in), text sits right above the first visible fold.
  var heroEl = $(".hero"), heroIn = $(".hero__in"), heroW = 0;
  function sizeHero() {
    if (!heroEl || window.innerWidth === heroW) return;
    heroW = window.innerWidth;
    if (!window.matchMedia("(max-width: 680px)").matches) {
      heroEl.style.minHeight = heroEl.style.paddingTop = "";
      return;
    }
    var vis = window.innerHeight, full = Math.max(vis, screen.height || 0);
    heroEl.style.minHeight = full + "px";
    heroEl.style.paddingTop = Math.max(110, vis - heroIn.offsetHeight - 40) + "px";
  }
  sizeHero();
  window.addEventListener("resize", sizeHero);
  if (document.fonts) document.fonts.ready.then(function () { heroW = 0; sizeHero(); });

  // lets iOS apply :active (gold flash on tap)
  document.addEventListener("touchstart", function () {}, { passive: true });

  // booking links
  document.querySelectorAll(".js-book, .js-book-tab").forEach(function (a) { a.href = D.bookingUrl; });
  var dlg = $("#book"), frame = $("#bookFrame"), loading = $("#bookLoading");
  frame.addEventListener("load", function () { if (frame.src) loading.classList.add("hide"); });
  function openBook(e) {
    if (!dlg || typeof dlg.showModal !== "function") return;
    e.preventDefault();
    if (!frame.src) frame.src = D.bookingUrl;
    dlg.showModal();
    document.documentElement.classList.add("lock");
  }
  document.querySelectorAll(".js-book").forEach(function (a) { a.addEventListener("click", openBook); });
  $("#bookClose").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("close", function () { document.documentElement.classList.remove("lock"); });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });

  // level tabs
  var level = 1;
  var levelsEl = $("#levels");
  D.levels.forEach(function (l, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.textContent = l.name;
    b.addEventListener("click", function () { setLevel(i); });
    levelsEl.appendChild(b);
  });
  var pill = document.createElement("span");
  pill.className = "levels__pill";
  levelsEl.appendChild(pill);

  // menu
  var menu = $("#menu");
  D.categories.forEach(function (c) {
    var col = document.createElement("div");
    col.className = "menu__cat reveal";
    col.innerHTML = "<h3>" + c.name + "</h3>";
    var ul = document.createElement("ul");
    D.services.filter(function (s) { return s.cat === c.id; }).forEach(function (s) {
      var li = document.createElement("li");
      li.className = "row";
      li._s = s;
      li.innerHTML =
        '<div class="row__name"><span>' + s.name + (s.hit ? ' <em class="hit">хіт</em>' : "") + "</span>" +
        '<small class="row__meta"></small></div><span class="row__dots"></span><b class="row__price">' + odoHTML(s.price) + '<span class="row__na">з ТОП барбера</span></b>';
      ul.appendChild(li);
    });
    col.appendChild(ul);
    menu.appendChild(col);
  });

  // odometer: fixed number of digit columns per service, leading ones collapse
  function odoHTML(prices) {
    var max = Math.max.apply(null, prices.filter(function (x) { return x != null; }));
    var n = String(max).length, h = '<span class="odo" aria-hidden="true">';
    for (var k = 0; k < n; k++) {
      if (k > 0 && (n - k) % 3 === 0) h += '<span class="odo__sep">&nbsp;</span>';
      h += '<span class="odo__d"><span class="odo__col">';
      for (var d = 0; d <= 9; d++) h += "<span>" + d + "</span>";
      h += "</span></span>";
    }
    return h + '<span class="odo__cur">&nbsp;₴</span></span><span class="sr-only"></span>';
  }
  function setOdo(li, p) {
    var odo = li.querySelector(".odo"), cols = odo.querySelectorAll(".odo__d"), seps = odo.querySelectorAll(".odo__sep");
    li.querySelector(".sr-only").textContent = p == null ? "" : fmt(p);
    if (p == null) return;
    var str = String(p), n = cols.length, pad = n - str.length;
    cols.forEach(function (c, k) {
      var on = k >= pad, digit = on ? +str[k - pad] : 0;
      c.classList.toggle("off", !on);
      c.firstChild.style.transitionDelay = (k * 0.06) + "s";
      c.firstChild.style.transform = "translateY(" + (-digit * 10) + "%)";
    });
    // separator shows only when the digit before it is visible
    seps.forEach(function (sp) { sp.classList.toggle("off", sp.previousElementSibling.classList.contains("off")); });
  }

  function setLevel(i) {
    level = i;
    levelsEl.querySelectorAll("button").forEach(function (b, k) {
      b.classList.toggle("on", k === i);
      b.setAttribute("aria-selected", k === i);
    });
    var on = levelsEl.querySelectorAll("button")[i];
    pill.style.width = on.offsetWidth + "px";
    pill.style.transform = "translateX(" + (on.offsetLeft - 4) + "px)";
    $("#levelNote").textContent = D.levels[i].note;
    menu.querySelectorAll(".row").forEach(function (li) {
      var s = li._s, p = s.price[i], d = pick(s.dur, i);
      var meta = [durTxt(d), s.note].filter(Boolean).join(" · ");
      li.querySelector(".row__meta").textContent = meta;
      var pr = li.querySelector(".row__price");
      li.classList.toggle("off", p == null);
      setOdo(li, p);
    });
  }
  setLevel(1);
  window.addEventListener("resize", function () { setLevel(level); });
  if (document.fonts) document.fonts.ready.then(function () { setLevel(level); });

  // team
  var grid = $("#teamGrid");
  D.barbers.forEach(function (b) {
    var el = document.createElement("article");
    el.className = "card reveal" + (b.small ? " card--small" : "");
    el.innerHTML =
      '<div class="card__photo"><img src="' + b.photo + '" alt="' + b.name + ', ' + D.levels[b.level].name.toLowerCase() + '"' + (b.small ? "" : ' loading="lazy"') + '></div>' +
      '<div class="card__body">' +
        '<p class="card__lvl">' + D.levels[b.level].name + "</p>" +
        "<h3>" + b.name + "</h3>" +
        '<p class="card__rate"><span class="stars">★★★★★</span> ' + b.reviews + " " + plural(b.reviews) + "</p>" +
        (b.english ? '<p class="lang"><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2.2 2.2 2.2 12.8 0 15M10 2.5c-2.2 2.2-2.2 12.8 0 15"/></svg>Speaks English</p>' : "") +
        '<a class="btn btn--line" href="' + D.bookingUrl + '" target="_blank" rel="noopener">Записатися</a>' +
      "</div>";
    grid.appendChild(el);
  });
  function plural(n) {
    var a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return "відгук";
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return "відгуки";
    return "відгуків";
  }

  // nav
  var nav = $("#nav"), burger = $("#burger");
  burger.addEventListener("click", function () {
    var o = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", o);
  });
  document.querySelectorAll("#navLinks a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); burger.setAttribute("aria-expanded", false); });
  });
  var sticky = $("#sticky"), contacts = $("#contacts"), heroH = $(".hero").offsetHeight;
  window.addEventListener("resize", function () { heroH = $(".hero").offsetHeight; });
  var ticking = false, hero = $(".hero");
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  function update() {
    ticking = false;
    var y = window.scrollY;
    nav.classList.toggle("scrolled", y > 10);
    nav.classList.toggle("on-dark", y < heroH - 70);
    var nearEnd = y + window.innerHeight * 0.6 > contactsTop;
    sticky.classList.toggle("show", y > 500 && !nearEnd);
  }
  var contactsTop = 0;
  function measure() { contactsTop = contacts.offsetTop; heroH = hero.offsetHeight; }
  window.addEventListener("load", measure);
  window.addEventListener("resize", measure);
  measure();
  window.addEventListener("scroll", onScroll, { passive: true });
  update();
  // pause hero loops when it is off-screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) {
      var on = es[0].isIntersecting;
      hero.classList.toggle("paused", !on);
      if (vid && vid.src) { if (on) { var pp = vid.play(); if (pp && pp.catch) pp.catch(function () {}); } else vid.pause(); }
    }).observe(hero);
  }

  // count-up numbers
  function countUp(el) {
    var t = el.getAttribute("data-count"), dec = t.indexOf(".") > -1, to = parseFloat(t), t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min((ts - t0) / 1400, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = dec ? (to * e).toFixed(1) : Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
    }, { threshold: .6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { cio.observe(el); });
  }

  // icons: normalise path lengths so strokes can "draw" in
  document.querySelectorAll(".ico *").forEach(function (el) {
    if (el.tagName !== "g" && !el.classList.contains("f")) el.setAttribute("pathLength", "1");
  });

  // reveal
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  } else els.forEach(function (e) { e.classList.add("in"); });
})();
