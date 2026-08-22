# AvenMinds — Careers Site

A fully static, data-driven careers portal: search + filter across 1,440 open
roles, an individually addressable job description page for every role, a
"Refer a Candidate" form, and a 4-step "Apply Now" application wizard —
all wired to send submissions straight to **info@avenminds.com**.

## Folder structure

```
avenminds-careers/
├── index.html            Simple home page linking into Careers
├── careers.html           Main listing page — search bar, sidebar filters, pagination
├── job-detail.html        Job description template (reads ?id=J00001 from the URL)
├── apply.html              4-step application wizard (reads ?id=J00001)
├── contact.html            Minimal contact stub (referenced by nav/footer)
├── css/style.css           Full site stylesheet
├── js/
│   ├── main.js              Shared: mobile nav toggle, footer year
│   ├── careers.js           Listing page: search, filters, sort, pagination
│   ├── job-detail.js        Job detail rendering + Refer-a-Candidate form
│   └── apply.js             Application wizard: steps, education fields, validation, review, submit
├── data/jobs.json           1,440 generated job records (see below)
├── assets/images/logo.svg   Placeholder logo mark — swap for your real logo
├── scripts/generate_jobs.py Python script that generated data/jobs.json
└── README.md                 This file
```

## How the job board works

Every role lives as one JSON object in `data/jobs.json` — there is **no
database and no backend**. `careers.html` fetches this file once, then does
all searching/filtering/sorting/pagination in the browser. `job-detail.html`
and `apply.html` read the same file and pull out the one record whose `id`
matches the `?id=` query string in the URL — that's what makes every job
have its own shareable "inner page" (`job-detail.html?id=J00001`,
`apply.html?id=J00001`, etc.) without 1,440 separate HTML files to maintain.

Each job record contains: `id`, `title`, `category` / `categoryLabel`,
`location`, `mode` (Onsite / Remote / Hybrid), `experience`,
`employmentType`, `postedDaysAgo`, and a ~30-line `description` covering
About the Role, Key Responsibilities, Who You Are, Experience &
Qualification, Life at AvenMinds, and How to Apply.

### Adding, editing or removing roles
- **Quick edits** (fix a typo, change a location): open `data/jobs.json` in
  any text/code editor, find the job by its `id` or `title`, edit the
  fields, save. No build step required.
- **Bulk regeneration**: edit the role lists / locations / experience bands
  at the top of `scripts/generate_jobs.py` and re-run:
  ```
  python3 scripts/generate_jobs.py
  ```
  This regenerates `data/jobs.json` from scratch (1,440 roles across 10
  categories today — raise `VARIANTS_PER_COMBO` or add more base roles per
  category to grow that number further).

## Forms & email delivery

Both the **Refer a Candidate** form (on every job detail page) and the
**Apply Now** wizard (`apply.html`) submit via [FormSubmit](https://formsubmit.co)'s
AJAX endpoint, posting straight to:

```
info@avenminds.com
```

No server, API key or account signup is required — FormSubmit delivers the
email on first submission (the very first send to a new address asks you to
click a one-time confirmation link in your inbox; every submission after
that arrives directly). Resume files are sent as real attachments via
`multipart/form-data`.

If you later want submissions to go into your own ATS/CRM instead of plain
email, replace the `FORM_ENDPOINT` constant near the top of `js/job-detail.js`
and `js/apply.js` with your own API endpoint.

## The Apply Now wizard (`apply.html`)

4 steps, all client-side validated before moving forward:

1. **Personal & Education** — First/Last name, contact number, email,
   LinkedIn, gender, citizenship, current location, resume upload,
   portfolio link, "how did you hear about us", and a repeatable
   Education History block (1 mandatory, up to 5, each removable except
   the first).
2. **Company Questions** — work authorization, disability/accommodation,
   passport, company-policy agreement, current employment status, notice
   period, expected CTC, relocation willingness, prior application history.
3. **Terms & Conditions** — scrollable terms text with a mandatory
   checkbox that blocks progress until checked.
4. **Review & Submit** — a read-only summary of every answer with "Edit"
   links that jump back to the relevant step, then Submit. On success the
   applicant sees an "Application Completed" confirmation with a
   reference ID and a message that the recruitment team will be in touch.

## Before going live — checklist

- [ ] Swap `assets/images/logo.svg` for your real logo (PNG/SVG both work —
      update the `<img>` `src` references if you rename the file).
- [ ] Submit one test application/referral per form so FormSubmit sends the
      one-time "confirm this inbox" email to info@avenminds.com — click the
      confirmation link, then all future submissions deliver automatically.
- [ ] Build out `services.html`, `industries.html`, `products.html`,
      `portfolio.html`, `blog.html`, `faq.html` — these are linked from the
      nav/footer but weren't part of this careers-page scope.
- [ ] Re-check `data/jobs.json` locations/roles against your real current
      openings before publishing, or regenerate via `scripts/generate_jobs.py`.
- [ ] Host as static files (Netlify, Vercel, GitHub Pages, S3, or any web
      server) — nothing here needs a backend.

## Local preview

From this folder, run any static file server, e.g.:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080/careers.html`.
