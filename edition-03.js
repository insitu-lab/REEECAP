/* REEECAP — temas rotativos, sem rastrear visitantes nem ler arquivos. */
(()=>{
 'use strict';
 const themes=['instagram','tiktok','spotify','youtube'];
 let last=-1;
 try{last=Number(sessionStorage.getItem('reeecap-last-theme'));}catch{}
 if(!Number.isInteger(last)||last<0||last>=themes.length)last=-1;
 let next;
 if(last===-1){next=Math.floor(Math.random()*themes.length);}
 else next=(last+1+Math.floor(Math.random()*(themes.length-1)))%themes.length;
 document.body.dataset.theme=themes[next];
 try{sessionStorage.setItem('reeecap-last-theme',String(next));}catch{}
 // A informação salva aqui é apenas o último tema, nunca dados da exportação.
 const names={instagram:'Instagram',tiktok:'TikTok',spotify:'Spotify',youtube:'YouTube'};
 const stage=document.querySelector('#previewStage');
 const logo=document.querySelector('#stagePlatformLogo'); if(logo)logo.src='./assets/brands/'+themes[next]+'.svg';
 if(stage){
   const chrom=stage.querySelector('.stage-chrome span:last-child');
   if(chrom)chrom.textContent=names[themes[next]]+' · 2026';
 }
})();
