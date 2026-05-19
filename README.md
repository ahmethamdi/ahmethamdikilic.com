# ahmethamdikilic.com

Personal portfolio of **Ahmet Hamdi Kilic** — Senior Shopify & E-Commerce Developer based in Korschenbroich, Germany.

Cinematic dark + lime accent design inspired by command-center / terminal aesthetics. Built as a static site with vanilla HTML, CSS and JavaScript — zero build step, fast everywhere, easy to ship.

> Live: [ahmethamdikilic.com](https://ahmethamdikilic.com) · Founder of **34devs**

---

## What this site is

A focused, conversion-aware portfolio that signals seniority to Shopify clients and hiring teams. Three pillars:

- **Custom Shopify Theme Development** — Online Store 2.0, modular sections, metafields, JSON templates, CWV-tuned Liquid.
- **Shopify App Development** — Public & custom apps, Theme App Extensions, Checkout Extensibility, Polaris admin UI, billing & webhooks.
- **Marketplace & ERP Integrations** — Shopify ↔ Plentymarkets, Shopware 5/6, Walmart. Bi-directional sync, rate-limit & retry strategy.

## Tech stack

| Layer       | Tools                                                                 |
| ----------- | --------------------------------------------------------------------- |
| Frontend    | HTML5, CSS3 (design tokens), vanilla JavaScript (ES6+)                |
| Typography  | PT Serif (display), Inter Tight (UI), JetBrains Mono (technical)      |
| Animations  | CSS keyframes, IntersectionObserver, prefers-reduced-motion aware     |
| Hosting     | Any static host — built for Vercel / Netlify / GitHub Pages / VPS     |
| i18n        | Folder-based locales: `/` (TR), `/en/`, `/de/` with `hreflang` links  |

No build step. No framework. No node_modules to ship. Just open `index.html`.

## Project structure

```
.
├── index.html               # TR homepage (default)
├── about.html               # TR — biography & timeline
├── services.html            # TR — 3 service tiers with scope/deliverable/timeline
├── work.html                # TR — projects index
├── contact.html             # TR — terminal-style contact
├── 404.html                 # TR — themed not-found
│
├── en/                      # English mirror of all pages
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   ├── work.html
│   └── contact.html
│
├── de/                      # German mirror of all pages
│   └── ...
│
├── case-studies/            # Future deep-dive case study pages
│
├── assets/
│   ├── css/styles.css       # Design tokens, components, responsive
│   ├── js/main.js           # Nav, reveal on scroll, active link
│   └── img/                 # Static images
│
├── favicon.svg
├── robots.txt
├── sitemap.xml
├── site.webmanifest
└── README.md
```

## Design system

The visual language is documented in CSS custom properties at the top of `assets/css/styles.css`:

```css
--bg:    #000000;   /* base */
--bg-1:  #060606;   /* elevated panels */
--card:  #0f0f0f;   /* cards */
--border:#252525;   /* dividers (sharp 1.5px) */
--ink:   #ffffff;   /* primary text */
--lime:  #c5ff4a;   /* single accent — CTAs, highlights */
```

Typography uses three families intentionally: a structured serif for display (authority), a tight sans for UI density, and a monospace for technical labels. Border radius is **0** everywhere (brutalist/terminal aesthetic).

## Running locally

```bash
# any static server works — Python is enough
python3 -m http.server 8000

# then open
open http://localhost:8000
```

For live reload during development, use `npx serve` or any VS Code live-server extension. No dependencies, nothing to install.

## Deploying

Because there is no build step, deploying is just copying the directory to any static host.

- **Vercel** — connect this repo, framework preset: "Other", build command: empty, output dir: `./`.
- **Netlify** — same as above. A `netlify.toml` can be added if custom headers are needed.
- **GitHub Pages** — enable Pages on `main` branch, root folder. Done.
- **VPS / S3 / Cloudflare Pages** — upload via rsync / sync. Done.

## SEO

- Per-page canonical + `hreflang` alternates for `tr`, `en`, `de`, `x-default`.
- Schema.org `Person` JSON-LD on homepage.
- OG + Twitter card meta on every page.
- `sitemap.xml` and `robots.txt` at root.
- Semantic HTML, single `<h1>` per page, descriptive alt text.

## Accessibility

- WCAG 2.2 AA color contrast on the dark theme.
- Visible focus styles (`:focus-visible` with lime outline + offset).
- Skip-to-content link on every page.
- `prefers-reduced-motion: reduce` disables all animations and reveals.
- ARIA labels on icon-only controls; navigation has `aria-expanded` state.

## Contact

- Email — [ahmethamdikilic@outlook.de](mailto:ahmethamdikilic@outlook.de)
- LinkedIn — [linkedin.com/in/ahmet-hamdi-kilic](https://www.linkedin.com/in/ahmet-hamdi-kilic)
- GitHub — [github.com/ahmethamdi](https://github.com/ahmethamdi)

---

© Ahmet Hamdi Kilic · 34devs
