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
| `js/theme.js` | Theme toggle. Follows the OS by default; only writes `data-theme` on an explicit override, and remembers it |
| `js/nav.js` | Mobile navigation (≤880px): builds the bottom bar from the existing top nav, and turns the section sidebar into a drawer. Progressive enhancement — drawer styles are scoped to `.has-js` |
| `CNAME` | Custom domain for GitHub Pages |
| `LICENSE` | CC Attribution 4.0 |

## Reusable base

This is intended as the base for the other lit courses — Children's Lit
(ENGL 2640) and Fanfiction (ENGL 2855), both winter — rather than inheriting
from the first-year writing sites, whose needs are different. Changing course
should mean swapping the token block, not rewriting components.

## Still to do

- Remaining pages (readings, assignments, calendar, reference)
- Real nav targets — those four links point at `#main` and carry `data-wip`,
  which greys them out in the mobile bottom bar so they don't read as dead
  ends. Remove the attribute as each page lands.
- Component set beyond card / note / reading-entry / lens
- Decide whether tags become real filter links or stay descriptive
- Confirm where "Lunch and Other Obscenities" should be linked from
  (epub metadata points to the author's own site and LiveJournal, not AO3)
