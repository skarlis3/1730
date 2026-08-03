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
    areas: [
      {
        id: "course",
        label: "Course",
        href: "index.html",
        built: true,
        sidebarLabel: "Within Course",
        groups: [
          {
            label: "Start here",
            items: [
              { id: "overview",   label: "Overview",              href: "index.html", built: true },
              { id: "what",       label: "What we're doing here", href: "",           built: false },
              { id: "how",        label: "How class runs",        href: "",           built: false },
              { id: "books",      label: "Books to buy",          href: "",           built: false }
            ]
          },
          {
            label: "Reading the course",
            items: [
              { id: "three-ways", label: "Three ways to read", href: "", built: false },
              { id: "close",      label: "Close reading",     href: "", built: false },
              { id: "response",   label: "Reader response",   href: "", built: false },
              { id: "historicism",label: "New historicism",   href: "", built: false }
            ]
          },
          {
            label: "Policies",
            items: [
              { id: "attendance", label: "Attendance & freewrites", href: "", built: false },
              { id: "late",       label: "Late work",               href: "", built: false },
              { id: "ai",         label: "Generative AI",           href: "", built: false }
            ]
          }
        ]
      },

      {
        id: "readings",
        label: "Readings",
        href: "",
        built: false,
        sidebarLabel: "Within Readings",
        groups: []
      },

      {
        id: "assignments",
        label: "Assignments",
        href: "",
        built: false,
        sidebarLabel: "Within Assignments",
        groups: []
      },

      {
        id: "calendar",
        label: "Calendar",
        href: "calendar.html",
        built: true,
        sidebarLabel: "Within Calendar",
        groups: [
          {
            label: "Calendar",
            items: [
              { id: "calendar", label: "Class calendar", href: "calendar.html", built: true }
            ]
          }
        ]
      },

      {
        id: "reference",
        label: "Reference",
        href: "",
        built: false,
        sidebarLabel: "Within Reference",
        groups: []
      }
    ]
  };
})();
