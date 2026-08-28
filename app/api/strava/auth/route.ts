import { NextResponse } from "next/server";
export async function GET(){const q=new URLSearchParams({client_id:process.env.STRAVA_CLIENT_ID||"",redirect_uri:process.env.STRAVA_REDIRECT_URI||"",response_type:"code",approval_prompt:"auto",scope:"activity:read_all,activity:write"});return NextResponse.redirect(`https://www.strava.com/oauth/authorize?${q}`)}
