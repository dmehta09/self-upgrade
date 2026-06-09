/* ============================================================
   DEVOPS FIELD GUIDE — shared behaviors (no dependencies, offline)
   theme · mobile nav · scroll progress · scrollspy · code tabs ·
   copy · quizzes · reveal-on-scroll · multi-language highlighter
   (Bash / YAML / Dockerfile / HCL / JSON / Python / Markdown)
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---------- Theme ---------- */
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("devops-theme", t); } catch (e) {}
  }
  (function initTheme() {
    var saved;
    try { saved = localStorage.getItem("devops-theme"); } catch (e) {}
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

  /* JS / TS keywords (for the API SDK snippets) */
  var JS_KW = ["const","let","var","function","return","if","else","for","while","do","switch","case","break","continue","new","class","extends","super","import","from","export","default","await","async","try","catch","finally","throw","typeof","instanceof","in","of","this","yield","delete","void","null","true","false","undefined","interface","type","enum","implements","public","private","protected","readonly","as","static","get","set"];
  var JSKW = {}; JS_KW.forEach(function (k) { JSKW[k] = 1; });

  /* React / Next / TanStack / Zustand / RHF / testing identifiers — colored like builtins */
  var JS_BI = ["useState","useEffect","useRef","useMemo","useCallback","useContext","useReducer","useTransition","useDeferredValue","useId","useLayoutEffect","useInsertionEffect","useSyncExternalStore","useImperativeHandle","useOptimistic","useActionState","useFormStatus",
    "memo","forwardRef","createContext","Fragment","Suspense","lazy","startTransition","createPortal","StrictMode",
    "cookies","headers","redirect","permanentRedirect","notFound","revalidatePath","revalidateTag","unstable_cache","useRouter","usePathname","useSearchParams","useParams","NextResponse","NextRequest","Image","Link","Script",
    "useQuery","useSuspenseQuery","useMutation","useQueryClient","useInfiniteQuery","QueryClient","QueryClientProvider",
    "createStore","useStore","useShallow",
    "useForm","useFormContext","useController","useFieldArray","zodResolver",
    "clsx","cva","twMerge",
    "describe","expect","beforeEach","afterEach","render","screen","within","waitFor","fireEvent","userEvent"];
  var JSBI = {}; JS_BI.forEach(function (k) { JSBI[k] = 1; });

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
    return esc(code)
      .replace(/^(\s*)([$>])(\s)/gm, '$1<span class="tok-prompt">$2</span>$3')
      .replace(/\b(claude|npm|npx|pnpm|pnpx|yarn|bun|bunx|deno|node|vite|tsc|next|eslint|biome|vitest|playwright|vercel|turbo|pip|pip3|pipx|python|python3|uv|brew|winget|irm|curl|git|gh|cd|ls|cat|export|source|pytest|bash|sh|zsh|docker|mkdir|echo|code|ssh|rm|mv|cp)\b/g, '<span class="tok-bi">$1</span>')
      .replace(/(\s)(--?[A-Za-z][\w-]*)/g, '$1<span class="tok-dec">$2</span>')
      .replace(/(#[^\n]*)/g, '<span class="tok-com">$1</span>');
  }

  /* JS / TS — tokenizer mirrors the Python one (strings, comments, numbers, idents) */
  function highlightJS(code) {
    var re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\.|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d[\d_]*\.?\d*(?:[eE][+-]?\d+)?\b)|([A-Za-z_$][\w$]*)|([^\sA-Za-z0-9_$])/g;
    var out = "", m, last = 0;
    while ((m = re.exec(code)) !== null) {
      if (m.index > last) out += esc(code.slice(last, m.index));
      last = re.lastIndex;
      if (m[1]) out += '<span class="tok-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-str">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-num">' + esc(m[3]) + "</span>";
      else if (m[4]) {
        var w = m[4], after = code.charAt(re.lastIndex);
        if (JSKW[w]) out += '<span class="tok-kw">' + w + "</span>";
        else if (after === "(") out += '<span class="tok-fn">' + w + "</span>";
        else if (JSBI[w]) out += '<span class="tok-bi">' + w + "</span>";
        else out += w;
      } else if (m[5]) {
        var p = m[5];
        if ("|=+-*/<>:".indexOf(p) !== -1) out += '<span class="tok-op">' + esc(p) + "</span>";
        else out += esc(p);
      }
    }
    if (last < code.length) out += esc(code.slice(last));
    return out;
  }

  /* JSON — keys vs strings vs literals (for settings.json / config) */
  function highlightJSON(code) {
    return esc(code).replace(/("(?:\\.|[^"\\])*"\s*:|"(?:\\.|[^"\\])*"|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g, function (match) {
      if (/^"/.test(match)) {
        if (/:\s*$/.test(match)) { var q = match.replace(/\s*:\s*$/, ""); return '<span class="tok-fn">' + q + "</span>" + match.slice(q.length); }
        return '<span class="tok-str">' + match + "</span>";
      }
      if (/^(true|false|null)$/.test(match)) return '<span class="tok-kw">' + match + "</span>";
      return '<span class="tok-num">' + match + "</span>";
    });
  }

  /* Markdown — light touch for CLAUDE.md / SKILL.md / agent files */
  function highlightMarkdown(code) {
    var lines = esc(code).split("\n"), fence = false, front = false;
    for (var i = 0; i < lines.length; i++) {
      var ln = lines[i];
      if (i === 0 && /^---\s*$/.test(ln)) { front = true; lines[i] = '<span class="tok-com">' + ln + "</span>"; continue; }
      if (front && /^---\s*$/.test(ln)) { front = false; lines[i] = '<span class="tok-com">' + ln + "</span>"; continue; }
      if (front) { lines[i] = ln.replace(/^([\w-]+)(\s*:)/, '<span class="tok-dec">$1</span>$2'); continue; }
      if (/^\s*```/.test(ln)) { fence = !fence; lines[i] = '<span class="tok-com">' + ln + "</span>"; continue; }
      if (fence) continue;
      if (/^#{1,6}\s/.test(ln)) { lines[i] = '<span class="tok-fn">' + ln + "</span>"; continue; }
      ln = ln.replace(/^(\s*)([-*+])(\s)/, '$1<span class="tok-op">$2</span>$3');
      ln = ln.replace(/^(\s*)(\d+\.)(\s)/, '$1<span class="tok-op">$2</span>$3');
      ln = ln.replace(/`([^`]+)`/g, '<span class="tok-str">`$1`</span>');
      ln = ln.replace(/\*\*([^*]+)\*\*/g, '<span class="tok-kw">**$1**</span>');
      lines[i] = ln;
    }
    return lines.join("\n");
  }

  /* YAML — K8s manifests / GitHub Actions / Compose (single-pass, safe) */
  function highlightYAML(code) {
    var re = /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\$\{[^}\n]*\}|\{\{[^}\n]*\}\})|^([ \t]*(?:- )*)([A-Za-z0-9_.\/\-]+)(?=\s*:)|(\b(?:true|false|null|yes|no|on|off)\b)|(-?\b\d[\d._]*\b)/gm;
    var out = "", m, last = 0;
    while ((m = re.exec(code)) !== null) {
      if (m.index > last) out += esc(code.slice(last, m.index));
      last = re.lastIndex;
      if (m[1]) out += '<span class="tok-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-str">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-dec">' + esc(m[3]) + "</span>";
      else if (m[5] !== undefined) out += esc(m[4]) + '<span class="tok-fn">' + esc(m[5]) + "</span>";
      else if (m[6]) out += '<span class="tok-kw">' + esc(m[6]) + "</span>";
      else if (m[7]) out += '<span class="tok-num">' + esc(m[7]) + "</span>";
    }
    if (last < code.length) out += esc(code.slice(last));
    return out;
  }

  /* Dockerfile — instruction keywords + comments + strings + vars */
  function highlightDockerfile(code) {
    var INSTR = { FROM: 1, RUN: 1, CMD: 1, LABEL: 1, EXPOSE: 1, ENV: 1, ADD: 1, COPY: 1, ENTRYPOINT: 1, VOLUME: 1, USER: 1, WORKDIR: 1, ARG: 1, ONBUILD: 1, STOPSIGNAL: 1, HEALTHCHECK: 1, SHELL: 1, MAINTAINER: 1, AS: 1 };
    var re = /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|^([ \t]*)([A-Za-z]+)|(\$\{?[A-Za-z_]\w*\}?)|(\b\d[\d.]*\b)/gm;
    var out = "", m, last = 0;
    while ((m = re.exec(code)) !== null) {
      if (m.index > last) out += esc(code.slice(last, m.index));
      last = re.lastIndex;
      if (m[1]) out += '<span class="tok-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-str">' + esc(m[2]) + "</span>";
      else if (m[4] !== undefined) { out += esc(m[3]); out += (INSTR[m[4]] && m[4] === m[4].toUpperCase()) ? '<span class="tok-kw">' + m[4] + "</span>" : esc(m[4]); }
      else if (m[5]) out += '<span class="tok-dec">' + esc(m[5]) + "</span>";
      else if (m[6]) out += '<span class="tok-num">' + esc(m[6]) + "</span>";
    }
    if (last < code.length) out += esc(code.slice(last));
    return out;
  }

  /* HCL / Terraform — block keywords, attr names, strings, ${interp}, numbers */
  function highlightHCL(code) {
    var KW = { resource: 1, variable: 1, output: 1, module: 1, data: 1, provider: 1, locals: 1, terraform: 1, dynamic: 1, "for": 1, "in": 1, "if": 1 };
    var re = /(#[^\n]*|\/\/[^\n]*)|("(?:\\.|[^"\\])*")|(\$\{[^}\n]*\})|(\b[a-zA-Z_][\w-]*\b)(\s*=(?!=))?|(\b\d[\d.]*\b)/g;
    var out = "", m, last = 0;
    while ((m = re.exec(code)) !== null) {
      if (m.index > last) out += esc(code.slice(last, m.index));
      last = re.lastIndex;
      if (m[1]) out += '<span class="tok-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tok-str">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="tok-dec">' + esc(m[3]) + "</span>";
      else if (m[4] !== undefined) {
        var w = m[4];
        if (KW[w]) out += '<span class="tok-kw">' + w + "</span>";
        else if (m[5]) out += '<span class="tok-fn">' + w + "</span>";
        else if (w === "true" || w === "false" || w === "null") out += '<span class="tok-kw">' + w + "</span>";
        else out += esc(w);
        if (m[5]) out += esc(m[5]);
      }
      else if (m[6]) out += '<span class="tok-num">' + esc(m[6]) + "</span>";
    }
    if (last < code.length) out += esc(code.slice(last));
    return out;
  }

  function highlightAll() {
    document.querySelectorAll(".codeblock pre code").forEach(function (el) {
      if (el.dataset.hl) return;
      var lang = (el.getAttribute("data-lang") || "text").toLowerCase();
      var raw = el.textContent;
      if (lang === "bash" || lang === "shell" || lang === "console" || lang === "sh" || lang === "zsh") el.innerHTML = highlightShell(raw);
      else if (lang === "yaml" || lang === "yml") el.innerHTML = highlightYAML(raw);
      else if (lang === "dockerfile" || lang === "docker") el.innerHTML = highlightDockerfile(raw);
      else if (lang === "hcl" || lang === "terraform" || lang === "tf") el.innerHTML = highlightHCL(raw);
      else if (lang === "js" || lang === "javascript" || lang === "ts" || lang === "typescript" || lang === "jsx" || lang === "tsx") el.innerHTML = highlightJS(raw);
      else if (lang === "json") el.innerHTML = highlightJSON(raw);
      else if (lang === "md" || lang === "markdown") el.innerHTML = highlightMarkdown(raw);
      else if (lang === "python" || lang === "py") el.innerHTML = highlightPython(raw);
      else el.innerHTML = esc(raw);
      el.dataset.hl = "1";
    });
  }
})();
