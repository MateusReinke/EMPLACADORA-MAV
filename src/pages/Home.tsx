import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  Car,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileSearch,
  Menu,
  MessageCircle,
  Instagram,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import mavLogo from "@/assets/mav-emplacamento-logo.svg";
import mercosulLogo from "@/assets/logo-mercosul-blanco.svg";
import brazilFlag from "@/assets/brazil-flag.svg";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Serviços", href: "#servicos" },
  { label: "Artigos", href: "#artigos" },
  { label: "Fluxo", href: "#fluxo" },
  { label: "FAQ", href: "#faq" },
];

const serviceCards = [
  {
    title: "Primeiro Emplacamento",
    category: "Veículo 0km",
    description: "Processo completo para veículo novo com checklist e finalização segura.",
    bullets: ["Conferência documental", "Abertura no sistema", "Suporte até instalação da placa"],
    steps: ["Validação dos documentos", "Cadastro e protocolo", "Emissão e instalação"],
    icon: Car,
  },
  {
    title: "Transferência de Propriedade",
    category: "Compra e venda",
    description: "Organização de cada etapa para reduzir pendências e acelerar a transferência.",
    bullets: ["Triagem de débitos", "Emissão de guias", "Atualização em tempo real"],
    steps: ["Análise inicial", "Apoio em vistoria", "Conclusão da transferência"],
    icon: FileCheck2,
  },
  {
    title: "Licenciamento Anual",
    category: "Regularização",
    description: "Licenciamento de veículos com acompanhamento por etapa e prazo.",
    bullets: ["Consulta de pendências", "Pagamentos orientados", "Confirmação de liberação"],
    steps: ["Levantamento", "Regularização", "Confirmação final"],
    icon: ShieldCheck,
  },
  {
    title: "2ª Via de CRLV e documentos",
    category: "Documentação",
    description: "Emissão de segunda via com orientação clara para pessoa física e jurídica.",
    bullets: ["Atendimento digital", "Checklist de exigências", "Status por atendimento"],
    steps: ["Solicitação", "Validação", "Entrega digital"],
    icon: FileSearch,
  },
  {
    title: "Placa Mercosul e substituição",
    category: "Placas",
    description: "Troca para padrão Mercosul, incluindo suporte em todas as exigências.",
    bullets: ["Orientação de vistoria", "Conferência de dados", "Agendamento de instalação"],
    steps: ["Solicitação", "Vistoria", "Emplacamento"],
    icon: Clock3,
  },
  {
    title: "Atendimento para frotas",
    category: "Empresas",
    description: "Gestão de múltiplos veículos com acompanhamento centralizado por lote.",
    bullets: ["Painel por empresa", "Priorização por urgência", "Histórico por veículo"],
    steps: ["Mapeamento da frota", "Plano de execução", "Relatório de conclusão"],
    icon: Building2,
  },
];

const faqs = [
  {
    question: "Quanto tempo leva um processo de emplacamento?",
    answer: "O prazo varia conforme o tipo de serviço e a documentação. Após a triagem inicial, informamos cada etapa com estimativa de conclusão.",
  },
  {
    question: "Vocês atendem empresas com frota?",
    answer: "Sim. Temos fluxo dedicado para pessoa jurídica com acompanhamento por lote e visão de andamento por veículo.",
  },
  {
    question: "Consigo acompanhar meu pedido online?",
    answer: "Sim. O status do processo pode ser consultado ao longo das etapas para manter previsibilidade e transparência.",
  },
];

const articleCards = [
  {
    title: "Documentos para emplacamento sem atraso",
    summary: "Guia rápido com os principais documentos para acelerar a aprovação na primeira análise.",
  },
  {
    title: "Transferência veicular: principais cuidados",
    summary: "Pontos críticos que mais geram pendências e como evitar atrasos no processo.",
  },
  {
    title: "Gestão de frota com mais previsibilidade",
    summary: "Boas práticas para organizar prazos, licenciamento e regularização de múltiplos veículos.",
  },
];


const mercosulSteps = [
  {
    step: "1",
    title: "Solicite a placa no Poupatempo",
    description: "Acesse o site ou app do Poupatempo e peça a alteração da placa para o padrão Mercosul.",
    color: "bg-[#facc15]",
    border: "border-[#facc15]/70",
    icon: FileSearch,
  },
  {
    step: "2",
    title: "Faça o laudo de vistoria",
    description: "Leve o veículo para uma empresa credenciada de vistoria para confirmar as condições e emitir o laudo.",
    color: "bg-[#ef4444]",
    border: "border-[#ef4444]/70",
    icon: Car,
  },
  {
    step: "3",
    title: "Conclua a etapa administrativa",
    description: "Finalize o pedido no portal do Poupatempo, anexando o laudo e seguindo as instruções indicadas.",
    color: "bg-[#38bdf8]",
    border: "border-[#38bdf8]/70",
    icon: Clock3,
  },
  {
    step: "4",
    title: "Aguarde a atualização do documento",
    description: "Em até 7 dias úteis, o documento atualizado aparecerá na sua carteira digital constando a placa nova.",
    color: "bg-[#fb923c]",
    border: "border-[#fb923c]/70",
    icon: FileCheck2,
  },
  {
    step: "5",
    title: "Emplaque na MAV",
    description: "Com o documento (CRLV) atualizado, traga seu veículo até nossa loja para emplacar ou agende pelo WhatsApp.",
    color: "bg-[#84cc16]",
    border: "border-[#84cc16]/70",
    icon: MessageCircle,
  },
];

const heroSlides = [
  {
    badge: "MAV Emplacadora",
    title: "Especialistas em emplacamento e regularização veicular",
    description:
      "Atendimento completo para primeiro emplacamento, transferência, licenciamento e rotinas de frota com apoio técnico do início ao fim.",
  },
  {
    badge: "Novidade",
    title: "Acompanhamento de pedidos em tempo real",
    description:
      "Clientes e equipes acompanham o status de cada processo por etapa, reduzindo dúvidas e acelerando decisões.",
  },
  {
    badge: "Relacionamento",
    title: "Comunicação clara durante todo o atendimento",
    description:
      "Atualizações de status, orientação objetiva e suporte em cada etapa para que o cliente acompanhe tudo com segurança.",
  },
];

const WhatsAppIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M19.11 17.12c-.25-.13-1.48-.73-1.71-.82-.23-.09-.4-.13-.57.13-.17.26-.65.82-.8.99-.15.17-.29.2-.54.07-.25-.13-1.05-.39-2.01-1.24-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.01-.39.11-.52.11-.11.25-.29.37-.43.12-.14.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.57-1.37-.78-1.88-.21-.5-.43-.43-.57-.43h-.49c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.69 4.29 3.77.6.26 1.07.42 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.48-.61 1.69-1.2.21-.59.21-1.09.15-1.2-.06-.11-.23-.17-.48-.3z"/>
    <path d="M16 3C8.83 3 3 8.83 3 16c0 2.29.6 4.53 1.74 6.5L3 29l6.67-1.7A12.95 12.95 0 0 0 16 29c7.17 0 13-5.83 13-13S23.17 3 16 3zm0 23.66c-1.95 0-3.86-.53-5.52-1.52l-.4-.24-3.96 1.01 1.06-3.86-.26-.4A10.58 10.58 0 0 1 5.33 16C5.33 10.3 10.3 5.33 16 5.33S26.67 10.3 26.67 16 21.7 26.66 16 26.66z"/>
  </svg>
);

const Home = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeService, setActiveService] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (!revealElements.length) return;

    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
    });

    if (typeof window === "undefined" || typeof window.IntersectionObserver === "undefined") {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });

    const fallbackTimer = window.setTimeout(() => {
      revealElements.forEach((element) => element.classList.add("is-visible"));
    }, 900);

    return () => {
      window.clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const closeMenuOnDesktop = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    closeMenuOnDesktop();
    window.addEventListener("resize", closeMenuOnDesktop);

    return () => {
      window.removeEventListener("resize", closeMenuOnDesktop);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background" itemScope itemType="https://schema.org/ProfessionalService">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <img src={mavLogo} alt="MAV Emplacadora" className="h-10 w-auto" />

          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card/70 text-foreground transition hover:bg-accent md:hidden"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                {item.label}
              </a>
            ))}
            <Button asChild size="sm" variant="secondary">
              <Link to="/login?perfil=colaborador">Login Colaborador</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/login?perfil=gestao">
                Login Vendedor/Admin
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  {item.label}
                </a>
              ))}
              <Button asChild size="sm" variant="secondary" className="justify-start">
                <Link to="/login?perfil=colaborador">Login Colaborador</Link>
              </Button>
              <Button asChild size="sm" className="justify-start">
                <Link to="/login?perfil=gestao">Login Vendedor/Admin</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      <section className="reveal-on-scroll relative overflow-hidden py-12 lg:py-24" data-reveal>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />
        <div className="container relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 text-center lg:text-left">
            <div className="relative min-h-[230px] overflow-hidden rounded-2xl border border-primary/20 bg-background/60 p-5 sm:min-h-[250px] sm:p-6">
              {heroSlides.map((slide, index) => (
                <article
                  key={slide.title}
                  className={`absolute inset-0 flex flex-col justify-center p-6 text-center transition-all duration-700 lg:text-left ${
                    index === activeSlide
                      ? "translate-x-0 opacity-100"
                      : index < activeSlide
                        ? "-translate-x-full opacity-0"
                        : "translate-x-full opacity-0"
                  }`}
                >
                  <span className="inline-flex w-fit items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
                    {slide.badge}
                  </span>
                  <h1 className="mt-3 text-[2rem] font-black leading-tight sm:text-4xl lg:text-5xl">{slide.title}</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-lg">{slide.description}</p>
                </article>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 lg:justify-start">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-primary" : "w-2.5 bg-primary/30"}`}
                  aria-label={`Selecionar slide ${index + 1}`}
                />
              ))}
            </div>

            <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap lg:justify-start">
              <Button asChild size="lg">
                <a href="#servicos">Conhecer serviços</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#fluxo">Ver como funciona</a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground lg:justify-start">
              <span className="rounded-full border border-border/80 bg-card/60 px-3 py-1">Atendimento PF e PJ</span>
              <span className="rounded-full border border-border/80 bg-card/60 px-3 py-1">Acompanhamento por etapas</span>
              <span className="rounded-full border border-border/80 bg-card/60 px-3 py-1">Gestão por perfil de usuário</span>
            </div>
          </div>

          <div className="reveal-on-scroll mx-auto w-full max-w-md rounded-3xl border border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/20 backdrop-blur" data-reveal>
            <img src={mavLogo} alt="Logo MAV" className="mx-auto h-28 w-auto drop-shadow-2xl" />
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-background/80 p-3">
                <BadgeCheck className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Triagem documental para diminuir retrabalho e melhorar previsibilidade.</p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-background/80 p-3">
                <Star className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Processo padronizado com atendimento consultivo e foco em agilidade.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="artigos" className="reveal-on-scroll bg-card/40 py-20" data-reveal>
        <div className="container">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
              <Newspaper className="h-4 w-4" /> Artigos
            </span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Conteúdo para orientar seu processo</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {articleCards.map((article) => (
              <article key={article.title} className="reveal-on-scroll rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md" data-reveal>
                <h3 className="text-lg font-semibold">{article.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="servicos" className="reveal-on-scroll bg-card/40 py-20" data-reveal>
        <div className="container">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Cobertura de serviços</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Escolha o serviço e veja o detalhamento</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Reestruturamos a área para um layout com menu lateral e painel de detalhes, como referência visual enviada.
            </p>
          </div>

          <div className="grid gap-4 lg:gap-6 lg:grid-cols-[0.42fr_0.58fr]">
            <aside className="rounded-3xl border border-white/10 bg-[#07142e] p-3 shadow-2xl shadow-[#020817]/60 sm:p-4 lg:max-h-[560px] lg:overflow-y-auto">
              <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Toque em um serviço</p>
              <div className="space-y-2.5 lg:space-y-3">
              {serviceCards.map((service, index) => {
                const Icon = service.icon;
                const isActive = index === activeService;

                return (
                  <button
                    key={service.title}
                    type="button"
                    onClick={() => setActiveService(index)}
                    className={`w-full rounded-2xl border px-3.5 py-3.5 text-left transition sm:px-4 sm:py-4 ${
                      isActive
                        ? "border-cyan-300/60 bg-[#0b1f46]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-white/20 bg-[#0a1a3a] p-2 text-white">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold leading-snug text-white sm:text-base">{service.title}</p>
                        <p className="text-[11px] uppercase tracking-wider text-slate-300">{service.category}</p>
                      </div>
                      {isActive && <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Ativo</span>}
                    </div>
                  </button>
                );
              })}
              </div>
            </aside>

            <article className="rounded-3xl border border-white/10 bg-[#030b1f] p-5 text-white shadow-2xl shadow-[#020817]/70 sm:p-8">
              <span className="inline-flex items-center rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                {serviceCards[activeService].category}
              </span>
              <h3 className="mt-4 text-2xl font-bold sm:text-3xl">{serviceCards[activeService].title}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">{serviceCards[activeService].description}</p>

              <div className="mt-6 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                {serviceCards[activeService].bullets.map((bullet) => (
                  <div key={bullet} className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-100">
                    {bullet}
                  </div>
                ))}
              </div>

              <div className="mt-7 space-y-3 border-t border-white/10 pt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Etapas principais</p>
                {serviceCards[activeService].steps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0b1633] px-4 py-3 text-sm">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-300 text-xs font-bold text-slate-900">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <Button asChild className="mt-7 w-full rounded-xl bg-[#25d366] px-6 text-slate-900 hover:bg-[#1eb85a] sm:mt-8 sm:w-fit">
                <a href="https://wa.me/5500000000000" target="_blank" rel="noreferrer">Solicitar atendimento da MAV</a>
              </Button>
            </article>
          </div>
        </div>
      </section>

      <section id="fluxo" className="reveal-on-scroll py-20" data-reveal>
        <div className="container">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Fluxo de atendimento</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Como trocar a placa cinza pela Mercosul</h2>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
              Criamos um passo a passo simples para orientar o cliente desde a solicitação no Poupatempo até o emplacamento final com a MAV.
            </p>
          </div>
          <div className="mx-auto flex max-w-5xl flex-col gap-5">
            {mercosulSteps.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.step}
                  className={`reveal-on-scroll flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${item.border}`}
                  data-reveal
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-background text-sm font-bold text-foreground">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <div className={`mb-3 inline-flex rounded-full px-4 py-1.5 text-sm font-semibold text-slate-900 ${item.color}`}>
                      {item.title}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                  <div className="hidden rounded-xl border border-border bg-background p-2 text-foreground/80 sm:block">
                    <Icon className="h-6 w-6" />
                  </div>
                </article>
              );
            })}
            <div className="rounded-2xl bg-[#1f3262] px-6 py-4 text-sm font-semibold text-white sm:text-base">
              Precisa de ajuda para concluir as etapas? Fale com a MAV no WhatsApp e agende seu emplacamento.
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="reveal-on-scroll bg-card/50 py-20" data-reveal>
        <div className="container max-w-4xl">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</span>
            <h2 className="mt-2 text-3xl font-bold">Perguntas frequentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="reveal-on-scroll rounded-2xl border border-border bg-card p-5 shadow-sm" itemScope itemType="https://schema.org/Question" data-reveal>
                <h3 className="font-semibold" itemProp="name">{faq.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <span itemProp="text">{faq.answer}</span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="reveal-on-scroll border-t border-border py-8" data-reveal>
        <div className="container flex flex-col items-center gap-4">
          <img src={mavLogo} alt="MAV" className="h-12 w-auto opacity-70" />
          <p className="text-center text-sm text-muted-foreground">© 2026 MAV Emplacadora. Todos os direitos reservados.</p>
        </div>
      </footer>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6 sm:gap-3">
        <a
          href="https://www.instagram.com/mavemplacamento"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-pink-900/30 transition hover:scale-[1.02] sm:px-6 sm:py-3 sm:text-base"
          aria-label="Abrir Instagram"
        >
          <Instagram className="h-5 w-5" />
          <span className="hidden sm:inline">Instagram</span>
        </a>
        <a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-900/30 transition hover:bg-[#15803d] sm:px-6 sm:py-3 sm:text-base"
          aria-label="Abrir WhatsApp"
        >
          <WhatsAppIcon className="h-5 w-5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>

      <div className="pointer-events-none fixed bottom-6 left-6 hidden items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3 py-2 text-xs text-muted-foreground backdrop-blur md:flex">
        <Building2 className="h-4 w-4 text-primary" />
        Plataforma para gestão de emplacamento
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
    </main>
  );
};

export default Home;
