import { env } from 'cloudflare:workers';
export async function POST(request:Request){
 const configured=(env as unknown as {WAITLIST_ADMIN_TOKEN?:string}).WAITLIST_ADMIN_TOKEN;
 if(!configured)return Response.json({error:'Export is not configured. Set WAITLIST_ADMIN_TOKEN in the Site runtime secrets.'},{status:503});
 const token=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 const enc=new TextEncoder();const a=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(token)));const b=new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(configured)));let mismatch=0;for(let i=0;i<a.length;i++)mismatch|=a[i]^b[i];if(mismatch)return Response.json({error:'Unauthorized.'},{status:401});
 if(!env.DB)return Response.json({error:'Database unavailable.'},{status:503});
 const {results}=await env.DB.prepare('SELECT email,created_at,consent_version FROM waitlist ORDER BY created_at DESC').all<{email:string;created_at:number;consent_version:string}>();
 const quote=(value:string)=>'"'+(/^[=+@\-\t\r]/.test(value)?"'":'')+value.replaceAll('"','""')+'"';
 const csv='email,created_at,consent_version\r\n'+results.map(row=>[quote(row.email),quote(new Date(row.created_at).toISOString()),quote(row.consent_version)].join(',')).join('\r\n');
 return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="others-waitlist.csv"','Cache-Control':'no-store'}});
}
