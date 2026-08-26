import { offerInsights, priceLabel, type PlatePrice } from "@/content/site";

/**
 * Preço grande com R$ reduzido e centavos sobrescritos — a leitura fica no
 * número cheio, que é o que precisa saltar aos olhos.
 */
export const BigPrice = ({
  value,
  tone = "ink",
  size = "lg",
}: {
  value: number;
  tone?: "ink" | "white";
  size?: "md" | "lg" | "xl";
}) => {
  const [reais, cents] = priceLabel(value).split(",");
  const color = tone === "white" ? "text-white" : "text-site-ink";
  const sizes = {
    md: { currency: "text-lg mt-1", main: "text-5xl", cents: "text-xl mt-1" },
    lg: { currency: "text-xl mt-2", main: "text-6xl sm:text-7xl", cents: "text-2xl mt-1.5" },
    xl: { currency: "text-2xl mt-3", main: "text-7xl sm:text-8xl", cents: "text-3xl mt-2" },
  }[size];

  return (
    <span className={`inline-flex items-start font-display font-extrabold leading-none ${color}`}>
      <span className={`mr-1.5 ${sizes.currency}`}>R$</span>
      <span className={sizes.main}>{reais}</span>
      <span className={sizes.cents}>,{cents}</span>
    </span>
  );
};

/** Selo de desconto calculado a partir dos valores reais (nunca fixo na mão). */
export const DiscountBadge = ({ item }: { item: PlatePrice }) => {
  const { percentOff } = offerInsights(item);
  if (!percentOff) return null;

  return (
    <span className="inline-flex items-center rounded-md bg-gold px-2.5 py-1 font-display text-xs font-extrabold uppercase tracking-wide text-mav-navy">
      {percentOff}% OFF
    </span>
  );
};

/** "de R$ 179,00" com o risco diagonal do material promocional. */
export const StruckPrice = ({ value, tone = "ink" }: { value: number; tone?: "ink" | "white" }) => (
  <span
    className={`relative inline-block font-body ${
      tone === "white" ? "text-white/60" : "text-site-ink/45"
    }`}
  >
    R$ {priceLabel(value)}
    <svg
      viewBox="0 0 100 20"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full text-red-500"
    >
      <line x1="2" y1="17" x2="98" y2="3" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  </span>
);

/** Linha "economize R$ X · sai a R$ Y por placa" — ancoragem e valor unitário. */
export const SavingsLine = ({
  item,
  tone = "ink",
}: {
  item: PlatePrice;
  tone?: "ink" | "white";
}) => {
  const { save, perPlate } = offerInsights(item);
  const muted = tone === "white" ? "text-white/70" : "text-site-ink/60";
  const strong = tone === "white" ? "text-white" : "text-site-ink";

  return (
    <p className={`font-body text-sm ${muted}`}>
      {save > 0 && (
        <>
          Economize <strong className={`font-display font-bold ${strong}`}>R$ {priceLabel(save)}</strong>
          {item.units > 1 && " · "}
        </>
      )}
      {item.units > 1 && (
        <>
          sai a <strong className={`font-display font-bold ${strong}`}>R$ {priceLabel(perPlate)}</strong> por placa
        </>
      )}
    </p>
  );
};
