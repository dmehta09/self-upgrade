/* Timed CKA task mock — reads #mockBank JSON with performance tasks */
(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function mount(root) {
    var bankEl = $("#mockBank", root);
    if (!bankEl) return;
    var bank;
    try { bank = JSON.parse(bankEl.textContent); } catch (e) { root.innerHTML = "<p>Invalid mock bank JSON.</p>"; return; }
    var tasks = bank.tasks || bank.questions || [];
    var minutes = bank.minutes || 120;
    var shell = document.createElement("div");
    shell.className = "mock-shell";
    shell.innerHTML =
      '<div class="mock-meta"><span>Tasks: <b id="mqCount">' + tasks.length + "</b></span>" +
      '<span>Timer: <b id="mqTimer">' + minutes + ":00</b></span>" +
      '<span>Mode: CKA performance · domain-weighted</span></div>' +
      '<div id="mqList"></div>' +
      '<div class="mock-actions">' +
      '<button type="button" class="rp-run" id="mqStart">Start timer</button>' +
      '<button type="button" class="rp-run" id="mqSubmit">Reveal solutions</button>' +
      '<button type="button" class="rp-reset" id="mqReset">Reset</button></div>' +
      '<div class="mock-score" id="mqScore"></div>';
    root.appendChild(shell);

    var list = $("#mqList", shell);
    tasks.forEach(function (t, i) {
      var div = document.createElement("div");
      div.className = "mock-q";
      div.dataset.idx = String(i);
      var weight = t.weight != null ? " · ~" + t.weight + "%" : "";
      div.innerHTML =
        '<p class="mq-stem"><b>T' + (i + 1) + " · " + esc(t.domain || "?") + weight + "</b> — " + esc(t.stem) + "</p>" +
        '<label class="mq-done"><input type="checkbox" name="mq' + i + '"> Mark done (self-check)</label>';
      list.appendChild(div);
    });

    var remaining = minutes * 60;
    var timerId = null;
    var timerEl = $("#mqTimer", shell);
    function fmt(s) {
      var m = Math.floor(s / 60), r = s % 60;
      return m + ":" + (r < 10 ? "0" : "") + r;
    }
    function tick() {
      remaining -= 1;
      if (remaining <= 0) {
        remaining = 0;
        timerEl.textContent = "0:00";
        clearInterval(timerId);
        timerId = null;
        score();
        return;
      }
      timerEl.textContent = fmt(remaining);
    }
    $("#mqStart", shell).addEventListener("click", function () {
      if (timerId) return;
      remaining = minutes * 60;
      timerEl.textContent = fmt(remaining);
      timerId = setInterval(tick, 1000);
    });

    function score() {
      if (timerId) { clearInterval(timerId); timerId = null; }
      var by = {};
      var done = 0;
      var review = [];
      tasks.forEach(function (t, i) {
        var d = t.domain || "Other";
        if (!by[d]) by[d] = { ok: 0, n: 0 };
        by[d].n += 1;
        var checked = $('input[name="mq' + i + '"]', shell);
        var ok = checked && checked.checked;
        if (ok) { done += 1; by[d].ok += 1; }
        var qDiv = list.children[i];
        if (qDiv) {
          qDiv.classList.toggle("is-correct", ok);
          qDiv.classList.toggle("is-wrong", !ok);
        }
        var steps = (t.solutionSteps || []).map(function (s) {
          return "<li><code>" + esc(s) + "</code></li>";
        }).join("");
        var verify = t.verify ? '<p class="mq-why"><b>Verify:</b> ' + esc(t.verify) + "</p>" : "";
        var why = t.why ? '<p class="mq-why">' + esc(t.why) + "</p>" : "";
        var lesson = t.lesson || "";
        var lessonHtml = lesson
          ? '<p class="mq-lesson"><a href="' + esc(lesson) + '">Re-read lesson →</a></p>'
          : "";
        review.push(
          '<div class="mq-review ' + (ok ? "ok" : "bad") + '">' +
          '<p class="mq-rev-head"><b>T' + (i + 1) + "</b> " + (ok ? "✓ Marked done" : "○ Not marked") +
          " · " + esc(d) + "</p>" +
          '<p class="mq-stem">' + esc(t.stem) + "</p>" +
          (steps ? "<ol class=\"mq-steps\">" + steps + "</ol>" : "") +
          verify + why + lessonHtml +
          "</div>"
        );
      });
      var scoreEl = $("#mqScore", shell);
      var pct = tasks.length ? Math.round((100 * done) / tasks.length) : 0;
      var bars = Object.keys(by).map(function (d) {
        var row = by[d];
        var p = row.n ? Math.round((100 * row.ok) / row.n) : 0;
        return '<div class="bar-row"><span>' + esc(d) + "</span><span class=\"bar\"><i style=\"width:" + p + '%\"></i></span><span>' + row.ok + "/" + row.n + "</span></div>";
      }).join("");
      scoreEl.innerHTML = "<p><b>Self-check: " + done + " / " + tasks.length + " marked (" + pct + "%)</b></p>" +
        "<p>CKA is scored by graders on a live cluster — use solutions below to compare your approach. Target ≥66% on timed runs.</p>" +
        "<div class=\"bars\">" + bars + "</div>" +
        "<h3 class=\"mq-review-title\">Task solutions</h3>" +
        "<div class=\"mq-reviews\">" + review.join("") + "</div>";
      scoreEl.classList.add("is-open");
      scoreEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    $("#mqSubmit", shell).addEventListener("click", score);
    $("#mqReset", shell).addEventListener("click", function () {
      if (timerId) { clearInterval(timerId); timerId = null; }
      remaining = minutes * 60;
      timerEl.textContent = fmt(remaining);
      $all("input[type=checkbox]", shell).forEach(function (el) { el.checked = false; });
      $all(".mock-q", shell).forEach(function (el) {
        el.classList.remove("is-correct", "is-wrong");
      });
      var scoreEl = $("#mqScore", shell);
      scoreEl.classList.remove("is-open");
      scoreEl.innerHTML = "";
    });
  }

  function boot() {
    $all("[data-mock]").forEach(mount);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
