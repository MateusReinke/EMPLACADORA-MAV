import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  Car,
  ChevronRight,
  FileCheck2,
  Megaphone,
  MessageCircle,
  Instagram,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

import mavLogo from "@/assets/mav-emplacamento-logo.svg";
import mercosulLogo from "@/assets/logo-mercosul-blanco.svg";
import brazilFlag from "@/assets/brazil-flag.svg";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Serviços", href: "#servicos" },
  { label: "Artigos", href: "#artigos" },
  { label: "Novidades", href: "#novidades" },
  { label: "Fluxo", href: "#fluxo" },
  { label: "FAQ", href: "#faq" },
];

const serviceCards = [
  {
    title: "Primeiro Emplacamento",
    description: "Conduzimos todo o processo do veículo zero com conferência, abertura e finalização sem complicação.",
    bullets: ["Checklist documental", "Abertura de processo", "Acompanhamento até entrega"],
    steps: ["Envio e validação dos documentos", "Abertura do processo no órgão", "Emissão e instalação da placa"],
    badgeColor: "bg-[#facc15]",
    icon: Car,
  },
  {
    title: "Transferência de Propriedade",
    description: "Atendimento completo para transferência com orientação clara e redução de retrabalho nas etapas críticas.",
    bullets: ["Triagem de pendências", "Emissão de guias", "Atualização de status"],
    steps: ["Conferência de débitos e impedimentos", "Apoio na vistoria e documentação", "Finalização da transferência no sistema"],
    badgeColor: "bg-[#fb7185]",
    icon: FileCheck2,
  },
  {
    title: "Licenciamento e Regularização",
    description: "Mantemos veículos e frotas em conformidade com fluxo previsível, histórico e controle por atendimento.",
    bullets: ["Suporte PF e PJ", "Controle por veículo", "Histórico organizado"],
    steps: ["Levantamento das pendências", "Pagamento e atualização de taxas", "Liberação e confirmação do status"],
    badgeColor: "bg-[#4ade80]",
    icon: ShieldCheck,
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

const updates = [
  "Atendimento digital com resposta mais rápida para dúvidas de documentação.",
  "Painel com acompanhamento de pedidos por etapa para clientes e equipe.",
  "Publicações semanais com orientações práticas para emplacamento e regularização.",
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

const Home = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>("[data-reveal]");

    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            element.classList.add("is-visible");
          } else {
            element.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-background" itemScope itemType="https://schema.org/ProfessionalService">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <img src={mavLogo} alt="MAV Emplacadora" className="h-10 w-auto" />

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
      </header>

      <section className="reveal-on-scroll relative overflow-hidden py-20 lg:py-28" data-reveal>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />
        <div className="container relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 text-center lg:text-left">
            <div className="relative min-h-[250px] overflow-hidden rounded-2xl border border-primary/20 bg-background/60 p-6">
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
                  <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">{slide.title}</h1>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{slide.description}</p>
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

            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
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

      <section id="novidades" className="reveal-on-scroll py-20" data-reveal>
        <div className="container max-w-4xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 shadow-sm">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
              <Megaphone className="h-4 w-4" /> Novidades
            </span>
            <h2 className="mt-2 text-3xl font-bold">O que está novo na MAV</h2>
          </div>
          <ul className="space-y-3">
            {updates.map((item) => (
              <li key={item} className="reveal-on-scroll rounded-xl border border-border bg-background/80 px-4 py-3 text-sm shadow-sm" data-reveal>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="servicos" className="reveal-on-scroll bg-card/40 py-20" data-reveal>
        <div className="container">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">O que fazemos</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Serviços em formato de etapas</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Mantivemos os cards no tema de placas e adicionamos tópicos com as possíveis etapas para cada serviço principal.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {serviceCards.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.title} className="reveal-on-scroll group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-border/70 bg-gradient-to-b from-[#08163e] to-[#0f255f] p-5 text-left text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg" data-reveal>
                  <div className="-mx-5 -mt-5 mb-5 rounded-t-2xl bg-[#003399] px-4 py-2 text-white shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <img src={mercosulLogo} alt="Logo Mercosul" className="h-5 w-auto" />
                      <p className="text-center text-xs font-bold uppercase tracking-wider">{service.title}</p>
                      <img src={brazilFlag} alt="Bandeira do Brasil" className="h-5 w-auto" />
                    </div>
                  </div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="inline-flex rounded-xl bg-white/15 p-2 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-200">Principais serviços</p>
                  </div>
                  <h3 className="mt-1 text-lg font-bold">{service.title}</h3>
                  <p className="mt-3 rounded-xl bg-white/5 px-3 py-3 text-sm leading-relaxed text-slate-200">{service.description}</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-slate-100">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">Etapas possíveis</p>
                    {service.steps.map((step, index) => (
                      <div key={step} className="flex items-center gap-3 rounded-xl border border-white/15 bg-[#051233] px-3 py-2 text-sm text-slate-100">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-slate-900 ${service.badgeColor}`}>
                          {index + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  <Button asChild className="mt-6 w-full rounded-xl bg-[#25d366] text-slate-900 hover:bg-[#1eb85a]">
                    <a href="https://wa.me/5500000000000" target="_blank" rel="noreferrer">Precisa de ajuda da MAV?</a>
                  </Button>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="fluxo" className="reveal-on-scroll py-20" data-reveal>
        <div className="container max-w-5xl rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/15 to-background p-8 text-center shadow-sm">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">Fluxo de atendimento</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Cada serviço segue um passo a passo claro</h2>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground sm:text-base">
            Nossos cards mostram os serviços principais e as possíveis etapas para você entender o processo antes de iniciar.
          </p>
          <Button asChild size="lg" className="mt-6">
            <a href="https://wa.me/5500000000000" target="_blank" rel="noreferrer">Precisa de ajuda da MAV?</a>
          </Button>
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

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <a
          href="https://www.instagram.com/mavemplacamento"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-pink-900/30 transition hover:scale-[1.02]"
          aria-label="Abrir Instagram"
        >
          <Instagram className="h-5 w-5" />
          Instagram
        </a>
        <a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#16a34a] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-green-900/30 transition hover:bg-[#15803d]"
          aria-label="Abrir WhatsApp"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
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
