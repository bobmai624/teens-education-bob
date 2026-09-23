(function(root){
 const matches=(item,{query='',region='',status=''}={})=>(!query||item.search.toLowerCase().includes(query.trim().toLowerCase()))&&(!region||item.region===region)&&(!status||item.status===status);
 if(typeof module!=='undefined')module.exports={matches};
 if(!root.document)return;
 const d=root.document,q=d.querySelector('#yv-query');if(!q)return;
 const region=d.querySelector('#yv-region'),status=d.querySelector('#yv-status'),cards=[...d.querySelectorAll('[data-yv-country]')];
 const update=()=>{let n=0;for(const card of cards){const yes=matches(card.dataset,{query:q.value,region:region.value,status:status.value});card.hidden=!yes;if(yes)n++;}d.querySelector('#yv-count').textContent=`显示 ${n} / ${cards.length} 个国家与地区`;d.querySelector('#yv-empty').hidden=!!n;};
 for(const input of [q,region,status])input.addEventListener('input',update);
 d.querySelector('#yv-reset').addEventListener('click',()=>{q.value=region.value=status.value='';update();q.focus();});update();
})(typeof window!=='undefined'?window:globalThis);
