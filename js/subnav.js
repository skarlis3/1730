/* subnav.js — the row of links at the top of a multi-page assignment.
   ===================================================================
   The pages themselves live in js/site-nav.js under `subnavs`, so the
   list is kept in the same one file as the rest of the site map. This
   file only draws it.

   A page opts in with two things:
     <nav class="subnav" data-subnav="final-project" aria-label="…">
     <body … data-subpage="final-project-reading">
   `data-subnav` picks which list to draw; `data-subpage` marks the
   current page with aria-current.
   =================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE;
  if (!SITE || !SITE.subnavs) return;

  var here = document.body.getAttribute("data-subpage") || "";

  document.querySelectorAll("[data-subnav]").forEach(function (nav) {
    var map = SITE.subnavs[nav.getAttribute("data-subnav")];
    if (!map) return;

    var label = document.createElement("p");
    label.className = "subnav-label";
    label.setAttribute("aria-hidden", "true");   /* the nav's aria-label already says it */
    label.textContent = map.label;
    nav.appendChild(label);

    var list = document.createElement("ol");
    map.items.forEach(function (item) {
      var li = document.createElement("li");
      var a  = document.createElement("a");
      a.href = item.href;
      a.textContent = item.label;
      if (item.id === here) a.setAttribute("aria-current", "page");
      li.appendChild(a);
      list.appendChild(li);
    });
    nav.appendChild(list);
  });
})();
