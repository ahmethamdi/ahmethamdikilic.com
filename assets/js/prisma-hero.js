/* Vanilla port of the framer-motion WordsPullUp from prisma-hero.tsx
   Splits [data-words-pull-up] text into words wrapped in <span class="word">,
   then triggers stagger via IntersectionObserver. */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Split words
  document.querySelectorAll('[data-words-pull-up]').forEach((el) => {
    if (el.dataset.split) return;
    const showAsterisk = el.hasAttribute('data-asterisk');
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.innerHTML = words.map((w, i) => {
      const isLast = i === words.length - 1;
      const star = (showAsterisk && isLast)
        ? '<span class="asterisk">*</span>'
        : '';
      return `<span class="word" style="transition-delay:${i * 80}ms">${w}${star}</span>`;
    }).join('');
    el.dataset.split = '1';
  });

  // 2. Animate in on view
  const items = document.querySelectorAll(
    '[data-words-pull-up], [data-prisma-anim]'
  );

  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach((el) => {
      el.classList.add('is-in');
      el.querySelectorAll('.word').forEach((w) => w.classList.add('is-in'));
    });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-in', 'is-anim');
      el.querySelectorAll('.word').forEach((w) => w.classList.add('is-in'));
      // for single-element anims, set delay via data-delay attr
      if (el.dataset.delay) {
        el.style.transitionDelay = `${el.dataset.delay}ms`;
      }
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

  items.forEach((el) => io.observe(el));
})();
