/** V07 Protótipo de celular clicável — esqueleto; implementação final pelo agente dev-prototipo. */
export type TelaInicial = "conversa" | "jornada" | "painel" | "niveis" | "atraso";
export function Celular(_props: { inicio?: TelaInicial; compacto?: boolean } = {}) {
  return <div data-pendente="Celular" className="grid h-[720px] w-[340px] place-items-center rounded-[48px] border border-dashed border-current/30 opacity-60">Celular</div>;
}
