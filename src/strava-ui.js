import { connectStrava, getStravaStatus, syncStravaActivities, mergeRides } from './strava.js';

let busy=false;

async function mount(){
  const settingsTitle=[...document.querySelectorAll('.section-title h2')].find(el=>el.textContent.trim()==='연동');
  if(!settingsTitle) return;
  const card=settingsTitle.closest('.section-title')?.nextElementSibling;
  if(!card || card.querySelector('[data-strava-controls]')) return;

  const row=document.createElement('div');
  row.className='settings-row';
  row.dataset.stravaControls='1';
  row.innerHTML=`<div><strong>Strava 실제 동기화</strong><div class="muted" data-strava-message>상태 확인 중…</div></div><div class="strava-actions"><button class="btn ghost" data-strava-connect>연결</button><button class="btn" data-strava-sync disabled>동기화</button></div>`;
  card.prepend(row);

  const msg=row.querySelector('[data-strava-message]');
  const connect=row.querySelector('[data-strava-connect]');
  const sync=row.querySelector('[data-strava-sync]');
  const status=await getStravaStatus();
  msg.textContent=status.connected?'Strava 연결됨 · 최근 활동을 불러올 수 있습니다.':'Strava 연결이 필요합니다.';
  connect.textContent=status.connected?'다시 연결':'연결';
  sync.disabled=!status.connected;
  connect.onclick=()=>connectStrava();
  sync.onclick=async()=>{
    if(busy) return; busy=true; sync.disabled=true; msg.textContent='Strava 활동 동기화 중…';
    try{
      const incoming=await syncStravaActivities();
      const existing=JSON.parse(localStorage.getItem('rides')||'[]');
      const merged=mergeRides(existing,incoming);
      localStorage.setItem('rides',JSON.stringify(merged));
      msg.textContent=`동기화 완료 · ${incoming.length}개 활동 확인`;
      setTimeout(()=>window.location.reload(),500);
    }catch(err){
      msg.textContent=err.message;
      sync.disabled=false;
    }finally{ busy=false; }
  };
}

const observer=new MutationObserver(()=>mount());
observer.observe(document.querySelector('#app'),{subtree:true,childList:true});
mount();
