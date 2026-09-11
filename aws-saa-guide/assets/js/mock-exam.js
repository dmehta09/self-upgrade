/* Timed SAA mock — reads #mockBank JSON, scores by domain */
(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function mount(root) {
    var bankEl = $("#mockBank", root);
    if (!bankEl) return;
    var bank;
    try { bank = JSON.parse(bankEl.textContent); } catch (e) { root.innerHTML = "<p>Invalid mock bank JSON.</p>"; return; }
    var qs = bank.questions || [];
    var minutes = bank.minutes || 30;
    var shell = document.createElement("div");
    shell.className = "mock-shell";
    shell.innerHTML =
      '<div class="mock-meta"><span>Questions: <b id="mqCount">' + qs.length + "</b></span>" +
      '<span>Timer: <b id="mqTimer">' + minutes + ":00</b></span>" +
      '<span>Mode: domain-weighted SAA-C03</span></div>' +
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
        return '<label><input type="radio" name="mq' + i + '" value="' + j + '"><span>' + c + "</span></label>";
      }).join("");
      div.innerHTML = '<p class="mq-stem"><b>Q' + (i + 1) + " · " + (q.domain || "?") + "</b> — " + q.stem + "</p>" +
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
      qs.forEach(function (q, i) {
        var d = q.domain || "Other";
        if (!by[d]) by[d] = { ok: 0, n: 0 };
        by[d].n += 1;
        var picked = $('input[name="mq' + i + '"]:checked', shell);
        var ans = picked ? Number(picked.value) : -1;
        if (ans === q.answer) { correct += 1; by[d].ok += 1; }
      });
      var scoreEl = $("#mqScore", shell);
      var pct = qs.length ? Math.round((100 * correct) / qs.length) : 0;
      var bars = Object.keys(by).map(function (d) {
        var row = by[d];
        var p = row.n ? Math.round((100 * row.ok) / row.n) : 0;
        return '<div class="bar-row"><span>' + d + "</span><span class=\"bar\"><i style=\"width:" + p + '%\"></i></span><span>' + row.ok + "/" + row.n + "</span></div>";
      }).join("");
      scoreEl.innerHTML = "<p><b>Score: " + correct + " / " + qs.length + " (" + pct + "%)</b></p>" +
        "<p>Review weak domains below, then re-read those lessons.</p><div class=\"bars\">" + bars + "</div>";
      scoreEl.classList.add("is-open");
    }
    $("#mqSubmit", shell).addEventListener("click", score);
    $("#mqReset", shell).addEventListener("click", function () {
      if (timerId) { clearInterval(timerId); timerId = null; }
      remaining = minutes * 60;
      timerEl.textContent = fmt(remaining);
      $all("input[type=radio]", shell).forEach(function (el) { el.checked = false; });
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
