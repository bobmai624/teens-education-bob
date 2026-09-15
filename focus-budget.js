(function(root){
 'use strict';
 const round=n=>Math.round((n+Number.EPSILON)*100)/100;
 function calculate({tuition,award,extras,fx,target}){
  if(![tuition,award,extras,fx,target].every(Number.isFinite)||tuition<0||award<0||award>tuition||extras<0||fx<=0||target<=0)throw new Error('Invalid budget inputs');
  const paid=tuition-award;
  return {net:round(paid*fx),school:round((paid+extras)*fx),stress:round(paid*fx*1.1),needed:Math.max(0,Math.ceil((paid-target/fx)*100-1e-8)/100),breakEven:paid?target/paid:null};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={calculate};
 if(!root.document)return;
 const form=document.getElementById('focus-budget');if(!form)return;
 const fields=['tuition','award','extras','fx','target'],nodes=Object.fromEntries(fields.map(k=>[k,form.elements.namedItem(k)]));
 const number=n=>new Intl.NumberFormat('zh-CN',{maximumFractionDigits:2}).format(n);
 function update(){
  const out=document.getElementById('focus-budget-result');
  try{
   const values=Object.fromEntries(fields.map(k=>[k,nodes[k].value.trim()===''?NaN:Number(nodes[k].value)]));
   const r=calculate(values);document.getElementById('focus-budget-error').textContent='';
   out.innerHTML=`<div><small>净学费／人民币</small><strong>${number(r.net)}</strong><span>${r.net<=values.target?'基准学费通过':'基准学费超标'}</span></div><div><small>学费＋已输入学校必缴费</small><strong>${number(r.school)}</strong><span>仍未包含家庭生活与陪读</span></div><div><small>汇率上涨10%后净学费</small><strong>${number(r.stress)}</strong><span>${r.stress<=values.target?'压力测试通过':'压力测试超标'}</span></div><div><small>还需额外减免／原币</small><strong>${number(r.needed)}</strong><span>盈亏线汇率：${r.breakEven===null?'学费为零，不适用':number(r.breakEven)}</span></div>`;
  }catch{out.replaceChildren();document.getElementById('focus-budget-error').textContent='请输入完整有效金额：费用不能为负，减免不能超过学费，汇率和预算上限必须大于0。';}
 }
 const presets=JSON.parse(document.getElementById('focus-budget-presets').textContent);
 function apply(){const p=presets[form.elements.namedItem('preset').value];for(const k of fields)nodes[k].value=p[k];document.getElementById('focus-budget-note').textContent=p.note;update();}
 form.elements.namedItem('preset').addEventListener('change',apply);for(const k of fields)nodes[k].addEventListener('input',update);
 form.addEventListener('submit',e=>e.preventDefault());apply();
})(typeof globalThis!=='undefined'?globalThis:this);
