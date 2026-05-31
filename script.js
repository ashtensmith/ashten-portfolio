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
      lockBtn.addEventListener('click', () => unlock(true));
    }
  }

  /* ---- Year in footer (future-proof) ---- */
  // Static "© 2026" is in the markup; no JS needed.
})();
