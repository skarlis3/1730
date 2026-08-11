/* calendar.js — pulls the course Google Calendar into the page.
   ===================================================================
   Students who want the real thing get the "Open in Google Calendar"
   link; nobody has to leave the site to see what's due.

   Three views: Schedule (the default — a syllabus-style week list),
   Month, and Upcoming.

   ---- WHAT TO EDIT WHEN A NEW SEMESTER STARTS ----------------------
   CALENDAR_ID, TERM_START and TERM_END below. Nothing else. Full setup
   walkthrough — creating the calendar, making it public, the API key
   restrictions — is in
   work-with-claude-code/classes/google-calendar-setup.html

   ---- WHY THE KEY IS SITTING HERE IN PLAIN SIGHT -------------------
   It is a browser API key, and browser API keys cannot be hidden —
   anything the page can read, a reader can read. What protects it is
   not secrecy but restriction: in Google Cloud it is locked to the
   Calendar API only and to an allowlist of referring sites. A copy
   lifted off this page is refused everywhere except those sites.

   That means **a new class site must be added to the allowlist** or
   every calendar on it silently returns 403. That is the single most
   likely thing to go wrong here. See the guide.
   =================================================================== */
(function () {
  "use strict";

  /* ---- CONFIG ---------------------------------------------------- */

  var CALENDAR_ID =
    "d105b9ece7cf63810a43afffdb15430b9cda5c3ddbfcaea07ddd44bfd4ad5808@group.calendar.google.com";

  var API_KEY  = "AIzaSyAv4RBdi3zx-8hCIXBpzYLb7oT9XTUL6tY";
  var TIMEZONE = "America/Detroit";
  var UPCOMING_DAYS = 21;         /* how far "Upcoming" looks ahead */
  var CHIPS_PER_DAY = 2;          /* before a day collapses to "+N more" */

  /* The schedule view's skeleton. Every meeting day between these two
     dates gets a row, whether or not anything is on the calendar for it —
     so a week whose reading isn't chosen yet shows up as an empty week
     rather than silently vanishing. Both are the DAY THE CLASS MEETS:
     the first meeting of the term and the last. */
  var TERM_START = "2026-08-17";
  var TERM_END   = "2026-12-07";
  var MEETS_ON   = 1;             /* 0 Sun … 6 Sat. This section meets Mondays. */

  /* Weeks with no class. Normally left empty: any event whose title says
     "no class" (or "college closed") is detected on its own, which is how
     Labor Day is caught. Add a meeting date here — "2026-09-07" — only if
     a closure is worded so that the sniff misses it. Getting this wrong
     doesn't error, it silently shifts every later week number by one, so
     the meeting count is printed under the list as a check. */
  var BREAKS = [];

  /* ---------------------------------------------------------------- */

  var root = document.getElementById("calendar");
  if (!root) return;

  var DAYS  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

  var events = [];
  var shown  = new Date();        /* which month the grid is showing */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;   /* textContent, never innerHTML —
                                                 calendar fields are free text
                                                 and must not become markup */
    return n;
  }

  /* All-day events arrive as "2026-09-08" with no timezone. Building a
     Date from that string directly would read it as UTC midnight and
     land on the previous evening in Detroit — the classic calendar
     off-by-one. Split and build locally instead. */
  function startOf(ev) {
    if (ev.start.dateTime) return new Date(ev.start.dateTime);
    var p = ev.start.date.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function isAllDay(ev) { return !ev.start.dateTime; }

  function midnight(d) {
    var n = new Date(d); n.setHours(0, 0, 0, 0); return n;
  }
  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  function daysBetween(d) {
    return Math.round((midnight(d) - midnight(new Date())) / 86400000);
  }
  /* Same care as startOf(): build from the parts so "2026-08-17" is local
     midnight and not UTC midnight the evening before. */
  function isoDate(s) {
    var p = s.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function plusDays(d, n) { var c = new Date(d); c.setDate(c.getDate() + n); return c; }
  function dateKey(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
           "-" + String(d.getDate()).padStart(2, "0");
  }
  function shortDate(d) {
    return DAYS[d.getDay()].slice(0, 3) + " " + MONTHS[d.getMonth()].slice(0, 3) +
           " " + d.getDate();
  }
  function timeOf(ev) {
    /* All-day events show NO label at all. Sarah, 8 Aug 2026: this calendar is a
       course schedule -- what we are doing that day -- and nothing on it has a
       time, so "All day" was on every single event, saying nothing.

       Returns "" rather than "All day"; every caller skips the element when this
       is empty, so there is no stray empty span left to take up space. A real
       time still renders if an event ever has one. */
    if (isAllDay(ev)) return "";
    return startOf(ev).toLocaleTimeString("en-US",
      { hour: "numeric", minute: "2-digit", timeZone: TIMEZONE });
  }
  function eventsOn(date) {
    return events.filter(function (e) { return sameDay(startOf(e), date); });
  }

  /* ---- fetch ------------------------------------------------------ */

  function load() {
    var min = new Date(); min.setMonth(min.getMonth() - 4);
    var max = new Date(); max.setMonth(max.getMonth() + 8);

    /* Widen to cover the whole term if today's window doesn't. Without
       this, opening the page in late December clips the August weeks off
       the schedule view. A week either side catches the Sunday deadlines
       that belong to the first meeting. */
    var termFrom = plusDays(isoDate(TERM_START), -8);
    var termTo   = plusDays(isoDate(TERM_END), 8);
    if (termFrom < min) min = termFrom;
    if (termTo   > max) max = termTo;

    var url = new URL("https://www.googleapis.com/calendar/v3/calendars/" +
                      encodeURIComponent(CALENDAR_ID) + "/events");
    url.searchParams.set("key", API_KEY);
    url.searchParams.set("timeMin", min.toISOString());
    url.searchParams.set("timeMax", max.toISOString());
    url.searchParams.set("singleEvents", "true");   /* expand repeats into
                                                       individual dates */
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "500");
    url.searchParams.set("timeZone", TIMEZONE);

    return fetch(url).then(function (r) {
      if (!r.ok) {
        return r.json().catch(function () { return {}; }).then(function (body) {
          var msg = (body.error && body.error.message) || ("HTTP " + r.status);
          throw new Error(msg);
        });
      }
      return r.json();
    }).then(function (d) { events = d.items || []; });
  }

  /* ---- month view -------------------------------------------------
     A month grid is genuinely tabular data — days of the week are
     columns — so this is a real <table>, not a grid of divs pretending
     to be one. The site rule bans tables for layout, not for tables. */

  function renderMonth() {
    var host = document.getElementById("cal-month");
    host.textContent = "";

    var y = shown.getFullYear(), m = shown.getMonth();
    document.getElementById("cal-month-label").textContent = MONTHS[m] + " " + y;

    var table = el("table", "cal-grid");
    var cap = el("caption", "cal-caption", MONTHS[m] + " " + y);
    table.appendChild(cap);

    var thead = el("thead"), hrow = el("tr");
    DAYS.forEach(function (d) {
      var th = el("th", null);
      th.scope = "col";
      var ab = el("abbr", null, d.slice(0, 3));
      ab.title = d;
      th.appendChild(ab);
      hrow.appendChild(th);
    });
    thead.appendChild(hrow);
    table.appendChild(thead);

    var tbody = el("tbody");
    var first = new Date(y, m, 1);
    var cursor = new Date(y, m, 1 - first.getDay());   /* back up to Sunday */

    for (var w = 0; w < 6; w++) {
      var tr = el("tr");
      for (var i = 0; i < 7; i++) {
        tr.appendChild(dayCell(new Date(cursor), m));
        cursor.setDate(cursor.getDate() + 1);
      }
      tbody.appendChild(tr);
      /* stop once we're past the month and the row is complete */
      if (cursor.getMonth() !== m && cursor.getDate() > 7) break;
    }
    table.appendChild(tbody);
    host.appendChild(table);
  }

  function dayCell(date, month) {
    var td = el("td", "cal-day");
    var outside = date.getMonth() !== month;
    if (outside) td.className += " is-outside";
    if (sameDay(date, new Date())) {
      td.className += " is-today";
      td.setAttribute("aria-current", "date");
    }

    var num = el("span", "cal-daynum", String(date.getDate()));
    if (sameDay(date, new Date())) {
      /* "Today" needs to survive being read aloud, not just look different */
      num.appendChild(el("span", "sr-only", " (today)"));
    }
    td.appendChild(num);

    var list = eventsOn(date);
    if (!list.length) return td;

    var visible = list.slice(0, CHIPS_PER_DAY);
    visible.forEach(function (ev) { td.appendChild(chip(ev)); });

    if (list.length > visible.length) {
      var more = el("button", "cal-more",
                    "+" + (list.length - visible.length) + " more");
      more.type = "button";
      more.setAttribute("aria-label",
        "Show all " + list.length + " events on " +
        DAYS[date.getDay()] + ", " + MONTHS[date.getMonth()] + " " + date.getDate());
      more.addEventListener("click", function () { openDay(date, list); });
      td.appendChild(more);
    }
    return td;
  }

  function chip(ev) {
    var b = el("button", "cal-chip");
    b.type = "button";
    var chipTime = timeOf(ev);
    if (chipTime) b.appendChild(el("span", "cal-chip-time", chipTime));
    b.appendChild(el("span", "cal-chip-title", ev.summary || "(untitled)"));
    b.addEventListener("click", function () { openEvent(ev); });
    return b;
  }

  /* ---- upcoming view ---------------------------------------------- */

  function renderUpcoming() {
    var host = document.getElementById("cal-upcoming");
    host.textContent = "";

    var today = midnight(new Date());
    var end = new Date(today); end.setDate(end.getDate() + UPCOMING_DAYS);

    var soon = events.filter(function (e) {
      var d = midnight(startOf(e));
      return d >= today && d < end;
    });

    if (!soon.length) {
      host.appendChild(el("p", "cal-empty",
        "Nothing scheduled in the next " + UPCOMING_DAYS + " days."));
      return;
    }

    /* group by day so a date is announced once, not once per event */
    var groups = [], last = null;
    soon.forEach(function (e) {
      var d = midnight(startOf(e));
      if (!last || !sameDay(last.date, d)) { last = { date: d, items: [] }; groups.push(last); }
      last.items.push(e);
    });

    var ul = el("ul", "cal-up-list");
    ul.setAttribute("role", "list");
    groups.forEach(function (g) {
      var li = el("li", "cal-up-day");
      var n = daysBetween(g.date);
      var head = el("p", "cal-up-date");
      head.appendChild(el("span", "cal-up-date-main",
        DAYS[g.date.getDay()] + ", " + MONTHS[g.date.getMonth()] + " " + g.date.getDate()));
      head.appendChild(el("span", "cal-up-when",
        n === 0 ? "Today" : n === 1 ? "Tomorrow" : "in " + n + " days"));
      li.appendChild(head);

      var inner = el("ul", "cal-up-events");
      inner.setAttribute("role", "list");
      g.items.forEach(function (ev) {
        var item = el("li");
        var b = el("button", "cal-up-item");
        b.type = "button";
        var upTime = timeOf(ev);
        if (upTime) b.appendChild(el("span", "cal-up-time", upTime));
        b.appendChild(el("span", "cal-up-title", ev.summary || "(untitled)"));
        b.addEventListener("click", function () { openEvent(ev); });
        item.appendChild(b);
        inner.appendChild(item);
      });
      li.appendChild(inner);
      ul.appendChild(li);
    });
    host.appendChild(ul);
  }

  /* ---- schedule view ----------------------------------------------
     A syllabus-style list of the term, one row per meeting week.

     THE ORDER MATTERS. The skeleton is built first, from TERM_START and
     TERM_END, and events are dropped into it afterwards. Doing it the
     other way round — deriving the weeks from whatever events exist —
     means a week with nothing scheduled yet disappears, which is exactly
     the week a student most needs to see is coming.

     A week runs Tuesday → Monday, ending on the meeting. That is what
     puts a Sunday deadline in the week it's due for rather than the week
     before, and it matches the Canvas convention of setting the due date
     the night before class (see classes/CLAUDE.md).

     Week numbers count MEETINGS. A closure doesn't consume a number: it
     gets an unnumbered band, and the next meeting carries on the count.
     That's the numbering Sarah's planning docs and the Canvas readings
     page already use — Klune at 4, midterm at 6, exam at 13. */

  /* Which bucket a title belongs in. First match wins, so the order of
     these tests is the specification. All of it works off the title,
     because that's the only field the calendar is allowed to carry —
     descriptions are visible to students, so nothing is written there. */
  function classifyEvent(title) {
    var low = title.toLowerCase();
    if (/no class|college closed|classes do not meet/.test(low)) return "break";
    if (/^reminder\s*:/i.test(title))                            return "reminder";
    if (/^readings?\s*(due)?\s*:/i.test(title))                  return "reading";
    if (/^no readings/.test(low))                                return "noreading";
    if (/midterm|final exam/.test(low))                          return "exam";
    if (/^due\s*:/i.test(title) || /\bdue$/.test(low.trim()))    return "due";
    if (/^attendance mandatory$/.test(low.trim()))               return "attendance";
    return "inclass";
  }

  /* Drop the part of the title that the group label already says. */
  function stripLabel(title) {
    return title
      .replace(/^readings?\s*(due)?\s*:\s*/i, "")
      .replace(/^due\s*:\s*/i, "")
      .replace(/^reminder\s*:\s*/i, "")
      .replace(/\s*[;,]?\s*attendance mandatory!?\s*$/i, "")
      .replace(/\s+due$/i, "")
      .trim();
  }

  function buildWeeks() {
    var byDate = {};
    events.forEach(function (ev) {
      var k = dateKey(startOf(ev));
      (byDate[k] = byDate[k] || []).push(ev.summary || "(untitled)");
    });

    var weeks = [], count = 0;
    var meeting = isoDate(TERM_START), last = isoDate(TERM_END);

    while (meeting <= last) {
      var w = {
        day: new Date(meeting), num: null, breakLabel: null,
        readings: [], due: [], exams: [], inclass: [], reminders: [],
        attendance: false, noReadings: false
      };

      for (var back = 6; back >= 0; back--) {
        var day = plusDays(meeting, -back);
        (byDate[dateKey(day)] || []).forEach(function (title) {
          var text = stripLabel(title);
          switch (classifyEvent(title)) {
            case "break":      w.breakLabel = text; break;
            case "reminder":   w.reminders.push(text); break;
            case "reading":    w.readings.push(text); break;
            case "noreading":  w.noReadings = true; break;
            case "exam":       w.exams.push(text);
                               if (/attendance mandatory/i.test(title)) w.attendance = true;
                               break;
            case "due":        w.due.push({ day: day, text: text }); break;
            case "attendance": w.attendance = true; break;
            default:           w.inclass.push(text);
          }
        });
      }

      if (BREAKS.indexOf(dateKey(meeting)) !== -1) w.breakLabel = w.breakLabel || "No class";
      if (!w.breakLabel) w.num = ++count;
      weeks.push(w);
      meeting = plusDays(meeting, 7);
    }

    /* A reminder goes out the day after class, about the NEXT session's
       reading, so it belongs with that session — not on its own date,
       which for the reminder sent before a closure would strand it in the
       break. Move any reminder landing in an unnumbered week forward to
       the next week that meets. */
    weeks.forEach(function (w, i) {
      if (w.num !== null || !w.reminders.length) return;
      for (var j = i + 1; j < weeks.length; j++) {
        if (weeks[j].num !== null) {
          weeks[j].reminders = w.reminders.concat(weeks[j].reminders);
          w.reminders = [];
          return;
        }
      }
    });

    return { weeks: weeks, meetings: count };
  }

  function schedGroup(cls, label, items, build) {
    var g = el("div", "cal-grp " + cls);
    g.appendChild(el("p", "cal-grp-lbl", label));
    var ul = el("ul");
    ul.setAttribute("role", "list");
    items.forEach(function (it) { ul.appendChild(build(it)); });
    g.appendChild(ul);
    return g;
  }

  function weekRow(w, today) {
    var li = el("li");

    if (w.breakLabel) {
      var band = el("div", "cal-brk");
      band.appendChild(el("span", "cal-brk-date", shortDate(w.day)));
      band.appendChild(el("span", "cal-brk-txt", w.breakLabel));
      li.appendChild(band);
      return li;
    }

    li.className = "cal-wk";
    var isNow = sameDay(w.day, today);
    if (isNow) li.classList.add("is-now");
    else if (midnight(w.day) < midnight(today)) li.classList.add("is-past");

    var num = el("div", "cal-wk-num");
    num.appendChild(el("span", "cal-wk-lbl", "Week"));
    num.appendChild(document.createTextNode(String(w.num)));
    num.appendChild(el("div", "cal-wk-date", shortDate(w.day)));
    li.appendChild(num);

    var body = el("div", "cal-wk-body");

    if (isNow) body.appendChild(el("p", "cal-wk-now", "This week"));

    if (w.attendance) {
      var chips = el("div", "cal-sched-chips");
      chips.appendChild(el("span", "cal-sched-chip", "Attendance mandatory"));
      body.appendChild(chips);
    }

    if (w.readings.length) {
      body.appendChild(schedGroup("cal-grp-readings", "Read before class", w.readings,
        function (text) {
          /* "Reading: TBD" strips down to a bare "TBD", which reads as an
             error next to real titles. */
          var bare = /^TBD$/i.test(text);
          var item = el("li", /\bTBD\b/.test(text) ? "is-tbd" : null,
                        bare ? "Reading TBD" : text);
          return item;
        }));
    } else if (w.noReadings) {
      var none = el("div", "cal-grp cal-grp-readings");
      none.appendChild(el("p", "cal-grp-lbl", "Read before class"));
      var nl = el("ul");
      nl.setAttribute("role", "list");
      nl.appendChild(el("li", "is-none", "None this week"));
      none.appendChild(nl);
      body.appendChild(none);
    }

    if (w.exams.length) {
      body.appendChild(schedGroup("cal-grp-exam", "In class", w.exams,
        function (text) { return el("li", null, text); }));
    }

    if (w.due.length) {
      body.appendChild(schedGroup("cal-grp-due", "Due", w.due, function (it) {
        var item = el("li");
        /* Only date-stamp a deadline that isn't the class meeting itself —
           on the meeting day the week's own date already says it. */
        if (sameDay(it.day, w.day)) {
          item.textContent = it.text;
        } else {
          item.appendChild(document.createTextNode(it.text + " "));
          item.appendChild(el("span", "cal-due-when", shortDate(it.day)));
        }
        return item;
      }));
    }

    if (w.inclass.length) {
      body.appendChild(schedGroup("cal-grp-inclass",
        w.exams.length ? "Also in class" : "In class", w.inclass,
        function (text) { return el("li", null, text); }));
    }

    if (w.reminders.length) {
      var rem = el("div", "cal-rem");
      var rl = el("ul");
      rl.setAttribute("role", "list");
      w.reminders.forEach(function (text) { rl.appendChild(el("li", null, text)); });
      rem.appendChild(rl);
      body.appendChild(rem);
    }

    li.appendChild(body);
    return li;
  }

  function renderSchedule() {
    var host = document.getElementById("cal-schedule");
    host.textContent = "";
    var today = midnight(new Date());
    var built = buildWeeks();
    built.weeks.forEach(function (w) { host.appendChild(weekRow(w, today)); });
  }

  /* ---- dialog -----------------------------------------------------
     Same modal contract as the section drawer in nav.js: focus moves
     in, everything else goes inert, Escape closes, focus returns to
     whatever opened it. Un-inert happens before focus is restored,
     because an inert element cannot take focus. */

  var dlg      = document.getElementById("cal-dialog");
  var dlgTitle = document.getElementById("cal-dialog-title");
  var dlgBody  = document.getElementById("cal-dialog-body");
  var dlgClose = document.getElementById("cal-dialog-close");
  var scrim    = document.getElementById("cal-scrim");
  var opener   = null;

  function background() {
    return [document.querySelector(".topbar"), document.querySelector("main"),
            document.querySelector(".bottombar"), document.querySelector(".site-footer")]
           .filter(Boolean);
  }
  function inert(on) {
    background().forEach(function (n) {
      if (on) n.setAttribute("inert", ""); else n.removeAttribute("inert");
    });
  }

  function openDialog(title) {
    opener = document.activeElement;
    dlgTitle.textContent = title;
    dlg.hidden = false; scrim.hidden = false;
    inert(true);
    dlgClose.focus();
  }
  function closeDialog() {
    if (dlg.hidden) return;
    dlg.hidden = true; scrim.hidden = true;
    inert(false);
    if (opener && opener.focus) opener.focus();
  }

  function openEvent(ev) {
    dlgBody.textContent = "";
    var d = startOf(ev);
    var when = DAYS[d.getDay()] + ", " + MONTHS[d.getMonth()] + " " + d.getDate();
    var t = timeOf(ev);
    if (t) when += " · " + t;      /* no trailing separator when there is no time */
    dlgBody.appendChild(el("p", "cal-dlg-when", when));
    if (ev.location) dlgBody.appendChild(el("p", "cal-dlg-loc", ev.location));
    if (ev.description) {
      /* Descriptions are author-written free text and can contain markup.
         Each line becomes its own paragraph via textContent, so nothing
         in a calendar field can ever execute on the page. */
      ev.description.split(/\r?\n/).forEach(function (line) {
        if (line.trim()) dlgBody.appendChild(el("p", null, line.trim()));
      });
    } else {
      dlgBody.appendChild(el("p", "cal-dlg-none", "No further details."));
    }
    openDialog(ev.summary || "(untitled)");
  }

  function openDay(date, list) {
    dlgBody.textContent = "";
    var ul = el("ul", "cal-dlg-list");
    ul.setAttribute("role", "list");
    list.forEach(function (ev) {
      var li = el("li");
      var b = el("button", "cal-up-item");
      b.type = "button";
      var popTime = timeOf(ev);
      if (popTime) b.appendChild(el("span", "cal-up-time", popTime));
      b.appendChild(el("span", "cal-up-title", ev.summary || "(untitled)"));
      b.addEventListener("click", function () { openEvent(ev); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    dlgBody.appendChild(ul);
    openDialog(DAYS[date.getDay()] + ", " + MONTHS[date.getMonth()] + " " + date.getDate());
  }

  dlgClose.addEventListener("click", closeDialog);
  scrim.addEventListener("click", closeDialog);
  document.addEventListener("keydown", function (e) {
    if (dlg.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); closeDialog(); return; }
    if (e.key !== "Tab") return;
    var f = Array.prototype.filter.call(
      dlg.querySelectorAll("a[href], button"),
      function (n) { return n.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---- tabs -------------------------------------------------------
     A real tab widget, which means arrow keys as well as clicks. The
     first-year-writing calendar declares role="tab" without them —
     that promises an interaction model to screen-reader users that
     then isn't there. Roving tabindex: only the selected tab is a tab
     stop, and arrows move between them. */

  var tabs = Array.prototype.slice.call(root.querySelectorAll("[role=tab]"));

  function selectTab(tab, setFocus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle("is-on", on);
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (setFocus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab); });
    tab.addEventListener("keydown", function (e) {
      var to = null;
      if (e.key === "ArrowRight") to = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") to = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") to = tabs[0];
      else if (e.key === "End") to = tabs[tabs.length - 1];
      if (to) { e.preventDefault(); selectTab(to, true); }
    });
  });

  /* ---- month navigation ------------------------------------------- */

  function step(n) {
    shown = new Date(shown.getFullYear(), shown.getMonth() + n, 1);
    renderMonth();
  }
  document.getElementById("cal-prev").addEventListener("click", function () { step(-1); });
  document.getElementById("cal-next").addEventListener("click", function () { step(1); });
  document.getElementById("cal-today").addEventListener("click", function () {
    shown = new Date(); renderMonth();
  });

  /* ---- go ---------------------------------------------------------- */

  var status = document.getElementById("cal-status");

  function fail(message, detail) {
    status.textContent = "";
    status.hidden = false;
    status.appendChild(el("p", "cal-fail-msg", message));
    if (detail) status.appendChild(el("p", "cal-fail-detail", detail));
    /* The Google Calendar link is in the page regardless, so a student
       is never stranded when this fails. */
    document.getElementById("cal-views").hidden = true;
  }

  if (!CALENDAR_ID) {
    /* Not configured yet. Hide the Google links too — before the ID is
       set they point nowhere useful. A genuine load failure keeps them,
       because there they do go to the class calendar. */
    var links = document.querySelector(".cal-links");
    if (links) links.hidden = true;
    fail("The calendar isn't set up yet.",
         "It'll appear here once the class calendar is connected.");
    return;
  }

  load().then(function () {
    status.hidden = true;
    document.getElementById("cal-views").hidden = false;
    selectTab(tabs[0]);       /* whichever tab is first in the markup */
    renderSchedule();
    renderMonth();
    renderUpcoming();
  }).catch(function (err) {
    fail("The calendar couldn't load right now.",
         "Use the link above to open it in Google Calendar. (" + err.message + ")");
  });
})();
