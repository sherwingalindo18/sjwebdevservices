# SJ Webdev Services — Website

A production-ready, fully responsive, multi-page static website built with **HTML5, CSS3 and vanilla JavaScript** (no frameworks, no build step). Just upload the files to any host and it works.

## Folder structure

```
/
├── index.html              Home
├── about-services.html     Services + process + FAQ
├── portfolio.html          Filterable project gallery + lightbox
├── contact.html            Contact form (EmailJS)
├── robots.txt              Search-engine crawl rules
├── sitemap.xml             Page index for search engines
│
├── css/
│   ├── style.css           Design system, layout, components
│   ├── animations.css      Scroll reveals & entrance motion
│   └── responsive.css      Tablet / mobile breakpoints
│
├── js/
│   ├── main.js             Nav, loader, reveals, counters, slider, back-to-top
│   ├── portfolio.js        Category filtering + lightbox
│   └── contact.js          Form validation + EmailJS delivery
│
├── images/
│   ├── logo-dark.png       Logo for light backgrounds (header)
│   ├── logo-light.png      Logo for dark backgrounds (footer)
│   ├── favicon-*.png       Favicons / app icons
│   └── portfolio/          12 project thumbnails (SVG — easy to replace)
│
└── assets/
    └── og-image.svg        Social-share preview image
```

## SEO — what's already built in

Every page includes: a unique `<title>` and meta description, keywords, `robots`, a canonical URL, Open Graph + Twitter Card tags, and JSON-LD structured data (Organization, Breadcrumbs, Service catalog, FAQ, ContactPage). The site also ships with `robots.txt` and `sitemap.xml`, semantic landmarks, one `<h1>` per page, descriptive `alt` text, and accessible focus states.

**Before going live**, do a find-and-replace of `https://www.sjwebdevservices.com` if your final domain differs, then submit `sitemap.xml` in Google Search Console.

## Make the contact form send email (EmailJS)

The form is wired to deliver inquiries to **sjwebdevservices@gmail.com** via EmailJS (free). Full step-by-step instructions are in the comment block at the bottom of `contact.html`. In short: create an EmailJS account, add a Gmail service + template, then paste your three IDs into the top of `js/contact.js`. Until then the form runs in demo mode (validates and shows a success message, no email sent).

## Replace portfolio projects

Each project is one `<article class="p-card">` in `portfolio.html` (and the featured six in `index.html`). Edit the `data-*` attributes (title, category, description, url, type, stack) and swap the thumbnail in `images/portfolio/`. Keep the `data-category` value matching one of the filter buttons: `business`, `restaurant`, `ecommerce`, `church`, `booking`, `custom`.

## Replace the logo

Drop your files in as `images/logo-dark.png` (used on light backgrounds) and `images/logo-light.png` (used on dark backgrounds). Dimensions are flexible — height is controlled in CSS.
