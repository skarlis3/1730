/* checklist.js — remembers which boxes a student has ticked.
   ===================================================================
   Saved in this browser only (localStorage), under one key per page,
   so nothing is sent anywhere and nothing syncs between devices. The
   page says so in its .checklist-note line.

   Each box needs a stable id. Renaming an id forgets that box's saved
   state, so add new items with new ids rather than renumbering.
   =================================================================== */
(function () {
  "use strict";

  var KEY = "engl1730-checklist:" + location.pathname;
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { saved = {}; }

  var boxes = document.querySelectorAll('.checklist input[type="checkbox"]');
  boxes.forEach(function (box) {
    if (saved[box.id]) box.checked = true;
    box.addEventListener("change", function () {
      saved[box.id] = box.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* storage off: boxes still work, just don't persist */ }
    });
  });
})();
