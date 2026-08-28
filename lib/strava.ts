import { cookies } from "next/headers";

export type StravaSession = { access_token:string;refresh_token:string;expires_at:number;athlete:{id:number;firstname?:string;lastname?:string} };
const COOKIE="riding_strava";
const enc=new TextEncoder(), dec=new TextDecoder();
async function key(){const raw=enc.encode(process.env.STRAVA_CLIENT_SECRET||"");return crypto.subtle.importKey("raw",await crypto.subtle.digest("SHA-256",raw),"AES-GCM",false,["encrypt","decrypt"])}
export async function seal(data:StravaSession){const iv=crypto.getRandomValues(new Uint8Array(12)),bytes=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv},await key(),enc.encode(JSON.stringify(data))));return `${btoa(String.fromCharCode(...iv))}.${btoa(String.fromCharCode(...bytes))}`}
export async function open(value?:string):Promise<StravaSession|null>{try{if(!value)return null;const [a,b]=value.split("."),iv=Uint8Array.from(atob(a),c=>c.charCodeAt(0)),bytes=Uint8Array.from(atob(b),c=>c.charCodeAt(0));return JSON.parse(dec.decode(await crypto.subtle.decrypt({name:"AES-GCM",iv},await key(),bytes)))}catch{return null}}
export async function session(){return open((await cookies()).get(COOKIE)?.value)}
export async function fresh(s:StravaSession){if(s.expires_at>Date.now()/1000+3600)return s;const body=new URLSearchParams({client_id:process.env.STRAVA_CLIENT_ID||"",client_secret:process.env.STRAVA_CLIENT_SECRET||"",grant_type:"refresh_token",refresh_token:s.refresh_token}),r=await fetch("https://www.strava.com/oauth/token",{method:"POST",body});if(!r.ok)throw new Error("Strava token refresh failed");return {...s,...await r.json()}}
export const cookieName=COOKIE;
