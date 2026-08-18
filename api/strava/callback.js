import { parseCookies, clearCookie, exchangeToken, saveTokens } from './_shared.js';

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const { code, state, error } = req.query || {};
  const cookies=parseCookies(req);
  if(error) return res.redirect(302,'/?strava=denied');
  if(!code || !state || state !== cookies.strava_oauth_state) return res.status(400).json({error:'Invalid OAuth state'});
  try{
    const data=await exchangeToken({grant_type:'authorization_code',code:String(code)});
    saveTokens(res,data);
    clearCookie(res,'strava_oauth_state');
    return res.redirect(302,'/?strava=connected');
  }catch(err){
    return res.status(502).json({error:err.message});
  }
}
