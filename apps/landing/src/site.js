const toggle=document.querySelector('.mobile-toggle'),menu=document.querySelector('.mobile-menu');
if(toggle&&menu){
 const close=()=>{toggle.setAttribute('aria-expanded','false');menu.hidden=true;};
 toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));menu.hidden=open;});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){close();toggle.focus();}});
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
 matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)close();});
}
const tabs=[...document.querySelectorAll('[role=tab]')];
function activate(tab,focus=false){
 for(const button of tabs){const chosen=button===tab;button.setAttribute('aria-selected',String(chosen));button.tabIndex=chosen?0:-1;document.getElementById(button.getAttribute('aria-controls')).hidden=!chosen;}
 if(focus)tab.focus();
}
for(const tab of tabs){tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',e=>{
 const at=tabs.indexOf(tab);
 const next=e.key==='ArrowRight'?(at+1)%tabs.length:e.key==='ArrowLeft'?(at-1+tabs.length)%tabs.length:e.key==='Home'?0:e.key==='End'?tabs.length-1:-1;
 if(next>=0){e.preventDefault();activate(tabs[next],true);}
});}
// Local events carry only a fixed CTA name. No trackers, identifiers, form data or query strings are transmitted.
document.querySelectorAll('[data-event]').forEach(link=>link.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('tirzelife:cta',{detail:{name:link.dataset.event}}))));
