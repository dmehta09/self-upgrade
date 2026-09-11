#!/usr/bin/env node
/* Print a ready-to-paste stub for a new DSA pattern problem (hand-HTML guide).
   Usage:  node tools/new-problem.js <pattern-file-stem> <problem-id> "Title"
   Example: node tools/new-problem.js stack next-greater "Next Greater Element"
*/
"use strict";
const id = process.argv[3];
const title = process.argv[4] || "Problem title";
const pattern = process.argv[2] || "pattern-name";

if (!process.argv[3]) {
  console.error('Usage: node tools/new-problem.js <pattern-stem> <problem-id> "Title"');
  console.error('Then paste into patterns/<stem>.html, add TOC link, rebuild search, verify.');
  process.exit(1);
}

const slug = id.replace(/_/g, "-");
console.log(`Paste into patterns/${pattern}.html (and add TOC + mermaid-init.js if missing):\n`);
console.log(`<!-- ===== PROBLEM: ${title.toUpperCase()} ===== -->
<section class="section problem reveal" id="${slug}">
  <header class="problem-meta">
    <h2><span class="section-num">NN</span> &nbsp;${title}</h2>
    <div class="pm-tags">
      <span class="pm-chip pattern">Pattern</span>
      <span class="pm-chip diff-med">Medium</span>
      <span class="pm-chip cx">O(?) time · O(?) space</span>
    </div>
  </header>
  <p class="lead">…</p>
  <div class="callout analogy">…</div>
  <!-- optional viz -->
  <h3>How to solve it</h3>
  <ol>…</ol>
  <div class="table-wrap complexity">…</div>
  <div class="quiz" data-quiz>…</div>
  <details class="deeper hint">…</details>
  <details class="deeper solution">
    <summary>… Show the solution &amp; run it <span class="tag">solution</span></summary>
    <div class="deeper-body">
      <div class="runpad" data-needs="">
        <div class="rp-head"><span class="rp-title">${slug.replace(/-/g, "_")}.py</span><div class="rp-actions"><button class="rp-reset">Reset</button><button class="rp-run">Run</button></div></div>
        <textarea class="rp-editor" spellcheck="false" rows="12">
def solve(...):
    ...
</textarea>
        <div class="rp-output"><pre class="rp-expected">…</pre></div>
      </div>
      <p>One-sentence recap.</p>
    </div>
  </details>
  <details class="deeper walkthrough">
    <summary>… Line-by-line walkthrough + flow <span class="tag">walkthrough</span></summary>
    <div class="deeper-body">
      <p class="takeaway">Why this is the interview default.</p>
      <div class="mermaid-wrap"><pre class="mermaid">flowchart TD
  start[Start] --> done[Done]
</pre></div>
      <ol class="code-walk">
        <li><code>def solve(...):</code><span>Plain English.</span></li>
      </ol>
      <p class="walk-why">Complexity in one sentence.</p>
    </div>
  </details>
</section>
`);
console.log("\nThen: node tools/build-search-index.js && node tools/verify.js");
