import { NextRequest, NextResponse } from "next/server";

const host=process.env.VMIX_HOST||"127.0.0.1";
const port=process.env.VMIX_PORT||"8088";

export async function GET(){
 try{const r=await fetch(`http://${host}:${port}/api`,{cache:"no-store",signal:AbortSignal.timeout(2500)});return NextResponse.json({ok:r.ok,host,port},{status:r.ok?200:502})}catch{return NextResponse.json({ok:false,error:"vMix não encontrado na rede"},{status:503})}
}

export async function POST(req:NextRequest){
 try{
  const body=await req.json();
  const allowed=new Set(["SetText","SetImage","OverlayInput1In","OverlayInput1Out","OverlayInput2In","OverlayInput2Out"]);
  if(!allowed.has(body.function))return NextResponse.json({ok:false,error:"Comando não permitido"},{status:400});
  const url=new URL(`http://${host}:${port}/api/`);url.searchParams.set("Function",body.function);
  if(body.input)url.searchParams.set("Input",String(body.input));if(body.selectedName)url.searchParams.set("SelectedName",String(body.selectedName));if(body.value!==undefined)url.searchParams.set("Value",String(body.value));
  const r=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(3000)});return NextResponse.json({ok:r.ok},{status:r.ok?200:502});
 }catch{return NextResponse.json({ok:false,error:"Falha ao comunicar com o vMix"},{status:503})}
}
