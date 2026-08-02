/* footer.js — the shared site footer for ENGL 1730.
   ===================================================================
   Matches the footer on the first-year-writing sites (1181 / 1170 /
   1190) in structure and wording, so the whole set reads as one
   instructor's work. Two deliberate differences:

     · The FYW footers separate the brand from the licence text with an
       <hr>. This site's first design rule forbids hard rules, so the
       same separation is a gradient fade. Same reading, no line.

     · Quick Links are generated from the site map in js/site-nav.js
       rather than typed out. The FYW footers keep a hand-written list,
       which is a second place to forget. Here, adding a page to
       site-nav.js puts it in the footer too, and unbuilt pages appear
       as plain text rather than links that go nowhere.

   Wording lives in site-nav.js under `footer`. Edit it there.
   =================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE;
  if (!SITE || !SITE.footer) return;
  var F = SITE.footer;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* Find an item anywhere in the site map by its id — used for the
     "Learn more." link, which points at the Generative AI policy page
     and becomes a real link the moment that page is built. */
  function findItem(id) {
    var found = null;
    SITE.areas.forEach(function (a) {
      (a.groups || []).forEach(function (g) {
        (g.items || []).forEach(function (i) { if (i.id === id) found = i; });
      });
    });
    return found;
  }

  var foot = el("footer", "site-footer");
  foot.setAttribute("role", "contentinfo");
  var inner = el("div", "site-footer__inner");

  /* ---- column 1: brand, licence, AI disclosure ---- */
  var about = el("div", "site-footer__about");
  about.appendChild(el("div", "site-footer__brand", F.brand));

  var lic = el("p");
  lic.appendChild(document.createTextNode(F.license));
  var a = el("a", "", F.licenseLink.label);
  a.href = F.licenseLink.href;
  a.rel = "license noopener";
  lic.appendChild(a);
  lic.appendChild(document.createTextNode("."));
  about.appendChild(lic);

  var ai = el("p");
  ai.appendChild(document.createTextNode(F.ai));
  var policy = findItem(F.aiPolicyRef);
  if (policy && policy.built && policy.href) {
    var pl = el("a", "", F.aiPolicyLabel);
    pl.href = policy.href;
    ai.appendChild(pl);
  }
  /* If the policy page doesn't exist yet, the sentence simply ends —
     no "Learn more." pointing nowhere. It appears on its own when the
     page is built. */
  about.appendChild(ai);
  inner.appendChild(about);

  /* ---- column 2: quick links, straight from the site map ---- */
  var quick = el("nav", "site-footer__links");
  quick.setAttribute("aria-label", "Footer – Quick Links");
  quick.appendChild(el("h2", "site-footer__head", "Quick Links"));
  var ul = el("ul");
  ul.setAttribute("role", "list");
  SITE.areas.forEach(function (ar) {
    var li = el("li");
    var live = ar.built && ar.href;
    var n = el(live ? "a" : "span", live ? "" : "is-wip", ar.label);
    if (live) n.href = ar.href;
    li.appendChild(n);
    ul.appendChild(li);
  });
  quick.appendChild(ul);
  inner.appendChild(quick);

  /* ---- column 3: external links ---- */
  if (F.external && F.external.length) {
    var ext = el("div", "site-footer__links");
    ext.appendChild(el("h2", "site-footer__head", "External Links"));
    var eul = el("ul");
    eul.setAttribute("role", "list");
    F.external.forEach(function (x) {
      var li = el("li");
      var n = el("a", "", x.label);
      n.href = x.href;
      n.rel = "noopener";
      li.appendChild(n);
      eul.appendChild(li);
    });
    ext.appendChild(eul);
    inner.appendChild(ext);
  }

  foot.appendChild(inner);
  document.body.appendChild(foot);
})();
