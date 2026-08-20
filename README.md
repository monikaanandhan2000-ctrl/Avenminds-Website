# AvenMinds — Website (Static HTML/CSS/JS)

A complete, ready-to-publish website for AvenMinds: 9 pages, mega-menu services navigation,
76 live job listings with an application form, a full FAQ, a partner/portfolio showcase,
and a contact form with an embedded map.

## What's inside

```
avenminds/
├── index.html         Home
├── services.html      All 10 service verticals + EdTech course pricing
├── industries.html    Industries served
├── products.html       Our products/platforms
├── portfolio.html      Team, why-us, partner logos, testimonials
├── blog.html            Blog & updates
├── faq.html              ~28 FAQs, grouped
├── careers.html          76 job listings, filterable, with an Apply form
├── contact.html          Contact form + embedded Google Map
├── css/style.css
├── js/main.js
└── assets/images/        Logo + partner logos
```

## 1. IMPORTANT — activate your forms before going live

The **Careers "Apply" form** and the **Contact form** both submit to:
`https://formsubmit.co/info@avenminds.com`

FormSubmit is a free service that emails form submissions straight to your inbox —
**no backend/server needed.** But you must activate it once:

1. Publish the site (or run it locally) and submit either form one time.
2. FormSubmit will send a confirmation email to **info@avenminds.com** — open it and click
   **"Activate Form."**
3. After that, every submission is emailed to you automatically.

If you'd rather use a different provider (Getform, Formspree, your own backend, etc.),
just replace the `action="https://formsubmit.co/info@avenminds.com"` value in
`careers.html` and `contact.html` with your new endpoint.

## 2. The location map

`contact.html` embeds a Google Maps iframe pointed at your address (1/101, Kavarai Street,
Latteri, K.V. Kuppam Taluk, Vellore – 632202). This uses the free, key-less Maps embed —
it will work as soon as the site is live and has internet access. If you'd like a pinned
marker with your exact rooftop coordinates instead of an address search, drop your Google
Business listing or Plus Code into the `map_query` value at the top of the contact section
and re-publish, or swap in an iframe src from Google Maps → Share → Embed a map.

## 3. Publishing the site (pick one)

**Netlify / Vercel (easiest, free):**
Drag-and-drop this whole `avenminds` folder into Netlify's "Deploy manually" screen, or run
`vercel` / `netlify deploy` from inside the folder. No build step required — it's static HTML.

**Any standard web host / cPanel:**
Upload the entire contents of this folder into your `public_html` (or equivalent) directory.
`index.html` is the homepage, so no extra configuration is needed.

**GitHub Pages:**
Push this folder to a repository and enable Pages on the `main` branch — the site will be
live at `https://yourusername.github.io/reponame/`.

## 4. Before you launch — a short checklist

- [ ] Activate both forms (see step 1)
- [ ] Swap the placeholder team photos on `portfolio.html` for real headshots
      (replace the `.team-photo` initials blocks with `<img>` tags)
- [ ] Connect your real social media links in the footer (`href="#"` placeholders)
- [ ] Point a custom domain (e.g. avenminds.com) at wherever you deploy
- [ ] Review job listings on `careers.html` and edit/remove any that are no longer open
- [ ] Add Google Analytics / Meta Pixel if you plan to run ad campaigns (paste the snippet
      right before `</head>` in each page, or centralize it by including a shared script tag)

## 5. Editing content

Every page is plain HTML — search for the text you want to change and edit directly.
Colours, fonts and spacing all live in `css/style.css` under `:root` at the top of the file
if you want to adjust the palette later. Shared interactions (mobile menu, FAQ accordion,
scroll reveal, job filters, apply modal) live in `js/main.js` and inline scripts at the
bottom of `careers.html`.

---
Built for **AvenMinds** — The Next-Gen Transformation Partner.
