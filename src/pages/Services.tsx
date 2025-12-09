import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator, 
  FileText, 
  Search, 
  Building2, 
  Users, 
  Globe,
  CheckCircle2,
  ArrowRight,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";
import { services } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  Calculator,
  FileText,
  Search,
  Building2,
  Users,
  Globe,
};

export default function Services() {
  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-20">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
              Nos Services d'Excellence
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              ARCH EXCELLENCE SARL vous accompagne dans tous les aspects comptables, fiscaux, 
              juridiques et administratifs de votre entreprise en Côte d'Ivoire.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2">
            {services.map((service, index) => {
              const Icon = iconMap[service.icon] || Building2;
              return (
                <Card 
                  key={service.id} 
                  variant="elevated" 
                  className="group hover:shadow-gold animate-fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-start gap-5">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-secondary/10 transition-colors">
                        <Icon className="h-8 w-8 text-primary group-hover:text-secondary transition-colors" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl mb-2">{service.title}</CardTitle>
                        <CardDescription className="text-base">{service.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {service.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Investor Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                Pour les investisseurs étrangers
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                Accompagnement Investisseurs Internationaux
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Vous souhaitez investir en Côte d'Ivoire ? Notre équipe spécialisée vous accompagne 
                dans toutes vos démarches administratives et juridiques.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Obtention de la carte de résident",
                  "Déclaration d'existence fiscale",
                  "Ouverture de compte bancaire professionnel",
                  "Demande d'agréments sectoriels",
                  "Accompagnement démarches CEPICI",
                  "Conseil fiscal et juridique",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="gold" size="lg" asChild>
                <Link to="/contact">
                  Demander un accompagnement
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <Card variant="gold" className="p-8">
              <h3 className="font-display text-2xl font-bold mb-4">Pack Investisseur Premium</h3>
              <p className="text-muted-foreground mb-6">
                Solution tout-en-un pour les investisseurs souhaitant s'implanter en Côte d'Ivoire.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Création d'entreprise complète",
                  "Accompagnement administratif",
                  "Conseil juridique personnalisé",
                  "Suivi pendant 3 mois",
                  "Expert dédié",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-secondary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t pt-6">
                <p className="text-sm text-muted-foreground mb-2">À partir de</p>
                <p className="text-3xl font-bold text-secondary mb-4">500 000 FCFA</p>
                <Button variant="navy" className="w-full" asChild>
                  <Link to="/contact">Nous contacter</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold text-secondary-foreground mb-2">
                Besoin d'un conseil personnalisé ?
              </h3>
              <p className="text-secondary-foreground/80">
                Nos experts sont disponibles pour répondre à vos questions.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="navy" size="lg" asChild>
                <a href="tel:0151252999">
                  <Phone className="h-5 w-5" />
                  Appeler maintenant
                </a>
              </Button>
              <Button variant="outline" size="lg" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10" asChild>
                <Link to="/contact">Formulaire de contact</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
