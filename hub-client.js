(()=>{
  const query=document.getElementById('hub-query');
  const parse=id=>{const el=document.getElementById(id);return el?JSON.parse(el.textContent):[]};
  const normal=x=>String(x||'').toLocaleLowerCase().normalize('NFKC').trim();
  const match=(text,q)=>normal(q).split(/\s+/).every(t=>normal(text).includes(t));
  const refs=document.querySelectorAll('[data-source-card]');
  if(refs.length&&document.getElementById('hub-source-filter')){
    const report=document.getElementById('hub-source-filter'),topic=document.getElementById('hub-topic-filter'),page=document.getElementById('hub-page-filter');
    function filter(){
      let count=0;for(const card of refs){const show=match(card.dataset.search,query.value)&&(!report.value||card.dataset.report===report.value)&&(!topic.value||card.dataset.topic===topic.value)&&(!page.value||card.dataset.pages.split(' ').includes(page.value));card.hidden=!show;if(show)count++;}
      document.getElementById('hub-result-count').textContent=`显示 ${count} / ${refs.length} 条来源记录。原报告编号分别保留，不作跨报告去重。`;
      document.getElementById('hub-empty').hidden=count!==0;
    }
    [query,report,topic,page].forEach(el=>el.addEventListener('input',filter));
    document.getElementById('hub-reset').addEventListener('click',()=>{[query,report,topic,page].forEach(el=>el.value='');filter();query.focus()});
    const params=new URLSearchParams(location.search);report.value=params.get('report')||'';page.value=params.get('page')||'';query.value=params.get('q')||'';
    const reveal=()=>{const card=document.getElementById(location.hash.slice(1));if(card?.hasAttribute('data-source-card')){[query,report,topic,page].forEach(el=>el.value='');filter();card.scrollIntoView({block:'center'});}};
    filter();if(location.hash)requestAnimationFrame(reveal);window.addEventListener('hashchange',reveal);
  }else if(query){
    const pages=parse('hub-pages-data'),results=document.getElementById('hub-search-results'),count=document.getElementById('hub-result-count');
    query.addEventListener('input',()=>{results.replaceChildren();const q=query.value.trim();if(!q){count.textContent='按问题、国家或关键词查找章节；资料来源请进入参考库。';return;}const found=pages.filter(p=>match(`${p.title} ${p.categoryLabel} ${p.keywords||''}`,q));count.textContent=`找到 ${found.length} 个章节`;for(const p of found){const li=document.createElement('li'),a=document.createElement('a'),small=document.createElement('small');a.href=p.file;a.textContent=p.title;small.textContent=p.categoryLabel;li.append(a,small);results.append(li);}if(!found.length){const li=document.createElement('li');li.textContent='没有匹配章节。试试“陪读”“预算”“回国”或国家名。';results.append(li);}});
  }
  const dialog=document.getElementById('hub-ref-dialog');
  document.addEventListener('click',event=>{
    const returnLink=event.target.closest('#hub-ref-dialog a[href^="#"]');
    if(returnLink&&dialog){dialog.close();return;}
    const link=event.target.closest('a[data-ref]');if(!link||!dialog||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const source=document.getElementById('ref-'+link.dataset.ref);if(!source)return;
    event.preventDefault();const clone=source.cloneNode(true);clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));document.getElementById('hub-dialog-content').replaceChildren(clone);dialog.showModal();
  });
  if(dialog){document.getElementById('hub-dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});}
  function revealSection(){let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{return;}const target=id&&document.getElementById(id);if(target){let parent=target.parentElement;while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}}}
  window.addEventListener('hashchange',revealSection);revealSection();
})();
