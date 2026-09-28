const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'spain-student-family.html'),'utf8');
test('published Spain report contains complete deep-link, evidence and source sections',()=>{
 for(const id of ['age12-residence-route','study-half-clock','residence-evidence','nlv-checklist','nlv-work-options','funds-timeline','passive-income'])assert(html.includes(`id="${id}"`),id);
 assert.equal((html.match(/<details class="law-proof"/g)||[]).length,6);
 assert.equal((html.match(/<li id="source-/g)||[]).length,30);
});
test('Chinese emphasis renders as formatting rather than visible markdown markers',()=>{
 const text=html.slice(html.indexOf('<body')).replace(/<script[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,'');
 assert.equal(text.includes('**'),false,'unparsed double-star emphasis in rendered report');
});
test('every in-page anchor is unique and resolves',()=>{
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'duplicate IDs');
 for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(decodeURIComponent(id)),id);
});
test('official evidence PDF and six unmodified page images match the provenance manifest',()=>{
 const base=path.join(root,'assets/spain-residence');
 const manifest=JSON.parse(fs.readFileSync(path.join(base,'evidence-manifest.json')));
 assert.equal(manifest.sourceUrl,'https://www.boe.es/buscar/pdf/2024/BOE-A-2024-24099-consolidado.pdf');
 assert.equal(manifest.images.length,6);
 assert.deepEqual(manifest.images.map(i=>i.page),[128,129,133,51,53,54]);
 for(const item of [manifest.pdf,...manifest.images]){
  const data=fs.readFileSync(path.join(base,item.file));
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),item.sha256,item.file);
  assert(html.includes(`assets/spain-residence/${item.file}`),item.file);
 }
});
test('report, reference library, publication manifest and home cards agree',()=>{
 const refs=JSON.parse(fs.readFileSync(path.join(root,'hub-sources.json'))).filter(s=>s.report==='deepspain');
 assert.equal(refs.length,30);
 const report=JSON.parse(fs.readFileSync(path.join(root,'publication-manifest.json'))).familyDeepReports.reports.find(r=>r.file==='spain-student-family.html');
 assert.equal(report.sources,30);
 assert.equal(report.sha256,crypto.createHash('sha256').update(html).digest('hex'));
 for(const f of ['index.html','family-projects.html'])assert(fs.readFileSync(path.join(root,f),'utf8').includes('12岁→17岁路线'));
});
