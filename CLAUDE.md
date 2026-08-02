# 1730 Site Repo

Course site for ENGL 1730 — Contemporary American Literature, Macomb
Community College. See `work-with-claude-code/classes/ENGL-1730/CLAUDE.md`
for full course context (term, readings, assignments, planning docs).

**This repo is the source of truth for the site.** Planning and drafting
happen in `work-with-claude-code/classes/ENGL-1730/`; site files live here.
A staging copy previously existed at `classes/ENGL-1730/site/` — it was
removed on 2026-08-02 and should not be recreated.

- **Remote:** `git@github.com-work:skarlis3/1730.git`. The `-work` SSH alias is
  the `skarlis3` account; plain `github.com` authenticates as **sarahlizz3**
  on this machine and will be rejected.
- **Deployed:** GitHub Pages, custom domain `1730.skarlis.org` — live and
  serving as of 2026-08-02. `skarlis3.github.io/1730/` redirects to it.
  **The live site is the last *pushed* commit.** Local edits change nothing
  students see until they're committed and pushed.
- **License:** CC-BY-4.0.

**Test live, not locally.** The class doesn't run until Fall 2026 and no
students have the address, so there's nothing to break by pushing a
half-finished state. Sarah's preference is to push and check the real site.
Local file:// checks are for a fast first look only — they miss anything to
do with deployment, and a local fix that hasn't been pushed looks exactly
like a fix that didn't work (this happened on 2026-08-02).

## Two design rules — do not break these

Stated at the top of `css/style.css` and in `README.md`, repeated here
because they're the constraints most likely to be violated by a well-meaning
edit:

1. **No hard rules.** Separate things with surface-colour value shifts,
   spacing, or gradient fades — never a high-contrast line. If a divider
   seems necessary, change the surface or add space instead. Gradient edges
   are fine.

2. **Nothing that isn't clickable may look clickable.** The card/tag/pin
   vocabulary is borrowed from where students already read, but it must never
   imply a control that doesn't exist. No reaction rows, no vote arrows, no
   button-shaped chips. Tags are plain text, the way AO3 renders them.

## How the CSS is organized

Tokens at the top of `style.css`. **Light is the base; dark redefines token
values only.** Components style through tokens and never inside the dark
media query — so a new course palette should be a token swap, nothing else.
That matters: this site is the intended base for ENGL 2640 (Children's Lit)
and ENGL 2855 (Fanfiction), *not* the first-year writing sites.

Accents run green → blue → violet in spectrum order: `--accent` green
(links, current nav), `--accent-3` blue (notes, callouts), `--accent-2`
violet (tags, lens numerals), plus `--grad` for gradient strips.

## Navigation — one source of truth (`js/site-nav.js`)

**To add a page, edit `js/site-nav.js` and nothing else.** There is no nav
markup in any `.html` file.

`site-nav.js` holds the whole site map: the course card, the five areas, and
each area's sidebar groups. `js/nav.js` reads it and draws all four places
navigation appears — top bar, sidebar, phone bottom bar, phone drawer. Because
they share one list, they cannot drift apart.

- **Adding a page:** flip `built: false` to `true` and set the real `href`.
- **Adding an area:** add an entry to `areas`, then put `data-area="<id>"` on
  the `<body>` of its pages.
- **Which page am I on:** `<body data-area="…" data-page="…">`. Declared, not
  guessed from the URL — on GitHub Pages `/` and `/index.html` are the same
  page under two names.

Anything with `built: false` renders as **plain text, never a link**, in all
four navs. Two rules force this: a link announced as "Readings" that goes to
the top of the current page misstates itself (WCAG 2.4.4), and design rule 2
says nothing non-clickable may look clickable. `js/footer.js` follows the same
rule for its Quick Links.

**This is no longer progressive enhancement.** Navigation is drawn by
JavaScript, so with scripting off there is none — the page's own content still
renders and a `<noscript>` line offers the way home. That was a deliberate
trade on 2026-08-02 for having a single source of truth. If you ever need
no-JS nav back, the cost is a second copy in every HTML file.

**Anything `nav.js` injects must be hidden by default in the CSS.** It builds
the hamburger, the drawer header, and the bottom bar at every screen width —
it doesn't check the breakpoint. So each needs a `display: none` outside the
media query and a `display` value back inside it, or it shows up on a laptop.
This bit once (2026-08-02). The `.has-js` prefix inside the breakpoint is what
wins the specificity fight — keep it. The same applies to `.frame`: its
two-column rule is `.has-js` scoped, so every responsive override of it needs
the prefix too.

The scrim is the exception: it's hidden via the `hidden` attribute, which JS
toggles. Do **not** give it a `display` value, or the media-query rule will
outrank `hidden` and leave an invisible full-page layer eating every click.

### The drawer is a modal, and `inert` is what makes it one

While the drawer is open, `nav.js` puts `inert` on the top bar, `main`, the
bottom bar and the footer. That removes them from the tab order *and* the
accessibility tree together, so nobody can read through the drawer into the
page behind it.

Do **not** replace this with `role="dialog"` + `aria-modal`. The drawer
element is a `<nav>`, which has to stay a navigation landmark on desktop where
there is no drawer, and `dialog` is not a permitted role override for it —
that combination is invalid ARIA and axe flags it. `inert` is the stronger
guarantee anyway. Order matters in the close path: un-inert **before**
restoring focus, because an inert element can't take it.

## Footer (`js/footer.js`)

Structure and wording mirror the first-year-writing sites (1181 / 1170 / 1190)
so the whole set reads as one instructor's work. Wording lives in `site-nav.js`
under `footer`. Two deliberate departures from the FYW version: the `<hr>`
under the brand is a gradient fade here (design rule 1), and Quick Links are
generated from the site map rather than hand-listed.

**Anything `nav.js` injects must be hidden by default in the CSS.** The script
builds the hamburger, the drawer header, and the bottom bar into the page at
every screen width — it doesn't check the breakpoint. So each one needs a
`display: none` outside the media query and a `display` value back inside it,
or it shows up on a laptop. This bit once (2026-08-02: hamburger and a stray
"In this section / Close" header on desktop). The `.has-js` prefix inside the
breakpoint is what wins the specificity fight — keep it.

The scrim is the exception: it's hidden via the `hidden` attribute, which JS
toggles. Do **not** give it a `display` value, or the media-query rule will
outrank `hidden` and leave an invisible full-page layer eating every click.

## Accessibility

WCAG AA minimum, AAA contrast targeted (7:1 normal text). `--ink-2` is chosen
to stay AAA on `--ground`. Interactive targets are 44px minimum on mobile.
Check every text-on-background pairing in **both** themes when adding tokens.

## Change logging

Changes to this repo get logged in
`work-with-claude-code/classes/ENGL-1730/changelog/YYYY-MM-DD.html`, with a
row added to that folder's `index.html`. The log records *why* something
changed — the outside cause — not just what the diff shows.
