import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/layout/Layout";
import { 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Calculator, 
  FileText, 
  Search, 
  Users, 
  Globe,
  Star,
  Clock,
  Shield,
  Zap
} from "lucide-react";
import { companyTypes, services, testimonials, stats } from "@/lib/mock-data";
import heroBg from "@/assets/hero-bg.jpg";

const iconMap: Record<string, React.ElementType> = {
  Calculator,
  FileText,
  Search,
  Building2,
  Users,
  Globe,
};

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-navy-light" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        
        <div className="container relative py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <div className="space-y-8 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground text-sm font-medium backdrop-blur-sm">
                <Zap className="h-4 w-4 text-secondary" />
                <span>Génération automatique de documents</span>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
                Créez votre entreprise en{" "}
                <span className="text-secondary">Côte d'Ivoire</span>{" "}
                en quelques clics
              </h1>
              
              <p className="text-lg text-primary-foreground/80 max-w-xl leading-relaxed">
                Plateforme officielle de génération automatique de documents administratifs. 
                Statuts, DSV, contrat de bail... Tous vos documents CEPICI conformes en 24-48h.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/creation-entreprise">
                    Créer mon entreprise
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline-light" size="xl" asChild>
                  <Link to="/services">Découvrir nos services</Link>
                </Button>
              </div>
              
              <div className="flex items-center gap-10 pt-6 border-t border-primary-foreground/20">
                {stats.slice(0, 3).map((stat, index) => (
                  <div key={stat.label} className="text-center">
                    <p className="font-display text-3xl sm:text-4xl font-bold text-secondary">{stat.value}</p>
                    <p className="text-sm text-primary-foreground/70 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hero Cards */}
            <div className="hidden lg:block relative">
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-secondary/20 to-transparent rounded-3xl" />
              <div className="relative grid gap-4 p-6">
                {companyTypes.filter(c => !c.requiresNotary).slice(0, 3).map((company, index) => (
                  <Card 
                    key={company.id} 
                    variant="elevated"
                    className="animate-slide-left bg-card/95 backdrop-blur"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
                          <Building2 className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                          <p className="font-semibold">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.estimatedTime}</p>
                        </div>
                      </div>
                      <p className="font-bold text-secondary">{company.price.toLocaleString()} FCFA</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Pourquoi choisir <span className="text-gradient-orange">ARCH EXCELLENCE</span> ?
            </h2>
            <p className="text-muted-foreground">
              Une solution complète et fiable pour tous vos besoins administratifs et juridiques.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Zap, title: "Rapide", description: "Documents générés en 24-48h maximum" },
              { icon: Shield, title: "Conforme", description: "100% conformes CEPICI et OHADA" },
              { icon: Clock, title: "Disponible 24/7", description: "Créez votre dossier à tout moment" },
              { icon: Users, title: "Expert dédié", description: "Accompagnement personnalisé" },
            ].map((feature, index) => (
              <Card key={index} variant="gold" className="text-center">
                <CardContent className="pt-8 pb-6">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
                    <feature.icon className="h-7 w-7 text-secondary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Types Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Choisissez votre forme juridique
            </h2>
            <p className="text-muted-foreground">
              Nous accompagnons la création de tous types de sociétés en Côte d'Ivoire.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companyTypes.filter(c => !c.requiresNotary).map((company) => (
              <Card key={company.id} variant="elevated" className="group hover:border-secondary/30">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                      {company.id}
                    </span>
                    <span className="text-sm text-muted-foreground">{company.estimatedTime}</span>
                  </div>
                  <CardTitle className="text-xl">{company.fullName}</CardTitle>
                  <CardDescription>{company.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {company.documentsGenerated.slice(0, 4).map((doc) => (
                      <div key={doc} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span>{doc}</span>
                      </div>
                    ))}
                    {company.documentsGenerated.length > 4 && (
                      <p className="text-sm text-muted-foreground">
                        +{company.documentsGenerated.length - 4} autres documents
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold text-secondary">{company.price.toLocaleString()} <span className="text-sm font-normal">FCFA</span></p>
                    </div>
                    <Button variant="gold" size="sm" asChild>
                      <Link to="/creation-entreprise">Commencer</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Card variant="elevated" className="mx-auto max-w-3xl text-left">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  Pour les SA, SAS, Coopératives et SARL &gt; 10M FCFA, un accompagnement personnalisé est nécessaire.
                </p>
                <div className="mt-6">
                  <Button variant="outline-gold" asChild>
                    <Link to="/contact">Nous contacter pour ces formes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Nos services d'expertise
            </h2>
            <p className="text-muted-foreground">
              ARCH EXCELLENCE vous accompagne dans tous les aspects de la vie de votre entreprise.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = iconMap[service.icon] || Building2;
              return (
                <Card key={service.id} variant="default" className="group hover:shadow-gold transition-all">
                  <CardHeader>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-secondary/10 transition-colors">
                      <Icon className="h-7 w-7 text-primary group-hover:text-secondary transition-colors" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-12 text-center">
            <Button variant="navy" size="lg" asChild>
              <Link to="/services">
                Voir tous nos services
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-primary">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-primary-foreground/70">
              Découvrez les témoignages de ceux qui nous ont fait confiance.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-primary-foreground/5 border-primary-foreground/10">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-primary-foreground/90 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="font-display font-bold text-secondary">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-primary-foreground">{testimonial.name}</p>
                      <p className="text-sm text-primary-foreground/60">{testimonial.company}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-secondary-foreground mb-6">
            Prêt à lancer votre entreprise ?
          </h2>
          <p className="text-secondary-foreground/80 max-w-xl mx-auto mb-8">
            Rejoignez les centaines d'entrepreneurs qui ont déjà créé leur entreprise avec ARCH EXCELLENCE.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="navy" size="xl" asChild>
              <Link to="/creation-entreprise">
                Commencer maintenant
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-secondary" asChild>
              <Link to="/contact">Parler à un expert</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
