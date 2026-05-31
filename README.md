# Ashten Smith — Portfolio

A single-page, zero-build portfolio for a Staff-level product designer. Dark,
high-contrast, systems-minimal aesthetic. Pure HTML/CSS/JS — deploys straight to
GitHub Pages.

## Structure
- `index.html` — all content & sections (Hero · Work · About · Process · Endorsements · Contact)
- `styles.css` — design system (colors, type, layout, responsive, animations)
- `script.js` — nav, scroll reveals, active-link spy, count-up stats

## Run locally
Just open `index.html` in a browser, or serve it:
```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Deploy to GitHub Pages
Push to a repo named `<username>.github.io` (or enable Pages on any repo → Settings → Pages → deploy from `main` / root).

## Before you publish — swap these placeholders
- **Case study metrics** in `index.html` are aligned to the target role but are
  placeholders — replace with your real numbers.
- **Case study links** (`case__link`) point to `#contact`. Link them to real
  detail pages once written (e.g. `case-studies/ai-customer-center.html`).
- **Testimonials** are generic — replace with real, attributed quotes (with permission).
- **LinkedIn URL** and **Resume PDF** link in the Contact section.
- Add a real **portrait image** and case study **hero images** in place of the CSS mockups.
