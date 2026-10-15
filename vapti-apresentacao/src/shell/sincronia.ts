/**
 * Sincronia entre a apresentação e a janela de notas (?notas=1).
 * Principal: postMessage entre opener e janela (funciona em file://).
 * Reforço: BroadcastChannel. Mensagens idempotentes (sempre o id da tela, nunca "avance 1").
 */
import { useEffect, useRef, useState } from "react";

const CANAL = "vapti-apresentacao";

export type Mensagem =
  | { vapti: 1; tipo: "slide"; id: string }
  | { vapti: 1; tipo: "ola" }
  | { vapti: 1; tipo: "ir"; id: string };

type SemMarca<T> = T extends unknown ? Omit<T, "vapti"> : never;

function ehMensagem(d: unknown): d is Mensagem {
  return typeof d === "object" && d !== null && (d as { vapti?: unknown }).vapti === 1 && typeof (d as { tipo?: unknown }).tipo === "string";
}

function abrirCanal(): BroadcastChannel | null {
  try {
    return typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CANAL);
  } catch {
    return null;
  }
}

/** Lado da apresentação: envia a tela atual e obedece aos pedidos "ir". */
export function useSincroniaPrincipal(idAtual: string, irParaId: (id: string) => void) {
  const janela = useRef<Window | null>(null);
  const canal = useRef<BroadcastChannel | null>(null);
  const idRef = useRef(idAtual);
  const irRef = useRef(irParaId);
  idRef.current = idAtual;
  irRef.current = irParaId;

  const enviar = (m: SemMarca<Mensagem>) => {
    const msg = { vapti: 1, ...m };
    try {
      if (janela.current && !janela.current.closed) janela.current.postMessage(msg, "*");
    } catch {
      /* janela fechada */
    }
    try {
      canal.current?.postMessage(msg);
    } catch {
      /* sem canal */
    }
  };
  const enviarRef = useRef(enviar);
  enviarRef.current = enviar;

  useEffect(() => {
    canal.current = abrirCanal();
    const receber = (dados: unknown, origem: MessageEventSource | null) => {
      if (!ehMensagem(dados)) return;
      if (dados.tipo === "ola") {
        if (origem && typeof (origem as Window).postMessage === "function" && origem !== window) janela.current = origem as Window;
        enviarRef.current({ tipo: "slide", id: idRef.current });
      } else if (dados.tipo === "ir") {
        idRef.current = dados.id;
        irRef.current(dados.id);
      }
    };
    const aoMensagem = (e: MessageEvent) => receber(e.data, e.source);
    window.addEventListener("message", aoMensagem);
    const c = canal.current;
    if (c) c.onmessage = (e) => receber(e.data, null);
    return () => {
      window.removeEventListener("message", aoMensagem);
      c?.close();
    };
  }, []);

  useEffect(() => {
    enviarRef.current({ tipo: "slide", id: idAtual });
  }, [idAtual]);

  /** Abre a janela de notas, já na tela atual. */
  const abrirJanela = () => {
    const base = window.location.href.split("#")[0].split("?")[0];
    const w = window.open(`${base}?notas=1#/${idRef.current}`, "vapti-notas", "popup,width=1320,height=860");
    if (w) janela.current = w;
  };
  return abrirJanela;
}

/** Lado da janela de notas: recebe a tela atual e pede navegação. */
export function useSincroniaNotas(idInicial: string) {
  const [id, setId] = useState(idInicial);
  const [ultimoContato, setUltimoContato] = useState(0);
  const canal = useRef<BroadcastChannel | null>(null);

  const enviar = (m: SemMarca<Mensagem>) => {
    const msg = { vapti: 1, ...m };
    try {
      window.opener?.postMessage(msg, "*");
    } catch {
      /* opener fechado */
    }
    try {
      canal.current?.postMessage(msg);
    } catch {
      /* sem canal */
    }
  };
  const enviarRef = useRef(enviar);
  enviarRef.current = enviar;

  useEffect(() => {
    canal.current = abrirCanal();
    const receber = (dados: unknown) => {
      if (!ehMensagem(dados) || dados.tipo !== "slide") return;
      setId(dados.id);
      setUltimoContato(Date.now());
    };
    const aoMensagem = (e: MessageEvent) => receber(e.data);
    window.addEventListener("message", aoMensagem);
    const c = canal.current;
    if (c) c.onmessage = (e) => receber(e.data);
    enviarRef.current({ tipo: "ola" });
    // Batimento: reconecta se a apresentação for recarregada.
    const t = window.setInterval(() => enviarRef.current({ tipo: "ola" }), 3000);
    return () => {
      window.removeEventListener("message", aoMensagem);
      window.clearInterval(t);
      c?.close();
    };
  }, []);

  const irPara = (novo: string) => {
    setId(novo);
    enviarRef.current({ tipo: "ir", id: novo });
  };
  return { id, irPara, ultimoContato };
}
