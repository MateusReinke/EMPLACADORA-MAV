import { ContactSection } from "@/components/site/ContactSection";
import { FaqSection } from "@/components/site/FaqSection";
import { FlowSection } from "@/components/site/FlowSection";
import { HeroSection } from "@/components/site/HeroSection";
import { PillarsSection } from "@/components/site/PillarsSection";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { ServicesSection } from "@/components/site/ServicesSection";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
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

  return (
    <div className="mav-site min-h-screen bg-site-bg font-body text-site-ink antialiased">
      <a
        href="#servicos"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-mav-blue focus:px-4 focus:py-2 focus:font-display focus:font-bold focus:text-white"
      >
        Pular para os serviços
      </a>

      <SiteHeader />

      <main>
        <HeroSection />
        {/* Antes dos serviços: quem acabou de ver o preço quer saber por que
            confiar em quem vai mexer no documento do veículo. */}
        <PillarsSection />
        <ServicesSection />
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
