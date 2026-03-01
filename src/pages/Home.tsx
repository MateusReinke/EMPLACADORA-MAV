import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Building2,
  Car,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileSearch,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  MessageCircle,
  Newspaper,
  Megaphone,
} from "lucide-react";

import mavLogo from "@/assets/mav-emplacamento-logo.svg";
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
    description:
      "Processo completo para veículos novos, com orientação de ponta a ponta.",
    bullets: ["Conferência documental", "Abertura e acompanhamento", "Finalização com agilidade"],
    icon: Car,
  },
  {
    title: "Transferência de Propriedade",
    description:
      "Suporte para transferência entre municípios e regularização de pendências.",
    bullets: ["Checklist prévio", "Emissão de guias", "Status atualizado em tempo real"],
    icon: FileCheck2,
  },
  {
    title: "Licenciamento e Regularização",
    description:
      "Rotina completa para manter veículos e frotas em conformidade legal.",
    bullets: ["Atendimento PF e PJ", "Controle por veículo", "Histórico organizado"],
    icon: ShieldCheck,
  },
];

const faqs = [
  {
    question: "Quanto tempo leva um processo de emplacamento?",
    answer:
      "Depende do tipo de serviço e documentação. Após a triagem inicial, informamos o prazo estimado e cada etapa.",
  },
  {
    question: "Vocês atendem empresas com frota?",
    answer:
      "Sim. Temos fluxo dedicado para pessoa jurídica com acompanhamento por lote e status por veículo.",
  },
  {
    question: "Consigo acompanhar o pedido online?",
    answer:
      "Sim. Clientes, vendedores e administradores podem visualizar o andamento dos pedidos no sistema.",
  },
];

const articleCards = [
  {
    title: "Como organizar documentos para evitar atrasos",
    summary: "Checklist prático para pessoa física e jurídica enviar tudo certo na primeira tentativa.",
  },
  {
    title: "Transferência de propriedade: erros mais comuns",
    summary: "Veja os pontos que mais causam retrabalho e como acelerar a aprovação do processo.",
  },
  {
    title: "Emplacamento para frotas: como ganhar escala",
    summary: "Boas práticas para empresas com múltiplos veículos manterem controle e previsibilidade.",
  },
];

const updates = [
  "Novo canal de atendimento via WhatsApp com resposta mais rápida.",
  "Painel de acompanhamento de pedidos em tempo real para clientes.",
  "Publicação semanal de conteúdos sobre documentação e regularização.",
];

const Home = () => {
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

      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />
        <div className="container relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Gestão moderna para emplacadoras
            </span>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Emplacamento com processo claro, <span className="text-primary">controle total</span> e atendimento ágil
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A MAV centraliza operação, clientes e pedidos em uma experiência completa para sua equipe trabalhar com mais velocidade e previsibilidade.
            </p>

            <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
              <Button asChild size="lg">
                <a href="#servicos">Conhecer serviços</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="https://wa.me/5500000000000" target="_blank" rel="noreferrer">Falar no WhatsApp</a>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-muted-foreground lg:justify-start">
              <span className="rounded-full border border-border/80 bg-card/60 px-3 py-1">Atendimento PF e PJ</span>
              <span className="rounded-full border border-border/80 bg-card/60 px-3 py-1">Acompanhamento por etapas</span>
              <span className="rounded-full border border-border/80 bg-card/60 px-3 py-1">Gestão por perfil de usuário</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md rounded-3xl border border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/20 backdrop-blur">
            <img src={mavLogo} alt="Logo MAV" className="mx-auto h-32 w-auto drop-shadow-2xl" />
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3 rounded-xl bg-background/80 p-3">
                <BadgeCheck className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Triagem documental para reduzir retrabalho e aumentar previsibilidade.</p>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-background/80 p-3">
                <Star className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Fluxo padronizado para entregas com mais qualidade e velocidade.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="artigos" className="bg-card/40 py-20">
        <div className="container">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
              <Newspaper className="h-4 w-4" /> Artigos
            </span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Conteúdo para orientar seu processo</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {articleCards.map((article) => (
              <article key={article.title} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold">{article.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="novidades" className="py-20">
        <div className="container max-w-4xl rounded-3xl border border-primary/20 bg-primary/5 p-8">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-primary">
              <Megaphone className="h-4 w-4" /> Novidades
            </span>
            <h2 className="mt-2 text-3xl font-bold">O que está novo na MAV</h2>
          </div>
          <ul className="space-y-3">
            {updates.map((item) => (
              <li key={item} className="rounded-xl border border-border bg-background/80 px-4 py-3 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="servicos" className="bg-card/40 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">O que fazemos</span>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Serviços essenciais para sua operação</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Estrutura inspirada no seu exemplo, adaptada para o contexto de emplacamento e documentação.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {serviceCards.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.title} className="group relative overflow-hidden rounded-2xl border border-border/80 bg-background/70 p-5 text-left transition-all duration-300 hover:border-primary/40">
                  <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Serviço</p>
                  <h3 className="mt-1 text-lg font-bold">{service.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                  <ul className="mt-4 space-y-2 text-sm">
                    {service.bullets.map((bullet) => (
                      <li key={bullet} className="rounded-lg border bg-background/80 px-3 py-2">• {bullet}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="fluxo" className="py-20">
        <div className="container grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">Coleta e conferência inicial</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">Recebemos os dados, validamos os documentos e iniciamos o processo com checklist técnico.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <FileSearch className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">Acompanhamento por etapa</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">Cada pedido evolui com status visível para clientes e equipe, evitando ruídos de comunicação.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Clock3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">Entrega com prazo definido</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">Fluxo operacional padronizado para previsibilidade e melhor experiência de atendimento.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-card/50 py-20">
        <div className="container max-w-4xl">
          <div className="mb-10 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</span>
            <h2 className="mt-2 text-3xl font-bold">Perguntas frequentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-2xl border border-border bg-card p-5" itemScope itemType="https://schema.org/Question">
                <h3 className="font-semibold" itemProp="name">{faq.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <span itemProp="text">{faq.answer}</span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center gap-4">
          <img src={mavLogo} alt="MAV" className="h-12 w-auto opacity-70" />
          <p className="text-center text-sm text-muted-foreground">© 2026 MAV Emplacadora. Todos os direitos reservados.</p>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-green-700"
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
