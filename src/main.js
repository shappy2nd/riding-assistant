const app = document.querySelector('#app');
const navButtons = [...document.querySelectorAll('.bottom-nav button')];
const brandBtn = document.querySelector('#brandBtn');
const clock = document.querySelector('#clock');

const state = {
  tab: 'today',
  savedRoutes: JSON.parse(localStorage.getItem('savedRoutes') || '[]'),
  places: JSON.parse(localStorage.getItem('places') || '["우리집"]'),
  rides: JSON.parse(localStorage.getItem('rides') || JSON.stringify([
    {date:'2026-08-16T19:10:00', distance:31.2, minutes:78, source:'Strava', title:'안양천 저녁 라이딩', path:[[37.5172,126.8947],[37.5297,126.8726],[37.5422,126.8561],[37.5561,126.8474]]},
    {date:'2026-08-13T18:50:00', distance:24.7, minutes:66, source:'기기', title:'도림천 회복 라이딩', path:[[37.4932,126.8958],[37.5006,126.8841],[37.5085,126.8734],[37.5188,126.8647]]},
    {date:'2026-08-09T08:30:00', distance:82.1, minutes:244, source:'Strava', title:'한강 주말 라이딩', path:[[37.5172,126.8947],[37.5288,126.9326],[37.5326,126.9906],[37.5175,127.0347]]}
  ]))
};

const sampleRoutes = [
  {name:'도림천 회복 루프', distance:24.0, minutes:72, tag:'가볍게', path:[[37.4932,126.8958],[37.5006,126.8841],[37.5085,126.8734],[37.5188,126.8647]]},
  {name:'안양천 운동 루프', distance:36.8, minutes:102, tag:'운동', path:[[37.5172,126.8947],[37.5297,126.8726],[37.5422,126.8561],[37.5561,126.8474]]},
  {name:'한강대교 야라', distance:41.5, minutes:118, tag:'야라', path:[[37.5172,126.8947],[37.5224,126.9391],[37.5298,126.9638],[37.5175,126.9824]]}
];

const kakaoKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY || '';
let kakaoPromise;
function loadKakao(){
  if(window.kakao?.maps) return Promise.resolve(window.kakao);
  if(!kakaoKey) return Promise.reject(new Error('VITE_KAKAO_JAVASCRIPT_KEY 미설정'));
  if(kakaoPromise) return kakaoPromise;
  kakaoPromise = new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(kakaoKey)}&autoload=false&libraries=services`;
    script.onload=()=>window.kakao.maps.load(()=>resolve(window.kakao));
    script.onerror=()=>reject(new Error('Kakao Maps SDK 로드 실패'));
    document.head.appendChild(script);
  });
  return kakaoPromise;
}
function drawMap(id,path=[],level=7){
  const el=document.getElementById(id); if(!el) return;
  loadKakao().then(kakao=>{
    const points=(path.length?path:[[37.5172,126.8947]]).map(([lat,lng])=>new kakao.maps.LatLng(lat,lng));
    const map=new kakao.maps.Map(el,{center:points[0],level});
    if(points.length>1){
      const line=new kakao.maps.Polyline({path:points,strokeWeight:5,strokeColor:'#e5482d',strokeOpacity:.9,strokeStyle:'solid'}); line.setMap(map);
      const bounds=new kakao.maps.LatLngBounds(); points.forEach(p=>bounds.extend(p)); map.setBounds(bounds,32,32,32,32);
    }
    new kakao.maps.Marker({position:points[0],map});
    if(points.length>1) new kakao.maps.Marker({position:points.at(-1),map});
  }).catch(err=>{el.innerHTML=`<div class="map-message"><strong>Kakao 지도 연결 대기</strong><span>${err.message}</span></div>`;});
}

function fmtMinutes(min){ const h=Math.floor(min/60), m=min%60; return h ? `${h}h ${String(m).padStart(2,'0')}m` : `${m}m`; }
function setTab(tab){ state.tab=tab; navButtons.forEach(b=>b.classList.toggle('active', b.dataset.tab===tab)); render(); window.scrollTo({top:0,behavior:'smooth'}); }
brandBtn.addEventListener('click',()=>setTab('today'));
navButtons.forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
setInterval(()=>{ clock.textContent=new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}); },1000);
function shell(content){ app.innerHTML=`<div class="container">${content}</div>`; }

function renderToday(){
  const d=new Date();
  shell(`<section class="hero"><h1>오늘은 가볍게, 달리기 좋은 날.</h1><p>${d.toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'})} · 서울 한강권</p></section><div class="grid"><div class="card metric"><span class="muted">라이딩 지수</span><strong>82 / 100</strong><span class="tag">좋음</span></div><div class="card metric"><span class="muted">기온</span><strong>25°C</strong><span class="muted">예시 데이터</span></div><div class="card metric"><span class="muted">바람</span><strong>2.8 m/s</strong><span class="muted">예시 데이터</span></div></div><div class="section-title"><h2>오늘 추천</h2><button class="btn secondary" id="goCourses">코스 보기</button></div><div class="card route-card"><div><strong>도림천 회복 루프</strong><div class="muted">24.0km · 약 72분 · 평일 퇴근 후</div></div><span class="tag">가볍게</span></div><div class="section-title"><h2>안내</h2></div><div class="card"><p class="muted">현재 날씨는 재구축 MVP의 예시값입니다. 실제 날씨 API는 다음 단계에서 활성화합니다.</p></div>`);
  document.querySelector('#goCourses').onclick=()=>setTab('courses');
}
function routeCard(r,i){return `<div class="card route-card"><div><strong>${r.name}</strong><div class="muted">${r.distance.toFixed(1)}km · ${fmtMinutes(r.minutes)}</div><div class="spacer"></div><span class="tag">${r.tag}</span></div><div><button class="btn ghost preview-route" data-index="${i}">지도</button> <button class="btn ghost save-route" data-name="${r.name}">저장</button></div></div>`}
function renderCourses(){
  shell(`<div class="section-title"><h2>라이딩 경로 설정</h2></div><div class="card"><div id="courseMap" class="map-canvas"></div><div class="spacer"></div><button class="btn">경로 설정</button> <button class="btn ghost">GPX 불러오기</button></div><div class="section-title"><h2>추천 경로</h2></div><div class="list">${sampleRoutes.map(routeCard).join('')}</div><div class="section-title"><h2>저장된 경로</h2></div><div class="list">${state.savedRoutes.length?state.savedRoutes.map(r=>`<div class="card"><strong>${r}</strong></div>`).join(''):'<div class="card muted">아직 저장된 경로가 없습니다.</div>'}</div>`);
  drawMap('courseMap',sampleRoutes[0].path);
  document.querySelectorAll('.preview-route').forEach(btn=>btn.onclick=()=>drawMap('courseMap',sampleRoutes[Number(btn.dataset.index)].path));
  document.querySelectorAll('.save-route').forEach(btn=>btn.onclick=()=>{if(!state.savedRoutes.includes(btn.dataset.name)){state.savedRoutes.push(btn.dataset.name);localStorage.setItem('savedRoutes',JSON.stringify(state.savedRoutes));renderCourses();}});
}
function renderRide(){
  shell(`<div class="section-title"><h2>주행</h2></div><div class="ride-panel"><div class="ride-stat"><span>현재 속도</span><strong>0.0</strong><small>km/h</small></div><div class="ride-stat"><span>경과 시간</span><strong>00:00</strong><small>hh:mm</small></div><div class="ride-stat"><span>주행 거리</span><strong>0.0</strong><small>km</small></div></div><div class="spacer"></div><div class="card"><div id="rideMap" class="map-canvas tall"></div></div><div class="grid"><div class="card metric"><span class="muted">남은 거리</span><strong>-- km</strong></div><div class="card metric"><span class="muted">상승</span><strong>-- m</strong></div><div class="card metric"><span class="muted">평균 속도</span><strong>-- km/h</strong></div></div>`);
  drawMap('rideMap',sampleRoutes[0].path,6);
}
function dedupedRides(){return [...state.rides].sort((a,b)=>new Date(b.date)-new Date(a.date));}
function periodSummary(rides, days){ const now=new Date(); const start=new Date(now); start.setDate(now.getDate()-days+1); const f=rides.filter(r=>new Date(r.date)>=start&&new Date(r.date)<=now); return {km:f.reduce((s,r)=>s+r.distance,0), min:f.reduce((s,r)=>s+r.minutes,0)}; }
function calendarHtml(rides){ const now=new Date(),y=now.getFullYear(),m=now.getMonth(); const first=new Date(y,m,1).getDay(); const days=new Date(y,m+1,0).getDate(); let cells=''; for(let i=0;i<first;i++)cells+='<div></div>'; for(let day=1;day<=days;day++){ const count=rides.filter(r=>{const d=new Date(r.date);return d.getFullYear()===y&&d.getMonth()===m&&d.getDate()===day}).length; cells+=`<div class="day ${count?'has-ride':''}"><strong>${day}</strong>${count?`<div>🚲${count>1?' '+count:''}</div>`:''}</div>`;} return cells; }
function renderRecords(){
  const rides=dedupedRides(), now=new Date(), week=periodSummary(rides,7), monthR=rides.filter(r=>{const d=new Date(r.date);return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth()}), yearR=rides.filter(r=>new Date(r.date).getFullYear()===now.getFullYear());
  const month={km:monthR.reduce((s,r)=>s+r.distance,0),min:monthR.reduce((s,r)=>s+r.minutes,0)}, year={km:yearR.reduce((s,r)=>s+r.distance,0),min:yearR.reduce((s,r)=>s+r.minutes,0)};
  shell(`<div class="section-title"><h2>주행 히스토리</h2></div><div class="grid"><div class="card metric"><span class="muted">이번 주</span><strong>${week.km.toFixed(1)}km</strong><span>${fmtMinutes(week.min)}</span></div><div class="card metric"><span class="muted">이번 달</span><strong>${month.km.toFixed(1)}km</strong><span>${fmtMinutes(month.min)}</span></div><div class="card metric"><span class="muted">올해</span><strong>${year.km.toFixed(1)}km</strong><span>${fmtMinutes(year.min)}</span></div></div><div class="section-title"><h2>${now.getFullYear()}년 ${now.getMonth()+1}월</h2></div><div class="calendar">${['일','월','화','수','목','금','토'].map(x=>`<div class="muted">${x}</div>`).join('')}${calendarHtml(rides)}</div><div class="section-title"><h2>최근 기록</h2></div><div class="list">${rides.map((r,i)=>`<div class="card record-card"><div><strong>${r.title}</strong><div class="muted">${new Date(r.date).toLocaleDateString('ko-KR')} · ${r.distance.toFixed(1)}km · ${fmtMinutes(r.minutes)} · ${r.source}</div></div><div id="recordMap${i}" class="record-map"></div></div>`).join('')}</div>`);
  rides.forEach((r,i)=>drawMap(`recordMap${i}`,r.path||[],8));
}
function renderSettings(){
  shell(`<div class="section-title"><h2>설정</h2></div><div class="card"><div class="settings-row"><div><strong>저장 장소</strong><div class="muted">우리집 및 사용자 지정 장소</div></div><button class="btn ghost" id="addPlace">추가</button></div><div id="placeList">${state.places.map(p=>`<div class="settings-row"><span>${p}</span><span class="tag">저장됨</span></div>`).join('')}</div></div><div class="section-title"><h2>연동</h2></div><div class="card"><div class="settings-row"><div><strong>Strava</strong><div class="muted">OAuth 연결 구조</div></div><span class="tag">연결 준비</span></div><div class="settings-row"><div><strong>Kakao Maps</strong><div class="muted">${kakaoKey?'JavaScript 키 환경변수 감지됨':'VITE_KAKAO_JAVASCRIPT_KEY 필요'}</div></div><span class="tag">${kakaoKey?'설정됨':'키 필요'}</span></div></div>`);
  document.querySelector('#addPlace').onclick=()=>{const name=prompt('저장할 장소 이름');if(name){state.places.push(name);localStorage.setItem('places',JSON.stringify(state.places));renderSettings();}};
}
function render(){ if(state.tab==='today')renderToday(); else if(state.tab==='courses')renderCourses(); else if(state.tab==='ride')renderRide(); else if(state.tab==='records')renderRecords(); else renderSettings(); }
render();
