/* ============================================================
   Go — a visual guide · CHANLAB
   Visualises a channel as a fixed-size buffer with a queue of
   blocked senders on one side and blocked receivers on the other.
   Shows: buffered fill/drain, the unbuffered rendezvous (cap 0 →
   a sender and receiver hand off directly), select choosing the
   one ready case, close → receivers drain then get the zero value,
   and the send-on-closed-channel panic.

   Frame-stepper contract: ←/→ step · Space play/pause · Home/End.
   Each frame fully specifies state (no deltas). Offline,
   theme-aware, reduced-motion aware.

   Authoring:
     <figure class="chanlab reveal" data-chanlab aria-label="…">
       <script type="application/json" class="cl-config">
       { "frames": [
         { "caption": "Buffered cap-2 channel, one value queued.",
           "channels": [
             { "id":"ch", "cap":2, "buf":[1],
               "senders":[{"g":"g1","val":2}],
               "receivers":[] } ],
           "output": "" },
         { "caption": "Receiver takes 1; sender g1's 2 moves into the buffer.",
           "channels": [
             { "id":"ch", "cap":2, "buf":[2], "senders":[], "receivers":[] } ],
           "output": "got 1" }
       ] }
       </script>
     </figure>
   Per channel: cap (0 = unbuffered), buf = values currently held,
   closed = true draws the closed badge, senders/receivers = blocked
   goroutines (sender carries val). Top-level: select = { g, cases[],
   ready } highlights the chosen case; event = a red banner (e.g. a
   panic); output = accumulated stdout. ============================================================ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }

  function build(fig) {
    var confEl = fig.querySelector(".cl-config");
    if (!confEl) return;
    var cfg; try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    var frames = cfg.frames || [];
    if (!frames.length) return;

    var stage = el("div", "cl-stage");
    var cap = el("div", "viz-cap");
    var controls = el("div", "viz-controls");
    var resetB = el("button", "viz-reset", "⏮"), prevB = el("button", "viz-prev", "‹"),
        playB = el("button", "viz-play", "▶ Play"), nextB = el("button", "viz-next", "›"),
        stepEl = el("span", "viz-step", "");
    [resetB, prevB, playB, nextB].forEach(function (b) { b.type = "button"; });
    controls.appendChild(resetB); controls.appendChild(prevB); controls.appendChild(playB); controls.appendChild(nextB); controls.appendChild(stepEl);
    fig.appendChild(stage); fig.appendChild(cap); fig.appendChild(controls);

    function party(side, list) {
      var col = el("div", "cl-party cl-" + side);
      col.appendChild(el("div", "cl-plabel", side === "send" ? "blocked senders" : "blocked receivers"));
      var wrap = el("div", "cl-pwrap");
      if (!list || !list.length) wrap.appendChild(el("span", "cl-none", "—"));
      else list.forEach(function (g) {
        var box = el("div", "cl-waiter");
        box.appendChild(el("span", "cl-wg", g.g));
        if (side === "send" && g.val != null) box.appendChild(el("span", "cl-wval", "⇢ " + g.val));
        wrap.appendChild(box);
      });
      col.appendChild(wrap);
      return col;
    }

    function render(n) {
      var f = frames[n];
      stage.innerHTML = "";

      (f.channels || []).forEach(function (ch) {
        var row = el("div", "cl-chan");
        row.appendChild(party("send", ch.senders));

        var mid = el("div", "cl-mid");
        var head = el("div", "cl-chead");
        head.appendChild(el("span", "cl-cid", ch.id));
        head.appendChild(el("span", "cl-cmeta", ch.cap === 0 ? "unbuffered" : "cap " + ch.cap + " · len " + (ch.buf ? ch.buf.length : 0)));
        if (ch.closed) head.appendChild(el("span", "cl-closed", "closed"));
        mid.appendChild(head);

        var cells = el("div", "cl-cells");
        if (ch.cap === 0) {
          var rz = el("div", "cl-rendez", "rendezvous");
          cells.appendChild(rz);
        } else {
          var buf = ch.buf || [];
          for (var k = 0; k < ch.cap; k++) {
            var filled = k < buf.length;
            cells.appendChild(el("span", "cl-cell" + (filled ? " filled" : ""), filled ? String(buf[k]) : ""));
          }
        }
        mid.appendChild(cells);
        row.appendChild(mid);

        row.appendChild(party("recv", ch.receivers));
        stage.appendChild(row);
      });

      /* select widget */
      if (f.select) {
        var sel = el("div", "cl-select");
        sel.appendChild(el("div", "cl-plabel", "select in " + (f.select.g || "main") + " — ready case wins"));
        var crow = el("div", "cl-cases");
        (f.select.cases || []).forEach(function (c, k) {
          crow.appendChild(el("div", "cl-case" + (f.select.ready === k ? " ready" : ""), c));
        });
        sel.appendChild(crow);
        stage.appendChild(sel);
      }

      /* event banner (panic etc.) */
      if (f.event) {
        var ev = el("div", "cl-event");
        ev.textContent = "⚠ " + f.event;
        stage.appendChild(ev);
      }

      /* output */
      var out = el("div", "cl-out");
      out.appendChild(el("div", "cl-plabel", "output"));
      var ov = f.output != null ? String(f.output) : "";
      if (ov === "") out.appendChild(el("span", "cl-none", "(none yet)"));
      else ov.split("\n").forEach(function (line) { out.appendChild(el("span", "cl-emit", line)); });
      stage.appendChild(out);

      cap.innerHTML = f.caption || "";
      stepEl.textContent = (n + 1) + " / " + frames.length;
      i = n;
    }

    var i = 0, timer = null;
    function stop() { if (timer) { clearInterval(timer); timer = null; } playB.textContent = "▶ Play"; }
    function play() { if (i >= frames.length - 1) render(0); playB.textContent = "⏸ Pause"; timer = setInterval(function () { if (i >= frames.length - 1) { stop(); return; } render(i + 1); }, 2400); }
    function go(n) { stop(); render(Math.max(0, Math.min(frames.length - 1, n))); }
    resetB.addEventListener("click", function () { go(0); });
    prevB.addEventListener("click", function () { go(i - 1); });
    nextB.addEventListener("click", function () { go(i + 1); });
    playB.addEventListener("click", function () { timer ? stop() : play(); });
    fig.setAttribute("tabindex", "0");
    fig.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { go(i + 1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { go(i - 1); e.preventDefault(); }
      else if (e.key === " " || e.key === "Spacebar") { timer ? stop() : play(); e.preventDefault(); }
      else if (e.key === "Home") { go(0); }
      else if (e.key === "End") { go(frames.length - 1); }
    });
    if (REDUCED) playB.style.display = "none";
    render(0);
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll("[data-chanlab]").forEach(build); });
})();
