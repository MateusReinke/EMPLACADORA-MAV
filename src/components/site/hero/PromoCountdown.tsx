import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { PROMO_ENDS_AT } from "@/content/site";

/**
 * Contagem regressiva da promoção.
 *
 * Ligada a `PROMO_ENDS_AT` — uma data real, definida pela MAV. Quando o prazo
 * chega, o contador some sozinho.
 *
 * Deliberadamente NÃO existe modo "timer aleatório" nem contador que reinicia a
 * cada visita: anunciar um prazo que não vai ser cumprido é publicidade
 * enganosa (CDC, arts. 30 e 37), e o visitante que volta no dia seguinte e vê o
 * relógio zerado descobre a encenação — caro demais para quem vai confiar
 * documento de veículo à empresa.
 *
 * Com `PROMO_ENDS_AT = null`, este componente não renderiza nada.
 */
const pad = (value: number) => String(value).padStart(2, "0");

const remainingFrom = (deadline: number) => {
  const diff = deadline - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

export const PromoCountdown = ({ tone = "white" }: { tone?: "white" | "ink" }) => {
  // Começa nulo mesmo quando há prazo: o HTML é gerado no build, e um tempo
  // calculado lá chegaria desatualizado ao visitante.
  const [left, setLeft] = useState<ReturnType<typeof remainingFrom>>(null);

  useEffect(() => {
    if (!PROMO_ENDS_AT) return;

    const deadline = new Date(PROMO_ENDS_AT).getTime();
    if (Number.isNaN(deadline)) {
      console.warn(`[MAV] PROMO_ENDS_AT inválido: ${PROMO_ENDS_AT}`);
      return;
    }

    const tick = () => setLeft(remainingFrom(deadline));
    tick();

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!left) return null;

  const blocks = [
    { value: left.days, label: left.days === 1 ? "dia" : "dias" },
    { value: left.hours, label: "horas" },
    { value: left.minutes, label: "min" },
    { value: left.seconds, label: "seg" },
  ];

  const isWhite = tone === "white";

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${
        isWhite ? "border-white/20 bg-white/10" : "border-site-line bg-site-alt"
      }`}
    >
      <span
        className={`flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-[0.14em] ${
          isWhite ? "text-white/75" : "text-site-ink/60"
        }`}
      >
        <Clock className="h-3.5 w-3.5" strokeWidth={2.5} />
        Promoção acaba em
      </span>

      <span className="flex items-center gap-1.5" role="timer" aria-live="off">
        {blocks.map((block, index) => (
          <span key={block.label} className="flex items-center gap-1.5">
            <span
              className={`flex min-w-[46px] flex-col items-center rounded-lg px-2 py-1 ${
                isWhite ? "bg-white/15" : "bg-site-card"
              }`}
            >
              <span
                className={`font-display text-lg font-extrabold leading-none tabular-nums ${
                  isWhite ? "text-white" : "text-site-ink"
                }`}
              >
                {pad(block.value)}
              </span>
              <span
                className={`mt-0.5 font-body text-[0.6rem] uppercase tracking-wide ${
                  isWhite ? "text-white/60" : "text-site-ink/50"
                }`}
              >
                {block.label}
              </span>
            </span>
            {index < blocks.length - 1 && (
              <span className={isWhite ? "text-white/40" : "text-site-ink/30"}>:</span>
            )}
          </span>
        ))}
      </span>
    </div>
  );
};
