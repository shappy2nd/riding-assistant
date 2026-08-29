import { NextRequest,NextResponse } from "next/server";
import { cookieName,fresh,seal,session } from "@/lib/strava";

export async function GET(req:NextRequest){
 const old=await session();
 if(!old)return NextResponse.json({error:"Strava 연결이 필요합니다."},{status:401});
 const id=req.nextUrl.searchParams.get("id");
 if(!id||!/^[0-9]+$/.test(id))return NextResponse.json({error:"업로드 번호가 올바르지 않습니다."},{status:400});
 try{
  const s=await fresh(old),r=await fetch(`https://www.strava.com/api/v3/uploads/${id}`,{headers:{Authorization:`Bearer ${s.access_token}`}}),data=await r.json();
  if(!r.ok)return NextResponse.json({error:data?.message||"업로드 상태를 확인하지 못했습니다."},{status:r.status});
  const res=NextResponse.json({complete:Boolean(data.activity_id),activityId:data.activity_id||null,error:data.error||null,status:data.status||"처리 중"});
  if(s.refresh_token!==old.refresh_token)res.cookies.set(cookieName,await seal(s),{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:31536000});
  return res;
 }catch{return NextResponse.json({error:"업로드 상태를 확인하지 못했습니다."},{status:500})}
}
