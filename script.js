/* =========================================================
   Ashten Smith — Portfolio interactions
   ========================================================= */
(function () {
  'use strict';

  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Nav: shadow on scroll ---- */
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile menu toggle ---- */
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('.nav__links a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---- Active nav link on scroll ---- */
  const sections = ['work', 'about', 'process', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const navLinks = new Map();
  nav.querySelectorAll('.nav__links a').forEach((a) => {
    const id = a.getAttribute('href').replace('#', '');
    navLinks.set(id, a);
  });

  if ('IntersectionObserver' in window && sections.length) {
    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((a) => a.classList.remove('is-active'));
            const active = navLinks.get(entry.target.id);
            if (active) active.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => spyObserver.observe(s));
  }

  /* ---- Count-up stats ---- */
  const counters = document.querySelectorAll('.stat__num[data-count]');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (prefersReduced) { el.textContent = target + suffix; return; }
    const duration = 1200;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (counters.length && 'IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => countObserver.observe(c));
  }

  /* ---- Easter-egg hunt ---- */
  let closeSpecsView = null; // assigned by the glasses section below
  const EGG_TOTAL = 3;
  const eggToast = document.getElementById('eggToast');
  const eggCountEl = document.getElementById('eggCount');
  const prizeModal = document.getElementById('prizeModal');
  const prizeClose = document.getElementById('prizeClose');
  const eggIntro = document.getElementById('eggIntro');
  const eggIntroClose = document.getElementById('eggIntroClose');
  let eggsFound;
  try { eggsFound = new Set(JSON.parse(sessionStorage.getItem('eggsFound') || '[]')); }
  catch (e) { eggsFound = new Set(); }
  let eggToastTimer = null;

  const showEggToast = (count) => {
    if (!eggToast) return;
    if (eggCountEl) eggCountEl.textContent = count + ' of ' + EGG_TOTAL;
    eggToast.hidden = false;
    window.requestAnimationFrame(() => eggToast.classList.add('is-on'));
    window.clearTimeout(eggToastTimer);
    eggToastTimer = window.setTimeout(() => {
      eggToast.classList.remove('is-on');
      window.setTimeout(() => { eggToast.hidden = true; }, 400);
    }, 3600);
  };

  const showPrize = () => {
    if (!prizeModal) return;
    prizeModal.hidden = false;
    window.requestAnimationFrame(() => prizeModal.classList.add('is-on'));
    document.body.classList.add('specs-open');
    if (prizeClose) prizeClose.focus();
  };
  const hidePrize = () => {
    if (!prizeModal) return;
    prizeModal.classList.remove('is-on');
    document.body.classList.remove('specs-open');
    if (prefersReduced) { prizeModal.hidden = true; }
    else { window.setTimeout(() => { prizeModal.hidden = true; }, 420); }
  };

  const showEggIntro = () => {
    if (!eggIntro) { showEggToast(1); return; }
    eggIntro.hidden = false;
    window.requestAnimationFrame(() => eggIntro.classList.add('is-on'));
    document.body.classList.add('specs-open');
    if (eggIntroClose) eggIntroClose.focus();
  };
  const hideEggIntro = () => {
    if (!eggIntro) return;
    eggIntro.classList.remove('is-on');
    document.body.classList.remove('specs-open');
    if (prefersReduced) { eggIntro.hidden = true; }
    else { window.setTimeout(() => { eggIntro.hidden = true; }, 420); }
  };

  function markEgg(id) {
    if (eggsFound.has(id)) return;
    eggsFound.add(id);
    try { sessionStorage.setItem('eggsFound', JSON.stringify([...eggsFound])); } catch (e) { /* ignore */ }
    const count = eggsFound.size;

    if (count === 1) {
      // First find: a short explanatory modal so they understand the hunt.
      // If the glasses overlay is mid-experience, let it play, then hand off.
      if (specsView && !specsView.hidden) {
        window.setTimeout(() => {
          if (typeof closeSpecsView === 'function') closeSpecsView();
          window.setTimeout(showEggIntro, 520);
        }, 950);
      } else {
        showEggIntro();
      }
      return;
    }

    showEggToast(count);
    if (count >= EGG_TOTAL) {
      // let the "3 of 3" toast land, close any open overlay, then celebrate
      window.setTimeout(() => {
        if (typeof closeSpecsView === 'function') closeSpecsView();
        window.setTimeout(showPrize, 650);
      }, 1100);
    }
  }

  if (prizeClose) prizeClose.addEventListener('click', hidePrize);
  if (prizeModal) prizeModal.addEventListener('click', (e) => { if (e.target === prizeModal) hidePrize(); });
  if (eggIntroClose) eggIntroClose.addEventListener('click', hideEggIntro);
  if (eggIntro) eggIntro.addEventListener('click', (e) => { if (e.target === eggIntro) hideEggIntro(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (prizeModal && !prizeModal.hidden) hidePrize();
    if (eggIntro && !eggIntro.hidden) hideEggIntro();
  });

  const flowerEgg = document.querySelector('.scrapbook');
  if (flowerEgg) {
    const findFlower = () => markEgg('flower');
    flowerEgg.addEventListener('click', findFlower);
    flowerEgg.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); findFlower(); }
    });
  }

  /* ---- Case-study lock gate ---- */
  const lockBtn = document.getElementById('lockBtn');
  const lockGate = document.getElementById('lockGate');
  const casesEl = document.querySelector('.work .cases');

  if (lockBtn && lockGate && casesEl) {
    const links = casesEl.querySelectorAll('.case__link');
    const setLinksEnabled = (on) => {
      links.forEach((l) => {
        if (on) { l.removeAttribute('tabindex'); l.removeAttribute('aria-disabled'); }
        else { l.setAttribute('tabindex', '-1'); l.setAttribute('aria-disabled', 'true'); }
      });
    };

    const lock = () => {
      casesEl.classList.add('is-locked');
      setLinksEnabled(false);
      lockGate.hidden = false;
      lockBtn.setAttribute('aria-pressed', 'false');
    };

    const unlock = (animate) => {
      casesEl.classList.remove('is-locked');
      setLinksEnabled(true);
      lockBtn.classList.add('is-open');
      lockBtn.setAttribute('aria-pressed', 'true');
      if (animate && !prefersReduced) {
        window.setTimeout(() => lockGate.classList.add('is-gone'), 620);
        window.setTimeout(() => { lockGate.hidden = true; }, 1180);
      } else {
        lockGate.classList.add('is-gone');
        lockGate.hidden = true;
      }
      try { sessionStorage.setItem('casesUnlocked', '1'); } catch (e) { /* ignore */ }
    };

    let alreadyUnlocked = false;
    try { alreadyUnlocked = sessionStorage.getItem('casesUnlocked') === '1'; } catch (e) { /* ignore */ }

    if (alreadyUnlocked) {
      setLinksEnabled(true); // cards stay active; gate stays hidden
    } else {
      lock();
      lockBtn.addEventListener('click', () => { unlock(true); markEgg('lock'); });
    }
  }

  /* ---- "Through the glasses" reveal ---- */
  const specsToggle = document.getElementById('specsToggle');
  const specsView = document.getElementById('specsView');
  const specsClose = document.getElementById('specsClose');
  const specsCoach = document.getElementById('specsCoach');

  if (specsToggle && specsView) {
    let lastFocus = null;

    const onSpecsKey = (e) => { if (e.key === 'Escape') closeSpecs(); };

    const openSpecs = () => {
      lastFocus = document.activeElement;
      specsView.hidden = false;
      // next frame so the opacity transition runs
      window.requestAnimationFrame(() => specsView.classList.add('is-on'));
      specsToggle.setAttribute('aria-pressed', 'true');
      document.body.classList.add('specs-open');
      document.addEventListener('keydown', onSpecsKey);
      if (specsCoach) specsCoach.classList.add('is-gone'); // they found it — stop nudging
      if (specsClose) specsClose.focus();
    };

    const closeSpecs = () => {
      specsView.classList.remove('is-on');
      specsToggle.setAttribute('aria-pressed', 'false');
      document.body.classList.remove('specs-open');
      document.removeEventListener('keydown', onSpecsKey);
      if (prefersReduced) { specsView.hidden = true; }
      else { window.setTimeout(() => { specsView.hidden = true; }, 900); }
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };

    specsToggle.addEventListener('click', () => {
      if (specsView.hidden) { openSpecs(); markEgg('glasses'); } else closeSpecs();
    });
    closeSpecsView = closeSpecs; // let the egg hunt dismiss the glasses before the prize
    if (specsClose) specsClose.addEventListener('click', closeSpecs);
    // click on the dimmed backdrop (outside the stage) closes
    specsView.addEventListener('click', (e) => { if (e.target === specsView) closeSpecs(); });
  }

  /* ---- Year in footer (future-proof) ---- */
  // Static "© 2026" is in the markup; no JS needed.
})();
