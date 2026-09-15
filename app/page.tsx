"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen, CircleDollarSign, LayoutGrid, Megaphone, Music2, Radio,
  Settings2, UserRound, Wifi, ChevronLeft, ChevronRight, Plus, Search,
  SlidersHorizontal, MonitorPlay, X, Save
} from "lucide-react";

type Item = { type:string; title:string; detail:string; body?:string };

const seed: Item[] = [
  { type:"LOUVOR", title:"Bondade de Deus", detail:"Refrão", body:"Tua bondade me seguirá" },
  { type:"BÍBLIA", title:"João 3:16", detail:"NAA", body:"Porque Deus amou o mundo de tal maneira..." },
  { type:"GC", title:"Pr. Rafael Martins", detail:"Pastor convidado", body:"Pastor convidado" },
  { type:"OFERTA", title:"Dízimos e ofertas", detail:"PIX + QR Code", body:"chavepix@igreja.com" },
  { type:"AVISO", title:"Conferência City", detail:"18–20 de setembro", body:"18–20 de setembro" }
];

const nav = [
  ["Culto", Radio], ["Bíblia", BookOpen], ["Louvor", Music2], ["GC", UserRound],
  ["Oferta", CircleDollarSign], ["Avisos", Megaphone], ["Templates", LayoutGrid]
] as const;

export default function Home(){
  const [active,setActive]=useState("Culto");
  const [items,setItems]=useState<Item[]>(seed);
  const [selected,setSelected]=useState(0);
  const [live,setLive]=useState<number|null>(null);
  const [vmix,setVmix]=useState<"offline"|"checking"|"online">("offline");

  const current=items[selected];
  const next=items[Math.min(selected+1,items.length-1)];

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      const tag=(e.target as HTMLElement)?.tagName;
      if(tag==="INPUT"||tag==="TEXTAREA") return;
      if(e.key==="ArrowRight") setSelected(v=>Math.min(items.length-1,v+1));
      if(e.key==="ArrowLeft") setSelected(v=>Math.max(0,v-1));
      if(e.code==="Space"){ e.preventDefault(); setLive(l=>l===selected?null:selected); }
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[selected,items.length]);

  async function testVmix(){
    setVmix("checking");
    try{ const r=await fetch("/api/vmix"); setVmix(r.ok?"online":"offline"); }
    catch{ setVmix("offline"); }
  }

  function addItem(item:Item){
    setItems(v=>[...v,item]);
    setSelected(items.length);
    setActive("Culto");
  }

  return <main className="app">
    <aside className="sidebar">
      <div className="brand"><span className="brandDot">c</span><strong>church gc</strong></div>

      <nav>
        {nav.map(([label,Icon])=>
          <button key={label} className={active===label?"navItem active":"navItem"} onClick={()=>setActive(label)}>
            <Icon size={18}/><span>{label}</span>
          </button>
        )}
      </nav>

      <div className="sidebarBottom">
        <button className={active==="Configurações"?"navItem active":"navItem"} onClick={()=>setActive("Configurações")}>
          <Settings2 size={18}/><span>Configurações</span>
        </button>
        <button className="vmixButton" onClick={testVmix}>
          <span className={"connectionDot "+vmix}/>
          <span>{vmix==="online"?"vMix conectado":vmix==="checking"?"Conectando...":"Conectar ao vMix"}</span>
        </button>
      </div>
    </aside>

    <section className="main">
      <header className="topbar">
        <div>
          <span className="topLabel">CULTO ATUAL</span>
          <strong>Culto de domingo</strong>
        </div>
        <div className="topRight">
          <span className="network"><Wifi size={14}/> Rede local</span>
          <button className="saveButton"><Save size={14}/> Salvar culto</button>
        </div>
      </header>

      {active==="Culto"
        ? <LiveWorkspace items={items} selected={selected} live={live} setSelected={setSelected} setLive={setLive} current={current} next={next}/>
        : <Module active={active} addItem={addItem} testVmix={testVmix} vmix={vmix}/>
      }
    </section>
  </main>
}

function LiveWorkspace({items,selected,live,setSelected,setLive,current,next}:{items:Item[];selected:number;live:number|null;setSelected:(n:number)=>void;setLive:(n:number|null)=>void;current:Item;next:Item}){
  return <div className="liveWorkspace">
    <div className="primaryArea">
      <section className="previewArea">
        <div className="previewHeader">
          <div><span className="sectionLabel">PREVIEW</span><strong>{current.title}</strong></div>
          <div className="previewMeta"><span>{current.type}</span><span>16:9</span></div>
        </div>

        <div className="previewCanvas">
          <div className="safeArea"/>
          <div className="demoBackdrop">
            <div className="backdropGlow"/>
          </div>
          <Graphic item={current}/>
          <div className="liveBadge">{live===selected?"NO AR":"PREVIEW"}</div>
        </div>

        <div className="controlBar">
          <button className="stepButton" onClick={()=>setSelected(Math.max(0,selected-1))}><ChevronLeft size={18}/><span>Anterior</span></button>
          <button className="clearButton" disabled={live===null} onClick={()=>setLive(null)}><X size={17}/><span>Tirar do ar</span></button>
          <button className="airButton" onClick={()=>setLive(selected)}><MonitorPlay size={18}/><span>Colocar no ar</span></button>
          <button className="stepButton" onClick={()=>setSelected(Math.min(items.length-1,selected+1))}><span>Próximo</span><ChevronRight size={18}/></button>
        </div>
      </section>

      <aside className="nextPanel">
        <div className="nextHeader"><span className="sectionLabel">PRÓXIMO</span><span>{selected+2 <= items.length ? String(selected+2).padStart(2,"0") : "—"}</span></div>
        <div className="nextHero">
          <TypeIcon type={next.type}/>
          <div><small>{next.type}</small><strong>{next.title}</strong><span>{next.detail}</span></div>
        </div>

        <div className="upNext">
          <span className="sectionLabel">DEPOIS</span>
          {items.slice(selected+2,selected+5).map((item,i)=>
            <button key={i} onClick={()=>setSelected(selected+2+i)}>
              <span className="miniType">{shortType(item.type)}</span>
              <span><strong>{item.title}</strong><small>{item.detail}</small></span>
            </button>
          )}
          {selected+2>=items.length && <div className="endOfList">Fim do roteiro</div>}
        </div>
      </aside>
    </div>

    <section className="timeline">
      <div className="timelineHeader">
        <span className="sectionLabel">ROTEIRO</span>
        <button><Plus size={14}/> Adicionar</button>
      </div>
      <div className="timelineTrack">
        {items.map((item,i)=>
          <button key={i} className={(i===selected?"timelineItem selected ":"timelineItem ")+(live===i?"onair":"")} onClick={()=>setSelected(i)}>
            <div className="timelineIndex">{String(i+1).padStart(2,"0")}</div>
            <TypeIcon type={item.type}/>
            <div className="timelineText"><strong>{item.title}</strong><span>{item.detail}</span></div>
            {live===i && <span className="airPip">NO AR</span>}
          </button>
        )}
      </div>
    </section>
  </div>
}

function Graphic({item}:{item:Item}){
  return <div className={"graphic graphic-"+item.type.toLowerCase()}>
    <span className="graphicEyebrow">{item.type}</span>
    <strong>{item.title}</strong>
    <span>{item.body||item.detail}</span>
  </div>
}

function TypeIcon({type}:{type:string}){
  if(type==="BÍBLIA") return <span className="typeIcon"><BookOpen size={17}/></span>;
  if(type==="LOUVOR") return <span className="typeIcon"><Music2 size={17}/></span>;
  if(type==="OFERTA") return <span className="typeIcon"><CircleDollarSign size={17}/></span>;
  if(type==="AVISO") return <span className="typeIcon"><Megaphone size={17}/></span>;
  return <span className="typeIcon"><UserRound size={17}/></span>;
}

function Module({active,addItem,testVmix,vmix}:{active:string;addItem:(i:Item)=>void;testVmix:()=>void;vmix:string}){
  if(active==="Templates"){
    return <div className="modulePage">
      <div className="moduleHeader"><div><span className="topLabel">BIBLIOTECA</span><h1>Templates</h1></div><button className="simpleButton"><Plus size={14}/> Novo template</button></div>
      <div className="templateGrid">
        {["Nome + função","Versículo amplo","Louvor central","Oferta + QR","Aviso de evento","GC minimal"].map((name,i)=>
          <button className="templateCard" key={name}>
            <div className={"templatePreview t"+i}><span/></div>
            <div><strong>{name}</strong><span>16:9</span></div>
          </button>
        )}
      </div>
    </div>
  }

  if(active==="Configurações"){
    return <div className="modulePage">
      <div className="moduleHeader"><div><span className="topLabel">SISTEMA</span><h1>Configurações</h1></div></div>
      <div className="settingsBox">
        <div><strong>Conexão com vMix</strong><p>Configure o computador onde o vMix está aberto.</p></div>
        <label>Host<input value="VMIX_HOST" readOnly/></label>
        <label>Porta<input value="8088" readOnly/></label>
        <button className="simpleButton primary" onClick={testVmix}>{vmix==="checking"?"Testando...":"Testar conexão"}</button>
      </div>
    </div>
  }

  const map:Record<string,{type:string;title:string;field1:string;field2:string;placeholder:string}> = {
    "Bíblia":{type:"BÍBLIA",title:"Bíblia",field1:"Referência",field2:"Texto",placeholder:"João 3:16"},
    "Louvor":{type:"LOUVOR",title:"Louvor",field1:"Música",field2:"Trecho / seção",placeholder:"Bondade de Deus"},
    "GC":{type:"GC",title:"GC de pessoa",field1:"Nome",field2:"Função / cargo",placeholder:"Pr. Rafael Martins"},
    "Oferta":{type:"OFERTA",title:"Oferta",field1:"Título",field2:"PIX / instrução",placeholder:"Dízimos e ofertas"},
    "Avisos":{type:"AVISO",title:"Aviso",field1:"Título",field2:"Data / informação",placeholder:"Conferência City"}
  };
  return <Composer cfg={map[active]||map.GC} addItem={addItem}/>
}

function Composer({cfg,addItem}:{cfg:{type:string;title:string;field1:string;field2:string;placeholder:string};addItem:(i:Item)=>void}){
  const[a,setA]=useState(""); const[b,setB]=useState("");
  const item=useMemo(()=>({type:cfg.type,title:a||cfg.placeholder,detail:b||"Pré-visualização",body:b||"Preencha os campos para visualizar."}),[a,b,cfg]);

  return <div className="composerPage">
    <section className="composerPanel">
      <div className="composerHeader"><span className="topLabel">PREPARAR</span><h1>{cfg.title}</h1></div>
      <div className="searchLike"><Search size={17}/><input autoFocus value={a} onChange={e=>setA(e.target.value)} placeholder={cfg.placeholder}/></div>
      <label>{cfg.field2}<textarea value={b} onChange={e=>setB(e.target.value)} placeholder={cfg.field2}/></label>
      <div className="composerActions"><button className="simpleButton">Salvar</button><button className="simpleButton primary" disabled={!a.trim()} onClick={()=>addItem({type:cfg.type,title:a,detail:b||"Pronto para exibir",body:b})}>Adicionar ao culto</button></div>
    </section>

    <section className="composerPreview">
      <div className="previewHeader"><div><span className="sectionLabel">PREVIEW</span><strong>{item.title}</strong></div><SlidersHorizontal size={16}/></div>
      <div className="previewCanvas compact"><div className="safeArea"/><div className="demoBackdrop"><div className="backdropGlow"/></div><Graphic item={item}/></div>
    </section>
  </div>
}

function shortType(t:string){return t==="BÍBLIA"?"BV":t==="LOUVOR"?"LV":t==="OFERTA"?"OF":t==="AVISO"?"AV":"GC"}
