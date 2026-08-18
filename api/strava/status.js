import { parseCookies } from './_shared.js';

export default async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const c=parseCookies(req);
  return res.status(200).json({connected:Boolean(c.strava_refresh)});
}
