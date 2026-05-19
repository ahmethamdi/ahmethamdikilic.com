/* AHK / 34devs — main.js v2.2
   smooth scroll · scroll-driven reveals · magnetic hover · nav · active link
   vanilla, zero deps, ~3kb gzipped
   honors prefers-reduced-motion */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================================
     1. Smooth scroll (lightweight Lenis-inspired implementation)
     Provides eased smooth-scrolling with rAF loop. Drives a CSS custom prop
     --scroll-y on <html> so other components can pin/parallax against it.
     ========================================================================= */
  const SmoothScroll = (() => {
    if (reduced) return { current: 0, target: 0 };

    let target = window.scrollY;
    let current = window.scrollY;
    const ease = 0.10;        // smoothing factor (lower = smoother)
    const threshold = 0.4;    // stop animating below this delta
    let rafId = null;
    let isScrolling = false;

    const onScroll = () => {
      target = window.scrollY;
      if (!isScrolling) loop();
    };

    const loop = () => {
      const delta = target - current;
      if (Math.abs(delta) < threshold) {
        current = target;
        isScrolling = false;
        document.documentElement.style.setProperty('--scroll-y', `${current}px`);
        return;
      }
      isScrolling = true;
      current += delta * ease;
      document.documentElement.style.setProperty('--scroll-y', `${current}px`);
      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    loop();

    return { get current() { return current; }, get target() { return target; } };
  })();

  /* =========================================================================
     2. Reveal on scroll — IntersectionObserver
     Supports word-by-word stagger via data-reveal="words" attribute.
     ========================================================================= */
  (function reveals() {
    // optional: split text into words for [data-reveal="words"]
    document.querySelectorAll('[data-reveal="words"]').forEach((el) => {
      if (el.dataset.split) return;
      const text = el.textContent.trim();
      el.innerHTML = text.split(/(\s+)/).map((token) => {
        if (/^\s+$/.test(token)) return token;
        return `<span class="word">${token}</span>`;
      }).join('');
      el.dataset.split = '1';
    });

    const items = document.querySelectorAll('.reveal, [data-reveal]');
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // stagger child words
          const words = entry.target.querySelectorAll('.word');
          words.forEach((w, i) => {
            w.style.transitionDelay = `${i * 28}ms`;
          });
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '120px 0px 120px 0px', threshold: 0.05 });
    items.forEach((el) => io.observe(el));
  })();

  /* =========================================================================
     3. Magnetic hover — lerp-based, vanilla
     Use [data-magnetic] (or [data-magnetic="strong"]) on any element.
     Element will gently follow the cursor when hovered, springs back on leave.
     ========================================================================= */
  (function magnetic() {
    if (reduced) return;
    const els = document.querySelectorAll('[data-magnetic]');
    els.forEach((el) => {
      const strength = el.dataset.magnetic === 'strong' ? 0.4 : 0.22;
      let raf = null;
      let tx = 0, ty = 0, cx = 0, cy = 0;
      let active = false;

      const loop = () => {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
          raf = requestAnimationFrame(loop);
        } else {
          raf = null;
        }
      };

      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * strength;
        ty = (e.clientY - (r.top + r.height / 2)) * strength;
        if (!raf) raf = requestAnimationFrame(loop);
      };
      const onLeave = () => {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      };
      const onEnter = () => { active = true; };

      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  })();

  /* =========================================================================
     4. Mobile nav toggle
     ========================================================================= */
  (function nav() {
    const toggle = document.querySelector('[data-nav-toggle]');
    const wrap = document.querySelector('[data-nav-wrap]');
    if (!toggle || !wrap) return;

    toggle.addEventListener('click', () => {
      const open = wrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });

    wrap.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        if (wrap.classList.contains('is-open')) {
          wrap.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });
  })();

  /* =========================================================================
     5. Active nav highlight
     ========================================================================= */
  (function activeNav() {
    const path = (location.pathname.replace(/\/$/, '') || '/');
    document.querySelectorAll('.site-nav a').forEach((a) => {
      const raw = a.getAttribute('href') || '';
      const href = raw.replace(/\/$/, '') || '/';
      if (href === path || (href !== '/' && path.startsWith(href))) {
        a.classList.add('is-active');
      }
    });
  })();

  /* =========================================================================
     6. Project card tilt + image scale on hover (subtle, GPU-friendly)
     Applied automatically to [data-tilt]
     ========================================================================= */
  (function tilt() {
    if (reduced) return;
    const els = document.querySelectorAll('[data-tilt]');
    els.forEach((el) => {
      const intensity = parseFloat(el.dataset.tilt) || 6; // deg
      let raf = null;
      let rx = 0, ry = 0, crx = 0, cry = 0;
      const loop = () => {
        crx += (rx - crx) * 0.18;
        cry += (ry - cry) * 0.18;
        el.style.setProperty('--tilt-x', `${crx}deg`);
        el.style.setProperty('--tilt-y', `${cry}deg`);
        if (Math.abs(rx - crx) > 0.05 || Math.abs(ry - cry) > 0.05) {
          raf = requestAnimationFrame(loop);
        } else { raf = null; }
      };
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry = (px - 0.5) * intensity;     // rotateY based on x
        rx = (0.5 - py) * intensity;     // rotateX based on y
        if (!raf) raf = requestAnimationFrame(loop);
      });
      el.addEventListener('mouseleave', () => {
        rx = 0; ry = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });
    });
  })();

})();
