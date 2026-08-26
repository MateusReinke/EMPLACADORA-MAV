import { PILLARS } from "@/content/site";
import { Eyebrow, SlashMark } from "./brand";
import { AnimatedIconField } from "./hero/AnimatedIconField";
import { PILLAR_ICONS } from "./icons";

/**
 * Os quatro pilares do material de marca. Propositalmente sem cards soltos:
 * são células separadas por filetes, para não repetir a grade da seção de
 * serviços.
 *
 * Seção clara, e não a faixa navy que era antes: depois que ela virou o
 * segundo bloco da página, o navy caía colado no painel navy do herói. As duas
 * áreas escuras se encostavam, o vinco diagonal da dobra morria dentro de outra
 * área escura e a página ganhava um degrau duro de claro para escuro logo no
 * começo. O navy segue presente aqui pelos selos redondos dos ícones — e a
 * única faixa escura de largura inteira passa a ser o contato, no fim.
 */
export const PillarsSection = () => (
  <section className="relative overflow-hidden bg-site-bg py-16 sm:py-20">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-mav-blue/10 blur-3xl"
    />
    <AnimatedIconField tone="ink" variant="fleet" />

    <div className="relative mx-auto grid max-w-6xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <div data-reveal>
        <Eyebrow>Por que a MAV</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.015em] text-site-ink sm:text-4xl">
          Quatro motivos para não deixar isso com qualquer um
        </h2>
        <SlashMark tone="blue" className="mt-6 h-4 w-14" />
        <p className="mt-5 max-w-sm font-body leading-relaxed text-site-ink/70">
          Emplacamento envolve documento, taxa oficial e prazo. A MAV trata cada
          processo com o mesmo cuidado, do carro popular à frota da empresa.
        </p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-site-line bg-site-line shadow-mav-card sm:grid-cols-2">
        {PILLARS.map((pillar) => {
          const Icon = PILLAR_ICONS[pillar.icon];

          return (
            <div key={pillar.title} className="bg-site-card p-6 sm:p-7" data-reveal>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-site-badge text-white">
                <Icon className="h-[22px] w-[22px]" strokeWidth={2.25} />
              </span>
              <h3 className="mt-4 font-display text-lg font-extrabold uppercase tracking-wide text-site-ink">
                {pillar.title}
              </h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-site-ink/70">
                {pillar.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);
