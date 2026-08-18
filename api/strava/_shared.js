import crypto from 'node:crypto';

export const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';
export const STRAVA_API = 'https://www.strava.com/api/v3';

export function parseCookies(req){
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(v=>{
    const i=v.indexOf('='); return [v.slice(0,i).trim(), decodeURIComponent(v.slice(i+1))];
  }));
}

export function setCookie(res,name,value,{maxAge=21600,httpOnly=true}={}){
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Max-Age=${maxAge}${httpOnly?'; HttpOnly':''}${secure}`;
  const prev = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', prev ? [...(Array.isArray(prev)?prev:[prev]),cookie] : cookie);
}

export function clearCookie(res,name){ setCookie(res,name,'',{maxAge:0}); }
export function randomState(){ return crypto.randomBytes(24).toString('hex'); }

export async function exchangeToken(params){
  const body = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || '',
    client_secret: process.env.STRAVA_CLIENT_SECRET || '',
    ...params
  });
  const res = await fetch(STRAVA_TOKEN_URL,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  const data = await res.json();
  if(!res.ok) throw new Error(data.message || 'Strava token exchange failed');
  return data;
}

export function saveTokens(res,data){
  setCookie(res,'strava_access',data.access_token,{maxAge:Math.max(60,(data.expires_at||0)-Math.floor(Date.now()/1000))});
  setCookie(res,'strava_refresh',data.refresh_token,{maxAge:60*60*24*180});
  setCookie(res,'strava_expires',String(data.expires_at||0),{maxAge:60*60*24*180});
}

export async function validAccessToken(req,res){
  const c=parseCookies(req);
  if(!c.strava_refresh) return null;
  const expires=Number(c.strava_expires||0);
  if(c.strava_access && expires > Math.floor(Date.now()/1000)+120) return c.strava_access;
  const data=await exchangeToken({grant_type:'refresh_token',refresh_token:c.strava_refresh});
  saveTokens(res,data);
  return data.access_token;
}
