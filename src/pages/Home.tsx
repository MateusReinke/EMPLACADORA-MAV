import { Link } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Headset,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import mavLogo from "@/assets/mav-emplacamento-logo.svg";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const services = [
  {
    title: "Primeiro Emplacamento",
    description: "Cuidamos de toda a documentação e etapas junto aos órgãos competentes para veículos novos.",
    points: ["Checklist completo", "Acompanhamento por status", "Entrega com previsibilidade"],
    icon: FileText,
  },
  {
    title: "Transferência e Regularização",
    description: "Transferência de propriedade, mudança de município e regularização documental sem dor de cabeça.",
    points: ["Validação prévia", "Redução de retrabalho", "Suporte especializado"],
    icon: ShieldCheck,
  },
  {
    title: "Gestão para Frotas e Empresas",
    description: "Fluxo dedicado para pessoa jurídica, com controle por veículo e acompanhamento centralizado.",
    points: ["Atendimento PJ", "Visão por lote", "Comunicação ativa"],
    icon: Users,
  },
];

const faqs = [
  {
    q: "Quanto tempo leva para concluir um emplacamento?",
    a: "O prazo varia conforme o tipo de processo e a situação documental. Após a triagem, informamos o cronograma com estimativa realista.",
  },
  {
    q: "Posso acompanhar o andamento do meu pedido?",
    a: "Sim. Você acompanha o progresso por etapas, com atualizações de status para ter visibilidade do processo do início ao fim.",
  },
  {
    q: "Vocês atendem pessoa física e jurídica?",
    a: "Atendemos ambos os perfis, inclusive empresas com volume recorrente e necessidades de gestão de frota.",
  },
  {
    q: "Quais documentos são necessários?",
    a: "Depende do serviço contratado. Nossa equipe faz a conferência e envia um checklist personalizado para evitar pendências.",
  },
];

const Home = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <img src={mavLogo} alt="MAV Emplacadora" className="h-10 w-auto" />
          <nav className="hidden items-center gap-2 md:flex">
            <a href="#servicos" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Serviços</a>
            <a href="#faq" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">FAQ</a>
            <a href="#contato" className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">Contato</a>
            <Button asChild size="sm">
              <Link to="/login">
                Área de Gestão
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/5" />
        <div className="container relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              Solução profissional para emplacadoras
            </span>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Home page profissional para apresentar seus serviços com <span className="text-primary">autoridade</span>
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Estrutura completa com serviços, FAQ, botões de contato e formulário para captação de novos clientes — tudo em um visual moderno e confiável.
            </p>
            <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button asChild size="lg">
                <a href="#contato">Solicitar atendimento</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#servicos">Ver serviços</a>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground lg:justify-start">
              <span className="rounded-full border bg-card px-3 py-1">Atendimento especializado</span>
              <span className="rounded-full border bg-card px-3 py-1">Processo transparente</span>
              <span className="rounded-full border bg-card px-3 py-1">Suporte por WhatsApp</span>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-card/90 p-6 shadow-xl">
            <h2 className="text-xl font-bold">Por que escolher a MAV?</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-background p-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Fluxo claro desde a triagem documental até a finalização do processo.</p>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-background p-3">
                <Clock3 className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Mais agilidade operacional com etapas padronizadas e comunicação ativa.</p>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-background p-3">
                <Headset className="mt-0.5 h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Equipe pronta para atender clientes PF, PJ e gestão de frotas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servicos" className="bg-card/40 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Serviços</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Soluções completas em documentação veicular</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.title} className="rounded-2xl border border-border bg-background p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md">
                  <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="container max-w-4xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</p>
            <h2 className="mt-2 text-3xl font-bold">Perguntas frequentes</h2>
          </div>
          <div className="rounded-2xl border bg-card p-4 sm:p-6">
            <Accordion type="single" collapsible>
              {faqs.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <section id="contato" className="bg-card/50 py-20">
        <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Contato</p>
            <h2 className="text-3xl font-bold">Fale com nossa equipe</h2>
            <p className="text-muted-foreground">
              Entre em contato para solicitar orçamento, tirar dúvidas ou iniciar seu processo.
            </p>

            <div className="space-y-3">
              <a href="tel:+5511999999999" className="flex items-center gap-3 rounded-xl border bg-background p-3 transition hover:border-primary/40">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm">(11) 99999-9999</span>
              </a>
              <a href="mailto:contato@mavemplacadora.com" className="flex items-center gap-3 rounded-xl border bg-background p-3 transition hover:border-primary/40">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span className="text-sm">contato@mavemplacadora.com</span>
              </a>
              <a
                href="https://wa.me/5511999999999?text=Olá%2C%20quero%20informa%C3%A7%C3%B5es%20sobre%20servi%C3%A7os%20de%20emplacamento."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <MessageCircle className="h-4 w-4" />
                Chamar no WhatsApp
              </a>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              Atendimento presencial e online.
            </div>
          </div>

          <form className="rounded-2xl border bg-background p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Solicite um contato</h3>
            <p className="mt-1 text-sm text-muted-foreground">Preencha o formulário e retornaremos rapidamente.</p>
            <div className="mt-5 grid gap-4">
              <Input placeholder="Seu nome" name="name" />
              <Input placeholder="Seu e-mail" type="email" name="email" />
              <Input placeholder="Seu telefone" name="phone" />
              <Input placeholder="Serviço de interesse" name="service" />
              <Textarea placeholder="Descreva sua necessidade" name="message" className="min-h-28" />
              <Button type="submit" className="w-full">Enviar solicitação</Button>
            </div>
          </form>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container flex flex-col items-center gap-4">
          <img src={mavLogo} alt="MAV Emplacadora" className="h-10 w-auto opacity-70" />
          <p className="text-center text-sm text-muted-foreground">© 2026 MAV Emplacadora. Todos os direitos reservados.</p>
        </div>
      </footer>

      <a
        href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20quero%20falar%20com%20a%20MAV%20Emplacadora."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>
    </main>
  );
};

export default Home;
