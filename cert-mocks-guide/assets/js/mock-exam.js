/* Timed SAA mock — reads #mockBank JSON, scores by domain, teaches on review */
(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function mount(root) {
    var bankEl = $("#mockBank", root) || (root.parentElement && $("#mockBank", root.parentElement)) || $("#mockBank");
    if (!bankEl) { root.innerHTML = "<p>Mock bank missing.</p>"; return; }
    var bank;
    try { bank = JSON.parse(bankEl.textContent); } catch (e) { root.innerHTML = "<p>Invalid mock bank JSON.</p>"; return; }
    var qs = bank.questions || [];
    var minutes = bank.minutes || 130;
    var label = bank.label || "MCQ mock";
    var passHint = bank.passHint || "Practice bar ≥72% (~AWS 720/1000).";
    var shell = document.createElement("div");
    shell.className = "mock-shell";
    shell.innerHTML =
      '<div class="mock-meta"><span>Questions: <b id="mqCount">' + qs.length + "</b></span>" +
      '<span>Timer: <b id="mqTimer">' + minutes + ":00</b></span>" +
      '<span>Mode: ' + esc(label) + "</span></div>" +
      '<div id="mqList"></div>' +
      '<div class="mock-actions">' +
      '<button type="button" class="rp-run" id="mqStart">Start timer</button>' +
      '<button type="button" class="rp-run" id="mqSubmit">Score mock</button>' +
      '<button type="button" class="rp-reset" id="mqReset">Reset</button></div>' +
      '<div class="mock-score" id="mqScore"></div>';
    root.appendChild(shell);

    var list = $("#mqList", shell);
    qs.forEach(function (q, i) {
      var div = document.createElement("div");
      div.className = "mock-q";
      div.dataset.idx = String(i);
      var opts = (q.choices || []).map(function (c, j) {
        return '<label><input type="radio" name="mq' + i + '" value="' + j + '"><span>' + esc(c) + "</span></label>";
      }).join("");
      div.innerHTML = '<p class="mq-stem"><b>Q' + (i + 1) + " · " + esc(q.domain || "?") + "</b> — " + esc(q.stem) + "</p>" +
        '<div class="mq-opts">' + opts + "</div>";
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
      var correct = 0;
      var review = [];
      qs.forEach(function (q, i) {
        var d = q.domain || "Other";
        if (!by[d]) by[d] = { ok: 0, n: 0 };
        by[d].n += 1;
        var picked = $('input[name="mq' + i + '"]:checked', shell);
        var ans = picked ? Number(picked.value) : -1;
        var ok = ans === q.answer;
        if (ok) { correct += 1; by[d].ok += 1; }
        var qDiv = list.children[i];
        if (qDiv) {
          qDiv.classList.toggle("is-correct", ok);
          qDiv.classList.toggle("is-wrong", !ok);
        }
        var why = q.why || "Re-read the linked lesson and try again.";
        var lesson = q.lesson || "";
        var lessonHtml = lesson
          ? '<p class="mq-lesson"><a href="' + esc(lesson) + '">Re-read lesson →</a></p>'
          : "";
        var your = ans >= 0 && q.choices ? esc(q.choices[ans]) : "<em>No answer</em>";
        var right = q.choices ? esc(q.choices[q.answer]) : "";
        review.push(
          '<div class="mq-review ' + (ok ? "ok" : "bad") + '">' +
          '<p class="mq-rev-head"><b>Q' + (i + 1) + "</b> " + (ok ? "✓ Correct" : "✗ Missed") +
          " · " + esc(d) + "</p>" +
          (ok ? "" : '<p class="mq-yours">You: ' + your + "</p>") +
          '<p class="mq-right"><b>Answer:</b> ' + right + "</p>" +
          '<p class="mq-why">' + esc(why) + "</p>" +
          lessonHtml +
          "</div>"
        );
      });
      var scoreEl = $("#mqScore", shell);
      var pct = qs.length ? Math.round((100 * correct) / qs.length) : 0;
      var bars = Object.keys(by).map(function (d) {
        var row = by[d];
        var p = row.n ? Math.round((100 * row.ok) / row.n) : 0;
        return '<div class="bar-row"><span>' + esc(d) + "</span><span class=\"bar\"><i style=\"width:" + p + '%\"></i></span><span>' + row.ok + "/" + row.n + "</span></div>";
      }).join("");
      scoreEl.innerHTML = "<p><b>Score: " + correct + " / " + qs.length + " (" + pct + "%)</b></p>" +
        "<p>" + esc(passHint) + " Domain bars first — then read each explanation and open the lesson link.</p>" +
        "<div class=\"bars\">" + bars + "</div>" +
        "<h3 class=\"mq-review-title\">Question review</h3>" +
        "<div class=\"mq-reviews\">" + review.join("") + "</div>";
      scoreEl.classList.add("is-open");
      scoreEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    $("#mqSubmit", shell).addEventListener("click", score);
    $("#mqReset", shell).addEventListener("click", function () {
      if (timerId) { clearInterval(timerId); timerId = null; }
      remaining = minutes * 60;
      timerEl.textContent = fmt(remaining);
      $all("input[type=radio]", shell).forEach(function (el) { el.checked = false; });
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
