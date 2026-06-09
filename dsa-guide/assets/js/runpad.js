/* ============================================================
   DSA Field Guide — runnable Python (Pyodide)
   Editable .runpad blocks that execute real Python in the browser.
   • Pyodide loads lazily on the FIRST Run click (one shared runtime).
   • Pydantic loads via loadPackage("pydantic") (vendored wheel — no PyPI).
   • Offline / CDN failure -> shows the hand-authored expected output.
   Pyodide is the ONLY part of this site that needs the network.
   ============================================================ */
(function () {
  "use strict";
  var PYODIDE_VER = "0.29.4";
  var CDN = "https://cdn.jsdelivr.net/pyodide/v" + PYODIDE_VER + "/full/";

  var pyodidePromise = null;       // shared singleton
  var loadedPkgs = {};

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src; s.onload = resolve;
      s.onerror = function () { reject(new Error("Failed to load " + src)); };
      document.head.appendChild(s);
      setTimeout(function () { reject(new Error("Timed out loading Pyodide")); }, 30000);
    });
  }

  function getPyodide(onStatus) {
    if (pyodidePromise) return pyodidePromise;
    pyodidePromise = (function () {
      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        return Promise.reject(new Error("offline"));
      }
      if (onStatus) onStatus("Downloading Python (~once, a few MB)…");
      return loadScript(CDN + "pyodide.js")
        .then(function () { return window.loadPyodide({ indexURL: CDN }); });
    })();
    pyodidePromise.catch(function () { pyodidePromise = null; }); // allow retry after failure
    return pyodidePromise;
  }

  function ensurePackages(py, list) {
    var need = (list || []).filter(function (p) { return !loadedPkgs[p]; });
    if (!need.length) return Promise.resolve();
    return py.loadPackage(need).then(function () { need.forEach(function (p) { loadedPkgs[p] = true; }); });
  }

  function setBtn(btn, label, busy) {
    btn.disabled = !!busy;
    btn.innerHTML = busy ? '<span class="spin"></span>' + label : label;
  }

  function wire(pad) {
    var editor = pad.querySelector(".rp-editor");
    var runBtn = pad.querySelector(".rp-run");
    var resetBtn = pad.querySelector(".rp-reset");
    var output = pad.querySelector(".rp-output");
    var expected = pad.querySelector(".rp-expected");
    if (!editor || !runBtn || !output) return;

    var initialCode = editor.value;
    var expectedHTML = expected ? expected.outerHTML : "";
    var needs = (pad.getAttribute("data-needs") || "").split(/\s+/).filter(Boolean);

    function showExpected(note) {
      output.innerHTML =
        '<span class="rp-label">Output</span>' +
        (note ? '<div class="rp-note">' + note + '</div>' : "") +
        expectedHTML;
    }

    function fresh() { output.innerHTML = '<span class="rp-label">Output</span>'; return output; }

    resetBtn && resetBtn.addEventListener("click", function () {
      editor.value = initialCode;
      showExpected("");
    });

    runBtn.addEventListener("click", function () {
      var code = editor.value;
      setBtn(runBtn, "Loading…", true);
      var statusShown = false;
      getPyodide(function (msg) { statusShown = true; fresh().innerHTML += '<div class="rp-note">' + msg + '</div>'; })
        .then(function (py) {
          setBtn(runBtn, "Running…", true);
          return ensurePackages(py, needs).then(function () {
            var buf = [];
            py.setStdout({ batched: function (s) { buf.push(s); } });
            py.setStderr({ batched: function (s) { buf.push(s); } });
            return py.runPythonAsync(code).then(function (ret) {
              var text = buf.join("\n");
              if ((text === "" || text == null) && ret !== undefined && ret !== null) text = String(ret);
              var box = fresh();
              var pre = document.createElement("pre");
              pre.className = "rp-expected";
              pre.textContent = text === "" ? "(no output)" : text;
              box.appendChild(pre);
            });
          });
        })
        .catch(function (err) {
          var msg = (err && err.message) || String(err);
          if (msg === "offline" || /load|network|timed out/i.test(msg)) {
            showExpected("Live Python needs an internet connection (it downloads Pyodide once). Showing the saved output:");
          } else {
            // a real Python error from runPythonAsync
            var box = fresh();
            var pre = document.createElement("pre");
            pre.className = "rp-err"; pre.textContent = msg;
            box.appendChild(pre);
          }
        })
        .then(function () { setBtn(runBtn, "Run", false); });
    });

    // initial state: show the saved expected output so the page teaches at a glance
    showExpected("");
  }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".runpad").forEach(wire); });
})();
