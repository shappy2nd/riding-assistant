import { randomState, setCookie } from './_shared.js';

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  if(!process.env.STRAVA_CLIENT_ID) return res.status(500).json({error:'STRAVA_CLIENT_ID 미설정'});
  const state=randomState();
  setCookie(res,'strava_oauth_state',state,{maxAge:600});
  const origin=process.env.APP_ORIGIN || `${req.headers['x-forwarded-proto']||'https'}://${req.headers.host}`;
  const redirectUri=`${origin.replace(/\/$/,'')}/api/strava/callback`;
  const qs=new URLSearchParams({
    client_id:process.env.STRAVA_CLIENT_ID,
    response_type:'code',
    redirect_uri:redirectUri,
    approval_prompt:'auto',
    scope:'read,activity:read',
    state
  });
  res.redirect(302,`https://www.strava.com/oauth/authorize?${qs}`);
}
