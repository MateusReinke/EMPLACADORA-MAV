import { useRef, useState } from "react";
import { Check } from "lucide-react";

import { PLATE_TYPES, plateTypeMessage, whatsappLink } from "@/content/site";
import { Eyebrow, MercosulPlate, WhatsAppIcon } from "./brand";
import { AnimatedIconField } from "./hero/AnimatedIconField";
import { PlateSizeCompare } from "./PlateSizeCompare";

const GROUP_LABEL: Record<string, string> = {
  categoria: "Categoria",
  formato: "Formato",
};

/**
 * "Os tipos de placa" — a grade de placas à esquerda, a explicação da que
 * estiver aberta à direita.
 *
 * No padrão Mercosul brasileiro o fundo é sempre branco e quem identifica a
 * categoria do veículo é a cor dos caracteres. Por isso a grade mostra a placa
 * desenhada, e não um ícone: a diferença entre as categorias *é* visual, e uma
 * lista de nomes não ensinaria nada.
 *
 * Os dois últimos itens são formato, não categoria — mesma placa em outro
 * tamanho. Aparecem depois de um filete, e o desenho deles é proporcionalmente
 * menor, que é a própria explicação.
 */
export const PlateTypesSection = () => {
  const [activeId, setActiveId] = useState(PLATE_TYPES[0].id);
  const active = PLATE_TYPES.find((type) => type.id === activeId) ?? PLATE_TYPES[0];
  const panelRef = useRef<HTMLDivElement>(null);

  /*
   * No celular o painel mora embaixo da grade inteira: tocar num card da
   * última linha trocaria um conteúdo fora da tela, e a impressão seria a de
   * que o toque não fez nada. Acima de lg os dois ficam lado a lado e não há
   * o que rolar.
   */
  const select = (id: string) => {
    setActiveId(id);

    if (typeof window === "undefined") return;
    if (window.matchMedia("(min-width: 1024px)").matches) return;

    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panelRef.current?.scrollIntoView({
      behavior: reduzido ? "auto" : "smooth",
      block: "start",
    });
  };

  const categorias = PLATE_TYPES.filter((type) => type.group === "categoria");
  const formatos = PLATE_TYPES.filter((type) => type.group === "formato");

  const renderCard = (type: (typeof PLATE_TYPES)[number]) => {
    const selected = type.id === active.id;

    return (
      <button
        key={type.id}
        type="button"
        role="tab"
        id={`placa-tab-${type.id}`}
        aria-selected={selected}
        aria-controls="placa-detalhe"
        onClick={() => select(type.id)}
        className={`group flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-all duration-200 ${
          selected
            ? "border-mav-blue bg-site-card shadow-mav-card-hover ring-1 ring-mav-blue"
            : "border-site-line bg-site-card hover:-translate-y-0.5 hover:border-mav-blue/40 hover:shadow-mav-card"
        }`}
      >
        <span
          className="block w-full transition-transform duration-200 group-hover:scale-[1.03]"
          style={{ maxWidth: `${(type.scale ?? 1) * 100}%` }}
        >
          <MercosulPlate
            code={type.sample}
            charColor={type.charColor}
            uid={`-tipo-${type.id}`}
            className="w-full"
            title={`Placa Mercosul ${type.name} — ${type.colorName.toLowerCase()}`}
          />
        </span>

        <span className="flex flex-col gap-0.5">
          <span
            className={`font-display text-sm font-extrabold leading-tight ${
              selected ? "text-site-accent" : "text-site-ink"
            }`}
          >
            {type.name}
          </span>
          <span className="font-body text-[0.7rem] leading-snug text-site-ink/55">
            {type.colorName}
          </span>
        </span>
      </button>
    );
  };

  return (
    <section id="tipos-de-placa" className="relative overflow-hidden py-16 sm:py-24">
      <AnimatedIconField tone="ink" variant="plates" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="max-w-2xl" data-reveal>
          <Eyebrow>Tipos de placa</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-[-0.015em] text-site-ink sm:text-4xl">
            Os diferentes tipos de placa Mercosul
          </h2>
          <p className="mt-3 font-body text-site-ink/70">
            O fundo branco é o mesmo em todas — o que muda é a cor dos caracteres,
            e é ela que diz a categoria do veículo. Toque em uma placa para ver
            para quem ela serve.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <div
              role="tablist"
              aria-label="Categorias de placa"
              className="grid grid-cols-2 gap-4 sm:grid-cols-3"
              data-reveal
            >
              {categorias.map(renderCard)}
            </div>

            <p className="mt-9 flex items-center gap-3 font-display text-[0.7rem] font-bold uppercase tracking-[0.16em] text-site-ink/45">
              Também estampamos
              <span aria-hidden="true" className="h-px flex-1 bg-site-line" />
            </p>

            <div
              role="tablist"
              aria-label="Formatos de placa"
              className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3"
              data-reveal
            >
              {formatos.map(renderCard)}
            </div>
          </div>

          {/* Painel de detalhe. `lg:sticky` porque a grade ao lado é mais alta:
              sem isso, clicar num card de baixo abriria um texto fora da tela. */}
          <div
            ref={panelRef}
            id="placa-detalhe"
            role="tabpanel"
            aria-labelledby={`placa-tab-${active.id}`}
            className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start"
            data-reveal
          >
            <div className="overflow-hidden rounded-2xl border border-site-line bg-site-contrast text-white shadow-mav-plate">
              <div className="relative border-b border-white/10 px-6 py-7 sm:px-7">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-mav-blue/25 blur-3xl"
                />
                <div className="relative mx-auto w-full max-w-[230px]">
                  <MercosulPlate
                    code={active.sample}
                    charColor={active.charColor}
                    uid="-tipo-detalhe"
                    className="w-full drop-shadow-[0_18px_26px_rgba(0,0,0,0.45)]"
                    title={`Placa Mercosul ${active.name} — ${active.colorName.toLowerCase()}`}
                  />
                </div>
              </div>

              <div className="px-6 py-7 sm:px-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white/10 px-2.5 py-1 font-display text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/70">
                    {GROUP_LABEL[active.group]}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 font-display text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/70">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full ring-1 ring-white/40"
                      style={{ backgroundColor: active.charColor }}
                    />
                    {active.colorName}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-2xl font-extrabold leading-tight">
                  {active.name}
                </h3>
                <p className="mt-3 font-body leading-relaxed text-white/75">
                  {active.description}
                </p>

                <ul className="mt-5 grid gap-2.5 border-t border-white/10 pt-5">
                  {active.examples.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 font-body text-sm text-white/85"
                    >
                      <span className="mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-mav-blue">
                        <Check className="h-3 w-3 text-white" strokeWidth={3.5} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <a
                  href={whatsappLink(plateTypeMessage(active))}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2.5 rounded-xl bg-whats px-5 py-3.5 font-display text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-whats-dark"
                >
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                  Falar sobre {active.name.toLowerCase()}
                </a>
              </div>
            </div>
          </div>
        </div>

        <PlateSizeCompare />
      </div>
    </section>
  );
};
