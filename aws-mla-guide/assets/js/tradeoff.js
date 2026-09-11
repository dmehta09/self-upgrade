/* ============================================================
   AWS MLA Field Guide — trade-off explorer (.tradeoff)
   A segmented slider between competing options; picking one
   animates a set of dimension bars (latency / cost / complexity /
   …) and shows a "best for" note. There is rarely a free lunch in
   system design — this makes the cost of each choice visible.
   Offline, no deps, honors prefers-reduced-motion (via CSS).

   Authoring:
     <div class="tradeoff" data-tradeoff>
       <script type="application/json" class="tr-config">
       {
         "title": "Fan-out: write vs read",
         "axisLabel": "Where do we assemble each timeline?",
         "stops": [
           { "label": "On write", "dims": { "Read latency": 92, "Write cost": 30, "Storage": 45, "Freshness": 88 },
             "note": "Precompute every follower's timeline on each post. Reads are instant; celebrity writes explode." },
           { "label": "Hybrid", "dims": { "Read latency": 75, "Write cost": 60, "Storage": 60, "Freshness": 80 },
             "note": "Fan-out for normal users; pull on read for celebrities. The pragmatic real-world answer." },
           { "label": "On read", "dims": { "Read latency": 40, "Write cost": 90, "Storage": 80, "Freshness": 70 },
             "note": "Assemble the timeline when it's requested. Cheap writes, heavier reads + caching." }
         ]
       }
       </script>
     </div>
   ============================================================ */
(function () {
  "use strict";
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  function init(host) {
    var cfg = {};
    var sEl = host.querySelector(".tr-config") || host.querySelector("script[type='application/json']");
    if (sEl) { try { cfg = JSON.parse(sEl.textContent) || {}; } catch (e) { cfg = {}; } }
    var stops = cfg.stops || [];
    if (stops.length < 2) return;
    var dims = Object.keys(stops[0].dims || {});   // canonical dimension order from the first stop

    host.innerHTML = "";
    var head = el("div", "tr-head");
    head.appendChild(el("span", "tr-title", cfg.title || "Trade-off"));
    if (cfg.axisLabel) head.appendChild(el("div", "tr-axis", cfg.axisLabel));
    host.appendChild(head);

    var seg = el("div", "tr-seg"); host.appendChild(seg);
    var barsWrap = el("div", "tr-bars"); host.appendChild(barsWrap);
    var note = el("div", "tr-note"); host.appendChild(note);

    // build bars once; we only animate widths on change
    var fills = {}, vals = {};
    dims.forEach(function (name) {
      var bar = el("div", "tr-bar");
      bar.appendChild(el("span", "tr-blabel", name));
      var track = el("span", "tr-track");
      var fill = el("span", "tr-fill"); track.appendChild(fill);
      bar.appendChild(track);
      var v = el("span", "tr-bval", "0");
      bar.appendChild(v);
      barsWrap.appendChild(bar);
      fills[name] = fill; vals[name] = v;
    });

    var segBtns = [];
    function select(idx) {
      var stop = stops[idx];
      segBtns.forEach(function (b, k) { b.classList.toggle("active", k === idx); });
      dims.forEach(function (name) {
        var v = (stop.dims && stop.dims[name] != null) ? stop.dims[name] : 0;
        fills[name].style.width = Math.max(0, Math.min(100, v)) + "%";
        vals[name].textContent = Math.round(v);
      });
      note.innerHTML = "<b>" + (stop.label || "") + ".</b> " + (stop.note || "");
    }

    stops.forEach(function (stop, idx) {
      var b = el("button", "tr-seg-btn", stop.label || ("Option " + (idx + 1))); b.type = "button";
      b.addEventListener("click", function () { select(idx); });
      seg.appendChild(b); segBtns.push(b);
    });

    select(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".tradeoff").forEach(init); });
})();
