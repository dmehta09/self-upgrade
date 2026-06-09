/* ============================================================
   THE LANG STACK — shared behaviors (no dependencies, offline)
   theme · mobile nav · scroll progress · scrollspy · code tabs ·
   copy · quizzes · reveal-on-scroll · Python syntax highlighter
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---------- Theme ---------- */
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("genai-theme", t); } catch (e) {}
  }
  (function initTheme() {
    var saved;
    try { saved = localStorage.getItem("genai-theme"); } catch (e) {}
    applyTheme(saved === "light" || saved === "dark" ? saved : "dark");
  })();

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    /* theme toggle */
    var themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
      });
    }

    /* mobile nav */
    var menuBtn = document.getElementById("menuBtn");
    var scrim = document.querySelector(".sidebar-scrim");
    function closeNav() { document.body.classList.remove("nav-open"); }
    if (menuBtn) menuBtn.addEventListener("click", function () { document.body.classList.toggle("nav-open"); });
    if (scrim) scrim.addEventListener("click", closeNav);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeNav(); });
    // close after tapping a link on mobile
    document.querySelectorAll(".sidebar a").forEach(function (a) {
      a.addEventListener("click", function () { if (window.innerWidth <= 980) closeNav(); });
    });

    /* mark active sidebar link by current path */
    (function markActive() {
      var here = location.pathname.replace(/\/index\.html$/, "/").replace(/\/+$/, "/") || "/";
      var hereFile = location.pathname.split("/").pop() || "index.html";
      document.querySelectorAll(".sidebar .nav-link").forEach(function (a) {
        var href = a.getAttribute("href");
        if (!href || href.charAt(0) === "#") return;
        var clean = href.split("#")[0].split("?")[0];
        var file = clean.split("/").pop();
        // resolve against current location for robust compare
        var resolved;
        try { resolved = new URL(href, location.href).pathname; } catch (e) { resolved = clean; }
        if (resolved === location.pathname) a.classList.add("active");
      });
    })();

    /* scroll progress bar */
    var bar = document.querySelector(".scroll-progress");
    if (bar) {
      var ticking = false;
      function upd() {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
        ticking = false;
      }
      window.addEventListener("scroll", function () {
        if (!ticking) { window.requestAnimationFrame(upd); ticking = true; }
      }, { passive: true });
      upd();
    }

    /* code tabs */
    document.querySelectorAll(".codeblock").forEach(function (block) {
      var tabs = block.querySelectorAll(".code-tab");
      var panes = block.querySelectorAll(".code-pane");
      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () {
          tabs.forEach(function (t) { t.classList.remove("active"); });
          panes.forEach(function (p) { p.classList.remove("active"); });
          tab.classList.add("active");
          if (panes[i]) panes[i].classList.add("active");
        });
      });
    });

    /* copy buttons */
    document.querySelectorAll(".code-copy").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var block = btn.closest(".codeblock");
        var pane = block.querySelector(".code-pane.active") || block.querySelector(".code-pane") || block;
        var codeEl = pane.querySelector("code") || pane;
        var text = codeEl.innerText;
        var done = function () {
          var label = btn.querySelector(".clabel");
          btn.classList.add("copied");
          if (label) { var old = label.textContent; label.textContent = "Copied!"; setTimeout(function () { label.textContent = old; btn.classList.remove("copied"); }, 1600); }
          else setTimeout(function () { btn.classList.remove("copied"); }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(fallback);
        } else fallback();
        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); done(); } catch (e) {}
          document.body.removeChild(ta);
        }
      });
    });

    /* quizzes */
    document.querySelectorAll(".quiz").forEach(function (quiz) {
      var opts = quiz.querySelectorAll(".quiz-opt");
      var explain = quiz.querySelector(".quiz-explain");
      opts.forEach(function (opt) {
        opt.addEventListener("click", function () {
          if (quiz.dataset.answered) return;
          quiz.dataset.answered = "1";
          var correct = opt.getAttribute("data-correct") === "true";
          opt.classList.add(correct ? "correct" : "wrong");
          var mark = opt.querySelector(".mark"); if (mark) mark.textContent = correct ? "✓" : "✕";
          if (!correct) {
            opts.forEach(function (o) {
              if (o.getAttribute("data-correct") === "true") {
                o.classList.add("correct");
                var m = o.querySelector(".mark"); if (m) m.textContent = "✓";
              }
            });
          }
          opts.forEach(function (o) { o.disabled = true; });
          if (explain) explain.classList.add("show");
        });
      });
    });

    /* reveal on scroll */
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && reveals.length) {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); ro.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      reveals.forEach(function (el) { ro.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("in"); });
    }

    /* scrollspy for .toc and in-page sidebar anchors */
    var spyLinks = [].slice.call(document.querySelectorAll('.toc a[href^="#"], .nav-sub a[href^="#"]'));
    if (spyLinks.length && "IntersectionObserver" in window) {
      var map = {};
      var targets = [];
      spyLinks.forEach(function (l) {
        var id = l.getAttribute("href").slice(1);
        var sec = document.getElementById(id);
        if (sec) { map[id] = l; targets.push(sec); }
      });
      var current = null;
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) current = en.target.id;
        });
        if (current && map[current]) {
          spyLinks.forEach(function (l) { l.classList.remove("active"); });
          map[current].classList.add("active");
        }
      }, { rootMargin: "-80px 0px -65% 0px", threshold: 0 });
      targets.forEach(function (t) { so.observe(t); });
    }

    /* syntax highlight */
    highlightAll();
  });

  /* ============================================================
     Lightweight Python / shell highlighter
     ============================================================ */
  var PY_KW = ["def","class","return","if","elif","else","for","while","in","not","and","or","is","import","from","as","with","try","except","finally","raise","pass","break","continue","lambda","yield","global","nonlocal","assert","del","async","await","None","True","False","match","case","await"];
  var PY_BI = ["print","len","str","int","float","list","dict","set","tuple","bool","range","enumerate","zip","type","isinstance","super","self","cls","map","filter","sorted","reversed","sum","min","max","abs","input","ord","chr","divmod","pow","round","all","any","iter","next",
    // common DSA structures / helpers — colored like builtins
    "deque","defaultdict","Counter","OrderedDict","heapq","heappush","heappop","heapify","heappushpop","heapreplace","nlargest","nsmallest","bisect","bisect_left","bisect_right","insort","math","inf","gcd","lcm","floor","ceil","sqrt","log2","collections","itertools","permutations","combinations","product","accumulate",
    // typing names + the node classes solutions define
    "Optional","List","Dict","Set","Tuple","Deque","Any","Union","Iterable","TreeNode","ListNode","Node"];
  var KW = {}; PY_KW.forEach(function (k) { KW[k] = 1; });
  var BI = {}; PY_BI.forEach(function (k) { BI[k] = 1; });

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function highlightPython(code) {
    // master tokenizer regex (ordered)
    var re = /(\"\"\"[\s\S]*?\"\"\"|'''[\s\S]*?''')|(#[^\n]*)|([rbfRBF]{0,2}\"(?:\\.|[^\"\\])*\"|[rbfRBF]{0,2}'(?:\\.|[^'\\])*')|(@[A-Za-z_][\w.]*)|(\b\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?\b)|([A-Za-z_]\w*)|([^\sA-Za-z0-9_])/g;
    var out = "", m, last = 0;
    while ((m = re.exec(code)) !== null) {
      if (m.index > last) out += esc(code.slice(last, m.index));
      last = re.lastIndex;
      if (m[1]) out += '<span class="tok-str">' + esc(m[1]) + "</span>";          // triple string
      else if (m[2]) out += '<span class="tok-com">' + esc(m[2]) + "</span>";      // comment
      else if (m[3]) out += '<span class="tok-str">' + esc(m[3]) + "</span>";      // string
      else if (m[4]) out += '<span class="tok-dec">' + esc(m[4]) + "</span>";      // decorator
      else if (m[5]) out += '<span class="tok-num">' + esc(m[5]) + "</span>";      // number
      else if (m[6]) {                                                              // identifier
        var w = m[6];
        var after = code.charAt(re.lastIndex);
        if (KW[w]) out += '<span class="tok-kw">' + w + "</span>";
        else if (after === "(") out += '<span class="tok-fn">' + w + "</span>";
        else if (BI[w]) out += '<span class="tok-bi">' + w + "</span>";
        else out += w;
      }
      else if (m[7]) {                                                              // punctuation/operator
        var p = m[7];
        if ("|=+-*/<>:".indexOf(p) !== -1) out += '<span class="tok-op">' + esc(p) + "</span>";
        else out += esc(p);
      }
    }
    if (last < code.length) out += esc(code.slice(last));
    return out;
  }

  function highlightShell(code) {
    return esc(code).replace(/^(\s*)(\$)(\s)/gm, '$1<span class="tok-prompt">$</span>$3')
                    .replace(/\b(pip|python|python3|uv|export|langgraph|npm|node)\b/g, '<span class="tok-bi">$1</span>')
                    .replace(/(#[^\n]*)/g, '<span class="tok-com">$1</span>');
  }

  function highlightAll() {
    document.querySelectorAll(".codeblock pre code").forEach(function (el) {
      if (el.dataset.hl) return;
      var lang = el.getAttribute("data-lang") || "python";
      var raw = el.textContent;
      if (lang === "bash" || lang === "shell" || lang === "console") el.innerHTML = highlightShell(raw);
      else if (lang === "text" || lang === "txt") el.innerHTML = esc(raw);
      else el.innerHTML = highlightPython(raw);
      el.dataset.hl = "1";
    });
  }
})();
