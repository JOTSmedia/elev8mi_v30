(() => {
 'use strict';
 const loader=document.getElementById('loader'),fly=document.getElementById('flyLogo'),hero=document.getElementById('heroLogo'),header=document.querySelector('header'),fill=document.getElementById('fill'),pct=document.getElementById('pct'),status=document.getElementById('status'),ui=document.getElementById('loadUi'),mark=document.querySelector('.load-mark');
 if(!loader||!fly||!hero||!mark)return;
 let generation=0,animation=null,deadline=0,progressTimer=0;
 function progress(n,label){
   const value=Math.max(0,Math.min(100,n)),glow=document.getElementById('logoGlow'),ring=document.getElementById('loadRingProgress');
   if(glow)glow.style.opacity=String(value/100);
   if(ring)ring.style.strokeDashoffset=String(100-value);
   fill.style.width=`${value}%`;pct.textContent=`${Math.floor(value)}%`;status.textContent=label;
   document.getElementById('loadProgress')?.setAttribute('aria-valuenow',String(Math.floor(value)));
 }
 function stopProgress(){clearInterval(progressTimer);progressTimer=0;}
 function finishProgress(token,from,duration){return new Promise(resolve=>{
   const began=performance.now();stopProgress();
   progressTimer=setInterval(()=>{if(token!==generation){stopProgress();resolve();return;}
     const fraction=Math.min(1,(performance.now()-began)/duration);
     progress(from+(100-from)*fraction,'Opening the table');
     if(fraction===1){stopProgress();resolve();}
   },16);
 });}

 function blockPage(blocked){['header','main','footer','#motionToggle'].forEach(selector=>{const el=document.querySelector(selector);if(el)el.inert=blocked;});document.body.setAttribute('aria-busy',String(blocked));loader.setAttribute('aria-hidden',String(!blocked));}
 function ready(){blockPage(false);document.body.classList.remove('locked');document.body.classList.add('live');header?.classList.add('ready');}
 function settle(token){if(token!==generation)return;stopProgress();clearTimeout(deadline);clearTimeout(window.elev8miLoaderWatchdog);animation?.cancel();animation=null;ready();hero.style.opacity='1';hero.parentElement.classList.add('breathing');fly.style.visibility='hidden';loader.classList.add('done');progress(100,'The table is ready');}
 function timeout(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
 async function run(){
   const started=performance.now();const token=++generation;stopProgress();animation?.cancel();animation=null;clearTimeout(deadline);clearTimeout(window.elev8miLoaderWatchdog);
   mark.append(fly);fly.removeAttribute('style');fly.className='pulse';fly.style.visibility='visible';hero.style.opacity='1';
   blockPage(true);document.body.classList.add('locked');document.body.classList.remove('live');header?.classList.remove('ready');loader.className='';ui?.classList.remove('hide');progress(0,'Preparing your table');
   const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
   const rampDuration=reduced?250:1100;
   progressTimer=setInterval(()=>{if(token!==generation)return;progress(Math.min(90,90*(performance.now()-started)/rampDuration),'Preparing your table');},16);
   deadline=setTimeout(()=>settle(token),3200);
   const critical=[fly,hero,document.querySelector('.journey-plate img')].filter(Boolean);
   const imageReady=Promise.all(critical.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});})));
   await Promise.race([imageReady,timeout(1200)]);if(token!==generation||loader.classList.contains('done'))return;
   await Promise.race([document.fonts?.ready??Promise.resolve(),timeout(350)]);if(token!==generation)return;
   // The globe maps decode asynchronously after the decorative modules start.
   // Give them a bounded chance to finish before revealing the hero. Slow or
   // unavailable maps keep the photographed Earth as a readable still.
   await Promise.race([window.Elev8PhotoMotion?.globeReady??Promise.resolve(),timeout(1200)]);if(token!==generation||loader.classList.contains('done'))return;
   await timeout(Math.max(0,rampDuration-(performance.now()-started)));if(token!==generation||loader.classList.contains('done'))return;
   const current=Math.min(90,90*(performance.now()-started)/rampDuration);
   await finishProgress(token,current,reduced?100:300);if(token!==generation||loader.classList.contains('done'))return;
   if(reduced){settle(token);return;}
   progress(100,'The table is ready');
   const from=fly.getBoundingClientRect(),to=hero.getBoundingClientRect();
   if(!fly.animate||!from.width||!to.width){settle(token);return;}
   ready();loader.classList.add('revealing');ui?.classList.add('hide');hero.style.opacity='0';document.body.append(fly);
   Object.assign(fly.style,{position:'fixed',left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`,margin:'0',zIndex:'4500',pointerEvents:'none',animation:'none',transformOrigin:'top left'});
   animation=fly.animate([{transform:'translate(0,0) scale(1,1)',opacity:1},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:1}],{duration:750,easing:'cubic-bezier(.22,.7,.24,1)',fill:'forwards'});
   animation.finished.then(()=>settle(token)).catch(()=>{if(token===generation)settle(token);});
 }
 document.getElementById('replay')?.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'});setTimeout(run,250);});
 run().catch(()=>settle(generation));
})();
