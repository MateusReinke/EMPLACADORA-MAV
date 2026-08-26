import { AlertTriangle, Info } from "lucide-react";

import {
  PLATE_SIZES,
  PLATE_SIZE_COMPARISONS,
  PLATE_SIZE_DISCLAIMER,
  PLATE_SIZE_NOTE,
  plateSizeLabel,
  type PlateSizeComparison,
} from "@/content/site";
import { MercosulPlate } from "./brand";

/**
 * Comparativo de tamanho, desenhado em escala real.
 *
 * As duas placas do par ficam sobrepostas e centradas, não lado a lado: o que
 * a pessoa precisa enxergar é *quanto* a menor deixa de ocupar, e isso só
 * aparece quando uma está por dentro da outra. O contorno tracejado é a maior;
 * a placa desenhada é a menor.
 *
 * As proporções vêm das medidas em milímetros, então o desenho não mente — no
 * par "reduzida × mini" a placa interna encosta nas duas laterais do contorno,
 * que é exatamente a informação (mesma largura, só a altura muda).
 */
/** Régua comum aos dois comparativos: tudo é desenhado em relação à normal. */
const CANVAS = PLATE_SIZES.normal;

const CompareStage = ({ comparison }: { comparison: PlateSizeComparison }) => {
  const base = PLATE_SIZES[comparison.base];
  const over = PLATE_SIZES[comparison.over];

  return (
    <div className="rounded-2xl border border-site-line bg-site-card p-5 shadow-mav-card sm:p-6">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h3 className="font-display text-lg font-extrabold leading-tight text-site-ink">
          {base.name}
        </h3>
        <span aria-hidden="true" className="font-display text-lg font-bold text-site-ink/30">
          ×
        </span>
        <h3 className="font-display text-lg font-extrabold leading-tight text-site-accent">
          {over.name}
        </h3>
      </div>

      <p className="mt-1.5 font-body text-sm leading-relaxed text-site-ink/70">
        {comparison.headline}
      </p>

      {/*
        O palco é sempre a placa normal, mesmo no par "reduzida × mini". Assim
        a mini sai do mesmo tamanho nos dois cards e dá para comparar de um
        para o outro — com um palco por par, ela apareceria maior no segundo,
        sendo a mesma placa. O palco não tem contorno visível: quem marca o
        limite é o tracejado da placa maior do par.
      */}
      <div
        className="relative mt-5"
        style={{ aspectRatio: `${CANVAS.width} / ${CANVAS.height}` }}
        aria-hidden="true"
      >
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[6px] outline-dashed outline-2 outline-site-ink/35"
          style={{
            width: `${(base.width / CANVAS.width) * 100}%`,
            height: `${(base.height / CANVAS.height) * 100}%`,
          }}
        />

        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: `${(over.width / CANVAS.width) * 100}%`,
            height: `${(over.height / CANVAS.height) * 100}%`,
          }}
        >
          <MercosulPlate
            framed={false}
            uid={`-cmp-${comparison.id}`}
            className="h-full w-full drop-shadow-[0_6px_14px_rgba(10,31,68,0.22)]"
            title=""
          />
        </span>
      </div>

      {/* Legenda: qual traço é qual, com a medida de cada um */}
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-site-line pt-4">
        <div className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className="mt-1 h-3.5 w-5 shrink-0 rounded-[2px] border-2 border-dashed border-site-ink/40"
          />
          <div>
            <dt className="font-display text-[0.8125rem] font-bold text-site-ink">
              {base.name}
            </dt>
            <dd className="font-body text-xs tabular-nums text-site-ink/60">
              {plateSizeLabel(base)}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <span
            aria-hidden="true"
            className="mt-1 h-3.5 w-5 shrink-0 rounded-[2px] bg-site-accent"
          />
          <div>
            <dt className="font-display text-[0.8125rem] font-bold text-site-accent">
              {over.name}
            </dt>
            <dd className="font-body text-xs tabular-nums text-site-ink/60">
              {plateSizeLabel(over)}
            </dd>
          </div>
        </div>
      </dl>

      <p className="mt-4 font-body text-[0.8125rem] leading-relaxed text-site-ink/65">
        {comparison.detail}
      </p>
    </div>
  );
};

export const PlateSizeCompare = () => (
  <div className="mt-16 border-t border-site-line pt-12">
    <div className="max-w-2xl" data-reveal>
      <h3 className="font-display text-2xl font-extrabold leading-tight tracking-[-0.015em] text-site-ink sm:text-3xl">
        Normal, reduzida e mini: o que muda no tamanho
      </h3>
      <p className="mt-3 font-body text-site-ink/70">
        Os três são a mesma placa Mercosul, com os mesmos elementos de segurança —
        muda só a medida. Os desenhos abaixo estão em escala real, um por cima do
        outro, para você ver de quanto é a diferença.
      </p>
    </div>

    <div className="mt-8 grid gap-5 md:grid-cols-2" data-reveal>
      {PLATE_SIZE_COMPARISONS.map((comparison) => (
        <CompareStage key={comparison.id} comparison={comparison} />
      ))}
    </div>

    <div className="mt-6 grid gap-4 md:grid-cols-[1.35fr_1fr]" data-reveal>
      {/* A ressalva vem em destaque de propósito: é o que evita o pedido errado */}
      <div className="flex gap-3.5 rounded-2xl border-l-4 border-gold bg-gold/10 p-5">
        <AlertTriangle
          className="mt-0.5 h-5 w-5 shrink-0 text-gold-ink"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <div>
          <p className="font-display text-[0.7rem] font-bold uppercase tracking-[0.14em] text-gold-ink">
            Só quando o veículo exige
          </p>
          <p className="mt-1.5 font-body text-sm leading-relaxed text-site-ink/75">
            {PLATE_SIZE_DISCLAIMER}
          </p>
        </div>
      </div>

      <div className="flex gap-3.5 rounded-2xl border border-site-line bg-site-alt p-5">
        <Info
          className="mt-0.5 h-5 w-5 shrink-0 text-site-accent"
          strokeWidth={2.5}
          aria-hidden="true"
        />
        <div>
          <p className="font-display text-[0.7rem] font-bold uppercase tracking-[0.14em] text-site-accent">
            Dá para combinar
          </p>
          <p className="mt-1.5 font-body text-sm leading-relaxed text-site-ink/75">
            {PLATE_SIZE_NOTE}
          </p>
        </div>
      </div>
    </div>
  </div>
);
