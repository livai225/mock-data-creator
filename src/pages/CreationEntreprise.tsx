import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  AlertTriangle,
  FileText,
  Download,
  ExternalLink
} from "lucide-react";
import { companyTypes, type CompanyTypeInfo } from "@/lib/mock-data";
import { toast } from "sonner";

type Step = 'type' | 'info' | 'associes' | 'recap' | 'contact';

interface FormData {
  companyType: CompanyTypeInfo | null;
  companyName: string;
  activity: string;
  capital: string;
  address: string;
  city: string;
  associes: { name: string; parts: string }[];
  gerant: string;
  email: string;
  phone: string;
}

export default function CreationEntreprise() {
  const [step, setStep] = useState<Step>('type');
  const [docsOpen, setDocsOpen] = useState(false);
  const [pendingCompanyType, setPendingCompanyType] = useState<CompanyTypeInfo | null>(null);
  const [formData, setFormData] = useState<FormData>({
    companyType: null,
    companyName: '',
    activity: '',
    capital: '',
    address: '',
    city: 'Abidjan',
    associes: [{ name: '', parts: '' }],
    gerant: '',
    email: '',
    phone: '',
  });

  const handleSelectType = (company: CompanyTypeInfo) => {
    setFormData({ ...formData, companyType: company });
    if (company.requiresNotary) {
      setStep('contact');
    } else {
      setStep('info');
    }
  };

  const checklist = useMemo(() => {
    const base = [
      "Pièce d'identité valide (CNI ou passeport)",
      "Contacts (téléphone, email)",
      "Adresse complète du siège + justificatif (contrat de bail / attestation de domiciliation)",
      "Objet social (activité principale)",
    ];

    if (!pendingCompanyType) return base;

    switch (pendingCompanyType.id) {
      case "EI":
        return [
          ...base,
          "Nom commercial / dénomination (si applicable)",
          "Adresse du domicile du promoteur (si différente du siège)",
        ];

      case "SARL":
        return [
          ...base,
          "Dénomination sociale",
          "Capital social (≤ 10M FCFA si procédure standard)",
          "Informations des associés (identité, parts, apports)",
          "Identité du gérant",
        ];

      case "SNC":
      case "SCS":
        return [
          ...base,
          "Dénomination sociale",
          "Informations des associés (identité, parts, apports)",
          "Identité du ou des gérants",
        ];

      case "GIE":
        return [
          ...base,
          "Dénomination du groupement",
          "Liste des membres (identité et coordonnées)",
          "But/objet du groupement",
          "Organe de gestion (responsable/administrateur)",
        ];

      case "SA":
      case "SAS":
      case "COOPERATIVE":
        return [
          ...base,
          "Dénomination sociale",
          "Capital social et répartition des actions/parts",
          "Identité des actionnaires/associés",
          "Identité des dirigeants (DG/Président, etc.)",
          "Note: un accompagnement personnalisé (notaire) est requis.",
        ];

      default:
        return base;
    }
  }, [pendingCompanyType]);

  const handleAddAssocie = () => {
    setFormData({
      ...formData,
      associes: [...formData.associes, { name: '', parts: '' }],
    });
  };

  const handleRemoveAssocie = (index: number) => {
    if (formData.associes.length > 1) {
      setFormData({
        ...formData,
        associes: formData.associes.filter((_, i) => i !== index),
      });
    }
  };

  const handleAssocieChange = (index: number, field: 'name' | 'parts', value: string) => {
    const newAssocies = [...formData.associes];
    newAssocies[index][field] = value;
    setFormData({ ...formData, associes: newAssocies });
  };

  const handleGenerate = () => {
    toast.success("Documents générés avec succès!", {
      description: "Vos documents sont prêts à être téléchargés.",
    });
  };

  const progressSteps = [
    { id: 'type', label: 'Type de société' },
    { id: 'info', label: 'Informations' },
    { id: 'associes', label: 'Associés' },
    { id: 'recap', label: 'Récapitulatif' },
  ];

  const currentStepIndex = progressSteps.findIndex(s => s.id === step);

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-16">
        <div className="container">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Créer votre entreprise
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            Suivez les étapes pour générer automatiquement tous les documents nécessaires à la création 
            de votre entreprise en Côte d'Ivoire.
          </p>
        </div>
      </section>

      {/* Progress */}
      {step !== 'contact' && (
        <div className="bg-muted/50 py-6">
          <div className="container">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {progressSteps.map((s, index) => (
                <div key={s.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                    index <= currentStepIndex 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index < currentStepIndex ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`ml-2 text-sm hidden sm:block ${
                    index <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'
                  }`}>
                    {s.label}
                  </span>
                  {index < progressSteps.length - 1 && (
                    <div className={`w-8 sm:w-16 h-0.5 mx-2 ${
                      index < currentStepIndex ? 'bg-secondary' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <section className="py-12">
        <div className="container max-w-4xl">
          {/* Step 1: Choose Type */}
          {step === 'type' && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold mb-2">
                  Choisissez le type de société
                </h2>
                <p className="text-muted-foreground">
                  Sélectionnez la forme juridique adaptée à votre projet.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {companyTypes.map((company) => (
                  <Card 
                    key={company.id} 
                    variant={company.requiresNotary ? 'outline' : 'gold'}
                    className={`cursor-pointer transition-all hover:border-secondary ${
                      company.requiresNotary ? 'opacity-80' : ''
                    }`}
                    onClick={() => {
                      setPendingCompanyType(company);
                      setDocsOpen(true);
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                          {company.id}
                        </span>
                        {company.requiresNotary && (
                          <span className="px-2 py-1 rounded-full bg-destructive/10 text-destructive text-xs">
                            Notaire requis
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg">{company.fullName}</CardTitle>
                      <CardDescription>{company.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {company.estimatedTime}
                        </span>
                        {company.price > 0 ? (
                          <span className="font-bold text-secondary">
                            {company.price.toLocaleString()} FCFA
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sur devis</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Dialog open={docsOpen} onOpenChange={setDocsOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Documents à préparer</DialogTitle>
                    <DialogDescription>
                      {pendingCompanyType
                        ? `Avant de continuer pour ${pendingCompanyType.fullName}, prépare les éléments suivants.`
                        : "Prépare ces éléments pour renseigner les informations demandées et/ou poursuivre la procédure au CEPICI."}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3">
                    {checklist.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <DialogFooter className="sm:justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        window.open("https://www.cepici.gouv.ci/", "_blank", "noopener,noreferrer");
                      }}
                      type="button"
                    >
                      <ExternalLink className="h-4 w-4" />
                      CEPICI
                    </Button>

                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDocsOpen(false);
                        }}
                        type="button"
                      >
                        Fermer
                      </Button>
                      <Button
                        variant="gold"
                        onClick={() => {
                          if (!pendingCompanyType) return;
                          setDocsOpen(false);
                          handleSelectType(pendingCompanyType);
                        }}
                        type="button"
                        disabled={!pendingCompanyType}
                      >
                        Continuer
                      </Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Step 2: Company Info */}
          {step === 'info' && formData.companyType && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setStep('type')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Informations de l'entreprise</CardTitle>
                  <CardDescription>
                    Renseignez les informations principales de votre {formData.companyType.fullName}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Dénomination sociale *</Label>
                      <Input
                        id="companyName"
                        placeholder="Ex: ABC SERVICES SARL"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capital">Capital social (FCFA) *</Label>
                      <Input
                        id="capital"
                        type="number"
                        placeholder="Ex: 1000000"
                        value={formData.capital}
                        onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activity">Objet social / Activité *</Label>
                    <Textarea
                      id="activity"
                      placeholder="Décrivez l'activité principale de votre entreprise..."
                      value={formData.activity}
                      onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse du siège *</Label>
                      <Input
                        id="address"
                        placeholder="Ex: Rue des Jardins, Cocody"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        placeholder="Ex: Abidjan"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@exemple.ci"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone *</Label>
                      <Input
                        id="phone"
                        placeholder="Ex: 0707070707"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button variant="gold" onClick={() => setStep('associes')}>
                      Continuer
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Associates */}
          {step === 'associes' && formData.companyType && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setStep('info')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Associés et dirigeants</CardTitle>
                  <CardDescription>
                    Renseignez les informations sur les associés et le gérant de la société.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Associés</Label>
                    {formData.associes.map((associe, index) => (
                      <div key={index} className="flex gap-4 items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Nom complet de l'associé"
                            value={associe.name}
                            onChange={(e) => handleAssocieChange(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="w-32 space-y-2">
                          <Input
                            placeholder="Parts (%)"
                            type="number"
                            value={associe.parts}
                            onChange={(e) => handleAssocieChange(index, 'parts', e.target.value)}
                          />
                        </div>
                        {formData.associes.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveAssocie(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={handleAddAssocie}>
                      + Ajouter un associé
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gerant">Gérant / Représentant légal *</Label>
                    <Input
                      id="gerant"
                      placeholder="Nom complet du gérant"
                      value={formData.gerant}
                      onChange={(e) => setFormData({ ...formData, gerant: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button variant="gold" onClick={() => setStep('recap')}>
                      Voir le récapitulatif
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 4: Recap */}
          {step === 'recap' && formData.companyType && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setStep('associes')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </div>

              <Card variant="gold">
                <CardHeader>
                  <CardTitle>Récapitulatif de votre dossier</CardTitle>
                  <CardDescription>
                    Vérifiez les informations avant de générer vos documents.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Type de société</p>
                      <p className="font-semibold">{formData.companyType.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dénomination</p>
                      <p className="font-semibold">{formData.companyName || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Capital social</p>
                      <p className="font-semibold">{formData.capital ? `${parseInt(formData.capital).toLocaleString()} FCFA` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gérant</p>
                      <p className="font-semibold">{formData.gerant || '-'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Siège social</p>
                      <p className="font-semibold">{formData.address}, {formData.city}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Objet social</p>
                      <p className="font-semibold">{formData.activity || '-'}</p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <p className="font-semibold mb-4">Documents qui seront générés :</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {formData.companyType.documentsGenerated.map((doc) => (
                        <div key={doc} className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-secondary" />
                          <span className="text-sm">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total à payer</p>
                        <p className="text-3xl font-bold text-secondary">
                          {formData.companyType.price.toLocaleString()} FCFA
                        </p>
                      </div>
                      <Button variant="hero" size="xl" onClick={handleGenerate}>
                        <Download className="h-5 w-5 mr-2" />
                        Générer les documents
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Contact Form (for notary-required types) */}
          {step === 'contact' && formData.companyType && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setStep('type')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </div>

              <Card variant="outline" className="border-destructive/30">
                <CardHeader>
                  <div className="flex items-center gap-3 text-destructive mb-2">
                    <AlertTriangle className="h-6 w-6" />
                    <span className="font-semibold">Intervention notariale requise</span>
                  </div>
                  <CardTitle>Contact ARCH EXCELLENCE</CardTitle>
                  <CardDescription>
                    La création d'une {formData.companyType.fullName} nécessite l'intervention d'un notaire. 
                    Notre équipe vous accompagnera dans cette démarche.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nom complet *</Label>
                      <Input id="contactName" placeholder="Votre nom" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email *</Label>
                      <Input id="contactEmail" type="email" placeholder="votre@email.ci" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Téléphone *</Label>
                      <Input id="contactPhone" placeholder="0707070707" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactCompany">Projet d'entreprise</Label>
                      <Input id="contactCompany" placeholder="Nom de votre futur entreprise" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactMessage">Message</Label>
                    <Textarea 
                      id="contactMessage" 
                      placeholder="Décrivez brièvement votre projet..." 
                      rows={4}
                    />
                  </div>
                  <Button variant="gold" className="w-full" onClick={() => toast.success("Demande envoyée ! Nous vous contacterons rapidement.")}>
                    Envoyer ma demande
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
