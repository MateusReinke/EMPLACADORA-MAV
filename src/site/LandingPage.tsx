import { ContactSection } from "@/components/site/ContactSection";
import { FaqSection } from "@/components/site/FaqSection";
import { FlowSection } from "@/components/site/FlowSection";
import { HeroSection } from "@/components/site/HeroSection";
import { PillarsSection } from "@/components/site/PillarsSection";
import { PricingSection } from "@/components/site/PricingSection";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { ServicesSection } from "@/components/site/ServicesSection";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { HeroCarousel } from "@/components/site/hero/HeroCarousel";
import { HeroPoster } from "@/components/site/hero/HeroPoster";
import { HeroSplitPrices } from "@/components/site/hero/HeroSplitPrices";
import { PriceStrip } from "@/components/site/hero/PriceStrip";
import { OfferBar } from "@/components/site/hero/OfferBar";
import { useHeroVariant } from "@/components/site/hero/useHeroVariant";
import { useReveal, usePublicTheme } from "@/components/site/useReveal";

/**
 * Site público da MAV Emplacamento.
 *
 * Deliberadamente independente de react-router e dos contextos do painel: este
 * mesmo componente é renderizado no build para gerar o HTML pré-renderizado que
 * o Google indexa (ver scripts/prerender.mjs). Qualquer dependência de
 * `window`, de contexto de rota ou de sessão quebraria essa renderização.
 */
export const LandingPage = () => {
  useReveal();
  usePublicTheme();
  // TEMPORÁRIO: comparação das três propostas de dobra inicial (?hero=a|b|c).
  const heroVariant = useHeroVariant();

  return (
    <div className="mav-site min-h-screen bg-site-bg font-body text-site-ink antialiased">
      <a
        href="#servicos"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-mav-blue focus:px-4 focus:py-2 focus:font-display focus:font-bold focus:text-white"
      >
        Pular para os serviços
      </a>

      {heroVariant === "c" && <OfferBar />}

      <SiteHeader />

      <main>
        {heroVariant === "atual" && <HeroSection />}
        {heroVariant === "a" && <HeroCarousel />}
        {heroVariant === "b" && <HeroSection offer="tag" />}
        {heroVariant === "c" && <HeroSection offer="card" />}
        {heroVariant === "d" && <HeroPoster />}
        {heroVariant === "e" && <HeroSplitPrices />}
        {heroVariant === "f" && (
          <>
            <HeroSection />
            <PriceStrip />
          </>
        )}
        <ServicesSection />
        <PricingSection />
        <PillarsSection />
        <FlowSection />
        {/* Só renderiza quando há avaliação real vinda do Google */}
        <ReviewsSection />
        <FaqSection />
        <ContactSection />
      </main>

      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
};

export default LandingPage;
