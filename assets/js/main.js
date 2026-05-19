/* AHK / 34devs — main.js
   Minimal: mobile nav toggle + intersection-based reveal */

(function () {
  'use strict';

  /* ----- Mobile nav toggle ----- */
  const toggle = document.querySelector('[data-nav-toggle]');
  const wrap = document.querySelector('[data-nav-wrap]');

  if (toggle && wrap) {
    toggle.addEventListener('click', () => {
      const open = wrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    wrap.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        if (wrap.classList.contains('is-open')) {
          wrap.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ----- Reveal on scroll ----- */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = document.querySelectorAll('.reveal');

  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '120px 0px 120px 0px', threshold: 0.01 }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ----- Active nav highlight (current page) ----- */
  const path = (location.pathname.replace(/\/$/, '') || '/');
  document.querySelectorAll('.site-nav a').forEach((a) => {
    const raw = a.getAttribute('href') || '';
    const href = raw.replace(/\/$/, '') || '/';
    if (href === path || (href !== '/' && path.startsWith(href))) {
      a.classList.add('is-active');
    }
  });
})();
