# ENGL 1730 — Contemporary American Literature

Course site for ENGL 1730 at Macomb Community College. Deployed via GitHub
Pages at [1730.skarlis.org](https://1730.skarlis.org/).

Vanilla HTML, CSS, and JavaScript — no build step, no dependencies. Open
`index.html` directly in a browser to work on it.

## Design direction

**Feed / Spectrum**, chosen 2026-08-02 after comparing four directions
(kept for reference in `work-with-claude-code/classes/ENGL-1730/mockups/aesthetic-directions-v2.html`).

The site borrows the visual grammar of where contemporary reading actually
happens — cards, pinned markers, tags — rather than describing internet
literature from an academic distance. Accent runs green → blue → violet in
spectrum order.

### Two rules this build is bound by

1. **No hard rules.** Separation is done with surface-colour value shifts,
   spacing, and gradient fades — never a high-contrast line. Crisp borders
   read as interruptions and pull focus off the text. Gradient edges are
   fine; they read as movement.

2. **Nothing that isn't clickable may look clickable.** The card/tag/pin
   vocabulary is borrowed, but it must never imply a control that doesn't
   exist. No reaction rows, no vote arrows, no button-shaped tag chips.
   Tags render as plain text, the way AO3 renders them.

Both rules are also stated at the top of `css/style.css`, where they're most
likely to be read before being broken.

## Files

| Path | What it is |
|---|---|
| `index.html` | Course overview page |
| `404.html` | Not-found page |
| `css/style.css` | All styles. Tokens at the top; light is the base, dark redefines token values only |
| `js/site-nav.js` | **The site map — the only file to edit to change navigation.** Areas, sidebar groups, footer wording |
| `js/nav.js` | Draws the site map into all four navs: top bar, sidebar, phone bottom bar, phone drawer. Shouldn't need editing to add a page |
| `js/footer.js` | The shared footer. Mirrors the 1181 / 1170 / 1190 wording; Quick Links come from the site map |
| `js/theme.js` | Theme toggle. Follows the OS by default; only writes `data-theme` on an explicit override, and remembers it |
| `CNAME` | Custom domain for GitHub Pages |
| `LICENSE` | CC Attribution 4.0 |

## Adding a page

Open `js/site-nav.js`, find the entry, flip `built: false` to `true`, and give
it a real `href`. That is the whole job — the top bar, the sidebar, the phone
bottom bar, the phone drawer and the footer all update together, because they
all read that one file.

Until a page is built it renders as plain text rather than a link, everywhere.
A link announced as "Readings" that goes to the top of the page you're already
on misstates itself, and design rule 2 forbids things that look clickable and
aren't.

Navigation is drawn by JavaScript, so there is none with scripting off. That's
a deliberate trade for having one source of truth; a `<noscript>` line says so
and the page's own content still reads.

## Reusable base

This is intended as the base for the other lit courses — Children's Lit
(ENGL 2640) and Fanfiction (ENGL 2855), both winter — rather than inheriting
from the first-year writing sites, whose needs are different. Changing course
should mean swapping the token block, not rewriting components.

## Still to do

- Remaining pages (readings, assignments, calendar, reference) — each one is a
  `built: true` flip in `js/site-nav.js` once the file exists
- Screen-reader testing. The whole accessibility pass was done by measurement
  and scripted interaction; no screen reader was ever run against the site.
- Component set beyond card / note / reading-entry / lens
- Decide whether tags become real filter links or stay descriptive
- Confirm where "Lunch and Other Obscenities" should be linked from
  (epub metadata points to the author's own site and LiveJournal, not AO3)
