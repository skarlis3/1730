/* nav.js — mobile navigation for the ENGL 1730 site.
   ------------------------------------------------------------------
   Two pieces, both mobile-only (≤880px):

   1. BOTTOM BAR. The five course areas move from the top of the screen
      to a fixed bar at the bottom, within thumb reach. It is built by
      reading the existing .topnav in the page — there is no second
      list of links to keep in sync, and aria-current carries over on
      its own.

   2. SIDEBAR DRAWER. The section sidebar slides in from the left over
      a dimmed page, with a large, permanently visible close button.
      The close control is in a sticky header inside the drawer, so it
      stays reachable no matter how far down you scroll.

   Progressive enhancement: without JavaScript the sidebar stays in the
   page as a plain list and the top nav keeps working. Drawer styling is
   scoped to .has-js, which is only added once this file runs.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var root = document.documentElement;
  var MOBILE = "(max-width: 880px)";

  var topnav  = document.querySelector(".topnav");
  var topbar  = document.querySelector(".topbar");
  var sidenav = document.querySelector(".sidenav");
  if (!topbar) return;

  root.classList.add("has-js");

  /* ---------- icons ------------------------------------------------
     Carried over from the 1181 site so the two feel related, plus an
     open book for Readings, which 1181 had no equivalent for.        */
  var ICONS = {
    course: '<path d="M3 10.5 12 3l9 7.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10v9h14v-9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    readings: '<path d="M12 6.5C10.6 5.2 8.6 4.5 6 4.5H3.5v13H6c2.6 0 4.6.7 6 2 1.4-1.3 3.4-2 6-2h2.5v-13H18c-2.6 0-4.6.7-6 2Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 6.5v12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    assignments: '<rect x="5" y="4" width="14" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 8h8M8 12h8M8 16h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 3v4M16 3v4M3 10h18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="7" y="13" width="4" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    reference: '<path d="M5 5h9l5 5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M14 5v5h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    policies: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.9"/><line x1="12" y1="10.5" x2="12" y2="16.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="7.2" r="1.6" fill="currentColor"/>',
    fallback: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/>'
  };

  function iconFor(label, href) {
    var s = (label + " " + (href || "")).toLowerCase();
    if (/polic/.test(s))                     return ICONS.policies;
    if (/course|home|overview/.test(s))      return ICONS.course;
    if (/read/.test(s))                      return ICONS.readings;
    if (/assign/.test(s))                    return ICONS.assignments;
    if (/calendar|schedule/.test(s))         return ICONS.calendar;
    if (/reference|resource/.test(s))        return ICONS.reference;
    return ICONS.fallback;
  }

  function svg(paths) {
    return '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">' + paths + "</svg>";
  }

  /* ---------- 1. bottom bar, built from the existing top nav ------- */
  if (topnav) {
    var items = Array.prototype.slice.call(topnav.querySelectorAll("a"));
    if (items.length) {
      var bar = document.createElement("nav");
      bar.className = "bottombar";
      bar.setAttribute("aria-label", "Course areas");

      var list = document.createElement("ul");
      items.forEach(function (a) {
        var li = document.createElement("li");
        var isCurrent = a.getAttribute("aria-current") === "page";
        // sections that don't exist yet render as plain text, not dead links
        var wip = a.hasAttribute("data-wip");
        var label = a.textContent.trim();

        var el = document.createElement(wip ? "span" : "a");
        el.className = "bb-item" + (wip ? " is-wip" : "");
        if (!wip) el.href = a.getAttribute("href");
        if (isCurrent) el.setAttribute("aria-current", "page");
        if (wip) el.setAttribute("aria-disabled", "true");
        el.innerHTML =
          '<span class="bb-ico">' + svg(iconFor(label, a.getAttribute("href"))) + "</span>" +
          '<span class="bb-label">' + label + "</span>";

        li.appendChild(el);
        list.appendChild(li);
      });

      bar.appendChild(list);
      document.body.appendChild(bar);
    }
  }

  /* ---------- 2. sidebar drawer ------------------------------------ */
  if (!sidenav) return;

  var scrim = document.createElement("div");
  scrim.className = "drawer-scrim";
  scrim.hidden = true;
  document.body.appendChild(scrim);

  // hamburger, placed at the start of the top bar
  var burger = document.createElement("button");
  burger.type = "button";
  burger.className = "burger";
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-controls", "section-nav");
  burger.setAttribute("aria-label", "Open section menu");
  burger.innerHTML =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">' +
    '<path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
    '<span class="burger-text">Menu</span>';
  topbar.insertBefore(burger, topbar.firstChild);

  sidenav.id = sidenav.id || "section-nav";

  // sticky close header inside the drawer
  var head = document.createElement("div");
  head.className = "drawer-head";
  head.innerHTML = '<span class="drawer-title">In this section</span>';
  var close = document.createElement("button");
  close.type = "button";
  close.className = "drawer-close";
  close.setAttribute("aria-label", "Close section menu");
  close.innerHTML =
    '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">' +
    '<path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
    '<span class="drawer-close-text">Close</span>';
  head.appendChild(close);
  sidenav.insertBefore(head, sidenav.firstChild);

  var isOpen = false;
  var lastFocus = null;
  var scrollY = 0;

  function focusables() {
    return Array.prototype.filter.call(
      sidenav.querySelectorAll("a[href], button:not([disabled])"),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    lastFocus = document.activeElement;
    root.classList.add("drawer-open");
    scrim.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    // freeze the page behind the drawer, remembering where we were
    scrollY = window.scrollY;
    root.style.setProperty("--scroll-lock", scrollY + "px");
    document.body.classList.add("is-locked");
    close.focus();
  }

  function shut() {
    if (!isOpen) return;
    isOpen = false;
    root.classList.remove("drawer-open");
    scrim.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("is-locked");
    window.scrollTo(0, scrollY); // put the page back where it was
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  burger.addEventListener("click", open);
  close.addEventListener("click", shut);
  scrim.addEventListener("click", shut);

  document.addEventListener("keydown", function (e) {
    if (!isOpen) return;
    if (e.key === "Escape") { e.preventDefault(); shut(); return; }
    if (e.key !== "Tab") return;
    // keep focus inside the drawer while it's open
    var f = focusables();
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // tapping a destination closes the drawer
  sidenav.addEventListener("click", function (e) {
    if (e.target.closest("a[href]")) shut();
  });

  // leaving mobile width must never strand the page in a locked state
  var mq = window.matchMedia(MOBILE);
  var onBreak = function (e) { if (!e.matches) shut(); };
  if (mq.addEventListener) mq.addEventListener("change", onBreak);
  else if (mq.addListener) mq.addListener(onBreak);
})();
