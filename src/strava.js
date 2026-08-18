const API_BASE = (import.meta.env.VITE_STRAVA_API_BASE || '').replace(/\/$/, '');

function api(path){ return `${API_BASE}${path}`; }

export async function getStravaStatus(){
  try{
    const res = await fetch(api('/api/strava/status'), { credentials:'include' });
    if(!res.ok) return { connected:false };
    return await res.json();
  }catch{
    return { connected:false };
  }
}

export function connectStrava(){
  window.location.href = api('/api/strava/auth');
}

export async function syncStravaActivities(){
  const res = await fetch(api('/api/strava/activities?per_page=50'), { credentials:'include' });
  if(!res.ok){
    const body = await res.json().catch(()=>({}));
    throw new Error(body.error || `Strava 동기화 실패 (${res.status})`);
  }
  const activities = await res.json();
  return activities
    .filter(a => ['Ride','MountainBikeRide','GravelRide','VirtualRide','EBikeRide'].includes(a.sport_type || a.type))
    .map(a => ({
      id: String(a.id),
      date: a.start_date_local || a.start_date,
      distance: Number(a.distance || 0) / 1000,
      minutes: Math.round(Number(a.moving_time || a.elapsed_time || 0) / 60),
      source: 'Strava',
      title: a.name || 'Strava 라이딩',
      polyline: a.map?.summary_polyline || '',
      elevation: Number(a.total_elevation_gain || 0)
    }));
}

export function mergeRides(existing, incoming){
  const merged = [...existing];
  for(const ride of incoming){
    const exact = merged.some(r => r.source === 'Strava' && r.id && r.id === ride.id);
    if(exact) continue;
    const t = new Date(ride.date).getTime();
    const duplicate = merged.some(r => {
      const dt = Math.abs(new Date(r.date).getTime() - t);
      return dt <= 10*60*1000 && Math.abs(Number(r.distance)-Number(ride.distance)) <= 0.2;
    });
    if(!duplicate) merged.push(ride);
  }
  return merged.sort((a,b)=>new Date(b.date)-new Date(a.date));
}
