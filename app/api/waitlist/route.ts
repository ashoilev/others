import { env } from 'cloudflare:workers';
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Invalid request origin.'},{status:403});
 if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'Expected JSON.'},{status:415});
 try{const body=await request.text();if(body.length>2048)return Response.json({error:'Request too large.'},{status:413});const data=JSON.parse(body);const email=typeof data.email==='string'?data.email.trim().toLowerCase():'';
 if(data.website)return Response.json({error:'Unable to accept this request.'},{status:400});
 if(email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({error:'Please enter a valid email address.'},{status:400});
 if(!env.DB)return Response.json({error:'The waitlist is not connected yet. Please check back soon.'},{status:503});
 await env.DB.prepare('INSERT INTO waitlist (email, created_at, consent_version) VALUES (?, ?, ?) ON CONFLICT(email) DO NOTHING').bind(email,Date.now(),'2026-10-23').run();
 return Response.json({message:'Thanks for your curiosity. If this email was already on the list, you’re still all set. We’ll be in touch when there’s more to explore.'});
 }catch{return Response.json({error:'We couldn’t save your signup. Please try again in a moment.'},{status:503});}
}
