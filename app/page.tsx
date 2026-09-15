"use client";

import { useState } from "react";
import { BookOpen, CircleDollarSign, LayoutGrid, Megaphone, Mic2, MonitorPlay, Music2, Radio, Settings2, UserRound, Wifi } from "lucide-react";

const nav = [
  ["Culto", Radio], ["GC", UserRound], ["Bíblia", BookOpen], ["Louvor", Music2],
  ["Oferta", CircleDollarSign], ["Avisos", Megaphone], ["Biblioteca", LayoutGrid],
] as const;

export default function Home() {
  const [active, setActive] = useState("Culto");
  const [live, setLive] = useState(false);
  const [mode, setMode] = useState<"preparacao" | "culto">("preparacao");

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brandMark">c</span><strong>church gc</strong></div>
        <nav>
          {nav.map(([label, Icon]) => <button key={label} className={active === label ? "nav active" : "nav"} onClick={() => setActive(label)}><Icon size={18}/><span>{label}</span></button>)}
        </nav>
        <div className="sideBottom">
          <button className="nav"><Settings2 size={18}/><span>Configurações</span></button>
          <div className="connection"><span className="dot"/><div><strong>vMix conectado</strong><small>Transmissão 01</small></div></div>
        </div>
      </aside>

      <section className="workspace">
        <header>
          <div><p className="eyebrow">CULTO DE DOMINGO</p><h1>{active}</h1></div>
          <div className="headerActions"><span className="network"><Wifi size={15}/> Rede local</span><div className="mode"><button className={mode === "preparacao" ? "selected" : ""} onClick={() => setMode("preparacao")}>Preparação</button><button className={mode === "culto" ? "selected" : ""} onClick={() => setMode("culto")}>Modo culto</button></div></div>
        </header>

        <div className="contentGrid">
          <section className="runPanel">
            <div className="sectionTitle"><div><p className="eyebrow">ROTEIRO</p><h2>Próximos do culto</h2></div><button className="quiet">+ Adicionar</button></div>
            <div className="runList">
              <RunItem type="LOUVOR" title="Bondade de Deus" detail="Refrão" icon={<Music2 size={17}/>} status="Próximo" />
              <RunItem type="BÍBLIA" title="João 3:16" detail="NAA" icon={<BookOpen size={17}/>} />
              <RunItem type="GC" title="Pr. Rafael Martins" detail="Pastor convidado" icon={<UserRound size={17}/>} />
              <RunItem type="OFERTA" title="Dízimos e ofertas" detail="PIX + QR Code" icon={<CircleDollarSign size={17}/>} />
              <RunItem type="AVISO" title="Conferência City" detail="18–20 de setembro" icon={<Megaphone size={17}/>} />
            </div>
          </section>

          <section className="previewPanel">
            <div className="sectionTitle"><div><p className="eyebrow">PREVIEW</p><h2>Saída do GC</h2></div><span className="resolution">1920 × 1080</span></div>
            <div className="screen">
              <div className="screenTag"><MonitorPlay size={14}/> PREVIEW</div>
              <div className="lowerThird"><small>PRÓXIMO</small><strong>Bondade de Deus</strong><span>Refrão</span></div>
            </div>
            <div className="previewMeta"><div><span>Selecionado</span><strong>Bondade de Deus · Refrão</strong></div><button className="edit">Editar conteúdo</button></div>
          </section>
        </div>

        <section className="livebar">
          <div className="onair"><span className={live ? "liveDot live" : "liveDot"}/><div><small>NO AR</small><strong>{live ? "Bondade de Deus · Refrão" : "Nenhum GC no ar"}</strong></div></div>
          <div className="controls"><button>← Anterior</button><button className={live ? "danger" : "primary"} onClick={() => setLive(!live)}>{live ? "Tirar do ar" : "Colocar no ar"}</button><button>Próximo →</button></div>
          <div className="shortcut"><kbd>Espaço</kbd><span>colocar / tirar</span></div>
        </section>
      </section>
    </main>
  );
}

function RunItem({ type, title, detail, icon, status }: {type:string; title:string; detail:string; icon:React.ReactNode; status?:string}) {
  return <button className="runItem"><span className="drag">⋮⋮</span><span className="itemIcon">{icon}</span><div><small>{type}</small><strong>{title}</strong><span>{detail}</span></div>{status && <em>{status}</em>}</button>;
}
