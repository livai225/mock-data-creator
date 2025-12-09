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
import { taxInfo } from "@/lib/mock-data";

const regimesFiscaux = [
  {
    id: "reel-normal",
    name: "Régime Réel Normal",
    description: "Pour les entreprises avec un CA supérieur à 150 millions FCFA",
    obligations: [
      "Tenue d'une comptabilité complète",
      "Déclarations mensuelles TVA",
      "Acomptes IS trimestriels",
      "États financiers annuels SYSCOA",
    ],
    applicable: "CA > 150 000 000 FCFA",
  },
  {
    id: "reel-simplifie",
    name: "Régime Réel Simplifié",
    description: "Pour les PME avec un CA entre 50 et 150 millions FCFA",
    obligations: [
      "Comptabilité simplifiée",
      "Déclaration annuelle TVA",
      "Acomptes IS semestriels",
      "Bilan simplifié",
    ],
    applicable: "50 000 000 < CA ≤ 150 000 000 FCFA",
  },
  {
    id: "micro",
    name: "Régime de la Micro-Entreprise",
    description: "Pour les très petites entreprises avec CA inférieur à 50 millions FCFA",
    obligations: [
      "Livre des recettes",
      "Impôt synthétique",
      "Pas de TVA",
      "Déclaration annuelle simplifiée",
    ],
    applicable: "CA ≤ 50 000 000 FCFA",
  },
];

const calendrierFiscal = [
  { mois: "Janvier", obligations: ["Déclaration TVA décembre", "Patente (1er versement)"] },
  { mois: "Février", obligations: ["Déclaration TVA janvier"] },
  { mois: "Mars", obligations: ["Déclaration TVA février", "1er acompte IS"] },
  { mois: "Avril", obligations: ["Déclaration TVA mars", "États financiers N-1"] },
  { mois: "Mai", obligations: ["Déclaration TVA avril"] },
  { mois: "Juin", obligations: ["Déclaration TVA mai", "2ème acompte IS"] },
  { mois: "Juillet", obligations: ["Déclaration TVA juin", "Patente (2ème versement)"] },
  { mois: "Août", obligations: ["Déclaration TVA juillet"] },
  { mois: "Septembre", obligations: ["Déclaration TVA août", "3ème acompte IS"] },
  { mois: "Octobre", obligations: ["Déclaration TVA septembre"] },
  { mois: "Novembre", obligations: ["Déclaration TVA octobre"] },
  { mois: "Décembre", obligations: ["Déclaration TVA novembre", "4ème acompte IS"] },
];

export default function Fiscalite() {
  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-20">
        <div className="container">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              Guide Complet
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
              Fiscalité Ivoirienne
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              Découvrez toutes les informations essentielles sur les impôts, taxes et obligations 
              fiscales des entreprises en Côte d'Ivoire.
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
                Impôts & Taxes
              </TabsTrigger>
              <TabsTrigger value="regimes" className="flex-1 min-w-[150px] data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <Briefcase className="h-4 w-4 mr-2" />
                Régimes Fiscaux
              </TabsTrigger>
              <TabsTrigger value="calendrier" className="flex-1 min-w-[150px] data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Calendrier Fiscal
              </TabsTrigger>
              <TabsTrigger value="cnps" className="flex-1 min-w-[150px] data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <Users className="h-4 w-4 mr-2" />
                CNPS & Social
              </TabsTrigger>
            </TabsList>

            {/* Impôts & Taxes */}
            <TabsContent value="impots" className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                {taxInfo.map((tax) => (
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

                {/* Additional taxes */}
                <Card variant="elevated">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Impôt sur le Revenu (IR)</CardTitle>
                      <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-bold">
                        0-60%
                      </span>
                    </div>
                    <CardDescription>
                      Impôt progressif sur les revenus des personnes physiques, applicable aux entrepreneurs individuels.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-muted text-sm">Entreprises individuelles</span>
                      <span className="px-3 py-1 rounded-full bg-muted text-sm">Professions libérales</span>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="elevated">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Impôt Synthétique</CardTitle>
                      <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary font-bold">
                        Variable
                      </span>
                    </div>
                    <CardDescription>
                      Impôt forfaitaire unique pour les micro-entreprises, remplaçant l'IS, la TVA et la patente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 rounded-full bg-muted text-sm">CA &lt; 50M FCFA</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Régimes Fiscaux */}
            <TabsContent value="regimes" className="space-y-8">
              <div className="grid gap-6">
                {regimesFiscaux.map((regime, index) => (
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
                  <CardTitle>Calendrier des Obligations Fiscales</CardTitle>
                  <CardDescription>
                    Les principales échéances fiscales pour les entreprises au régime réel normal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {calendrierFiscal.map((item) => (
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
                    <CardTitle>Cotisations CNPS Employeur</CardTitle>
                    <CardDescription>
                      Cotisations sociales obligatoires à la charge de l'employeur.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span>Prestations familiales</span>
                      <span className="font-bold text-secondary">5,75%</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span>Accidents du travail</span>
                      <span className="font-bold text-secondary">2% à 5%</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span>Retraite</span>
                      <span className="font-bold text-secondary">7,7%</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="font-semibold">Total employeur</span>
                      <span className="font-bold text-secondary text-lg">15,45% - 18,45%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Cotisations Salarié</CardTitle>
                    <CardDescription>
                      Part des cotisations prélevées sur le salaire brut.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span>Retraite</span>
                      <span className="font-bold text-secondary">6,3%</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="font-semibold">Total salarié</span>
                      <span className="font-bold text-secondary text-lg">6,3%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="outline" className="lg:col-span-2">
                  <CardContent className="flex items-center gap-4 py-6">
                    <AlertCircle className="h-8 w-8 text-secondary shrink-0" />
                    <div>
                      <p className="font-semibold">Important</p>
                      <p className="text-sm text-muted-foreground">
                        Les cotisations CNPS doivent être versées avant le 15 du mois suivant. 
                        Le non-respect des délais entraîne des pénalités de 10% par mois de retard.
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
            Besoin d'un accompagnement fiscal ?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Nos experts fiscalistes sont à votre disposition pour vous aider à optimiser 
            votre situation fiscale en toute légalité.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="gold" size="lg" asChild>
              <Link to="/services">
                Découvrir nos services
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/boutique">Télécharger nos guides</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
