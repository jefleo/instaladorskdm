import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Icone, Wordmark } from "../components/base";
import { config } from "../data/vapti";
import { modos } from "../content/ui";
import { slides } from "../sections";
import { ConteudoNotas } from "./Notas";
import { MiniaturaFluida, Palco } from "./Palco";
import { indiceDoHash } from "./rota";
import { useSincroniaNotas } from "./sincronia";
import { classificarAlvo } from "./teclado";

const mmss = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/** Segunda janela (?notas=1): tela atual, próxima, notas e cronômetro. */
export function JanelaNotas() {
  const { id, irPara, ultimoContato } = useSincroniaNotas(slides[indiceDoHash()].id);
  const indice = Math.max(0, slides.findIndex((s) => s.id === id));
  const atual = slides[indice];
  const proxima = slides[indice + 1];
  const r = modos.notas;

  // Cronômetro
  const [inicio, setInicio] = useState(() => Date.now());
  const [pausadoEm, setPausadoEm] = useState<number | null>(null);
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setAgora(Date.now()), 500);
    return () => window.clearInterval(t);
  }, []);
  const decorrido = (pausadoEm ?? agora) - inicio;
  const alternarPausa = () => {
    if (pausadoEm === null) setPausadoEm(Date.now());
    else {
      setInicio((i) => i + (Date.now() - pausadoEm));
      setPausadoEm(null);
    }
  };

  useEffect(() => {
    document.title = `${r.titulo} — ${config.marca}`;
  }, [r.titulo]);

  useEffect(() => {
    window.history.replaceState(null, "", `#/${atual.id}`);
  }, [atual.id]);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const alvo = classificarAlvo(e.target);
      if (alvo === "texto" || (alvo === "botao" && (e.key === " " || e.key === "Enter"))) return;
      let i: number | null = null;
      if (["ArrowRight", " ", "PageDown"].includes(e.key)) i = indice + 1;
      else if (["ArrowLeft", "PageUp"].includes(e.key)) i = indice - 1;
      else if (e.key === "Home") i = 0;
      else if (e.key === "End") i = slides.length - 1;
      if (i === null) return;
      e.preventDefault();
      irPara(slides[Math.min(slides.length - 1, Math.max(0, i))].id);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [indice, irPara]);

  const conectado = agora - ultimoContato < 7000;
  const hora = new Date(agora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="janela-notas">
      <header className="janela-notas__topo">
        <div className="flex items-center gap-4">
          <Wordmark tamanho={30} />
          <span className="font-mono text-[14px] uppercase tracking-[0.12em] text-texto-3">{r.titulo}</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="botao-shell botao-shell--icone" onClick={() => irPara(slides[Math.max(0, indice - 1)].id)} aria-label={modos.anterior} disabled={indice === 0}>
            <Icone icone={ChevronLeft} tamanho={22} />
          </button>
          <span className="barra-contador">{modos.slide(atual.id, indice + 1, slides.length)}</span>
          <button type="button" className="botao-shell botao-shell--icone" onClick={() => irPara(slides[Math.min(slides.length - 1, indice + 1)].id)} aria-label={modos.proxima} disabled={!proxima}>
            <Icone icone={ChevronRight} tamanho={22} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-texto-3">{r.cronometro}</p>
            <p className="font-mono text-[34px] font-bold leading-none text-verde" aria-live="off">
              {mmss(decorrido)}
            </p>
          </div>
          <button type="button" className="botao-shell botao-shell--icone" onClick={alternarPausa} aria-label={pausadoEm === null ? r.pausar : r.continuar} title={pausadoEm === null ? r.pausar : r.continuar}>
            <Icone icone={pausadoEm === null ? Pause : Play} tamanho={20} />
          </button>
          <button
            type="button"
            className="botao-shell botao-shell--icone"
            onClick={() => {
              setInicio(Date.now());
              setPausadoEm(pausadoEm === null ? null : Date.now());
            }}
            aria-label={r.zerar}
            title={r.zerar}
          >
            <Icone icone={RotateCcw} tamanho={20} />
          </button>
          <div className="text-right">
            <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-texto-3">{r.hora}</p>
            <p className="font-mono text-[22px] leading-none text-texto">{hora}</p>
          </div>
        </div>
      </header>
      {!conectado ? <p className="janela-notas__aviso">{r.semConexao}</p> : null}
      <main className="janela-notas__grade">
        <section className="janela-notas__atual" aria-label={r.agora}>
          <p className="janela-notas__rotulo">{r.agora}</p>
          <div className="janela-notas__palco">
            <Palco exibicao="miniatura" rotulo={atual.secao.titulo}>
              <div inert>{atual.render()}</div>
            </Palco>
          </div>
        </section>
        <section className="janela-notas__proxima" aria-label={r.proxima}>
          <p className="janela-notas__rotulo">{r.proxima}</p>
          {proxima ? (
            <>
              <MiniaturaFluida>{proxima.render()}</MiniaturaFluida>
              <p className="mt-2 text-[15px] text-texto-2">
                <span className="mr-2 font-mono text-verde">{proxima.id}</span>
                {proxima.secao.titulo}
              </p>
            </>
          ) : (
            <p className="text-texto-3">{r.fim}</p>
          )}
        </section>
        <section className="janela-notas__texto" aria-label={r.titulo}>
          <ConteudoNotas secao={atual.secao} grande />
        </section>
      </main>
    </div>
  );
}
