const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'quebec-child-public-school.html'),'utf8');
test('Quebec separates entry visa from parent study status and fee eligibility',()=>{
 for(const id of ['trv-definition','parent-study-permit','child-documents-by-parent-status','trv-requirements'])assert.equal(html.split(`id="${id}"`).length-1,1);
 for(const text of ['Temporary Resident Visa','Study Permit','Work Permit','Electronic Travel Authorization','不必先改成访客','纯语言课程不享有通常的学生校外工作豁免','不是所有临时居留文件的统称'])assert.ok(html.includes(text),text);
 assert.ok(html.includes('魁北克家长学习许可带孩子入学分支'));
 assert.ok(html.includes('不能把“已经在魁省”的豁免直接套给尚在境外的首次申请'));
});
test('Quebec published source library and new official evidence agree',()=>{
 assert.equal([...html.matchAll(/<li id="source-\d+"/g)].length,66);
 for(const n of [1,4,22,27,36,53,54,55,56])assert.ok(html.includes(`id="source-${n}"`));
 const raw=JSON.parse(fs.readFileSync(path.join(root,'hub-sources.json'),'utf8'));
 const sources=Array.isArray(raw)?raw:raw.sources;
 assert.equal(sources.filter(s=>s.report==='deepquebec').length,66);
 assert.ok(html.includes('2026年10月9日补充复核TRV申请资格'));
});
test('TRV application has a separate panel, six navigable topics and official sources',()=>{
 assert.ok(html.includes('class="trv-panel" role="region"'));
 for(const id of ['trv-eligibility','trv-money','trv-documents','trv-medical-fees','trv-apply-flow','trv-stay-renewal']){
  assert.equal(html.split(`id="${id}"`).length-1,1,id);
  assert.ok(html.includes(`href="#${id}"`),id);
 }
 assert.ok(html.includes('trv-application-flow'));
 for(let n=57;n<=66;n++)assert.ok(html.includes(`id="source-${n}"`));
});
