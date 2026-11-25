(function () {
  var D = window.DATA;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var fmt = function (n) { return n.toLocaleString("uk-UA").replace(/ /g, " ") + " ₴"; };
  var durTxt = function (m) {
    if (!m) return "";
    var h = Math.floor(m / 60), r = m % 60;
    return (h ? h + " год" : "") + (h && r ? " " : "") + (r ? r + " хв" : "");
  };
  var pick = function (v, i) { return Array.isArray(v) ? v[i] : v; };

  // booking links
  document.querySelectorAll(".js-book").forEach(function (a) { a.href = D.bookingUrl; });

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
        '<small class="row__meta"></small></div><span class="row__dots"></span><b class="row__price"></b>';
      ul.appendChild(li);
    });
    col.appendChild(ul);
    menu.appendChild(col);
  });

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
      pr.classList.remove("flip"); void pr.offsetWidth; pr.classList.add("flip");
      pr.textContent = p == null ? "з ТОП барбера" : fmt(p);
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
        (b.english ? '<p class="tag">Speaks English</p>' : "") +
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
  var sticky = $("#sticky"), contacts = $("#contacts");
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("scrolled", y > 10);
    var nearEnd = contacts.getBoundingClientRect().top < window.innerHeight * 0.6;
    sticky.classList.toggle("show", y > 500 && !nearEnd);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // reveal
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  } else els.forEach(function (e) { e.classList.add("in"); });
})();
