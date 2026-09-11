#!/usr/bin/env node
/* Render tools/banks/*.json → tools/content/domains-*.html fragments
   and practice/flashcard + drill bank JS. */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const BANKS = path.join(ROOT, "tools/banks");
const CONTENT = path.join(ROOT, "tools/content");

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paras(htmlOrText) {
  // allow simple HTML in model answers when author used tags; else escape
  if (!htmlOrText) return "";
  if (/<[a-z][\s\S]*>/i.test(htmlOrText)) return htmlOrText;
  return `<p>${esc(htmlOrText)}</p>`;
}

function renderCard(q) {
  const steps = (q.modelAnswer || []).map((s) => `<li>${/[<>]/.test(s) ? s : esc(s)}</li>`).join("\n");
  const traps = (q.traps || []).map((s) => `<li>${esc(s)}</li>`).join("\n");
  const fus = (q.followUps || []).map((s) => `<li>${esc(s)}</li>`).join("\n");
  const links = (q.links || []).map((l) => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("");
  let mermaid = "";
  if (q.mermaid) {
    mermaid = `<div class="sac-label">Diagram</div><div class="mermaid-wrap"><pre class="mermaid">${esc(q.mermaid)}</pre></div>`;
  }
  let code = "";
  if (q.code) {
    const lang = esc(q.codeLang || "text");
    code = `<div class="sac-label">Code / ops</div><div class="codeblock"><div class="code-head"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="code-file">${lang}</span></div><pre><code data-lang="${lang}">${esc(q.code)}</code></pre></div>`;
  }
  const nest = q.nestNote ? `<div class="sac-nest"><strong>Nest / Node:</strong> ${/[<>]/.test(q.nestNote) ? q.nestNote : esc(q.nestNote)}</div>` : "";
  return `
<details class="sac reveal" id="${esc(q.id)}">
  <summary><span class="sac-id">${esc(q.id)}</span><span class="sac-q">${esc(q.question)}</span></summary>
  <div class="sac-body">
    <div class="sac-label">First 30 seconds</div>
    <div class="sac-first">${/[<>]/.test(q.first30s) ? q.first30s : esc(q.first30s)}</div>
    <div class="sac-label">Model answer</div>
    <ol class="steps">${steps}</ol>
    ${mermaid}
    ${code}
    ${nest}
    <div class="sac-label">Say it out loud</div>
    <div class="callout tip"><div class="co-body"><div class="co-title">Say it <span class="tag">spoken</span></div><p>${esc(q.sayIt)}</p></div></div>
    <div class="sac-label">Traps / weak answers</div>
    <ul class="sac-traps">${traps}</ul>
    <div class="sac-label">Follow-ups</div>
    <ul class="sac-follow">${fus}</ul>
    ${links ? `<div class="sac-label">Go deeper</div><div class="sac-links">${links}</div>` : ""}
  </div>
</details>`;
}

function renderDomain(bank) {
  const cheat = (bank.cheatStrip || []).map((c) =>
    `<div class="chip-card"><strong>${esc(c.k)}</strong><span>${esc(c.v)}</span></div>`
  ).join("\n");
  const cards = (bank.questions || []).map(renderCard).join("\n");
  const quiz = (bank.quiz || []).map((item, i) => {
    const opts = (item.options || []).map((o) =>
      `<button class="quiz-opt" data-correct="${o.ok ? "true" : "false"}"><span class="mark"></span>${esc(o.t)}</button>`
    ).join("\n");
    return `<div class="quiz">
      <div class="quiz-q">${esc(item.q)}</div>
      ${opts}
      <div class="quiz-explain">${esc(item.explain || "")}</div>
    </div>`;
  }).join("\n");

  return `          <section class="hero reveal">
            <span class="eyebrow">Domain · ${esc(bank.id)}</span>
            <h1>${esc(bank.title)}</h1>
            <p class="lead">${esc(bank.primer)}</p>
          </section>

          <section class="section reveal" id="primer">
            <h2><span class="section-num">01</span> &nbsp;Decision cheat strip</h2>
            <div class="cheat-strip">
${cheat}
            </div>
          </section>

          <section class="section reveal" id="cards">
            <h2><span class="section-num">02</span> &nbsp;Scenario cards (open → rehearse)</h2>
            <p class="muted">Work closed-book first: say your structure out loud, then open the card. Mark the domain practiced when you can recite the “say it” lines cold.</p>
${cards}
          </section>

          <section class="section reveal" id="check">
            <h2><span class="section-num">03</span> &nbsp;Self-check</h2>
${quiz || `<p class="muted">Use the scenario cards as your quiz — close them and re-open randomly.</p>`}
          </section>
`;
}

function main() {
  fs.mkdirSync(CONTENT, { recursive: true });
  const files = fs.readdirSync(BANKS).filter((f) => f.endsWith(".json") && !f.startsWith("_")).sort();
  const allQs = [];
  const flash = [];

  files.forEach((f) => {
    const bank = JSON.parse(fs.readFileSync(path.join(BANKS, f), "utf8"));
    const fragName = `domains-${bank.slug}.html`;
    fs.writeFileSync(path.join(CONTENT, fragName), renderDomain(bank));
    console.log("Wrote tools/content/" + fragName);

    (bank.questions || []).forEach((q) => {
      allQs.push({
        id: q.id,
        domain: bank.slug,
        domainTitle: bank.title,
        q: q.question,
        first30s: q.first30s,
        sayIt: q.sayIt,
        traps: q.traps || [],
      });
      flash.push({
        front: q.question,
        back: q.sayIt || (q.first30s || ""),
        tag: bank.id,
      });
      (q.traps || []).slice(0, 1).forEach((t) => {
        flash.push({
          front: `Trap — ${bank.id} / ${q.id}: what's wrong with this instinct?`,
          back: t,
          tag: bank.id + "-trap",
        });
      });
    });
  });

  // drill bank JS
  const drillJs = `/* GENERATED by tools/render-banks.js — do not hand-edit */
window.SBE_DRILL = ${JSON.stringify(allQs, null, 2)};
`;
  fs.writeFileSync(path.join(ROOT, "assets/js/sbe-bank.js"), drillJs);
  console.log("Wrote assets/js/sbe-bank.js (" + allQs.length + " questions)");

  // flashcards fragment helper data embedded in practice page by content author;
  // also write JSON for tooling
  fs.writeFileSync(path.join(BANKS, "_flashcards.json"), JSON.stringify(flash, null, 2));
  console.log("Wrote tools/banks/_flashcards.json (" + flash.length + " cards)");
}

main();
