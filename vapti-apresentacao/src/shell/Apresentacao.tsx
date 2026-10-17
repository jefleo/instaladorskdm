import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, ChevronLeft, ChevronRight, Keyboard, LayoutGrid, Maximize, Minimize, StickyNote } from "lucide-react";
import { Icone } from "../components/base";
import { atalhos, modos } from "../content/ui";
import { movimento } from "../components/base";
import { semAnimacao } from "../lib/modo";
import { slides } from "../sections";
import { Ajuda } from "./Ajuda";
import { Grade } from "./Grade";
import { PainelNotas } from "./Notas";
import { Palco } from "./Palco";
import { useSincroniaPrincipal } from "./sincronia";
import { classificarAlvo } from "./teclado";

interface Props {
  indice: number;
  irPara: (i: number) => void;
  onLeitura: () => void;
}

/** Modo apresentação: palco de 1920×1080, teclado, notas, grade, ajuda e tela cheia. */
export function Apresentacao({ indice, irPara, onLeitura }: Props) {
  const [notas, setNotas] = useState(false);
  const [grade, setGrade] = useState(false);
  const [ajuda, setAjuda] = useState(false);
  const [telaCheia, setTelaCheia] = useState(false);
  const [ocioso, setOcioso] = useState(false);
  const direcao = useRef(1);
  const palcoRef = useRef<HTMLDivElement>(null);
  const atual = slides[indice];
  const total = slides.length;

  const ir = useCallback(
    (i: number) => {
      direcao.current = i >= indice ? 1 : -1;
      irPara(i);
    },
    [indice, irPara],
  );

  const abrirJanelaNotas = useSincroniaPrincipal(atual.id, (id) => {
    const i = slides.findIndex((s) => s.id === id);
    if (i >= 0) ir(i);
  });

  const alternarTelaCheia = useCallback(() => {
    try {
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
      else void document.documentElement.requestFullscreen?.().catch(() => undefined);
    } catch {
      /* navegador sem tela cheia */
    }
  }, []);

  useEffect(() => {
    const aoMudar = () => setTelaCheia(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", aoMudar);
    return () => document.removeEventListener("fullscreenchange", aoMudar);
  }, []);

  // Teclado
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const alvo = classificarAlvo(e.target);
      const k = e.key;

      if (k === "Escape") {
        if (alvo === "texto") (e.target as HTMLElement).blur();
        if (ajuda) setAjuda(false);
        else if (grade) setGrade(false);
        else if (notas) setNotas(false);
        else if (document.fullscreenElement) alternarTelaCheia();
        return;
      }
      if (alvo === "texto") return;
      if (k === "?") {
        e.preventDefault();
        setAjuda((v) => !v);
        return;
      }
      if (ajuda) return;
      const letra = k.length === 1 ? k.toLowerCase() : "";
      if (letra === "g") {
        e.preventDefault();
        setGrade((v) => !v);
        return;
      }
      if (grade) return; // a grade cuida das setas e do Enter
      if (letra === "n") {
        e.preventDefault();
        setNotas((v) => !v);
        return;
      }
      if (letra === "f") {
        e.preventDefault();
        alternarTelaCheia();
        return;
      }
      // Passador (PageUp/PageDown) sempre navega, mesmo com foco num controle.
      const passador = k === "PageDown" || k === "PageUp";
      if (alvo === "controle" && !passador) return; // setas mexem no controle
      if (alvo === "botao" && (k === " " || k === "Enter")) return; // ativa o botão
      let destino: number | null = null;
      if (k === "ArrowRight" || k === " " || k === "PageDown") destino = indice + 1;
      else if (k === "ArrowLeft" || k === "PageUp") destino = indice - 1;
      else if (k === "Home") destino = 0;
      else if (k === "End") destino = total - 1;
      if (destino === null) return;
      e.preventDefault();
      if (alvo === "controle") (e.target as HTMLElement).blur();
      ir(destino);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [ajuda, grade, notas, indice, total, ir, alternarTelaCheia]);

  // Foco volta ao palco a cada troca de tela (o elemento anterior some).
  useEffect(() => {
    if (!grade && !ajuda && palcoRef.current && !palcoRef.current.contains(document.activeElement)) palcoRef.current.focus({ preventScroll: true });
  }, [indice, grade, ajuda]);

  // Controles somem com o mouse parado.
  useEffect(() => {
    let t = 0;
    const mexeu = () => {
      setOcioso(false);
      window.clearTimeout(t);
      t = window.setTimeout(() => setOcioso(true), 2600);
    };
    mexeu();
    window.addEventListener("pointermove", mexeu);
    window.addEventListener("pointerdown", mexeu);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("pointermove", mexeu);
      window.removeEventListener("pointerdown", mexeu);
    };
  }, []);

  const animar = !semAnimacao();
  const d = direcao.current;

  return (
    <div className={`apres ${notas ? "apres--notas" : ""} ${ocioso ? "apres--ocioso" : ""}`}>
      <div className="apres-palco" ref={palcoRef} tabIndex={-1} aria-label={modos.apresentacao}>
        <Palco rotulo={modos.slideAtual(atual.secao.titulo, indice + 1, total)}>
          <AnimatePresence initial={false}>
            <motion.div
              key={atual.id}
              className="absolute inset-0"
              initial={animar ? { opacity: 0, x: 28 * d } : false}
              animate={{ opacity: 1, x: 0 }}
              exit={animar ? { opacity: 0, x: -28 * d, transition: { duration: movimento.rapida, ease: movimento.ease } } : { opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: animar ? movimento.base : 0, ease: movimento.ease }}
            >
              {atual.render()}
            </motion.div>
          </AnimatePresence>
        </Palco>

        <p className="sr-only-vapti" aria-live="polite">
          {modos.slideAtual(atual.secao.titulo, indice + 1, total)}
        </p>

        <div className="progresso" aria-hidden="true">
          <span style={{ width: `${((indice + 1) / total) * 100}%` }} />
        </div>

        <nav className="barra" aria-label={modos.controles}>
          <button type="button" className="botao-shell botao-shell--icone" onClick={() => ir(indice - 1)} disabled={indice === 0} aria-label={modos.anterior} title={modos.anterior}>
            <Icone icone={ChevronLeft} tamanho={20} />
          </button>
          <span className="barra-contador">{modos.slide(atual.id, indice + 1, total)}</span>
          <button type="button" className="botao-shell botao-shell--icone" onClick={() => ir(indice + 1)} disabled={indice === total - 1} aria-label={modos.proxima} title={modos.proxima}>
            <Icone icone={ChevronRight} tamanho={20} />
          </button>
          <span className="barra-divisor" aria-hidden="true" />
          <button type="button" className="botao-shell botao-shell--icone" onClick={() => setNotas((v) => !v)} aria-pressed={notas} aria-label={notas ? modos.notas.fechar : modos.notas.abrir} title={`${modos.notas.titulo} (N)`}>
            <Icone icone={StickyNote} tamanho={19} />
          </button>
          <button type="button" className="botao-shell botao-shell--icone" onClick={() => setGrade(true)} aria-label={modos.grade} title={`${modos.grade} (G)`}>
            <Icone icone={LayoutGrid} tamanho={19} />
          </button>
          <button type="button" className="botao-shell botao-shell--icone" onClick={alternarTelaCheia} aria-label={telaCheia ? modos.sairTelaCheia : modos.telaCheia} title={`${telaCheia ? modos.sairTelaCheia : modos.telaCheia} (F)`}>
            <Icone icone={telaCheia ? Minimize : Maximize} tamanho={19} />
          </button>
          <button type="button" className="botao-shell botao-shell--icone" onClick={() => setAjuda(true)} aria-label={atalhos.abrirAjuda} title={`${atalhos.titulo} (?)`}>
            <Icone icone={Keyboard} tamanho={19} />
          </button>
          <span className="barra-divisor" aria-hidden="true" />
          <button type="button" className="botao-shell" onClick={onLeitura} title={modos.leitura}>
            <Icone icone={BookOpen} tamanho={18} />
            <span>{modos.ler}</span>
          </button>
        </nav>
      </div>

      {notas ? <PainelNotas secao={atual.secao} onFechar={() => setNotas(false)} onAbrirJanela={abrirJanelaNotas} /> : null}
      {grade ? (
        <Grade
          atual={indice}
          onIr={(i) => {
            setGrade(false);
            ir(i);
          }}
          onFechar={() => setGrade(false)}
        />
      ) : null}
      {ajuda ? <Ajuda onFechar={() => setAjuda(false)} /> : null}
    </div>
  );
}
