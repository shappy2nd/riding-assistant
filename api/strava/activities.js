import { STRAVA_API, validAccessToken } from './_shared.js';

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  try{
    const token=await validAccessToken(req,res);
    if(!token) return res.status(401).json({error:'Strava 연결이 필요합니다.'});
    const perPage=Math.min(100,Math.max(1,Number(req.query?.per_page||30)));
    const page=Math.max(1,Number(req.query?.page||1));
    const url=new URL(`${STRAVA_API}/athlete/activities`);
    url.searchParams.set('page',String(page));
    url.searchParams.set('per_page',String(perPage));
    const upstream=await fetch(url,{headers:{Authorization:`Bearer ${token}`}});
    const data=await upstream.json();
    if(!upstream.ok) return res.status(upstream.status).json({error:data.message||'Strava API error'});
    return res.status(200).json(data);
  }catch(err){
    return res.status(502).json({error:err.message});
  }
}
