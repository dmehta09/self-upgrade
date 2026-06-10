/* ============================================================
   System Design Field Guide — quorum explorer (.quorum)
   An interactive consistency lab: N replicas, tunable W and R.
   Issue writes and reads, make a replica lag or partition it,
   and watch stale reads, failed writes, and split-brain happen —
   each event narrated in interview English in the log. Pure DOM
   (no SVG), no deps, theme-aware, reduced-motion safe.

   Authoring:
     <div class="quorum" data-quorum>
       <script type="application/json" class="qr-config">
       { "title": "Quorum reads & writes",
         "n": 3, "w": 2, "r": 2,
         "presets": [ { "label": "Strong (W+R>N)", "w": 2, "r": 2 },
                      { "label": "Fast & loose",   "w": 1, "r": 1 } ] }
       </script>
     </div>

   The model (deliberately simple, the version every interviewer
   expects): a write needs W acks from reachable replicas or it
   fails outright. A LAGGED replica still serves reads (stale) but
   is too slow to ack writes. A PARTITIONED replica is unreachable
   from the client — but a second writer on the far side of the
   split can commit to it ("Write to far side"), so healing can
   surface a split-brain conflict, resolved last-write-wins.
   ============================================================ */
(function () {
  "use strict";

  function el(t, c, html) { var e = document.createElement(t); if (c) e.className = c; if (html != null) e.innerHTML = html; return e; }
  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }

  var STATES = ["healthy", "lagged", "partitioned"];
  var STATE_LABEL = { healthy: "healthy", lagged: "lagged", partitioned: "partitioned" };
  var STATE_GLYPH = { healthy: "●", lagged: "◐", partitioned: "✕" };

  function init(host) {
    var cfgEl = host.querySelector(".qr-config") || host.querySelector("script[type='application/json']");
    var cfg = {};
    if (cfgEl) { try { cfg = JSON.parse(cfgEl.textContent) || {}; } catch (e) { cfg = {}; } }

    var N = Math.min(5, Math.max(2, cfg.n || 3));
    var w = Math.min(N, Math.max(1, cfg.w || 2));
    var r = Math.min(N, Math.max(1, cfg.r || 2));
    var presets = cfg.presets || [];

    /* replica model: state + applied version; latest = newest version
       committed anywhere (so reads below it are provably stale) */
    var reps = [], version = 0, latest = 0, farWrites = 0, nearWrites = 0;
    for (var k = 0; k < N; k++) reps.push({ state: "healthy", v: 0 });

    host.innerHTML = "";
    var head = el("div", "qr-head");
    head.appendChild(el("span", "qr-title", cfg.title || "Quorum reads &amp; writes"));
    var badge = el("span", "qr-badge");
    head.appendChild(badge);
    host.appendChild(head);

    /* W / R steppers + presets */
    var rail = el("div", "qr-rail");
    function stepper(label, get, set) {
      var box = el("div", "qr-stepper");
      box.appendChild(el("span", "qr-slabel", label));
      var minus = el("button", "qr-sbtn", "−"); minus.type = "button"; minus.setAttribute("aria-label", "Decrease " + label);
      var val = el("span", "qr-sval", String(get()));
      var plus = el("button", "qr-sbtn", "+"); plus.type = "button"; plus.setAttribute("aria-label", "Increase " + label);
      minus.addEventListener("click", function () { set(Math.max(1, get() - 1)); val.textContent = get(); refresh(); });
      plus.addEventListener("click", function () { set(Math.min(N, get() + 1)); val.textContent = get(); refresh(); });
      box.appendChild(minus); box.appendChild(val); box.appendChild(plus);
      return { box: box, val: val };
    }
    var wS = stepper("W", function () { return w; }, function (x) { w = x; });
    var rS = stepper("R", function () { return r; }, function (x) { r = x; });
    rail.appendChild(wS.box); rail.appendChild(rS.box);
    var presetWrap = el("div", "qr-presets");
    presets.forEach(function (p) {
      var b = el("button", "qr-chip", p.label); b.type = "button";
      b.addEventListener("click", function () {
        w = Math.min(N, Math.max(1, p.w || w)); r = Math.min(N, Math.max(1, p.r || r));
        wS.val.textContent = w; rS.val.textContent = r; refresh();
        log("Preset <b>" + p.label + "</b>: W=" + w + ", R=" + r + ".", "");
      });
      presetWrap.appendChild(b);
    });
    rail.appendChild(presetWrap);
    host.appendChild(rail);

    /* replica cards */
    var row = el("div", "qr-row");
    var cards = reps.map(function (rep, idx) {
      var c = el("button", "qr-rep"); c.type = "button";
      c.setAttribute("aria-label", "Replica " + (idx + 1) + " — click to cycle healthy, lagged, partitioned");
      var name = el("span", "qr-rname", "R" + (idx + 1));
      var ver = el("span", "qr-rver", "v0");
      var st = el("span", "qr-rstate", STATE_GLYPH.healthy + " healthy");
      c.appendChild(name); c.appendChild(ver); c.appendChild(st);
      c.addEventListener("click", function () {
        var next = STATES[(STATES.indexOf(rep.state) + 1) % STATES.length];
        rep.state = next;
        log("R" + (idx + 1) + " is now <b>" + STATE_LABEL[next] + "</b>" +
          (next === "lagged" ? " — reachable for reads but too slow to ack writes." :
           next === "partitioned" ? " — unreachable from this client." : "."), "");
        refresh();
      });
      row.appendChild(c);
      return { btn: c, ver: ver, st: st };
    });
    host.appendChild(row);

    /* action buttons */
    var actions = el("div", "qr-actions");
    var writeBtn = el("button", "qr-btn primary", "Write x=v?"); writeBtn.type = "button";
    var farBtn = el("button", "qr-btn", "Write to far side"); farBtn.type = "button";
    var readBtn = el("button", "qr-btn", "Read"); readBtn.type = "button";
    var healBtn = el("button", "qr-btn", "Heal all"); healBtn.type = "button";
    actions.appendChild(writeBtn); actions.appendChild(farBtn); actions.appendChild(readBtn); actions.appendChild(healBtn);
    host.appendChild(actions);

    var conflict = el("div", "qr-conflict"); conflict.hidden = true; host.appendChild(conflict);

    var logBox = el("div", "qr-log");
    logBox.setAttribute("aria-live", "polite");
    host.appendChild(logBox);

    function reachable(rep) { return rep.state !== "partitioned"; }
    function partitioned() { return reps.filter(function (x) { return x.state === "partitioned"; }); }

    function log(msg, kind) {
      var line = el("div", "qr-line" + (kind ? " " + kind : ""), msg);
      logBox.insertBefore(line, logBox.firstChild);
      while (logBox.children.length > 8) logBox.removeChild(logBox.lastChild);
    }

    function flash(idx, cls) {
      cards[idx].btn.classList.add(cls);
      setTimeout(function () { cards[idx].btn.classList.remove(cls); }, 900);
    }

    function refresh() {
      reps.forEach(function (rep, idx) {
        cards[idx].ver.textContent = "v" + rep.v;
        cards[idx].st.textContent = STATE_GLYPH[rep.state] + " " + STATE_LABEL[rep.state];
        cards[idx].btn.className = "qr-rep is-" + rep.state + (rep.v < latest && rep.state !== "partitioned" ? " is-stale" : "");
      });
      writeBtn.textContent = "Write x=v" + (version + 1);
      farBtn.hidden = !partitioned().length;
      var strong = w + r > N;
      badge.className = "qr-badge " + (strong ? "ok" : "warn");
      badge.innerHTML = "W+R" + (strong ? ">" : "≤") + "N → " + (strong ? "read/write sets overlap: reads see the latest committed write" : "no overlap guarantee: stale reads possible");
    }

    writeBtn.addEventListener("click", function () {
      var targets = [];
      reps.forEach(function (rep, idx) { if (rep.state === "healthy") targets.push(idx); });
      var acks = targets.length;
      if (acks >= w) {
        version++; latest = version; nearWrites++;
        targets.forEach(function (idx) { reps[idx].v = version; flash(idx, "did-write"); });
        var laggers = reps.filter(function (x) { return x.state === "lagged"; }).length;
        log("<b>WRITE v" + version + " committed</b> — " + acks + " ack" + (acks === 1 ? "" : "s") + " ≥ W=" + w + "." +
          (laggers ? " Lagged replica" + (laggers === 1 ? "" : "s") + " will catch up on heal." : ""), "ok");
      } else {
        log("<b>WRITE failed</b> — only " + acks + " reachable ack" + (acks === 1 ? "" : "s") + ", need W=" + w + ". The system chose consistency over availability (CP).", "bad");
      }
      refresh();
    });

    farBtn.addEventListener("click", function () {
      var far = [];
      reps.forEach(function (rep, idx) { if (rep.state === "partitioned") far.push(idx); });
      if (!far.length) return;
      if (far.length >= w) {
        version++; latest = version; farWrites++;
        far.forEach(function (idx) { reps[idx].v = version; flash(idx, "did-write"); });
        log("<b>FAR-SIDE WRITE v" + version + " committed</b> on the other side of the partition (" + far.length + " ≥ W=" + w + "). Both sides now accept writes — split-brain in the making.", "warn");
      } else {
        log("<b>FAR-SIDE WRITE failed</b> — only " + far.length + " replica" + (far.length === 1 ? "" : "s") + " on that side, need W=" + w + ". A majority quorum prevents split-brain exactly this way.", "bad");
      }
      refresh();
    });

    readBtn.addEventListener("click", function () {
      var idxs = [];
      reps.forEach(function (rep, idx) { if (reachable(rep)) idxs.push(idx); });
      if (idxs.length < r) {
        log("<b>READ failed</b> — only " + idxs.length + " reachable replica" + (idxs.length === 1 ? "" : "s") + ", need R=" + r + ".", "bad");
        return;
      }
      /* reads hit R random reachable replicas — like real coordinators do */
      for (var i = idxs.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = idxs[i]; idxs[i] = idxs[j]; idxs[j] = t; }
      var hit = idxs.slice(0, r);
      var got = 0;
      hit.forEach(function (idx) { got = Math.max(got, reps[idx].v); flash(idx, "did-read"); });
      var names = hit.map(function (idx) { return "R" + (idx + 1); }).join(", ");
      if (got < latest) {
        log("<b>STALE READ</b> — hit " + names + " → v" + got + ", but v" + latest + " is committed elsewhere. W+R≤N (or a lagging replica) means the read set missed every up-to-date copy.", "warn");
      } else {
        log("<b>READ v" + got + "</b> from " + names + " — fresh. The read set overlapped a replica that saw the latest write.", "ok");
      }
      refresh();
    });

    healBtn.addEventListener("click", function () {
      var hadConflict = farWrites > 0 && nearWrites > 0;
      var maxV = 0;
      reps.forEach(function (rep) { maxV = Math.max(maxV, rep.v); });
      reps.forEach(function (rep) { rep.state = "healthy"; rep.v = maxV; });
      latest = maxV;
      if (hadConflict) {
        conflict.hidden = false;
        conflict.innerHTML = "<b>Split-brain detected on heal:</b> both sides committed writes during the partition. Resolved last-write-wins → <b>v" + maxV + "</b> survives, the other write is silently lost. This is why you mention vector clocks / CRDTs — or a majority quorum that makes one side refuse writes.";
        log("<b>HEALED with conflict</b> — divergent histories merged last-write-wins at v" + maxV + ".", "warn");
      } else {
        conflict.hidden = true;
        log("<b>HEALED</b> — replication caught every replica up to v" + maxV + ".", "ok");
      }
      farWrites = 0; nearWrites = 0;
      refresh();
    });

    refresh();
    log("Click a replica to make it lag or partition it, then write and read. W=" + w + ", R=" + r + ", N=" + N + ".", "");
  }

  onReady(function () { document.querySelectorAll(".quorum").forEach(init); });
})();
