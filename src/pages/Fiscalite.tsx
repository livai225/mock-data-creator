import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Briefcase, 
  Users, 
  Calculator,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getPublicFiscaliteContentApi } from "@/lib/api";
import { defaultFiscaliteContent, normalizeFiscaliteContent, type FiscaliteContent } from "@/lib/site-content";

export default function Fiscalite() {
  const [content, setContent] = useState<FiscaliteContent>(defaultFiscaliteContent);

  useEffect(() => {
    getPublicFiscaliteContentApi()
      .then((res) => setContent(normalizeFiscaliteContent(res.data)))
      .catch(() => setContent(defaultFiscaliteContent));
  }, []);

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-20">
        <div className="container">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              {content.header.badge}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
              {content.header.title}
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              {content.header.description}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container">
          <Tabs defaultValue="impots" className="space-y-8">
            <TabsList className="flex flex-wrap h-auto gap-2 bg-muted p-2 rounded-xl">
              <TabsTrigger value="impots" className="flex-1 min-w-[150px] data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <Calculator className="h-4 w-4 mr-2" />
                {content.tabs.impots}
              </TabsTrigger>
              <TabsTrigger value="regimes" className="flex-1 min-w-[150px] data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <Briefcase className="h-4 w-4 mr-2" />
                {content.tabs.regimes}
              </TabsTrigger>
              <TabsTrigger value="calendrier" className="flex-1 min-w-[150px] data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                {content.tabs.calendrier}
              </TabsTrigger>
              <TabsTrigger value="cnps" className="flex-1 min-w-[150px] data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <Users className="h-4 w-4 mr-2" />
                {content.tabs.cnps}
              </TabsTrigger>
            </TabsList>

            {/* Impôts & Taxes */}
            <TabsContent value="impots" className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                {content.taxes.map((tax) => (
                  <Card key={tax.id} variant="elevated">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{tax.title}</CardTitle>
                        {tax.rate && (
                          <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-bold">
                            {tax.rate}
                          </span>
                        )}
                      </div>
                      <CardDescription>{tax.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tax.applicableTo.map((item) => (
                          <span key={item} className="px-3 py-1 rounded-full bg-muted text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {content.additionalTaxes.map((tax) => (
                  <Card key={tax.id} variant="elevated">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{tax.title}</CardTitle>
                        <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-bold">
                          {tax.rate}
                        </span>
                      </div>
                      <CardDescription>{tax.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {tax.applicableTo.map((item) => (
                          <span key={item} className="px-3 py-1 rounded-full bg-muted text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Régimes Fiscaux */}
            <TabsContent value="regimes" className="space-y-8">
              <div className="grid gap-6">
                {content.regimes.map((regime, index) => (
                  <Card key={regime.id} variant={index === 0 ? "gold" : "elevated"}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-2xl mb-2">{regime.name}</CardTitle>
                          <CardDescription className="text-base">{regime.description}</CardDescription>
                        </div>
                        <span className="px-4 py-2 rounded-lg bg-primary/10 text-sm font-medium whitespace-nowrap">
                          {regime.applicable}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium mb-3">Obligations principales :</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {regime.obligations.map((obligation) => (
                          <div key={obligation} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                            <span className="text-sm">{obligation}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Calendrier Fiscal */}
            <TabsContent value="calendrier" className="space-y-8">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>{content.calendrier.title}</CardTitle>
                  <CardDescription>
                    {content.calendrier.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {content.calendrier.items.map((item) => (
                      <div key={item.mois} className="p-4 rounded-xl bg-muted/50 border">
                        <p className="font-display font-semibold text-lg mb-3">{item.mois}</p>
                        <ul className="space-y-2">
                          {item.obligations.map((obligation) => (
                            <li key={obligation} className="flex items-start gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                              <span>{obligation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CNPS & Social */}
            <TabsContent value="cnps" className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card variant="gold">
                  <CardHeader>
                    <CardTitle>{content.cnps.employeur.title}</CardTitle>
                    <CardDescription>
                      {content.cnps.employeur.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {content.cnps.employeur.items.map((item, idx) => (
                      <div key={item.label} className={`flex justify-between items-center py-3 ${idx !== content.cnps.employeur.items.length - 1 ? "border-b" : ""}`}>
                        <span>{item.label}</span>
                        <span className="font-bold text-secondary">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-3">
                      <span className="font-semibold">{content.cnps.employeur.totalLabel}</span>
                      <span className="font-bold text-secondary text-lg">{content.cnps.employeur.totalValue}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>{content.cnps.salarie.title}</CardTitle>
                    <CardDescription>
                      {content.cnps.salarie.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {content.cnps.salarie.items.map((item, idx) => (
                      <div key={item.label} className={`flex justify-between items-center py-3 ${idx !== content.cnps.salarie.items.length - 1 ? "border-b" : ""}`}>
                        <span>{item.label}</span>
                        <span className="font-bold text-secondary">{item.value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-3">
                      <span className="font-semibold">{content.cnps.salarie.totalLabel}</span>
                      <span className="font-bold text-secondary text-lg">{content.cnps.salarie.totalValue}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="outline" className="lg:col-span-2">
                  <CardContent className="flex items-center gap-4 py-6">
                    <AlertCircle className="h-8 w-8 text-secondary shrink-0" />
                    <div>
                      <p className="font-semibold">{content.cnps.info.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {content.cnps.info.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/50">
        <div className="container text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">
            {content.cta.title}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            {content.cta.description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="gold" size="lg" asChild>
              <Link to="/services">
                {content.cta.primaryLabel}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/boutique">{content.cta.secondaryLabel}</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
