/* ============================================================
   FastAPI Field Guide — interactive API playground (no server)
   Each .playground holds a <script type="application/json"
   class="playground-config"> describing mock endpoint(s). A pure-JS
   router + Pydantic-v2-faithful validator returns real FastAPI-shaped
   responses: 404 / 405, and 422 with the exact
   {"detail":[{type,loc,msg,input}]} envelope. Runs offline / file://.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- type coercion (mimics Pydantic v2 lax mode) ---------- */
  function coerce(type, val, loc, name) {
    var L = loc.concat([name]);
    type = type || "str";
    if (type.indexOf("list") === 0) {
      if (!Array.isArray(val)) return err("list_type", L, "Input should be a valid list", val);
      var sub = (type.match(/list\[(\w+)\]/) || [])[1] || "str";
      var out = [], e;
      for (var i = 0; i < val.length; i++) {
        var r = coerce(sub, val[i], L, i);
        if (r.error) { e = r.error; break; }
        out.push(r.value);
      }
      return e ? { error: e } : { value: out };
    }
    if (type === "int") {
      if (typeof val === "number") {
        if (Number.isInteger(val)) return { value: val };
        return err("int_from_float", L, "Input should be a valid integer, got a number with a fractional part", val);
      }
      if (typeof val === "string" && /^-?\d+$/.test(val.trim())) return { value: parseInt(val, 10) };
      if (typeof val === "boolean") return { value: val ? 1 : 0 };
      return err("int_parsing", L, "Input should be a valid integer, unable to parse string as an integer", val);
    }
    if (type === "float") {
      if (typeof val === "number") return { value: val };
      if (typeof val === "string" && /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(val.trim())) return { value: parseFloat(val) };
      return err("float_parsing", L, "Input should be a valid number, unable to parse string as a number", val);
    }
    if (type === "bool") {
      if (typeof val === "boolean") return { value: val };
      var s = String(val).toLowerCase();
      if (["true", "1", "yes", "on"].indexOf(s) !== -1) return { value: true };
      if (["false", "0", "no", "off"].indexOf(s) !== -1) return { value: false };
      return err("bool_parsing", L, "Input should be a valid boolean, unable to interpret input", val);
    }
    // str
    if (typeof val === "string") return { value: val };
    if (typeof val === "number" || typeof val === "boolean") return err("string_type", L, "Input should be a valid string", val);
    return err("string_type", L, "Input should be a valid string", val);
  }

  function err(type, loc, msg, input) { return { error: { type: type, loc: loc, msg: msg, input: input } }; }

  /* ---------- constraint checks (after coercion) ---------- */
  function constrain(spec, value, loc, name) {
    var L = loc.concat([name]);
    if (typeof value === "number") {
      if (spec.ge != null && value < spec.ge) return err("greater_than_equal", L, "Input should be greater than or equal to " + spec.ge, value).error;
      if (spec.gt != null && value <= spec.gt) return err("greater_than", L, "Input should be greater than " + spec.gt, value).error;
      if (spec.le != null && value > spec.le) return err("less_than_equal", L, "Input should be less than or equal to " + spec.le, value).error;
      if (spec.lt != null && value >= spec.lt) return err("less_than", L, "Input should be less than " + spec.lt, value).error;
    }
    if (typeof value === "string") {
      if (spec.min_length != null && value.length < spec.min_length) return err("string_too_short", L, "String should have at least " + spec.min_length + " characters", value).error;
      if (spec.max_length != null && value.length > spec.max_length) return err("string_too_long", L, "String should have at most " + spec.max_length + " characters", value).error;
      if (spec.pattern && !(new RegExp(spec.pattern).test(value))) return err("string_pattern_mismatch", L, "String should match pattern '" + spec.pattern + "'", value).error;
    }
    if (Array.isArray(value)) {
      if (spec.min_length != null && value.length < spec.min_length) return err("too_short", L, "List should have at least " + spec.min_length + " items after validation, not " + value.length, value).error;
      if (spec.max_length != null && value.length > spec.max_length) return err("too_long", L, "List should have at most " + spec.max_length + " items after validation, not " + value.length, value).error;
    }
    return null;
  }

  function validateGroup(schema, source, locName) {
    // schema: {field: spec}, source: {field: rawValue or undefined}
    var errors = [], values = {};
    Object.keys(schema || {}).forEach(function (field) {
      var spec = schema[field];
      var has = Object.prototype.hasOwnProperty.call(source, field) && source[field] !== undefined && source[field] !== "";
      if (!has) {
        if (spec.required) errors.push({ type: "missing", loc: [locName, field], msg: "Field required", input: source });
        else if (spec.default !== undefined) values[field] = spec.default;
        return;
      }
      var c = coerce(spec.type, source[field], [locName], field);
      if (c.error) { errors.push(c.error); return; }
      var ce = constrain(spec, c.value, [locName], field);
      if (ce) { errors.push(ce); return; }
      values[field] = c.value;
    });
    return { errors: errors, values: values };
  }

  /* ---------- routing ---------- */
  function pathToRegex(p) {
    var names = [];
    var rx = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\{(\w+)\\\}/g, function (_, n) { names.push(n); return "([^/]+)"; });
    return { re: new RegExp("^" + rx + "$"), names: names };
  }

  function resolveShape(shape, ctx) {
    if (typeof shape === "string" && shape.charAt(0) === "$") {
      var parts = shape.slice(1).split(".");
      var bag = ctx[parts[0]];
      if (parts.length === 1) return bag;
      return bag ? bag[parts[1]] : null;
    }
    if (Array.isArray(shape)) return shape.map(function (x) { return resolveShape(x, ctx); });
    if (shape && typeof shape === "object") {
      var o = {}; Object.keys(shape).forEach(function (k) { o[k] = resolveShape(shape[k], ctx); }); return o;
    }
    return shape;
  }

  function handle(cfg, method, rawPath, bodyText) {
    var qIdx = rawPath.indexOf("?");
    var pathname = qIdx >= 0 ? rawPath.slice(0, qIdx) : rawPath;
    var queryStr = qIdx >= 0 ? rawPath.slice(qIdx + 1) : "";
    var qs = {}; queryStr.split("&").forEach(function (kv) { if (!kv) return; var i = kv.indexOf("="); var k = i >= 0 ? kv.slice(0, i) : kv; qs[decodeURIComponent(k)] = i >= 0 ? decodeURIComponent(kv.slice(i + 1)) : ""; });

    var pathMatchedDifferentMethod = false, ep = null, pathParams = {};
    for (var i = 0; i < cfg.endpoints.length; i++) {
      var e = cfg.endpoints[i];
      var pr = pathToRegex(e.path);
      var m = pr.re.exec(pathname);
      if (!m) continue;
      if (e.method.toUpperCase() !== method.toUpperCase()) { pathMatchedDifferentMethod = true; continue; }
      ep = e; pr.names.forEach(function (n, idx) { pathParams[n] = decodeURIComponent(m[idx + 1]); });
      break;
    }
    if (!ep) {
      if (pathMatchedDifferentMethod) return { status: 405, body: { detail: "Method Not Allowed" } };
      return { status: 404, body: { detail: "Not Found" } };
    }

    var errors = [], values = { path: {}, query: {}, body: {} };

    var pr2 = validateGroup(ep.path_params, pathParams, "path");
    errors = errors.concat(pr2.errors); values.path = pr2.values;

    var qr = validateGroup(ep.query_params, qs, "query");
    errors = errors.concat(qr.errors); values.query = qr.values;

    if (ep.body) {
      var parsed = null, bad = false;
      try { parsed = bodyText && bodyText.trim() ? JSON.parse(bodyText) : {}; }
      catch (e2) { bad = true; }
      if (bad) errors.push({ type: "json_invalid", loc: ["body"], msg: "JSON decode error", input: {} });
      else {
        var br = validateGroup(ep.body, parsed || {}, "body");
        errors = errors.concat(br.errors); values.body = br.values;
      }
    }

    if (errors.length) return { status: 422, body: { detail: errors } };

    var status = (ep.respond && ep.respond.status) || 200;
    var body = ep.respond && ep.respond.shape ? resolveShape(ep.respond.shape, values) : values.body;
    return { status: status, body: body };
  }

  /* ---------- response rendering ---------- */
  var REASON = { 200: "OK", 201: "Created", 202: "Accepted", 204: "No Content", 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 405: "Method Not Allowed", 422: "Unprocessable Entity" };
  function statusClass(code) { return code < 300 ? "ok" : code < 500 ? "warn" : "err"; }

  function hljson(obj) {
    var json = JSON.stringify(obj, null, 2).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g, function (match) {
      var cls = "j-num";
      if (/^"/.test(match)) cls = /:$/.test(match) ? "j-key" : "j-str";
      else if (/true|false/.test(match)) cls = "j-bool";
      else if (/null/.test(match)) cls = "j-null";
      return '<span class="' + cls + '">' + match + "</span>";
    });
  }

  /* ---------- widget wiring ---------- */
  function methodClass(m) { return "pg-method " + m.toLowerCase(); }
  function hasBodyMethod(m) { return ["POST", "PUT", "PATCH"].indexOf(m.toUpperCase()) !== -1; }

  function build(pad) {
    var confEl = pad.querySelector(".playground-config");
    if (!confEl) return;
    var cfg;
    try { cfg = JSON.parse(confEl.textContent); } catch (e) { return; }
    cfg.endpoints = cfg.endpoints || [];
    cfg.presets = cfg.presets || [];

    var first = cfg.presets[0] || (function () { var e = cfg.endpoints[0] || {}; return { method: e.method || "GET", path: e.path || "/", body: null }; })();
    var state = { method: (first.method || "GET").toUpperCase(), path: first.path || "/" };

    var presetsHTML = cfg.presets.map(function (p, i) { return '<button class="pg-preset" data-i="' + i + '">' + escapeHtml(p.label || p.method + " " + p.path) + "</button>"; }).join("");

    pad.innerHTML =
      (cfg.title ? '<div class="pg-head">' + escapeHtml(cfg.title) + "</div>" : "") +
      '<div class="pg-grid">' +
        '<div class="pg-req">' +
          (presetsHTML ? '<div class="pg-presets">' + presetsHTML + "</div>" : "") +
          '<div class="pg-line"><span class="' + methodClass(state.method) + '">' + state.method + '</span>' +
          '<input class="pg-path" value="' + escapeAttr(state.path) + '" aria-label="Request path" /></div>' +
          '<div class="pg-bodywrap"><div class="pg-blabel">Request body (JSON)</div>' +
          '<textarea class="pg-body" spellcheck="false" aria-label="Request body"></textarea></div>' +
          '<button class="btn btn-primary pg-send">Send request</button>' +
          '<div class="pg-hint">Edit the path or body, or click a preset, then Send. Responses are computed locally — no server.</div>' +
        "</div>" +
        '<div class="pg-res"><div class="pg-res-label">Response</div><div class="pg-status-wrap"></div><pre class="pg-json">// click "Send request"</pre></div>' +
      "</div>" +
      confEl.outerHTML; // keep config in DOM (inert)

    var methodEl = pad.querySelector(".pg-method");
    var pathEl = pad.querySelector(".pg-path");
    var bodyWrap = pad.querySelector(".pg-bodywrap");
    var bodyEl = pad.querySelector(".pg-body");
    var sendEl = pad.querySelector(".pg-send");
    var statusWrap = pad.querySelector(".pg-status-wrap");
    var jsonEl = pad.querySelector(".pg-json");

    function syncBodyVisibility() { bodyWrap.style.display = hasBodyMethod(state.method) ? "" : "none"; }

    function applyPreset(p) {
      state.method = (p.method || "GET").toUpperCase();
      state.path = p.path || "/";
      methodEl.className = methodClass(state.method);
      methodEl.textContent = state.method;
      pathEl.value = state.path;
      bodyEl.value = p.body != null ? JSON.stringify(p.body, null, 2) : "";
      syncBodyVisibility();
    }

    pad.querySelectorAll(".pg-preset").forEach(function (b) {
      b.addEventListener("click", function () { applyPreset(cfg.presets[+b.getAttribute("data-i")]); });
    });

    sendEl.addEventListener("click", function () {
      state.path = pathEl.value;
      var res = handle(cfg, state.method, state.path, bodyEl.value);
      var reason = REASON[res.status] || "";
      statusWrap.innerHTML = '<div class="pg-status ' + statusClass(res.status) + '">' + res.status + (reason ? " " + reason : "") + "</div>";
      jsonEl.innerHTML = hljson(res.body);
    });

    if (cfg.presets[0]) applyPreset(cfg.presets[0]); else syncBodyVisibility();
  }

  function escapeHtml(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }

  function onReady(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  onReady(function () { document.querySelectorAll(".playground").forEach(build); });
})();
