/* PWA installation is optional. App and export continue working without SW. */
(()=>{
 if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
 window.addEventListener('load',()=>{navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});},{once:true});
})();
