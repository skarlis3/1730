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

## Mobile navigation (`js/nav.js`)

Mobile-only, below 880px, and built as progressive enhancement:

- The top nav's five course areas are **read from the existing `.topnav`** to
  build a fixed bottom bar. There is no second list of links to keep in sync —
  edit the top nav and the bottom bar follows.
- The section sidebar becomes a left drawer with a sticky close button that
  stays reachable however far you scroll.
- All drawer styling is scoped to `.has-js`, which `nav.js` adds on run. With
  JavaScript off, the sidebar stays inline and the top nav keeps working.

Nav links to pages that don't exist yet carry `data-wip`; that greys them in
the bottom bar so they read as "not yet" rather than as a dead link. Drop the
attribute when the page lands.

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
