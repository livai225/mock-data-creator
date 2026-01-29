import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowRight, 
  ArrowLeft,
  FileText,
  Download,
  CheckCircle2,
  Building2,
  User,
  Home,
  FileSignature
} from "lucide-react";
import { 
  SARLUFormData, 
  SARLUStep, 
  sarluSteps, 
  defaultSARLUFormData
} from "@/lib/sarlu-types";

import { useAuth } from "@/auth/AuthContext";
import { createCompanyApi, generateDocumentsApi } from "@/lib/api";
import { toast } from "sonner";

interface SARLUFormProps {
  onBack: () => void;
  price: number;
  docs: string[];
  companyTypeName: string;
}

export function SARLUForm({ onBack, price, docs, companyTypeName }: SARLUFormProps) {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [step, setStep] = useState<SARLUStep>('societe');
  const [formData, setFormData] = useState<SARLUFormData>(defaultSARLUFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepIndex = sarluSteps.findIndex(s => s.id === step);

  const updateField = <K extends keyof SARLUFormData>(field: K, value: SARLUFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    const currentIndex = sarluSteps.findIndex(s => s.id === step);
    if (currentIndex < sarluSteps.length - 1) {
      setStep(sarluSteps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = sarluSteps.findIndex(s => s.id === step);
    if (currentIndex > 0) {
      setStep(sarluSteps[currentIndex - 1].id);
    } else {
      onBack();
    }
  };

  const handleGenerate = async () => {
    const payload = {
      companyType: 'SARLU',
      companyName: formData.denominationSociale,
      sigle: formData.sigle,
      activity: formData.objetSocial,
      capital: formData.nombreParts * formData.valeurPart,
      capitalEnLettres: formData.capitalEnLettres,
      duree_societe: formData.dureeAnnees,
      address: formData.adresseSiege,
      commune: formData.commune,
      quartier: formData.quartier || '',
      lot: formData.lot,
      ilot: formData.ilot,
      city: formData.ville,
      telephone: formData.telephone || formData.mobile,
      email: formData.email,
      boitePostale: formData.boitePostale,
      gerant: `${formData.associeNom} ${formData.associePrenoms}`,
      paymentAmount: price,
      chiffreAffairesPrev: formData.chiffreAffairesPrev,
      declarant: {
        nom: formData.declarantNom,
        qualite: formData.declarantQualite,
        adresse: formData.declarantAdresse,
        telephone: formData.declarantTelephone,
        fax: formData.declarantFax,
        mobile: formData.declarantMobile,
        email: formData.declarantEmail
      },
      projections: {
        investissementAnnee1: formData.investissementAnnee1,
        investissementAnnee2: formData.investissementAnnee2,
        investissementAnnee3: formData.investissementAnnee3,
        emploisAnnee1: formData.emploisAnnee1,
        emploisAnnee2: formData.emploisAnnee2,
        emploisAnnee3: formData.emploisAnnee3
      },
      // Informations du bailleur
      bailleur: {
        nom: formData.bailleurNom,
        prenom: formData.bailleurPrenom,
        adresse: formData.bailleurAdresse,
        telephone: formData.bailleurContact,
        loyerMensuel: formData.loyerMensuel,
        cautionMois: formData.cautionMois,
        avanceMois: formData.avanceMois,
        dureeBailAnnees: formData.dureeBailAnnees,
        dateDebutBail: formData.dateDebutBail
      },
      associates: [{
        name: `${formData.associeNom} ${formData.associePrenoms}`,
        parts: formData.nombreParts,
        profession: formData.associeProfession,
        nationalite: formData.associeNationalite,
        dateNaissance: formData.associeDateNaissance,
        lieuNaissance: formData.associeLieuNaissance,
        adresse: formData.associeAdresseDomicile,
        typeIdentite: formData.associeTypeIdentite,
        numeroIdentite: formData.associeNumeroIdentite,
        dateDelivranceId: formData.associeDateDelivranceId,
        lieuDelivranceId: formData.associeLieuDelivranceId
      }],
      managers: [{
        nom: formData.associeNom,
        prenoms: formData.associePrenoms,
        dateNaissance: formData.associeDateNaissance,
        lieuNaissance: formData.associeLieuNaissance,
        nationalite: formData.associeNationalite,
        profession: formData.associeProfession,
        adresse: formData.associeAdresseDomicile,
        villeResidence: formData.associeVilleResidence,
        pereNom: formData.associePereNom,
        mereNom: formData.associeMereNom,
        typeIdentite: formData.associeTypeIdentite,
        numeroIdentite: formData.associeNumeroIdentite,
        dateDelivranceId: formData.associeDateDelivranceId,
        dateValiditeId: formData.associeDateValiditeId,
        lieuDelivranceId: formData.associeLieuDelivranceId,
        dureeMandat: formData.gerantDureeMandat,
        dureeMandatAnnees: formData.gerantDureeMandat
      }],
      docs: docs,
      companyTypeName: companyTypeName
    };

    // Navigate to preview page with all data
    navigate("/preview-documents", {
      state: {
        formData,
        companyType: 'SARLU',
        payload,
        price,
        docs,
        companyTypeName
      }
    });
  };

  // Calcul automatique du capital
  const capitalCalcule = formData.nombreParts * formData.valeurPart;
  const cautionTotal = formData.loyerMensuel * (formData.cautionMois + formData.avanceMois);

  return (
    <div className="space-y-8">
      {/* Type de société - Indicateur permanent */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-blue-600 font-semibold">
              Type de société sélectionné
            </span>
            <p className="text-lg font-bold text-blue-900 mt-1">
              {companyTypeName}
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm text-blue-600 font-semibold">Prix</span>
            <p className="text-lg font-bold text-blue-900 mt-1">
              {price.toLocaleString()} FCFA
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="border-blue-500 text-blue-700 hover:bg-blue-100"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Changer
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-muted/50 p-6 rounded-lg">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {sarluSteps.map((s, index) => (
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
              <span className={`ml-2 text-sm hidden md:block ${
                index <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {s.label}
              </span>
              {index < sarluSteps.length - 1 && (
                <div className={`w-6 sm:w-12 h-0.5 mx-2 ${
                  index < currentStepIndex ? 'bg-secondary' : 'bg-border'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Société */}
      {step === 'societe' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-secondary mb-2">
              <Building2 className="h-5 w-5" />
              <span className="text-sm font-medium">Étape 1/5</span>
            </div>
            <CardTitle>Informations de la société</CardTitle>
            <CardDescription>
              Renseignez les informations principales de votre SARL Unipersonnelle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="denominationSociale">Dénomination sociale *</Label>
                <Input
                  id="denominationSociale"
                  placeholder="Ex: ABC SERVICES"
                  value={formData.denominationSociale}
                  onChange={(e) => updateField('denominationSociale', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sigle">Sigle (abréviation)</Label>
                <Input
                  id="sigle"
                  placeholder="Ex: ABS"
                  value={formData.sigle}
                  onChange={(e) => updateField('sigle', e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-4">Capital social</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="nombreParts">Nombre de parts *</Label>
                  <Input
                    id="nombreParts"
                    type="number"
                    value={formData.nombreParts}
                    onChange={(e) => updateField('nombreParts', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valeurPart">Valeur par part (FCFA) *</Label>
                  <Input
                    id="valeurPart"
                    type="number"
                    value={formData.valeurPart}
                    onChange={(e) => updateField('valeurPart', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capital total (FCFA)</Label>
                  <Input
                    value={capitalCalcule.toLocaleString()}
                    readOnly
                    className="bg-muted font-semibold"
                  />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="capitalEnLettres">Capital en lettres *</Label>
                <Input
                  id="capitalEnLettres"
                  placeholder="Ex: Un million de francs CFA"
                  value={formData.capitalEnLettres}
                  onChange={(e) => updateField('capitalEnLettres', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objetSocial">Objet social (activité principale) *</Label>
              <Textarea
                id="objetSocial"
                placeholder="Décrivez l'activité principale de votre entreprise..."
                rows={3}
                value={formData.objetSocial}
                onChange={(e) => updateField('objetSocial', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activiteSecondaire">Activités secondaires</Label>
              <Textarea
                id="activiteSecondaire"
                placeholder="Activités complémentaires (optionnel)..."
                rows={2}
                value={formData.activiteSecondaire}
                onChange={(e) => updateField('activiteSecondaire', e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="dureeAnnees">Durée (années) *</Label>
                <Input
                  id="dureeAnnees"
                  type="number"
                  value={formData.dureeAnnees}
                  onChange={(e) => updateField('dureeAnnees', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateConstitution">Date de constitution *</Label>
                <Input
                  id="dateConstitution"
                  type="date"
                  value={formData.dateConstitution}
                  onChange={(e) => updateField('dateConstitution', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chiffreAffairesPrev">CA prévisionnel</Label>
                <Input
                  id="chiffreAffairesPrev"
                  placeholder="Ex: 5.000.001 FCFA"
                  value={formData.chiffreAffairesPrev}
                  onChange={(e) => updateField('chiffreAffairesPrev', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button variant="gold" onClick={nextStep}>
                Continuer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Siège social */}
      {step === 'siege' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-secondary mb-2">
              <Home className="h-5 w-5" />
              <span className="text-sm font-medium">Étape 2/5</span>
            </div>
            <CardTitle>Siège social</CardTitle>
            <CardDescription>
              Adresse complète du siège social de votre entreprise.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="adresseSiege">Adresse complète *</Label>
              <Input
                id="adresseSiege"
                placeholder="Ex: Rue des Jardins, Quartier..."
                value={formData.adresseSiege}
                onChange={(e) => updateField('adresseSiege', e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="commune">Commune *</Label>
                <Input
                  id="commune"
                  placeholder="Ex: Port-Bouet"
                  value={formData.commune}
                  onChange={(e) => updateField('commune', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ville">Ville *</Label>
                <Input
                  id="ville"
                  value={formData.ville}
                  onChange={(e) => updateField('ville', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quartier">Quartier</Label>
              <Input
                id="quartier"
                placeholder="Ex: Angré Nouveau CHU"
                value={formData.quartier || ''}
                onChange={(e) => updateField('quartier' as any, e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="lot">Lot</Label>
                <Input
                  id="lot"
                  placeholder="Ex: 461"
                  value={formData.lot}
                  onChange={(e) => updateField('lot', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ilot">Îlot</Label>
                <Input
                  id="ilot"
                  placeholder="Ex: 123"
                  value={formData.ilot}
                  onChange={(e) => updateField('ilot', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boitePostale">Boîte postale</Label>
                <Input
                  id="boitePostale"
                  placeholder="Ex: BP 1234"
                  value={formData.boitePostale}
                  onChange={(e) => updateField('boitePostale', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone fixe</Label>
                <Input
                  id="telephone"
                  placeholder="Ex: 20 21 22 23"
                  value={formData.telephone}
                  onChange={(e) => updateField('telephone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile *</Label>
                <Input
                  id="mobile"
                  placeholder="Ex: 07 08 09 10 11"
                  value={formData.mobile}
                  onChange={(e) => updateField('mobile', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@exemple.ci"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button variant="gold" onClick={nextStep}>
                Continuer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Associé unique */}
      {step === 'associe' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-secondary mb-2">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Étape 3/5</span>
            </div>
            <CardTitle>Associé unique & Gérant</CardTitle>
            <CardDescription>
              Dans une SARL Unipersonnelle, l'associé unique est généralement aussi le gérant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="associeNom">Nom *</Label>
                <Input
                  id="associeNom"
                  placeholder="Nom de famille"
                  value={formData.associeNom}
                  onChange={(e) => updateField('associeNom', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="associePrenoms">Prénom(s) *</Label>
                <Input
                  id="associePrenoms"
                  placeholder="Prénoms"
                  value={formData.associePrenoms}
                  onChange={(e) => updateField('associePrenoms', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="associeDateNaissance">Date de naissance *</Label>
                <Input
                  id="associeDateNaissance"
                  type="date"
                  value={formData.associeDateNaissance}
                  onChange={(e) => updateField('associeDateNaissance', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="associeLieuNaissance">Lieu de naissance *</Label>
                <Input
                  id="associeLieuNaissance"
                  placeholder="Ex: Abidjan"
                  value={formData.associeLieuNaissance}
                  onChange={(e) => updateField('associeLieuNaissance', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="associeNationalite">Nationalité *</Label>
                <Input
                  id="associeNationalite"
                  placeholder="Ex: Ivoirienne"
                  value={formData.associeNationalite}
                  onChange={(e) => updateField('associeNationalite', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="associeProfession">Profession *</Label>
                <Input
                  id="associeProfession"
                  placeholder="Ex: Commerçant"
                  value={formData.associeProfession}
                  onChange={(e) => updateField('associeProfession', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="associeAdresseDomicile">Adresse de domicile *</Label>
              <Input
                id="associeAdresseDomicile"
                placeholder="Ex: Cocody Angré, 7ème Tranche"
                value={formData.associeAdresseDomicile}
                onChange={(e) => updateField('associeAdresseDomicile', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="associeVilleResidence">Ville de résidence *</Label>
              <Input
                id="associeVilleResidence"
                value={formData.associeVilleResidence}
                onChange={(e) => updateField('associeVilleResidence', e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="associePereNom">Nom du père *</Label>
                <Input
                  id="associePereNom"
                  placeholder="Nom complet du père"
                  value={formData.associePereNom}
                  onChange={(e) => updateField('associePereNom', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="associeMereNom">Nom de la mère *</Label>
                <Input
                  id="associeMereNom"
                  placeholder="Nom complet de la mère"
                  value={formData.associeMereNom}
                  onChange={(e) => updateField('associeMereNom', e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-4">Pièce d'identité</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Type d'identité *</Label>
                  <Select
                    value={formData.associeTypeIdentite}
                    onValueChange={(value: 'CNI' | 'Passeport' | 'Carte de séjour' | 'Carte de résident') => updateField('associeTypeIdentite', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNI">CNI</SelectItem>
                      <SelectItem value="Passeport">Passeport</SelectItem>
                      <SelectItem value="Carte de séjour">Carte de séjour</SelectItem>
                      <SelectItem value="Carte de résident">Carte de résident</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="associeNumeroIdentite">N° d'identité *</Label>
                  <Input
                    id="associeNumeroIdentite"
                    placeholder="Ex: CI002317170"
                    value={formData.associeNumeroIdentite}
                    onChange={(e) => updateField('associeNumeroIdentite', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="associeDateDelivranceId">Date de délivrance *</Label>
                  <Input
                    id="associeDateDelivranceId"
                    type="date"
                    value={formData.associeDateDelivranceId}
                    onChange={(e) => updateField('associeDateDelivranceId', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="associeDateValiditeId">Date de validité *</Label>
                  <Input
                    id="associeDateValiditeId"
                    type="date"
                    value={formData.associeDateValiditeId}
                    onChange={(e) => updateField('associeDateValiditeId', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="associeLieuDelivranceId">Lieu de délivrance *</Label>
                  <Input
                    id="associeLieuDelivranceId"
                    placeholder="Ex: République de Côte d'Ivoire"
                    value={formData.associeLieuDelivranceId}
                    onChange={(e) => updateField('associeLieuDelivranceId', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-4">Mandat de gérant</h4>
              <div className="space-y-2">
                <Label htmlFor="gerantDureeMandat">Durée du mandat (années) *</Label>
                <Input
                  id="gerantDureeMandat"
                  type="number"
                  value={formData.gerantDureeMandat}
                  onChange={(e) => updateField('gerantDureeMandat', Number(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Généralement égale à la durée de la société (99 ans)
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button variant="gold" onClick={nextStep}>
                Continuer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Contrat de bail */}
      {step === 'bail' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-secondary mb-2">
              <FileSignature className="h-5 w-5" />
              <span className="text-sm font-medium">Étape 4/5</span>
            </div>
            <CardTitle>Contrat de bail commercial</CardTitle>
            <CardDescription>
              Informations sur le bailleur (propriétaire) et les conditions du bail.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bailleurNom">Nom du bailleur *</Label>
                <Input
                  id="bailleurNom"
                  placeholder="Nom de famille"
                  value={formData.bailleurNom}
                  onChange={(e) => updateField('bailleurNom', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bailleurPrenom">Prénom(s) *</Label>
                <Input
                  id="bailleurPrenom"
                  value={formData.bailleurPrenom}
                  onChange={(e) => updateField('bailleurPrenom', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bailleurAdresse">Adresse du bailleur *</Label>
                <Input
                  id="bailleurAdresse"
                  value={formData.bailleurAdresse}
                  onChange={(e) => updateField('bailleurAdresse', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bailleurContact">Téléphone bailleur *</Label>
                <Input
                  id="bailleurContact"
                  placeholder="Ex: 05 05 44 33 78"
                  value={formData.bailleurContact}
                  onChange={(e) => updateField('bailleurContact', e.target.value)}
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-4">Conditions financières</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="loyerMensuel">Loyer mensuel (FCFA) *</Label>
                  <Input
                    id="loyerMensuel"
                    type="number"
                    placeholder="Ex: 40000"
                    value={formData.loyerMensuel}
                    onChange={(e) => updateField('loyerMensuel', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cautionMois">Caution (mois) *</Label>
                  <Input
                    id="cautionMois"
                    type="number"
                    value={formData.cautionMois}
                    onChange={(e) => updateField('cautionMois', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avanceMois">Mois d'avance *</Label>
                  <Input
                    id="avanceMois"
                    type="number"
                    value={formData.avanceMois}
                    onChange={(e) => updateField('avanceMois', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total garantie (FCFA)</Label>
                  <Input
                    value={cautionTotal.toLocaleString()}
                    readOnly
                    className="bg-muted font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-4">Durée du bail</h4>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="dureeBailAnnees">Durée (années) *</Label>
                  <Input
                    id="dureeBailAnnees"
                    type="number"
                    value={formData.dureeBailAnnees}
                    onChange={(e) => updateField('dureeBailAnnees', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateDebutBail">Date de début *</Label>
                  <Input
                    id="dateDebutBail"
                    type="date"
                    value={formData.dateDebutBail}
                    onChange={(e) => updateField('dateDebutBail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFinBail">Date de fin *</Label>
                  <Input
                    id="dateFinBail"
                    type="date"
                    value={formData.dateFinBail}
                    onChange={(e) => updateField('dateFinBail', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button variant="gold" onClick={nextStep}>
                Voir le récapitulatif
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Récapitulatif */}
      {step === 'recap' && (
        <Card variant="gold">
          <CardHeader>
            <CardTitle>Récapitulatif - SARL Unipersonnelle</CardTitle>
            <CardDescription>
              Vérifiez les informations avant de générer vos documents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-secondary" />
                  Société
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dénomination</span>
                    <span className="font-medium">{formData.denominationSociale || '-'}</span>
                  </div>
                  {formData.sigle && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sigle</span>
                      <span className="font-medium">{formData.sigle}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capital</span>
                    <span className="font-medium">{capitalCalcule.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parts</span>
                    <span className="font-medium">{formData.nombreParts} × {formData.valeurPart.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée</span>
                    <span className="font-medium">{formData.dureeAnnees} ans</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Home className="h-4 w-4 text-secondary" />
                  Siège social
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Adresse</span>
                    <span className="font-medium text-right">{formData.adresseSiege || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ville</span>
                    <span className="font-medium">{formData.commune}, {formData.ville}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact</span>
                    <span className="font-medium">{formData.mobile}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-secondary" />
                  Associé unique / Gérant
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nom</span>
                    <span className="font-medium">{formData.associeNom} {formData.associePrenoms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Père</span>
                    <span className="font-medium">{formData.associePereNom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mère</span>
                    <span className="font-medium">{formData.associeMereNom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profession</span>
                    <span className="font-medium">{formData.associeProfession}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{formData.associeTypeIdentite}</span>
                    <span className="font-medium">{formData.associeNumeroIdentite}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mandat</span>
                    <span className="font-medium">{formData.gerantDureeMandat} ans</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileSignature className="h-4 w-4 text-secondary" />
                  Bail commercial
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bailleur</span>
                    <span className="font-medium">{formData.bailleurNom} {formData.bailleurPrenom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loyer</span>
                    <span className="font-medium">{formData.loyerMensuel.toLocaleString()} FCFA/mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Garantie</span>
                    <span className="font-medium">{cautionTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durée</span>
                    <span className="font-medium">{formData.dureeBailAnnees} an(s)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="font-semibold mb-4">Documents qui seront générés :</p>
              <div className="grid gap-2 md:grid-cols-2">
                {docs.map((doc) => (
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
                    {price.toLocaleString()} FCFA
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <Button variant="hero" size="xl" onClick={handleGenerate} disabled={isSubmitting}>
                    <Download className="h-5 w-5 mr-2" />
                    {isSubmitting ? "Traitement..." : "Générer les documents"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
