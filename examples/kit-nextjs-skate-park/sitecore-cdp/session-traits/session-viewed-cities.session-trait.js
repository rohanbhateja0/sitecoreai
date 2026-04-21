/**
 * Sitecore CDP — Session trait: session_viewed_cities
 *
 * Purpose: list every distinct city (or location/search token) the user interacted with
 * in the **current session only**, in chronological order.
 *
 * Sources (same arbitraryData shape as property listings Engage events):
 * - property_card_clicked → arbitraryData.city
 * - property_search + search_mode=location → first segment of location_label ("City, ST, …")
 * - property_search + search_mode=text → arbitraryData.query (as typed; may not be a city)
 *
 * Return value: a JavaScript Array of strings, e.g. ["Dallas","Sayreville","Lakeland"].
 * Use a list/array session trait type in CDP if available. Returning JSON.stringify() here
 * caused CDP to persist a double-encoded string (e.g. "[\"Florida\",\"Lakeland\",…]").
 *
 * Context: uses triggerSession when CDP provides it with events; otherwise the latest WEB
 * session on the guest (same fallback pattern as other session traits).
 *
 * @see https://doc.sitecore.com/cdp/en/users/sitecore-cdp/code-snippets-1481735.html
 */

(function () {
  "use strict";

  function findWebSessions(guest) {
    if (!guest || !guest.sessions || !guest.sessions.length) {
      return [];
    }
    return guest.sessions.filter(function (s) {
      return s && s.sessionType === "WEB" && s.events && s.events.length;
    });
  }

  function pickLatestWebSession(guest) {
    var web = findWebSessions(guest);
    if (!web.length) {
      return null;
    }
    web.sort(function (a, b) {
      return new Date(b.startedAt || 0) - new Date(a.startedAt || 0);
    });
    return web[0];
  }

  function getCurrentSession(guest, triggerSession) {
    if (
      triggerSession &&
      triggerSession.events &&
      Object.prototype.toString.call(triggerSession.events) === "[object Array]" &&
      triggerSession.events.length
    ) {
      return triggerSession;
    }
    return pickLatestWebSession(guest);
  }

  function read(ev, key) {
    if (!ev) {
      return undefined;
    }
    if (ev.arbitraryData && Object.prototype.hasOwnProperty.call(ev.arbitraryData, key)) {
      return ev.arbitraryData[key];
    }
    if (Object.prototype.hasOwnProperty.call(ev, key)) {
      return ev[key];
    }
    if (ev.data && Object.prototype.hasOwnProperty.call(ev.data, key)) {
      return ev.data[key];
    }
    return undefined;
  }

  function normType(ev) {
    return String(read(ev, "type") || read(ev, "eventType") || "").toLowerCase();
  }

  function eventTime(ev) {
    var t = read(ev, "createdAt") || read(ev, "modifiedAt");
    return t ? new Date(t).getTime() : 0;
  }

  function pushUnique(list, seen, raw) {
    if (raw === undefined || raw === null) {
      return;
    }
    var s = String(raw).trim();
    if (!s || seen[s]) {
      return;
    }
    seen[s] = true;
    list.push(s);
  }

  var g = typeof guest !== "undefined" ? guest : null;
  var ts = typeof triggerSession !== "undefined" ? triggerSession : null;

  var session = getCurrentSession(g, ts);
  var events = (session && session.events) || [];

  var ordered = events.slice().sort(function (a, b) {
    return eventTime(a) - eventTime(b);
  });

  var out = [];
  var seen = {};

  for (var i = 0; i < ordered.length; i++) {
    var ev = ordered[i];
    var t = normType(ev);

    if (t === "property_card_clicked") {
      pushUnique(out, seen, read(ev, "city"));
    }

    if (t === "property_search") {
      var mode = read(ev, "search_mode");
      if (mode === "location") {
        var label = read(ev, "location_label");
        if (label) {
          pushUnique(out, seen, String(label).split(",")[0].trim());
        }
      } else if (mode === "text") {
        pushUnique(out, seen, read(ev, "query"));
      }
    }
  }

  return out;
})();
