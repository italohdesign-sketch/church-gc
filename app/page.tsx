"use client";

import { useEffect, useState } from "react";
import {
  BookOpen, CircleDollarSign, LayoutGrid, Megaphone, Music2, Radio,
  Settings2, UserRound, Wifi, Plus, Search, ChevronLeft, ChevronRight,
  Eye, EyeOff, MonitorUp, SlidersHorizontal
} from "lucide-react";

type Item = { type:string; title:string; detail:string; body?:string };

const seed: Item[] = [
  { type:"LOUVOR", title:"Bondade de Deus", detail:"Refrão", body:"Tua bondade me seguirá" },
  { type:"BÍBLIA", title:"João 3:16", detail:"Texto bíblico", body:"Porque Deus amou o mundo de tal maneira..." },
  { type:"GC", title:"Pr. Rafael Martins", detail:"Pastor convidado", body:"Pastor convidado" },
  { type:"OFERTA", title:"Dízimos e ofertas", detail:"PIX + QR Code", body:"chavepix@igreja.com" },
  { type:"AVISO", title:"Conferência City", detail:"18–20 de setembro", body:"18–20 de setembro" }
];

const nav = [
  ["Culto", Radio], ["GC", UserRound], ["Bíblia", BookOpen], ["Louvor", Music2],
  ["Oferta", CircleDollarSign], ["Avisos", Megaphone], ["Templates", LayoutGrid]
] as const;

export default function Home(){
  const [active,setActive]=useState("Culto");
  const [mode,setMode]=useState<"prep"|"live">("prep");
  const [items,setItems]=useState<Item[]>(seed);
  const [preview,setPreview]=useState(0);
  const [program,setProgram]=useState<number|null>(null);
  const [vmix,setVmix]=useState<"offline"|"checking"|"online">("offline");

  const previewItem=items[preview]||items[0];
  const programItem=program===null?null:items[program];

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      const tag=(e.target as HTMLElement)?.tagName;
      if(tag==="INPUT"||tag==="TEXTAREA") return;
      if(e.code==="Space"){e.preventDefault(); setProgram(p=>p===preview?null:preview)}
      if(e.key==="ArrowRight") setPreview(v=>Math.min(items.length-1,v+1));
      if(e.key==="ArrowLeft") setPreview(v=>Math.max(0,v-1));
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[preview,items.length]);

  async function testVmix(){
    setVmix("checking");
    try{const r=await fetch("/api/vmix");setVmix(r.ok?"online":"offline")}catch{setVmix("offline")}
  }

  function addItem(item:Item){
    setItems(v=>[...v,item]);
    setPreview(items.length);
    setActive("Culto");
  }

  return <main className={mode==="live"?"app liveMode":"app"}>
    <aside className="rail">
      <div className="logo">c</div>
      <nav className="railNav">
        {nav.map(([label,Icon])=>
          <button key={label} title={label} className={active===label?"railBtn active":"railBtn"} onClick={()=>setActive(label)}>
            <Icon size={18}/><span>{label}</span>
          </button>
        )}
      </nav>
      <div className="railBottom">
        <button title="Configurações" className={active==="Configurações"?"railBtn active":"railBtn"} onClick={()=>setActive("Configurações")}><Settings2 size={18}/><span>Configurações</span></button>
      </div>
    </aside>

    <section className="surface">
      <header className="topbar">
        <div className="service">
          <strong>church gc</strong>
          <span className="divider"/>
          <span>Culto de domingo</span>
        </div>
        <div className="topActions">
          <button className="vmixStatus" onClick={testVmix}>
            <span className={"statusDot "+vmix}/><Wifi size={14}/>
            {vmix==="online"?"vMix conectado":vmix==="checking"?"verificando...":"vMix offline"}
          </button>
          <div className="modeSwitch">
            <button className={mode==="prep"?"active":""} onClick={()=>setMode("prep")}>Preparar</button>
            <button className={mode==="live"?"active":""} onClick={()=>setMode("live")}>Ao vivo</button>
          </div>
        </div>
      </header>

      {active==="Culto"
        ? <ConsoleView items={items} preview={preview} program={program} setPreview={setPreview} setProgram={setProgram}/>
        : <ModuleView active={active} addItem={addItem} testVmix={testVmix} vmix={vmix}/>
      }
    </section>
  </main>
}

function ConsoleView({items,preview,program,setPreview,setProgram}:{items:Item[];preview:number;program:number|null;setPreview:(n:number)=>void;setProgram:(n:number|null)=>void}){
  const p=items[preview];
  const live=program===null?null:items[program];

  return <div className="console">
    <section className="cuePane">
      <div className="paneHead">
        <div><span className="kicker">RUNDOWN</span><h2>Ordem do culto</h2></div>
        <button className="iconBtn" title="Adicionar item"><Plus size={16}/></button>
      </div>
      <div className="cueSearch"><Search size={14}/><input placeholder="Buscar no culto"/></div>
      <div className="cueList">
        {items.map((item,i)=>
          <button key={i} className={i===preview?"cue active":"cue"} onClick={()=>setPreview(i)}>
            <span className={"typeTag t-"+item.type.toLowerCase()}>{shortType(item.type)}</span>
            <span className="cueCopy"><strong>{item.title}</strong><small>{item.detail}</small></span>
            {program===i && <span className="airFlag">AR</span>}
          </button>
        )}
      </div>
      <div className="cueFoot">{items.length} itens no culto</div>
    </section>

    <section className="stage">
      <div className="monitors">
        <MonitorCard label="PREVIEW" tone="preview" item={p}/>
        <MonitorCard label="PROGRAM" tone="program" item={live}/>
      </div>

      <div className="transport">
        <button className="transportBtn" onClick={()=>setPreview(Math.max(0,preview-1))}><ChevronLeft size={18}/>Anterior</button>
        <button className="clearBtn" disabled={program===null} onClick={()=>setProgram(null)}><EyeOff size={17}/>Tirar do ar</button>
        <button className="takeBtn" onClick={()=>setProgram(preview)}><MonitorUp size={17}/>Colocar no ar</button>
        <button className="transportBtn" onClick={()=>setPreview(Math.min(items.length-1,preview+1))}>Próximo<ChevronRight size={18}/></button>
      </div>

      <div className="statusStrip">
        <div><span>Preview</span><strong>{p.title}</strong></div>
        <div className="keys"><kbd>←</kbd><kbd>→</kbd><span>navegar</span><kbd>Espaço</kbd><span>ar / limpar</span></div>
        <div className="programText"><span>No ar</span><strong>{live?live.title:"—"}</strong></div>
      </div>
    </section>

    <aside className="quickPane">
      <div className="paneHead"><div><span className="kicker">ACESSO RÁPIDO</span><h2>Carregar GC</h2></div></div>
      <div className="quickGrid">
        <Quick icon={<UserRound size={18}/>} label="Pessoa" shortcut="1"/>
        <Quick icon={<BookOpen size={18}/>} label="Bíblia" shortcut="2"/>
        <Quick icon={<Music2 size={18}/>} label="Louvor" shortcut="3"/>
        <Quick icon={<CircleDollarSign size={18}/>} label="Oferta" shortcut="4"/>
        <Quick icon={<Megaphone size={18}/>} label="Aviso" shortcut="5"/>
        <Quick icon={<LayoutGrid size={18}/>} label="Livre" shortcut="6"/>
      </div>

      <div className="inspector">
        <div className="inspectorHead"><span>ITEM SELECIONADO</span><SlidersHorizontal size={14}/></div>
        <label>Tipo<input value={p.type} readOnly/></label>
        <label>Título<input value={p.title} readOnly/></label>
        <label>Conteúdo<textarea value={p.body||p.detail} readOnly/></label>
        <button className="editBtn">Editar conteúdo</button>
      </div>
    </aside>
  </div>
}

function MonitorCard({label,tone,item}:{label:string;tone:"preview"|"program";item:Item|null}){
  return <div className={"monitor "+tone}>
    <div className="monitorHead"><span className="lamp"/><strong>{label}</strong><span>1920×1080</span></div>
    <div className="video">
      <div className="safeArea"/>
      {item
        ? <div className="graphic"><small>{item.type}</small><strong>{item.title}</strong><span>{item.body||item.detail}</span></div>
        : <div className="emptyProgram"><Eye size={22}/><span>Nenhum GC no ar</span></div>
      }
    </div>
  </div>
}

function Quick({icon,label,shortcut}:{icon:React.ReactNode;label:string;shortcut:string}){
  return <button className="quickBtn">{icon}<span>{label}</span><kbd>{shortcut}</kbd></button>
}

function ModuleView({active,addItem,testVmix,vmix}:{active:string;addItem:(i:Item)=>void;testVmix:()=>void;vmix:string}){
  if(active==="Templates"){
    return <div className="moduleShell">
      <div className="moduleHead"><div><span className="kicker">BIBLIOTECA</span><h1>Templates</h1></div><button className="secondaryBtn">Novo template</button></div>
      <div className="templateShelf">
        {["Lower clean","Versículo amplo","Louvor central","Oferta + QR","Aviso lateral","Nome + cargo"].map((n,i)=>
          <button className="templateTile" key={n}><div className={"templateThumb v"+i}><span/></div><strong>{n}</strong><small>Broadcast · 16:9</small></button>
        )}
      </div>
    </div>
  }

  if(active==="Configurações"){
    return <div className="moduleShell">
      <div className="moduleHead"><div><span className="kicker">SISTEMA</span><h1>Configurações</h1></div></div>
      <div className="settingsPanel">
        <div><h3>Conexão com vMix</h3><p>O Bridge conversa com o computador da transmissão pela rede local.</p></div>
        <label>Host do vMix<input value="VMIX_HOST" readOnly/></label>
        <label>Porta<input value="8088" readOnly/></label>
        <button className="takeBtn" onClick={testVmix}>{vmix==="checking"?"Testando...":"Testar conexão"}</button>
      </div>
    </div>
  }

  const map:Record<string,{type:string;title:string;field1:string;field2:string}> = {
    "GC":{type:"GC",title:"Pessoa",field1:"Nome",field2:"Função / cargo"},
    "Bíblia":{type:"BÍBLIA",title:"Bíblia",field1:"Referência",field2:"Texto"},
    "Louvor":{type:"LOUVOR",title:"Louvor",field1:"Música",field2:"Trecho / seção"},
    "Oferta":{type:"OFERTA",title:"Oferta",field1:"Título",field2:"PIX / instrução"},
    "Avisos":{type:"AVISO",title:"Aviso",field1:"Título",field2:"Data / informação"}
  };
  const cfg=map[active]||map.GC;
  return <Composer cfg={cfg} addItem={addItem}/>
}

function Composer({cfg,addItem}:{cfg:{type:string;title:string;field1:string;field2:string};addItem:(i:Item)=>void}){
  const [a,setA]=useState(""); const[b,setB]=useState("");
  return <div className="moduleShell">
    <div className="moduleHead"><div><span className="kicker">CRIAR GC</span><h1>{cfg.title}</h1></div><span className="moduleHint">Enter para preparar · Espaço para colocar no ar</span></div>
    <div className="editorConsole">
      <div className="editorFields">
        <label>{cfg.field1}<input autoFocus value={a} onChange={e=>setA(e.target.value)} placeholder={cfg.field1}/></label>
        <label>{cfg.field2}<textarea value={b} onChange={e=>setB(e.target.value)} placeholder={cfg.field2}/></label>
        <button className="takeBtn" disabled={!a.trim()} onClick={()=>addItem({type:cfg.type,title:a,detail:b||"Pronto para exibir",body:b})}><Plus size={16}/>Adicionar ao rundown</button>
      </div>
      <div className="editorPreview">
        <div className="monitor preview">
          <div className="monitorHead"><span className="lamp"/><strong>PREVIEW</strong><span>1920×1080</span></div>
          <div className="video"><div className="safeArea"/><div className="graphic"><small>{cfg.type}</small><strong>{a||"Seu conteúdo"}</strong><span>{b||"Preencha os campos para visualizar."}</span></div></div>
        </div>
      </div>
    </div>
  </div>
}

function shortType(t:string){return t==="BÍBLIA"?"BV":t==="LOUVOR"?"LV":t==="OFERTA"?"OF":t==="AVISO"?"AV":"GC"}
