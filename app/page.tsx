"use client";

import { useEffect, useState } from "react";
import {
  BookOpen, CircleDollarSign, LayoutGrid, Megaphone, Music2, Radio,
  Settings2, UserRound, Wifi, Plus, Search, ChevronLeft, ChevronRight,
  EyeOff, MonitorUp, SlidersHorizontal, MoreHorizontal, FolderOpen,
  Save, PanelLeftClose, Command, Square
} from "lucide-react";

type Item = { type:string; title:string; detail:string; body?:string };

const seed: Item[] = [
  { type:"LOUVOR", title:"Bondade de Deus", detail:"Refrão", body:"Tua bondade me seguirá" },
  { type:"BÍBLIA", title:"João 3:16", detail:"NAA", body:"Porque Deus amou o mundo de tal maneira..." },
  { type:"GC", title:"Pr. Rafael Martins", detail:"Pastor convidado", body:"Pastor convidado" },
  { type:"OFERTA", title:"Dízimos e ofertas", detail:"PIX + QR Code", body:"chavepix@igreja.com" },
  { type:"AVISO", title:"Conferência City", detail:"18–20 SET", body:"18–20 de setembro" }
];

const nav = [
  ["Culto", Radio], ["GC", UserRound], ["Bíblia", BookOpen], ["Louvor", Music2],
  ["Oferta", CircleDollarSign], ["Avisos", Megaphone], ["Templates", LayoutGrid]
] as const;

export default function Home(){
  const [active,setActive]=useState("Culto");
  const [items,setItems]=useState<Item[]>(seed);
  const [preview,setPreview]=useState(0);
  const [program,setProgram]=useState<number|null>(null);
  const [vmix,setVmix]=useState<"offline"|"checking"|"online">("offline");

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      const tag=(e.target as HTMLElement)?.tagName;
      if(tag==="INPUT"||tag==="TEXTAREA") return;
      if(e.code==="Space"){ e.preventDefault(); setProgram(p=>p===preview?null:preview); }
      if(e.key==="ArrowRight") setPreview(v=>Math.min(items.length-1,v+1));
      if(e.key==="ArrowLeft") setPreview(v=>Math.max(0,v-1));
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[preview,items.length]);

  async function testVmix(){
    setVmix("checking");
    try{const r=await fetch("/api/vmix"); setVmix(r.ok?"online":"offline")}catch{setVmix("offline")}
  }
  function addItem(item:Item){setItems(v=>[...v,item]);setPreview(items.length);setActive("Culto")}

  return <main className="appFrame">
    <header className="appChrome">
      <div className="appIdentity">
        <div className="mark">CG</div>
        <div><strong>church gc</strong><span>Broadcast Graphics Control</span></div>
      </div>
      <div className="menuStrip">
        <button>Arquivo</button><button>Editar</button><button>Exibir</button><button>Saída</button>
      </div>
      <div className="systemStatus">
        <button className="statusPill" onClick={testVmix}>
          <span className={"signal "+vmix}/><Wifi size={13}/>
          {vmix==="online"?"vMix online":vmix==="checking"?"Conectando":"vMix offline"}
        </button>
        <span className="clock">TRANSMISSÃO 01</span>
      </div>
    </header>

    <div className="workbench">
      <aside className="toolRail">
        {nav.map(([label,Icon])=>
          <button key={label} title={label} className={active===label?"tool active":"tool"} onClick={()=>setActive(label)}>
            <Icon size={17}/><span>{label}</span>
          </button>
        )}
        <div className="toolSpacer"/>
        <button title="Configurações" className={active==="Configurações"?"tool active":"tool"} onClick={()=>setActive("Configurações")}><Settings2 size={17}/><span>Config</span></button>
      </aside>

      <section className="workspace">
        <div className="workspaceToolbar">
          <div className="serviceTitle">
            <button className="ghostIcon"><PanelLeftClose size={15}/></button>
            <div><strong>Culto de domingo</strong><span>15 set 2026 · 19:00</span></div>
          </div>
          <div className="toolbarActions">
            <button><FolderOpen size={14}/>Abrir</button>
            <button><Save size={14}/>Salvar</button>
            <span className="toolbarDivider"/>
            <button><Command size={14}/>Atalhos</button>
          </div>
        </div>

        {active==="Culto"
          ? <BroadcastConsole items={items} preview={preview} program={program} setPreview={setPreview} setProgram={setProgram}/>
          : <ModuleView active={active} addItem={addItem} testVmix={testVmix} vmix={vmix}/>
        }
      </section>
    </div>
  </main>
}

function BroadcastConsole({items,preview,program,setPreview,setProgram}:{items:Item[];preview:number;program:number|null;setPreview:(n:number)=>void;setProgram:(n:number|null)=>void}){
  const p=items[preview];
  const live=program===null?null:items[program];

  return <div className="broadcastGrid">
    <section className="playlistPane">
      <div className="panelHeader">
        <div><span className="panelLabel">PLAYLIST</span><strong>Rundown</strong></div>
        <div className="panelTools"><button><Plus size={14}/></button><button><MoreHorizontal size={14}/></button></div>
      </div>
      <div className="searchBar"><Search size={13}/><input placeholder="Localizar item"/></div>
      <div className="tableHead"><span>#</span><span>Tipo</span><span>Conteúdo</span><span>Estado</span></div>
      <div className="playlist">
        {items.map((item,i)=>
          <button key={i} className={i===preview?"playlistRow selected":"playlistRow"} onClick={()=>setPreview(i)}>
            <span className="rowIndex">{String(i+1).padStart(2,"0")}</span>
            <span className={"typeCode code-"+item.type.toLowerCase()}>{code(item.type)}</span>
            <span className="rowMain"><strong>{item.title}</strong><small>{item.detail}</small></span>
            <span className="rowState">{program===i?<><i className="liveIndicator"/>ON AIR</>:i===preview?"CUED":"READY"}</span>
          </button>
        )}
      </div>
      <div className="panelFooter"><span>{items.length} itens</span><span>Auto-save ativo</span></div>
    </section>

    <section className="centerStage">
      <div className="monitorGrid">
        <OutputMonitor title="PREVIEW" kind="preview" item={p}/>
        <OutputMonitor title="PROGRAM" kind="program" item={live}/>
      </div>

      <div className="takePanel">
        <button className="navControl" onClick={()=>setPreview(Math.max(0,preview-1))}><ChevronLeft size={17}/>PREV</button>
        <button className="clearControl" disabled={program===null} onClick={()=>setProgram(null)}><EyeOff size={16}/>CLEAR</button>
        <button className="takeControl" onClick={()=>setProgram(preview)}><MonitorUp size={16}/>TAKE</button>
        <button className="navControl" onClick={()=>setPreview(Math.min(items.length-1,preview+1))}>NEXT<ChevronRight size={17}/></button>
      </div>

      <div className="telemetry">
        <div><span>CUED</span><strong>{p.title}</strong></div>
        <div className="telemetryCenter"><kbd>←</kbd><kbd>→</kbd><span>SELECIONAR</span><kbd>SPACE</kbd><span>TAKE/CLEAR</span></div>
        <div className="telemetryRight"><span>PROGRAM</span><strong>{live?live.title:"EMPTY"}</strong></div>
      </div>
    </section>

    <aside className="inspectorPane">
      <div className="tabs"><button className="active">PROPRIEDADES</button><button>CAMADAS</button></div>
      <div className="inspectorBody">
        <div className="sectionCaption">ITEM SELECIONADO</div>
        <div className="propertyRow"><span>Tipo</span><strong>{p.type}</strong></div>
        <label>Nome<input value={p.title} readOnly/></label>
        <label>Descrição<input value={p.detail} readOnly/></label>
        <label>Conteúdo<textarea value={p.body||p.detail} readOnly/></label>
        <div className="sectionCaption spaced">SAÍDA</div>
        <div className="propertyRow"><span>Canal</span><strong>Overlay 1</strong></div>
        <div className="propertyRow"><span>Template</span><strong>Lower Clean 01</strong></div>
        <button className="editContent"><SlidersHorizontal size={14}/>Editar conteúdo</button>
      </div>
      <div className="quickRecall">
        <div className="sectionCaption">QUICK RECALL</div>
        <div className="recallGrid">
          {["GC","BV","LV","OF","AV","FREE"].map((x,i)=><button key={x}><span>{i+1}</span><strong>{x}</strong></button>)}
        </div>
      </div>
    </aside>
  </div>
}

function OutputMonitor({title,kind,item}:{title:string;kind:"preview"|"program";item:Item|null}){
  return <section className={"outputMonitor "+kind}>
    <div className="outputHeader">
      <div><span className="monitorLamp"/><strong>{title}</strong></div>
      <span>1080p50 · 16:9</span>
    </div>
    <div className="canvas">
      <div className="safeFrame"/>
      {item
        ? <div className="onAirGraphic"><small>{item.type}</small><strong>{item.title}</strong><span>{item.body||item.detail}</span></div>
        : <div className="emptyCanvas"><Square size={17}/><span>EMPTY</span></div>
      }
    </div>
  </section>
}

function ModuleView({active,addItem,testVmix,vmix}:{active:string;addItem:(i:Item)=>void;testVmix:()=>void;vmix:string}){
  if(active==="Templates") return <div className="moduleView"><div className="moduleTitle"><div><span>TEMPLATE LIBRARY</span><h1>Templates</h1></div><button className="toolbarButton">+ Novo template</button></div><div className="templateLibrary">{["Lower Clean 01","Scripture Full 02","Lyrics Center 01","Offering QR 01","Event Strip 02","Name Key 01"].map((x,i)=><button className="templateCard" key={x}><div className={"templatePreview tp"+i}><span/></div><strong>{x}</strong><small>1920×1080 · Overlay 1</small></button>)}</div></div>;

  if(active==="Configurações") return <div className="moduleView"><div className="moduleTitle"><div><span>SYSTEM</span><h1>Configurações</h1></div></div><div className="configPanel"><h3>vMix Bridge</h3><p>Conexão local entre o painel de operação e o computador de transmissão.</p><label>Host<input value="VMIX_HOST" readOnly/></label><label>Porta<input value="8088" readOnly/></label><button className="toolbarButton primary" onClick={testVmix}>{vmix==="checking"?"Testando...":"Testar conexão"}</button></div></div>;

  const map:Record<string,{type:string;title:string;field1:string;field2:string}> = {
    "GC":{type:"GC",title:"Pessoa / Lower Third",field1:"Nome",field2:"Função / cargo"},
    "Bíblia":{type:"BÍBLIA",title:"Texto bíblico",field1:"Referência",field2:"Texto"},
    "Louvor":{type:"LOUVOR",title:"Letra / Louvor",field1:"Música",field2:"Trecho / seção"},
    "Oferta":{type:"OFERTA",title:"Oferta",field1:"Título",field2:"PIX / instrução"},
    "Avisos":{type:"AVISO",title:"Aviso / Evento",field1:"Título",field2:"Data / informação"}
  };
  const cfg=map[active]||map.GC;
  return <Composer cfg={cfg} addItem={addItem}/>
}

function Composer({cfg,addItem}:{cfg:{type:string;title:string;field1:string;field2:string};addItem:(i:Item)=>void}){
  const[a,setA]=useState(""); const[b,setB]=useState("");
  return <div className="moduleView">
    <div className="moduleTitle"><div><span>GRAPHIC EDITOR</span><h1>{cfg.title}</h1></div><div className="moduleActions"><button className="toolbarButton">Salvar preset</button><button className="toolbarButton primary" disabled={!a.trim()} onClick={()=>addItem({type:cfg.type,title:a,detail:b||"Pronto",body:b})}>Adicionar ao rundown</button></div></div>
    <div className="editorLayout">
      <div className="fieldPanel">
        <div className="sectionCaption">DADOS</div>
        <label>{cfg.field1}<input autoFocus value={a} onChange={e=>setA(e.target.value)}/></label>
        <label>{cfg.field2}<textarea value={b} onChange={e=>setB(e.target.value)}/></label>
        <div className="sectionCaption spaced">TEMPLATE</div>
        <div className="propertyRow"><span>Template</span><strong>Lower Clean 01</strong></div>
        <div className="propertyRow"><span>Overlay</span><strong>1</strong></div>
      </div>
      <OutputMonitor title="PREVIEW" kind="preview" item={{type:cfg.type,title:a||"Seu conteúdo",detail:b||"Pré-visualização",body:b||"Preencha os campos para visualizar."}}/>
    </div>
  </div>
}

function code(t:string){return t==="BÍBLIA"?"BV":t==="LOUVOR"?"LYR":t==="OFERTA"?"OFF":t==="AVISO"?"EVT":"GC"}
