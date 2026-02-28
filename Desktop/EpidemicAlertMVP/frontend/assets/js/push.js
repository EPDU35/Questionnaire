(async function(){
"use strict";
if(!("serviceWorker" in navigator)||!("PushManager" in window))return;
async function initialiserPush(){try{const reg=await navigator.serviceWorker.register("/sw.js",{scope:"/"});const rep=await fetch("http://localhost:3000/api/push/cle-publique");if(!rep.ok)return;const{clePublique}=await rep.json();if(!clePublique)return;const ex=await reg.pushManager.getSubscription();if(ex)return;const perm=await Notification.requestPermission();if(perm!=="granted")return;const ab=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(clePublique)});const token=localStorage.getItem("babi_token");if(!token)return;await fetch("http://localhost:3000/api/push/abonner",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({abonnement:ab})});}catch(e){console.error("Erreur push:",e);}}
function urlBase64ToUint8Array(b){const p="=".repeat((4-b.length%4)%4);const s=(b+p).replace(/-/g,"+").replace(/_/g,"/");const r=window.atob(s);return Uint8Array.from([...r].map(c=>c.charCodeAt(0)));}
if(localStorage.getItem("babi_token"))await initialiserPush();
})();
