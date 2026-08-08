/* site-nav.js — the site map for ENGL 1730.
   ===================================================================
   THIS IS THE ONLY FILE YOU EDIT TO CHANGE NAVIGATION.

   Everything that renders navigation reads from here: the top bar, the
   sidebar, the phone's bottom bar, and the phone drawer. There is no
   second copy anywhere and no nav markup in any .html file.

   ---- To add a page -------------------------------------------------
   Find its group below and flip `built: false` to `built: true`, then
   set `href` to the real filename. That is the whole job.

   Until a page is built it renders as plain text, not a link — in every
   one of the four places navigation appears. That is deliberate: a link
   announced as "Readings" that doesn't go to Readings misstates itself
   to anyone using a screen reader, and a control that isn't clickable
   must not look clickable (see the design rules in css/style.css).

   ---- To add a whole new area ---------------------------------------
   Add an entry to `areas`. Give it an `id`, a `label`, an `href`, and
   its own `groups` for the sidebar. Then put `data-area="<id>"` on the
   <body> of every page belonging to it.

   ---- How a page says where it is -----------------------------------
   <body data-area="course" data-page="overview">
        `data-area` picks which top-nav item is current and which
        sidebar to draw. `data-page` picks the current sidebar item.
   =================================================================== */
(function () {
  "use strict";

  window.SITE = {

    /* The card at the top of the sidebar. Course-wide, not per-page. */
    course: {
      tile:  "1730",
      code:  "ENGL 1730",
      name:  "Contemporary American Literature",
      meta:  "Macomb CC · Fall 2026 · Mon evenings",
      stats: ["new course", "16 wks"]
    },

    /* The site footer. Wording mirrors the first-year-writing sites
       (1181 / 1170 / 1190) so the whole set reads as one instructor's
       work. Quick Links are generated from `areas` below — there is no
       separate list to keep in step.

       Note: the FYW footers put an <hr> under the brand. This site's
       first design rule forbids hard rules, so the same separation is
       done with a gradient fade instead. Same reading, no line. */
    footer: {
      brand: "ENGL 1730 Class Website",
      license:
        "ENGL 1730 website and its individual pages, unless otherwise " +
        "noted, are created by Sarah Karlis and are licensed under a ",
      licenseLink: {
        label: "Creative Commons Attribution 4.0 International License",
        href:  "https://creativecommons.org/licenses/by/4.0/"
      },
      ai:
        "AI tools were used in the design and coding of this site and " +
        "may have been used for proofreading, brainstorming, or refining " +
        "course content. ",
      /* "Learn more." points at the Generative AI policy page. It becomes
         a link automatically once that page's `built` flag flips below. */
      aiPolicyRef: "ai",
      aiPolicyLabel: "Learn more.",
      external: [
        { label: "Canvas", href: "https://online.macomb.edu" }
      ]
    },

    /* The five course areas, in top-nav order. Each carries the sidebar
       that appears while you are inside it. */
    /* ONE area, so the sidebar always shows the whole site.

       Until 2026-08-08 this was several top-level areas (Course, Calendar,
       Assignments, Reference) and the sidebar drew only the current one, with
       the top bar as the way between them. Removing the top bar therefore
       orphaned the Calendar on desktop: nothing linked to it, because the
       phone bottom bar is display:none above 880px.

       Collapsing to a single area makes that impossible by construction --
       every page is always one click away, and there is no "you are in the
       wrong section to see this" state. Groups do the organising instead.

       Policies stays its own group rather than merging into "Class info &
       policies": that label is long for a sidebar heading, and policies are
       what students go looking for by name. */
    areas: [
      {
        id: "course",
        label: "Course",
        href: "index.html",
        built: true,
        sidebarLabel: "This site",
        groups: [
          {
            label: "Start here",
            items: [
              { id: "overview", label: "Overview",       href: "index.html",     built: true }
            ]
          },
          {
            label: "Class info",
            items: [
              { id: "calendar", label: "Class calendar", href: "calendar.html",  built: true }
            ]
          },
          {
            label: "Policies",
            items: [
              { id: "late",      label: "Late work",              href: "late-work.html",         built: true },
              { id: "integrity", label: "Academic integrity & AI", href: "academic-integrity.html", built: true }
            ]
          }
        ]
      }

      /* ---- Readings: deliberately NOT in the nav ----------------------
         readings.html still exists at its own URL and is kept as a source of
         per-text access links for building the Canvas reading pages. The
         reading list itself lives in Canvas. Not an oversight; do not add it
         back, and don't use `built: false` either -- that renders the label as
         plain text, which still advertises a page students shouldn't visit.
         ---------------------------------------------------------------- */
    ]
  };
})();
