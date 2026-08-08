/* Theme control for ENGL 1730.
   Default is whatever the student's OS is set to — we only write
   data-theme when they explicitly override it, and we remember that
   choice. Clearing the override hands control back to the OS. */
(function () {
  var root = document.documentElement;
  var KEY = "engl1730-theme";
  var btn = document.querySelector(".theme-toggle");

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* private mode */ }
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  function osPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function currentlyDark() {
    var override = root.getAttribute("data-theme");
    return override ? override === "dark" : osPrefersDark();
  }
  function label() {
    if (!btn) return;
    /* The visible text names the CURRENT theme, so the control is legible as a
       theme control at a glance -- "Dark" on its own read as an unlabelled
       something (Sarah, 8 Aug: "isn't clear for what it is").

       The accessible name starts with that same visible text, which WCAG 2.5.3
       (Label in Name) requires, and then adds what pressing it does -- state
       alone would leave a screen reader user guessing. */
    var now  = currentlyDark() ? "Dark" : "Light";
    var next = currentlyDark() ? "light" : "dark";
    btn.textContent = "Theme: " + now;
    btn.setAttribute("aria-label", "Theme: " + now + ". Switch to " + next + " theme.");
  }

  if (btn) {
    btn.addEventListener("click", function () {
      var next = currentlyDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      label();
    });
  }

  // follow the OS while no explicit override is set
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () { if (!root.getAttribute("data-theme")) label(); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  label();
})();
