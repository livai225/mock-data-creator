import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, ArrowRight } from "lucide-react";
import { pricingPlans } from "@/lib/mock-data";
import { getPublicPricingApi, type PricingSetting } from "@/lib/api";

export default function Tarifs() {
  const [pricing, setPricing] = useState<PricingSetting | null>(null);

  useEffect(() => {
    getPublicPricingApi()
      .then((res) => setPricing(res.data ?? null))
      .catch(() => setPricing(null));
  }, []);

  const effectivePlans = useMemo(() => {
    const overrides = new Map((pricing?.pricingPlans ?? []).map((p) => [p.id, p.price]));
    return pricingPlans.map((p) => ({ ...p, price: overrides.get(p.id) ?? p.price }));
  }, [pricing?.pricingPlans]);

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-20">
        <div className="container text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
            Tarification transparente
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
            Nos Tarifs
          </h1>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Des formules adaptées à tous les projets entrepreneuriaux. 
            Pas de frais cachés, tout est inclus.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-3 max-w-6xl mx-auto">
            {effectivePlans.map((plan, index) => (
              <Card 
                key={plan.id}
                variant={plan.popular ? "gold" : "elevated"}
                className={`relative animate-fade-up ${plan.popular ? 'lg:scale-105 lg:-my-4 border-secondary' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium shadow-gold">
                      <Star className="h-4 w-4 fill-current" />
                      Plus populaire
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="pt-4">
                    <span className="text-5xl font-bold">{plan.price.toLocaleString()}</span>
                    <span className="text-muted-foreground ml-2">FCFA</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className={`h-5 w-5 shrink-0 ${plan.popular ? 'text-secondary' : 'text-accent'}`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={plan.popular ? "hero" : "outline-gold"} 
                    className="w-full" 
                    size="lg"
                    asChild
                  >
                    <Link to="/creation-entreprise">
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              Services Complémentaires
            </h2>
            <p className="text-muted-foreground">
              Des prestations à la carte pour répondre à tous vos besoins.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { service: "Modification statutaire", price: "45 000", desc: "Changement de gérant, augmentation capital..." },
              { service: "Dissolution / Liquidation", price: "75 000", desc: "Fermeture de société" },
              { service: "Consultation fiscale", price: "25 000", desc: "1 heure avec un expert" },
              { service: "Déclaration CNPS", price: "15 000/mois", desc: "Gestion des cotisations sociales" },
              { service: "Bilan comptable", price: "Sur devis", desc: "Établissement des états financiers" },
              { service: "Audit contractuel", price: "Sur devis", desc: "Mission d'audit sur mesure" },
            ].map((item) => (
              <Card key={item.service} variant="outline">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{item.service}</h3>
                    <span className="font-bold text-secondary whitespace-nowrap">
                      {item.price} {item.price !== "Sur devis" && "FCFA"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-secondary-foreground mb-4">
            Besoin d'un devis personnalisé ?
          </h2>
          <p className="text-secondary-foreground/80 max-w-xl mx-auto mb-8">
            Contactez-nous pour obtenir une proposition adaptée à votre projet spécifique.
          </p>
          <Button variant="navy" size="xl" asChild>
            <Link to="/contact">
              Demander un devis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
