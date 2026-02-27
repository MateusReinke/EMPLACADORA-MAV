import { Link } from "react-router-dom";
import mavLogo from "@/assets/mav-emplacamento-logo.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const services = [
  "Primeiro emplacamento",
  "Transferência e troca de município",
  "Licenciamento e regularização documental",
  "Suporte para clientes PF e PJ",
];

const highlights = [
  {
    title: "Atendimento especializado",
    description:
      "Equipe com experiência em processos de emplacamento e documentação veicular.",
  },
  {
    title: "Acompanhamento em tempo real",
    description:
      "Visualize pedidos, status e histórico de serviços em um só lugar.",
  },
  {
    title: "Gestão centralizada",
    description:
      "Clientes, veículos e pedidos organizados para agilizar o dia a dia da empresa.",
  },
];

const Home = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 md:px-8 md:py-16">
        <header className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border/60 bg-card p-8 shadow-sm md:flex-row md:items-center">
          <div className="space-y-4">
            <Badge variant="secondary" className="w-fit">
              Bem-vindo à MAV Emplacadora
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              Seu parceiro em documentação e emplacamento veicular
            </h1>
            <p className="max-w-2xl text-muted-foreground md:text-lg">
              A MAV oferece uma operação completa para clientes, vendedores e
              administradores acompanharem cada etapa dos serviços, com
              transparência e agilidade.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/login">Acessar sistema</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="mailto:contato@mavemplacadora.com">Falar com a equipe</a>
              </Button>
            </div>
          </div>

          <img
            src={mavLogo}
            alt="Logo da MAV Emplacadora"
            className="h-28 w-auto md:h-36"
          />
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title} className="border-border/60">
              <CardHeader>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {item.description}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">Serviços oferecidos</h2>
          <p className="mt-2 text-muted-foreground">
            Conheça os principais serviços da nossa emplacadora para manter sua
            frota regularizada.
          </p>
          <ul className="mt-6 grid list-disc gap-2 pl-6 text-sm marker:text-primary md:grid-cols-2 md:text-base">
            {services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
};

export default Home;
