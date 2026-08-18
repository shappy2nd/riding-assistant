const app = document.querySelector('#app');
const navButtons = [...document.querySelectorAll('.bottom-nav button')];
const brandBtn = document.querySelector('#brandBtn');
const clock = document.querySelector('#clock');

const state = {
  tab: 'today',
  savedRoutes: JSON.parse(localStorage.getItem('savedRoutes') || '[]'),
  places: JSON.parse(localStorage.getItem('places') || '["우리집"]'),
  rides: JSON.parse(localStorage.getItem('rides') || JSON.stringify([
    {date:'2026-08-16T19:10:00', distance:31.2, minutes:78, source:'Strava', title:'안양천 저녁 라이딩'},
    {date:'2026-08-13T18:50:00', distance:24.7, minutes:66, source:'기기', title:'도림천 회복 라이딩'},
    {date:'2026-08-09T08:30:00', distance:82.1, minutes:244, source:'Strava', title:'한강 주말 라이딩'}
  ]))
};

const sampleRoutes = [
  {name:'도림천 회복 루프', distance:24.0, minutes:72, tag:'가볍게'},
  {name:'안양천 운동 루프', distance:36.8, minutes:102, tag:'운동'},
  {name:'한강대교 야라', distance:41.5, minutes:118, tag:'야라'}
];

function fmtMinutes(min){ const h=Math.floor(min/60), m=min%60; return h ? `${h}h ${String(m).padStart(2,'0')}m` : `${m}m`; }
function setTab(tab){ state.tab=tab; navButtons.forEach(b=>b.classList.toggle('active', b.dataset.tab===tab)); render(); window.scrollTo({top:0,behavior:'smooth'}); }
brandBtn.addEventListener('click',()=>setTab('today'));
navButtons.forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
setInterval(()=>{ clock.textContent=new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}); },1000);

function shell(content){ app.innerHTML=`<div class="container">${content}</div>`; }

function renderToday(){
  const d=new Date();
  shell(`
    <section class="hero"><h1>오늘은 가볍게, 달리기 좋은 날.</h1><p>${d.toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'})} · 서울 한강권</p></section>
    <div class="grid">
      <div class="card metric"><span class="muted">라이딩 지수</span><strong>82 / 100</strong><span class="tag">좋음</span></div>
      <div class="card metric"><span class="muted">기온</span><strong>25°C</strong><span class="muted">예시 데이터</span></div>
      <div class="card metric"><span class="muted">바람</span><strong>2.8 m/s</strong><span class="muted">예시 데이터</span></div>
    </div>
    <div class="section-title"><h2>오늘 추천</h2><button class="btn secondary" id="goCourses">코스 보기</button></div>
    <div class="card route-card"><div><strong>도림천 회복 루프</strong><div class="muted">24.0km · 약 72분 · 평일 퇴근 후</div></div><span class="tag">가볍게</span></div>
    <div class="section-title"><h2>안내</h2></div><div class="card"><p class="muted">현재 날씨는 재구축 MVP의 예시값입니다. 실제 날씨 API와 실시간 지역 조회는 다음 연결 단계에서 활성화합니다.</p></div>
  `);
  document.querySelector('#goCourses').onclick=()=>setTab('courses');
}

function routeCard(r){return `<div class="card route-card"><div><strong>${r.name}</strong><div class="muted">${r.distance.toFixed(1)}km · ${fmtMinutes(r.minutes)}</div><div class="spacer"></div><span class="tag">${r.tag}</span></div><div><button class="btn ghost save-route" data-name="${r.name}">저장</button></div></div>`}
function renderCourses(){
  shell(`
    <div class="section-title"><h2>라이딩 경로 설정</h2></div>
    <div class="card"><div class="map-placeholder">Kakao 지도 연결 영역</div><div class="spacer"></div><button class="btn">경로 설정</button> <button class="btn ghost">GPX 불러오기</button></div>
    <div class="section-title"><h2>추천 경로</h2></div><div class="list">${sampleRoutes.map(routeCard).join('')}</div>
    <div class="section-title"><h2>저장된 경로</h2></div><div class="list">${state.savedRoutes.length?state.savedRoutes.map(r=>`<div class="card"><strong>${r}</strong></div>`).join(''):'<div class="card muted">아직 저장된 경로가 없습니다.</div>'}</div>
  `);
  document.querySelectorAll('.save-route').forEach(btn=>btn.onclick=()=>{if(!state.savedRoutes.includes(btn.dataset.name)){state.savedRoutes.push(btn.dataset.name);localStorage.setItem('savedRoutes',JSON.stringify(state.savedRoutes));renderCourses();}});
}

function renderRide(){
  shell(`
    <div class="section-title"><h2>주행</h2></div>
    <div class="ride-panel">
      <div class="ride-stat"><span>현재 속도</span><strong>0.0</strong><small>km/h</small></div>
      <div class="ride-stat"><span>경과 시간</span><strong>00:00</strong><small>hh:mm</small></div>
      <div class="ride-stat"><span>주행 거리</span><strong>0.0</strong><small>km</small></div>
    </div>
    <div class="spacer"></div><div class="card"><div class="map-placeholder">실시간 위치 · 경로 이탈 경고 · 길안내</div></div>
    <div class="grid"><div class="card metric"><span class="muted">남은 거리</span><strong>-- km</strong></div><div class="card metric"><span class="muted">상승</span><strong>-- m</strong></div><div class="card metric"><span class="muted">평균 속도</span><strong>-- km/h</strong></div></div>
  `);
}

function dedupedRides(){return [...state.rides].sort((a,b)=>new Date(b.date)-new Date(a.date));}
function periodSummary(rides, days){ const now=new Date('2026-08-18T21:00:00+09:00'); const start=new Date(now); start.setDate(now.getDate()-days+1); const f=rides.filter(r=>new Date(r.date)>=start&&new Date(r.date)<=now); return {km:f.reduce((s,r)=>s+r.distance,0), min:f.reduce((s,r)=>s+r.minutes,0)}; }
function calendarHtml(rides){ const y=2026,m=7; const first=new Date(y,m,1).getDay(); const days=new Date(y,m+1,0).getDate(); let cells=''; for(let i=0;i<first;i++)cells+='<div></div>'; for(let day=1;day<=days;day++){ const count=rides.filter(r=>{const d=new Date(r.date);return d.getFullYear()===y&&d.getMonth()===m&&d.getDate()===day}).length; cells+=`<div class="day ${count?'has-ride':''}"><strong>${day}</strong>${count?`<div>🚲${count>1?' '+count:''}</div>`:''}</div>`;} return cells; }
function renderRecords(){
  const rides=dedupedRides(), week=periodSummary(rides,7), month={km:rides.filter(r=>new Date(r.date).getMonth()===7).reduce((s,r)=>s+r.distance,0),min:rides.filter(r=>new Date(r.date).getMonth()===7).reduce((s,r)=>s+r.minutes,0)}, year={km:rides.reduce((s,r)=>s+r.distance,0),min:rides.reduce((s,r)=>s+r.minutes,0)};
  shell(`
    <div class="section-title"><h2>주행 히스토리</h2></div>
    <div class="grid"><div class="card metric"><span class="muted">이번 주</span><strong>${week.km.toFixed(1)}km</strong><span>${fmtMinutes(week.min)}</span></div><div class="card metric"><span class="muted">이번 달</span><strong>${month.km.toFixed(1)}km</strong><span>${fmtMinutes(month.min)}</span></div><div class="card metric"><span class="muted">올해</span><strong>${year.km.toFixed(1)}km</strong><span>${fmtMinutes(year.min)}</span></div></div>
    <div class="section-title"><h2>2026년 8월</h2></div><div class="calendar">${['일','월','화','수','목','금','토'].map(x=>`<div class="muted">${x}</div>`).join('')}${calendarHtml(rides)}</div>
    <div class="section-title"><h2>최근 기록</h2></div><div class="list">${rides.map(r=>`<div class="card record-card"><div><strong>${r.title}</strong><div class="muted">${new Date(r.date).toLocaleDateString('ko-KR')} · ${r.distance.toFixed(1)}km · ${fmtMinutes(r.minutes)} · ${r.source}</div></div><div class="map-placeholder" style="height:90px;width:180px">주행 지도</div></div>`).join('')}</div>
  `);
}

function renderSettings(){
  shell(`
    <div class="section-title"><h2>설정</h2></div>
    <div class="card"><div class="settings-row"><div><strong>저장 장소</strong><div class="muted">우리집 및 사용자 지정 장소</div></div><button class="btn ghost" id="addPlace">추가</button></div><div id="placeList">${state.places.map(p=>`<div class="settings-row"><span>${p}</span><span class="tag">저장됨</span></div>`).join('')}</div></div>
    <div class="section-title"><h2>연동</h2></div><div class="card"><div class="settings-row"><div><strong>Strava</strong><div class="muted">OAuth 연결 구조</div></div><span class="tag">연결 준비</span></div><div class="settings-row"><div><strong>Kakao Maps</strong><div class="muted">지도 및 경로 표시</div></div><span class="tag">키 필요</span></div></div>
  `);
  document.querySelector('#addPlace').onclick=()=>{const name=prompt('저장할 장소 이름');if(name){state.places.push(name);localStorage.setItem('places',JSON.stringify(state.places));renderSettings();}};
}

function render(){ if(state.tab==='today')renderToday(); else if(state.tab==='courses')renderCourses(); else if(state.tab==='ride')renderRide(); else if(state.tab==='records')renderRecords(); else renderSettings(); }
render();
