# ENGL 1730 — Accessibility Audit

**Date:** 2 August 2026
**Standard:** WCAG 2.2 AA required, AAA contrast targeted (7:1 normal, 4.5:1 large)
**Scope:** `index.html`, `404.html`, `css/style.css`, `js/nav.js`, `js/theme.js` — the whole site as it stands
**Method:** contrast computed from the token values in both themes (not eyeballed); markup and script read for semantics, keyboard behaviour, and ARIA

## Summary

No AA failures remain. One real failure was found and fixed: the "not yet
built" items in the mobile bottom bar sat at 2.0:1. Two robustness fixes went
in alongside it. Ten pairings pass AA but land just under the AAA target, all
between 6.28:1 and 6.99:1 — they share one cause, and one token change would
clear most of them. Two items need a decision rather than a fix.

## Fixed in this pass

| # | Issue | Criterion | What was wrong |
|---|---|---|---|
| 1 | Bottom-bar placeholder labels unreadable | 1.4.3 Contrast (AA) | The whole `.bb-item.is-wip` sat at `opacity: .42`, dropping "Readings"/"Calendar" to **2.00:1** light, **2.40:1** dark — under AA and under even the 3:1 non-text floor. These are labels, not disabled controls, so the disabled-control exemption doesn't apply. Fade now applies only to the icon, which is decorative and `aria-hidden`; the word returns to full secondary contrast (7.5:1 / 7.8:1). |
| 2 | Focus could land under the sticky bar | 2.4.11 Focus Not Obscured (AA, new in 2.2) | Introduced today when the top bar became sticky at all widths. Tabbing to a link just below the fold scrolls it into view, and "into view" included the strip the bar occupies. `scroll-margin-top` now applies to anchors, buttons, and anything tabbable, not just `:target`. |
| 3 | List semantics silently dropped | 1.3.1 Info and Relationships (A) | `list-style: none` makes Safari + VoiceOver stop announcing a list as a list — so "list, 5 items" disappears from the reading list and all three sidebar groups. `role="list"` restored on the `ol` and the three `ul`s. |

## Needs a decision — not changed

**Placeholder links that don't go where they say.** Every unbuilt destination
points at `#main`. In the top nav that's five links reading "Readings,"
"Assignments," "Calendar," "Reference"; in the sidebar it's ten more ("How
class runs," "Late work," and so on). A link whose name promises Readings and
delivers the top of the current page is a broken promise under **2.4.4 Link
Purpose (A)**, and it's noisiest for screen-reader users, who often pull up a
list of links to navigate by.

The mobile bottom bar already solves this — `nav.js` renders unbuilt sections
as `span`s, so they aren't announced as links at all. The top nav and sidebar
don't. Three options:

1. Match the bottom bar — render unbuilt entries as plain text everywhere.
   Consistent, and it also stops `#main` landing in the URL, which is what
   made the page open pre-scrolled.
2. Keep them as links but point each at its real future URL. They'd 404 until
   the page exists, which the 404 page handles gracefully.
3. Leave it, on the grounds that these disappear as pages get built.

This is a design call about how "coming soon" should read, so it's yours.
Worth noting it resolves itself as the site fills in.

**The mobile drawer isn't announced as a modal.** Keyboard handling is already
right — focus moves in, Tab is trapped, Escape closes, focus returns to the
hamburger. But a screen-reader user browsing with a virtual cursor can still
read the page behind the open drawer, because nothing marks the background as
inert. Adding `role="dialog"` + `aria-modal="true"`, or setting `inert` on the
rest of the page while open, would close the gap. Deferred because it's a
behaviour change worth testing on a real screen reader, not just reasoning
about.

## Contrast — full results

Every pairing passes AA in both themes. Marked rows pass AA but miss the 7:1
AAA target.

### Light

| What | Size | Ratio | |
|---|---|---|---|
| Body text on page / on card | 17px | 17.17:1 / 18.55:1 | AAA |
| Links and accent text | 17px | 8.75:1 | AAA |
| Current sidebar item on wash | 14px | 7.31:1 | AAA |
| Tag `#start-here` | 12.5px | 8.95:1 | AAA |
| Secondary text (notes, bylines, nav) | 13.5–14.5px | 7.52:1 | AAA |
| Deck and section intros | 17px | 6.96:1 | AA — just under |
| Eyebrow ("START HERE · OVERVIEW") | 11px | 6.96:1 | AA — just under |
| Note label | 11px | 6.84:1 | AA — just under |
| Theme toggle label | 12.5px | 6.36:1 | AA — just under |
| Reading-form chip ("Short stories") | 10.5px | 6.36:1 | AA — just under |
| Pull-quote attribution | 12px | 6.28:1 | AA — just under |

### Dark

| What | Size | Ratio | |
|---|---|---|---|
| Body text on page / on card | 17px | 17.20:1 / 15.86:1 | AAA |
| Links and accent text | 17px | 9.80:1 | AAA |
| Deck and section intros | 17px | 8.45:1 | AAA |
| Secondary text | 13.5–14.5px | 7.80:1 | AAA |
| Reading-form chip | 10.5px | 7.10:1 | AAA |
| Pull-quote attribution | 12px | 6.99:1 | AA — 0.01 short |
| Tag / lens numeral | 11–12.5px | 6.88:1 | AA — just under |
| Note label | 11px | 6.80:1 | AA — just under |

### The one cause behind most of it

`--ink-2` in light mode is `#4e5468`, and the comment beside it in
`style.css` claims it is "still AAA on `--ground`." It is **6.96:1** — it
misses by 0.04. Because that token carries most of the site's secondary text,
that single near-miss is behind the deck, the eyebrow, and (via `--surface-2`)
the toggle and the chip.

Darkening it to roughly `#4a5064` would clear 7:1 on `--ground` and pull
several rows up with it. Small enough to be invisible; worth doing as one
change rather than patching rows individually. The comment needs correcting
either way — right now the file asserts something untrue.

The remaining strays are the violet and blue accents on dark (`--accent-2`,
`--accent-3` at ~6.8:1) and the pull-quote attribution. Those need their own
nudge; all are AA-compliant today.

## Passed, no action

| Category | Notes |
|---|---|
| Language | `lang="en"` on both pages |
| Skip link | Present on both pages, first focusable element, targets `#main` |
| Landmarks | `header`, two labelled `nav`s, `main`, `aside` — bottom bar gets its own label from `nav.js` |
| Heading order | h1 → h2 → h3 throughout, no skipped levels |
| Focus indicators | 3px `--accent` outline with 2px offset via `:focus-visible` |
| Keyboard | Everything reachable; drawer traps focus, Escape exits, focus restored |
| Theme toggle | `aria-label` updates to "Switch to light/dark theme" — the visible word alone would be ambiguous |
| Touch targets | Bottom-bar items 52px, hamburger and close 44px, drawer links 44px, sidebar and top nav 24px minimum |
| Reduced motion | `prefers-reduced-motion: reduce` disables transitions, animations, and smooth scrolling globally |
| Decorative elements | Rails, numerals, dots, and marks all `aria-hidden`; the reading list's "01"–"05" are hidden because the `ol` already numbers them |
| Link distinguishability | Body links keep the browser underline; only nav and wordmark remove it |
| Images | None — every icon is inline SVG, `aria-hidden`, with text beside it |
| Tables | None. Nothing uses `table` for layout |
| Duplicate IDs / positive tabindex / empty links / unlabelled buttons | None found |
| No-JS | Sidebar stays inline, top nav keeps working, drawer chrome stays hidden, `--top-offset` falls back to 56px |

## Not covered

Only `index.html` and `404.html` exist. The readings, assignments, calendar,
and reference pages will need their own pass — particularly the calendar, if
it embeds anything from Google, since embedded frames need titles and bring
contrast that isn't controlled by these tokens.

No testing was done with an actual screen reader, only by reading the markup
and reasoning about the accessibility tree. The drawer-modal item above is the
one most likely to behave differently in practice.
