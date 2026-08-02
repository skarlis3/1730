/* nav.js — renders and runs every piece of navigation on the ENGL 1730 site.
   ===================================================================
   YOU SHOULD NOT NEED TO EDIT THIS FILE TO ADD A PAGE.
   The site map lives in js/site-nav.js. This file only draws it.

   What it builds, all from the same data:

     1. TOP BAR       wordmark, the five course areas, theme toggle
     2. SIDEBAR       the course card and the current area's groups
     3. BOTTOM BAR    the five areas again, phone only, in thumb reach
     4. DRAWER        the sidebar as a slide-in panel, phone only

   Because all four read one list, adding a page can never leave one of
   them out of step with the others.

   ---- Not-yet-built destinations ------------------------------------
   Anything with `built: false` renders as plain text, never as a link,
   in all four places. Two reasons, and both are rules rather than
   preferences:

     · A link announced as "Readings" that goes to the top of the page
       you are already on misstates its own purpose. WCAG 2.4.4.
     · Nothing that isn't clickable may look clickable — design rule 2,
       stated at the top of css/style.css.

   ---- No JavaScript --------------------------------------------------
   Navigation is drawn here, so with scripting off there is none. The
   page's own content still renders, and a <noscript> line offers the
   way home. This is a deliberate trade for having one source of truth.
   =================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE;
  if (!SITE) return;

  var root    = document.documentElement;
  var MOBILE  = "(max-width: 880px)";
  var topbar  = document.querySelector("[data-site-topbar]");
  var sidenav = document.querySelector("[data-site-sidenav]");

  root.classList.add("has-js");

  /* Which area and which page are we on? Declared on <body>, because
     guessing from the URL breaks on GitHub Pages, where "/" and
     "/index.html" are the same page under two names. */
  var here     = document.body.getAttribute("data-area") || "";
  var herePage = document.body.getAttribute("data-page") || "";
  var area     = null;
  SITE.areas.forEach(function (a) { if (a.id === here) area = a; });

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* One rule for every destination on the site: a real link when the
     page exists, plain text when it doesn't. Used by all four navs. */
  function destination(item, cls, current) {
    var live = item.built && item.href;
    var n = el(live ? "a" : "span", cls + (live ? "" : " is-wip"));
    if (live) n.href = item.href;
    if (live && current) n.setAttribute("aria-current", "page");
    return n;
  }

  /* ---------- 1. TOP BAR ------------------------------------------- */
  if (topbar) {
    topbar.setAttribute("role", "banner");

    var mark = el("a", "wordmark");
    mark.href = SITE.areas[0].href || "index.html";
    mark.appendChild(el("span", "wordmark-code", SITE.course.code));
    topbar.appendChild(mark);

    var topnav = el("nav", "topnav");
    topnav.setAttribute("aria-label", "Main areas");
    SITE.areas.forEach(function (a) {
      var n = destination(a, "", a.id === here);
      n.textContent = a.label;
      topnav.appendChild(n);
    });
    topbar.appendChild(topnav);

    var toggle = el("button", "theme-toggle", "Dark");
    toggle.type = "button";
    topbar.appendChild(toggle);
  }

  /* ---------- 2. SIDEBAR ------------------------------------------- */
  if (sidenav && area) {
    sidenav.setAttribute("aria-label", area.sidebarLabel || ("Within " + area.label));

    var card = el("div", "sidecard");
    var tile = el("div", "sidecard-tile");
    tile.setAttribute("aria-hidden", "true");
    tile.appendChild(el("span", "", SITE.course.tile));
    card.appendChild(tile);
    card.appendChild(el("p", "sidecard-title", SITE.course.name));
    card.appendChild(el("p", "sidecard-meta", SITE.course.meta));
    var stats = el("p", "sidecard-stats");
    SITE.course.stats.forEach(function (s) { stats.appendChild(el("span", "", s)); });
    card.appendChild(stats);
    sidenav.appendChild(card);

    area.groups.forEach(function (group, i) {
      /* The group label stays a <p>, not a heading, on purpose. The
         sidebar sits before <main> in the document, so headings here
         would put h2s above the page's h1 and wreck the outline. The
         grouping is carried by aria-labelledby instead, which is what
         a screen reader announces when entering the list. */
      var id = "nav-group-" + i;
      var head = el("p", "sidenav-heading", group.label);
      head.id = id;
      sidenav.appendChild(head);

      var ul = el("ul");
      ul.setAttribute("role", "list");       /* bullets are removed in CSS,
                                                which drops list semantics
                                                in Safari + VoiceOver */
      ul.setAttribute("aria-labelledby", id);
      group.items.forEach(function (item) {
        var li = el("li");
        var n = destination(item, "", item.id === herePage);
        n.textContent = item.label;
        li.appendChild(n);
        ul.appendChild(li);
      });
      sidenav.appendChild(ul);
    });
  }

  if (!topbar) return;

  /* ---------- sticky offset ----------------------------------------
     The top bar is sticky at every width, so the sidebar and every
     anchor jump need its height. Measured rather than hard-coded: it
     moves with the display font and wraps at narrow widths.          */
  function measureTopbar() {
    root.style.setProperty("--top-offset", topbar.offsetHeight + "px");
  }
  measureTopbar();
  window.addEventListener("resize", measureTopbar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureTopbar);

  /* ---------- icons ------------------------------------------------
     Carried over from the 1181 site so the two feel related, plus an
     open book for Readings, which 1181 had no equivalent for.        */
  var ICONS = {
    course: '<path d="M3 10.5 12 3l9 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10v9h14v-9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    readings: '<path d="M12 6.5C10.6 5.2 8.6 4.5 6 4.5H3.5v13H6c2.6 0 4.6.7 6 2 1.4-1.3 3.4-2 6-2h2.5v-13H18c-2.6 0-4.6.7-6 2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 6.5v12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    assignments: '<rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 8h8M8 12h8M8 16h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 3v4M16 3v4M3 10h18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="7" y="13" width="4" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    reference: '<path d="M5 5h9l5 5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M14 5v5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    fallback: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/>'
  };

  function iconFor(id, label) {
    var s = (id + " " + label).toLowerCase();
    if (/course|home|overview/.test(s))  return ICONS.course;
    if (/read/.test(s))                  return ICONS.readings;
    if (/assign/.test(s))                return ICONS.assignments;
    if (/calendar|schedule/.test(s))     return ICONS.calendar;
    if (/reference|resource/.test(s))    return ICONS.reference;
    return ICONS.fallback;
  }

  function svg(paths) {
    return '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">' + paths + "</svg>";
  }

  /* ---------- 3. BOTTOM BAR ---------------------------------------- */
  var bar = el("nav", "bottombar");
  bar.setAttribute("aria-label", "Course areas");
  var blist = el("ul");
  blist.setAttribute("role", "list");   /* same reason as the sidebar lists —
                                           this one is the whole navigation on
                                           a phone, so losing it costs most */
  SITE.areas.forEach(function (a) {
    var li = el("li");
    var n = destination(a, "bb-item", a.id === here);
    var ico = el("span", "bb-ico");
    ico.innerHTML = svg(iconFor(a.id, a.label));
    n.appendChild(ico);
    n.appendChild(el("span", "bb-label", a.label));
    li.appendChild(n);
    blist.appendChild(li);
  });
  bar.appendChild(blist);
  document.body.appendChild(bar);

  /* ---------- 4. DRAWER -------------------------------------------- */
  if (!sidenav) return;

  var scrim = el("div", "drawer-scrim");
  scrim.hidden = true;
  document.body.appendChild(scrim);

  var burger = el("button", "burger");
  burger.type = "button";
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-controls", "section-nav");
  burger.setAttribute("aria-label", "Open section menu");
  burger.innerHTML =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">' +
    '<path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
    '<span class="burger-text">Menu</span>';
  topbar.insertBefore(burger, topbar.firstChild);

  sidenav.id = sidenav.id || "section-nav";

  /* The drawer needs the page behind it to be genuinely unavailable —
     otherwise someone reading by virtual cursor rather than by Tab
     walks straight through into the page underneath.

     Done with `inert` on everything else (see setInert below), NOT with
     role="dialog" + aria-modal. Two reasons:

       · This element is a <nav>. Its implicit role is navigation, and
         "dialog" is not a permitted override for it — that's invalid
         ARIA, and it is the same element that has to stay a proper
         navigation landmark on desktop, where there is no drawer.
       · `inert` removes the background from the tab order and the
         accessibility tree at once, which is the thing aria-modal is
         only asking assistive tech to do. It's the stronger guarantee,
         not the weaker one.

     The hamburger's aria-expanded already says the menu is open. */

  var head = el("div", "drawer-head");
  head.appendChild(el("span", "drawer-title", "In this section"));
  var close = el("button", "drawer-close");
  close.type = "button";
  close.setAttribute("aria-label", "Close section menu");
  close.innerHTML =
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">' +
    '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
    '<span class="drawer-close-text">Close</span>';
  head.appendChild(close);
  sidenav.insertBefore(head, sidenav.firstChild);

  var isOpen = false, lastFocus = null, scrollY = 0;

  /* Everything that is NOT the drawer. `inert` takes these out of the
     tab order and out of the accessibility tree at the same time, which
     aria-hidden alone would not do. */
  function background() {
    return [topbar, document.querySelector("main"), bar,
            document.querySelector(".site-footer")].filter(Boolean);
  }
  function setInert(on) {
    background().forEach(function (n) {
      if (on) n.setAttribute("inert", "");
      else n.removeAttribute("inert");
    });
  }

  function focusables() {
    return Array.prototype.filter.call(
      sidenav.querySelectorAll("a[href], button:not([disabled])"),
      function (e) { return e.offsetParent !== null; }
    );
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    root.classList.add("drawer-open");
    scrim.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    scrollY = window.scrollY;
    root.style.setProperty("--scroll-lock", scrollY + "px");
    document.body.classList.add("is-locked");
    setInert(true);
    close.focus();
  }

  function shut() {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove("drawer-open");
    scrim.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
    /* Un-inert BEFORE restoring focus — an inert element cannot take it. */
    setInert(false);
    window.scrollTo(0, scrollY);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  burger.addEventListener("click", open);
  close.addEventListener("click", shut);
  scrim.addEventListener("click", shut);

  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") { e.preventDefault(); shut(); return; }
    if (e.key !== "Tab") return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  sidenav.addEventListener("click", function (e) {
    if (e.target.closest("a[href]")) shut();
  });

  /* Leaving phone width must never strand the page in a locked state. */
  var mq = window.matchMedia(MOBILE);
  var onBreak = function (e) { if (!e.matches) shut(); };
  if (mq.addEventListener) mq.addEventListener("change", onBreak);
  else if (mq.addListener) mq.addListener(onBreak);
})();
