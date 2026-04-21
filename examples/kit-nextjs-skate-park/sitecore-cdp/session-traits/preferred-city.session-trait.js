/**
 * Sitecore CDP — Session trait: preferred_city
 *
 * Purpose: one "best" city for the **guest**, aggregated across **all WEB sessions**, with
 * per-session event weights multiplied by a **recency** factor (newer sessions count more).
 *
 * Within each WEB session:
 * - property_card_clicked.city → weight 4 (state/region is not scored here to avoid "PA"/"FL" keys)
 * - property_search + location → first segment of location_label → weight 2
 * - property_search + text → query → weight 1
 *
 * Recency: sessions sorted newest-first by startedAt. Session at index 0 uses multiplier 1;
 * each older session multiplies by SESSION_RECENCY_DECAY (0.92^index). Tune DECAY toward 1 to
 * weight all sessions more equally; lower DECAY emphasizes the latest visits.
 *
 * Fallback when no scored city from any event: geoLocationCity from bxt dataExtensions on the
 * newest WEB session that defines it (then next-oldest, etc.).
 *
 * triggerSession is ignored for scoring scope (guest-wide); CDP still passes it for other traits.
 * If your deployment needs trigger-only scoring, copy this file and narrow the session loop.
 *
 * @see https://doc.sitecore.com/cdp/en/users/sitecore-cdp/code-snippets-1481735.html
 *
 * Local harness: `preferred-city.scenarios.json` + `session-traits.harness.mjs` + `test.json`.
 */

(function () {
  "use strict";

  /** Per-session multiplier for each step older than the latest WEB session (newest = 1). */
  var SESSION_RECENCY_DECAY = 0.92;

  var WEIGHT_CARD_CITY = 4;
  var WEIGHT_SEARCH_LOCATION = 2;
  var WEIGHT_SEARCH_TEXT = 1;

  function findWebSessions(guest) {
    if (!guest || !guest.sessions || !guest.sessions.length) {
      return [];
    }
    return guest.sessions.filter(function (s) {
      return s && s.sessionType === "WEB" && s.events && s.events.length;
    });
  }

  /** Newest WEB session first (by startedAt). */
  function webSessionsNewestFirst(guest) {
    var web = findWebSessions(guest);
    web.sort(function (a, b) {
      return new Date(b.startedAt || 0) - new Date(a.startedAt || 0);
    });
    return web;
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

  function readBxtGeoCity(session) {
    if (!session || !session.dataExtensions) {
      return undefined;
    }
    for (var i = 0; i < session.dataExtensions.length; i++) {
      var dx = session.dataExtensions[i];
      if (!dx || !dx.values) {
        continue;
      }
      if (dx.name === "bxt" || dx.key === "bxt") {
        return dx.values.geoLocationCity;
      }
    }
    return undefined;
  }

  function bump(map, raw, weight) {
    if (raw === undefined || raw === null) {
      return;
    }
    var s = String(raw).trim();
    if (!s) {
      return;
    }
    map[s] = (map[s] || 0) + (weight || 1);
  }

  function scoreSessionEvents(events, sessionMultiplier, scores) {
    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      var t = normType(ev);
      var m = sessionMultiplier;

      if (t === "property_card_clicked") {
        bump(scores, read(ev, "city"), WEIGHT_CARD_CITY * m);
      }

      if (t === "property_search") {
        var mode = read(ev, "search_mode");
        if (mode === "location") {
          var label = read(ev, "location_label");
          if (label) {
            var first = String(label).split(",")[0].trim();
            bump(scores, first, WEIGHT_SEARCH_LOCATION * m);
          }
        } else if (mode === "text") {
          var q = read(ev, "query");
          bump(scores, q, WEIGHT_SEARCH_TEXT * m);
        }
      }
    }
  }

  var g = typeof guest !== "undefined" ? guest : null;

  var scores = {};
  var web = g ? webSessionsNewestFirst(g) : [];

  for (var si = 0; si < web.length; si++) {
    var sess = web[si];
    var mult = Math.pow(SESSION_RECENCY_DECAY, si);
    scoreSessionEvents(sess.events || [], mult, scores);
  }

  var best = "";
  var bestScore = 0;
  Object.keys(scores).forEach(function (k) {
    if (scores[k] > bestScore) {
      bestScore = scores[k];
      best = k;
    }
  });

  if (!best) {
    for (var bj = 0; bj < web.length; bj++) {
      var geo = readBxtGeoCity(web[bj]);
      if (geo) {
        best = String(geo).trim();
        break;
      }
    }
  }

  return best || "";
})();
