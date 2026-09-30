const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'singapore-student-family.html'), 'utf8');
test('Singapore student PR update has six stable entry links and three path diagrams', () => {
  for (const id of ['student-pr-pathway', 'integrated-programme', 'student-pr-age-exams', 'student-pr-university', 'student-pr-ns', 'pr-obligations']) {
    assert(html.includes(`id="${id}"`), id);
    assert(html.includes(`href="#${id}"`), id);
  }
  for (const cls of ['student-pr-flow', 'ip-study-flow', 'pr-obligation-flow']) assert(html.includes(`diagram ${cls}`), cls);
  assert(html.includes('34个核心问题'));
});
test('Singapore key distinctions and primary evidence remain explicit', () => {
  for (const text of ['没有公开的“12—18岁专用申请窗口”', '15岁区分递交方式', '没有公布这条年龄窗口', '不是“18岁以前拿PR才服役”', '大学录取／在读本身不能替代考试／IP条件', '不是PR本身附带的统一工作年限', '不是“每年住180天”', '每年净额≤20万元']) assert(html.includes(text), text);
  assert.equal((html.match(/<li id="source-/g) || []).length, 63);
  assert(html.includes('不是政府文件'));
});
test('Singapore in-page anchors are unique and resolve', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(decodeURIComponent(id)), id);
});
test('Singapore report, source library, release manifest and home cards agree', () => {
  const refs = JSON.parse(fs.readFileSync(path.join(root, 'hub-sources.json'))).filter(s => s.report === 'deepsingapore');
  assert.equal(refs.length, 63);
  const report = JSON.parse(fs.readFileSync(path.join(root, 'publication-manifest.json'))).familyDeepReports.reports.find(r => r.file === 'singapore-student-family.html');
  assert.equal(report.sources, 63);
  assert.equal(report.sha256, crypto.createHash('sha256').update(html).digest('hex'));
  for (const f of ['index.html', 'family-projects.html']) assert(fs.readFileSync(path.join(root, f), 'utf8').includes('工作许可 · EP／DP学费 · 孩子PR后父母路径'));
});
test('Singapore work, DP tuition and parent transition additions are complete', () => {
  for (const id of ['guardian-work-activation','ep-dp-school-fees','dp-student-pr','parent-after-child-pr']) {
    assert(html.includes(`id="${id}"`), id);
    assert(html.includes(`href="#${id}"`), id);
  }
  for (const cls of ['guardian-work-activation-flow','dp-student-pr-flow','parent-status-transition-flow']) assert(html.includes(`diagram ${cls}`), cls);
  for (const text of ['Notification Letter','Dependant’s Pass','SGWorkPass','18,120','孩子PR不能直接续签家长EP','家长失业时，孩子DP可能一起失效','有效移民准证','21岁','另一位年满21岁']) assert(html.includes(text), text);
});
