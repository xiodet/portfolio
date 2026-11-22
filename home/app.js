/* ===== Налаштування ===== */
// Ваш нік у Telegram без @, наприклад 'mark_sites'. Порожньо = кнопки показують підказку.
const TELEGRAM = '';
const TG_TEXT = 'Привіт! Хочу пробну версію сайту для свого закладу.';

(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* Telegram links */
  let toastEl;
  const toast = (msg) => {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.append(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove('show'), 2600);
  };
  $$('.tg-link').forEach(a => {
    if (TELEGRAM) {
      a.href = `https://t.me/${TELEGRAM}?text=${encodeURIComponent(TG_TEXT)}`;
      a.target = '_blank'; a.rel = 'noopener';
    } else {
      a.addEventListener('click', e => {
        if (a.closest('.nav') || a.closest('.hero-cta') || a.classList.contains('float-cta')) return; // ведуть до контактів
        e.preventDefault(); toast('Демо: тут відкриється чат у Telegram');
      });
    }
  });

  /* Intro */
  const start = () => requestAnimationFrame(() => document.documentElement.classList.add('loaded'));
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve()).then(start);

  /* Rotating word */
  const words = ['салону краси', 'барбершопу', 'флориста', 'нейл-студії', 'кавʼярні'];
  const rw = $('.rot-word');
  if (rw && !reduce) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % words.length;
      rw.classList.add('out');
      setTimeout(() => {
        rw.classList.remove('out'); rw.classList.add('in');
        rw.textContent = words[i];
        void rw.offsetWidth;
        rw.classList.remove('in');
      }, 420);
    }, 2600);
  }

  /* Reveal on scroll */
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .reveal-work, .scale').forEach(el => io.observe(el));

  /* Nav */
  const nav = $('#nav'); let lastY = scrollY;
  const floatBtn = $('.float-cta'); const contact = $('#contact');
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 20);
    nav.classList.toggle('hide', y > 500 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove('hide');
    lastY = y;
    const cTop = contact.getBoundingClientRect().top;
    floatBtn.classList.toggle('show', y > innerHeight * .8 && cTop > innerHeight * .9);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Hero phones: slow auto-scroll + mouse parallax */
  const autos = $$('.hero-phones .screen.auto');
  const heroPhones = $('.hero-phones');
  let heroVisible = true;
  new IntersectionObserver(([e]) => heroVisible = e.isIntersecting).observe(heroPhones);
  const autoState = autos.map((s, k) => ({ s, img: $('img', s), pos: 0, dir: 1, wait: 1200 + k * 700, speed: 26 + k * 4 }));
  if (fine && !reduce) {
    addEventListener('pointermove', e => {
      const x = (e.clientX / innerWidth - .5) * 18, y = (e.clientY / innerHeight - .5) * 14;
      heroPhones.style.setProperty('--mx', x + 'px'); heroPhones.style.setProperty('--my', y + 'px');
    }, { passive: true });
  }

  /* Interactive screens in Works: auto-scroll until touched */
  const lives = $$('.screen.live').map(s => ({ s, visible: false, pausedUntil: 0, dir: 1, acc: 0 }));
  const lio = new IntersectionObserver(es => es.forEach(e => {
    const L = lives.find(l => l.s === e.target); if (L) L.visible = e.isIntersecting;
  }), { threshold: .35 });
  lives.forEach(L => {
    lio.observe(L.s);
    const pause = () => { L.pausedUntil = performance.now() + 5000; L.s.closest('.work')?.classList.add('touched'); };
    ['pointerdown', 'wheel', 'touchstart'].forEach(ev => L.s.addEventListener(ev, pause, { passive: true }));
    // drag to scroll on desktop
    if (fine) {
      let drag = null;
      L.s.addEventListener('pointerdown', e => { drag = { y: e.clientY, top: L.s.scrollTop }; L.s.setPointerCapture(e.pointerId); L.s.style.cursor = 'grabbing'; });
      L.s.addEventListener('pointermove', e => { if (drag) { L.s.scrollTop = drag.top - (e.clientY - drag.y) * 1.4; pause(); } });
      const end = () => { drag = null; L.s.style.cursor = ''; };
      L.s.addEventListener('pointerup', end); L.s.addEventListener('pointercancel', end);
    }
  });

  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(64, now - last); last = now;
    if (!reduce) {
      if (heroVisible) autoState.forEach(a => {
        const max = a.img.offsetHeight - a.s.clientHeight;
        if (max <= 0) return;
        if (a.wait > 0) { a.wait -= dt; return; }
        a.pos += a.dir * a.speed * dt / 1000;
        if (a.pos >= max) { a.pos = max; a.dir = -1; a.wait = 1500; }
        if (a.pos <= 0) { a.pos = 0; a.dir = 1; a.wait = 1500; }
        a.img.style.transform = `translateY(${-a.pos}px)`;
      });
      lives.forEach(L => {
        if (!L.visible || now < L.pausedUntil) return;
        const max = L.s.scrollHeight - L.s.clientHeight;
        if (max <= 0) return;
        L.acc += L.dir * 34 * dt / 1000;
        if (Math.abs(L.acc) >= 1) {
          const step = Math.trunc(L.acc); L.acc -= step;
          L.s.scrollTop += step;
          if (L.s.scrollTop >= max - 1) L.dir = -1;
          if (L.s.scrollTop <= 0) L.dir = 1;
        }
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  /* Work phones: slight tilt with scroll */
  const bigPhones = $$('.phone.big');
  const tilt = () => {
    const h = innerHeight;
    bigPhones.forEach(p => {
      const r = p.getBoundingClientRect();
      const c = (r.top + r.height / 2 - h / 2) / h; // -1..1
      if (Math.abs(c) < 1.2) p.style.transform = `perspective(1200px) rotateX(${c * 8}deg) translateY(${c * 18}px)`;
    });
  };
  if (!reduce) { addEventListener('scroll', tilt, { passive: true }); tilt(); }

  /* Price counters */
  const fmt = n => n.toLocaleString('uk-UA').replace(/ /g, ' ');
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.to, t0 = performance.now(), dur = 1500;
    if (reduce) return;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), v = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(Math.round(to * v / 100) * 100);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('.count').forEach(c => cio.observe(c));

  /* Steps progress line */
  const wrap = $('.steps-wrap'), line = $('.step-line span'), steps = $$('.step');
  const stepProg = () => {
    const r = wrap.getBoundingClientRect(), h = innerHeight;
    const p = Math.max(0, Math.min(1, (h * .7 - r.top) / (r.height || 1)));
    line.style.setProperty('--p', p.toFixed(3));
    steps.forEach(s => {
      const sr = s.getBoundingClientRect();
      s.classList.toggle('on', sr.top < h * .7);
    });
  };
  addEventListener('scroll', stepProg, { passive: true }); stepProg();

  /* Magnetic buttons */
  if (fine && !reduce) $$('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * .22, y = (e.clientY - r.top - r.height / 2) * .3;
      b.style.transform = `translate(${x}px,${y}px)`;
    });
    b.addEventListener('pointerleave', () => b.style.transform = '');
  });
})();
