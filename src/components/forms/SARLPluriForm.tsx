import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  SARLPluriFormData, 
  SARLPluriStep, 
  sarlPluriSteps, 
  defaultSARLPluriFormData,
  defaultAssocieInfo,
  AssocieInfo,
  GerantInfo,
  defaultGerantInfo
} from "@/lib/sarl-pluri-types";
import { 
  ArrowRight, 
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Download,
  CheckCircle2,
  Building2,
  Users,
  User,
  Home
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import { createCompanyApi, generateDocumentsApi } from "@/lib/api";

interface SARLPluriFormProps {
  onBack: () => void;
  price: number;
  docs: string[];
  companyTypeName: string;
}

export function SARLPluriForm({ onBack, price, docs, companyTypeName }: SARLPluriFormProps) {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const [step, setStep] = useState<SARLPluriStep>('societe');
  const [formData, setFormData] = useState<SARLPluriFormData>(defaultSARLPluriFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepIndex = sarlPluriSteps.findIndex(s => s.id === step);

  const updateField = <K extends keyof SARLPluriFormData>(field: K, value: SARLPluriFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAssocie = (index: number, field: keyof AssocieInfo, value: string | number) => {
    const newAssocies = [...formData.associes];
    newAssocies[index] = { ...newAssocies[index], [field]: value };
    // Calculer l'apport automatiquement
    if (field === 'nombreParts' || field === 'valeurParts') {
      newAssocies[index].apportNumeraire = newAssocies[index].nombreParts * newAssocies[index].valeurParts;
    }
    setFormData(prev => ({ ...prev, associes: newAssocies }));
  };

  const addAssocie = () => {
    const newAssocie: AssocieInfo = { 
      ...defaultAssocieInfo, 
      id: String(formData.associes.length + 1) 
    };
    setFormData(prev => ({ ...prev, associes: [...prev.associes, newAssocie] }));
  };

  const removeAssocie = (index: number) => {
    if (formData.associes.length > 2) {
      setFormData(prev => ({ 
        ...prev, 
        associes: prev.associes.filter((_, i) => i !== index) 
      }));
    } else {
      toast.error("Une SARL Pluripersonnelle nécessite au minimum 2 associés");
    }
  };

  const updateGerant = (index: number, field: keyof GerantInfo, value: string | number | boolean) => {
    const newGerants = [...formData.gerants];
    newGerants[index] = { ...newGerants[index], [field]: value };
    setFormData(prev => ({ ...prev, gerants: newGerants }));
  };

  // Fonction pour sélectionner un associé comme gérant
  const selectAssociateAsGerant = (gerantIndex: number, associateId: string) => {
    const newGerants = [...formData.gerants];
    
    if (associateId === 'manual') {
      // Saisie manuelle - réinitialiser le gérant
      newGerants[gerantIndex] = {
        ...defaultGerantInfo,
        id: newGerants[gerantIndex].id,
        isFromAssociate: false,
        associateId: undefined,
      };
    } else {
      // Sélectionner un associé
      const associe = formData.associes.find(a => a.id === associateId);
      if (associe) {
        newGerants[gerantIndex] = {
          ...newGerants[gerantIndex],
          isFromAssociate: true,
          associateId: associateId,
          nom: associe.nom,
          prenoms: associe.prenoms,
          dateNaissance: associe.dateNaissance,
          lieuNaissance: associe.lieuNaissance,
          nationalite: associe.nationalite,
          profession: associe.profession,
          adresse: associe.adresseDomicile,
          typeIdentite: associe.typeIdentite,
          numeroIdentite: associe.numeroIdentite,
          dateDelivranceId: associe.dateDelivranceId,
          lieuDelivranceId: associe.lieuDelivranceId,
          // Les champs spécifiques au gérant restent à remplir
          dateValiditeId: newGerants[gerantIndex].dateValiditeId || '',
          pereNom: newGerants[gerantIndex].pereNom || '',
          mereNom: newGerants[gerantIndex].mereNom || '',
          dureeMandat: newGerants[gerantIndex].dureeMandat || 'indeterminee',
          dureeMandatAnnees: newGerants[gerantIndex].dureeMandatAnnees,
        };
      }
    }
    
    setFormData(prev => ({ ...prev, gerants: newGerants }));
  };

  const addGerant = () => {
    const newGerant: GerantInfo = { 
      ...defaultGerantInfo, 
      id: String(formData.gerants.length + 1) 
    };
    setFormData(prev => ({ ...prev, gerants: [...prev.gerants, newGerant] }));
  };

  const removeGerant = (index: number) => {
    if (formData.gerants.length > 1) {
      setFormData(prev => ({ 
        ...prev, 
        gerants: prev.gerants.filter((_, i) => i !== index) 
      }));
    } else {
      toast.error("Il faut au moins un gérant");
    }
  };

  const nextStep = () => {
    const currentIndex = sarlPluriSteps.findIndex(s => s.id === step);
    if (currentIndex < sarlPluriSteps.length - 1) {
      setStep(sarlPluriSteps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = sarlPluriSteps.findIndex(s => s.id === step);
    if (currentIndex > 0) {
      setStep(sarlPluriSteps[currentIndex - 1].id);
    } else {
      onBack();
    }
  };

  const handleGenerate = async () => {
    const mainManager = formData.gerants[0];
    const gerantName = `${mainManager.nom} ${mainManager.prenoms}`;

    const payload = {
      companyType: 'SARL_PLURI',
      companyName: formData.denominationSociale,
      sigle: formData.sigle,
      activity: formData.objetSocial,
      capital: formData.capitalSocial,
      capitalEnLettres: formData.capitalEnLettres,
      duree_societe: formData.dureeAnnees,
      date_constitution: formData.dateConstitution,
      banque: formData.banque,
      address: formData.adresseSiege,
      commune: formData.commune,
      quartier: formData.quartier,
      lot: formData.lot,
      ilot: formData.ilot,
      nomImmeuble: formData.nomImmeuble,
      numeroEtage: formData.numeroEtage,
      numeroPorte: formData.numeroPorte,
      section: formData.section,
      parcelle: formData.parcelle,
      tfNumero: formData.tfNumero,
      city: formData.ville,
      telephone: formData.telephone,
      fax: formData.fax,
      adressePostale: formData.adressePostale,
      email: formData.email,
      boitePostale: formData.boitePostale,
      gerant: gerantName,
      paymentAmount: price,
      chiffreAffairesPrev: formData.chiffreAffairesPrev,
      // Informations du bailleur
      bailleur: {
        nom: formData.bailleurNom,
        prenom: formData.bailleurPrenom,
        adresse: formData.bailleurAdresse,
        telephone: formData.bailleurContact,
        loyerMensuel: formData.loyerMensuel,
        cautionMois: formData.cautionMois,
        dureeBailAnnees: formData.dureeBailAnnees
      },
      // Informations du déclarant
      declarant: {
        nom: formData.declarantNom,
        qualite: formData.declarantQualite,
        adresse: formData.declarantAdresse,
        telephone: formData.declarantTelephone,
        fax: formData.declarantFax,
        mobile: formData.declarantMobile,
        email: formData.declarantEmail
      },
      // Projections sur 3 ans
      projections: {
        investissementAnnee1: formData.investissementAnnee1,
        investissementAnnee2: formData.investissementAnnee2,
        investissementAnnee3: formData.investissementAnnee3,
        emploisAnnee1: formData.emploisAnnee1,
        emploisAnnee2: formData.emploisAnnee2,
        emploisAnnee3: formData.emploisAnnee3
      },
      associates: formData.associes.map(a => ({
        name: `${a.nom} ${a.prenoms}`,
        nom: a.nom,
        prenoms: a.prenoms,
        parts: a.nombreParts,
        profession: a.profession,
        nationalite: a.nationalite,
        dateNaissance: a.dateNaissance,
        lieuNaissance: a.lieuNaissance,
        adresseDomicile: a.adresseDomicile,
        adresse: a.adresseDomicile,
        typeIdentite: a.typeIdentite,
        numeroIdentite: a.numeroIdentite,
        dateDelivranceId: a.dateDelivranceId,
        dateValiditeId: a.dateValiditeId,
        lieuDelivranceId: a.lieuDelivranceId
      })),
      managers: formData.gerants.map((g, idx) => ({
        nom: g.nom,
        prenoms: g.prenoms,
        dateNaissance: g.dateNaissance,
        lieuNaissance: g.lieuNaissance,
        nationalite: g.nationalite,
        profession: g.profession,
        adresse: g.adresse,
        typeIdentite: g.typeIdentite,
        numeroIdentite: g.numeroIdentite,
        dateDelivranceId: g.dateDelivranceId,
        dateValiditeId: g.dateValiditeId,
        lieuDelivranceId: g.lieuDelivranceId,
        pereNom: g.pereNom,
        mereNom: g.mereNom,
        dureeMandat: g.dureeMandat === 'determinee' ? `${g.dureeMandatAnnees} ans` : 'Durée indéterminée',
        dureeMandatAnnees: g.dureeMandatAnnees,
        isMain: idx === 0
      })),
      docs: docs,
      companyTypeName: companyTypeName
    };

    // Navigate to preview page with all data
    navigate("/preview-documents", {
      state: {
        formData,
        companyType: 'SARL_PLURI',
        payload,
        price,
        docs,
        companyTypeName
      }
    });
  };

  const totalParts = formData.associes.reduce((sum, a) => sum + (a.nombreParts || 0), 0);
  const totalCapital = formData.associes.reduce((sum, a) => sum + (a.apportNumeraire || 0), 0);

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
          {sarlPluriSteps.map((s, index) => (
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
              {index < sarlPluriSteps.length - 1 && (
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
              <span className="text-sm font-medium">Étape 1/6</span>
            </div>
            <CardTitle>Informations de la société</CardTitle>
            <CardDescription>
              Renseignez les informations principales de votre SARL Pluripersonnelle.
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
                <Label htmlFor="sigle">Sigle (optionnel)</Label>
                <Input
                  id="sigle"
                  placeholder="Ex: ABS"
                  value={formData.sigle}
                  onChange={(e) => updateField('sigle', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="capitalSocial">Capital social (FCFA) *</Label>
                <Input
                  id="capitalSocial"
                  type="number"
                  placeholder="1000000"
                  value={formData.capitalSocial}
                  onChange={(e) => updateField('capitalSocial', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capitalEnLettres">Capital en lettres *</Label>
                <Input
                  id="capitalEnLettres"
                  placeholder="Un million de francs CFA"
                  value={formData.capitalEnLettres}
                  onChange={(e) => updateField('capitalEnLettres', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objetSocial">Objet social (activité) *</Label>
              <Textarea
                id="objetSocial"
                placeholder="Décrivez l'activité principale de votre entreprise..."
                rows={3}
                value={formData.objetSocial}
                onChange={(e) => updateField('objetSocial', e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="banque">Banque (dépôt du capital) *</Label>
                <Input
                  id="banque"
                  placeholder="Ex: NSIA BANQUE, SGBCI, BICICI..."
                  value={formData.banque}
                  onChange={(e) => updateField('banque', e.target.value)}
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dureeAnnees">Durée de la société (années) *</Label>
                <Input
                  id="dureeAnnees"
                  type="number"
                  value={formData.dureeAnnees}
                  onChange={(e) => updateField('dureeAnnees', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chiffreAffairesPrev">CA Prévisionnel</Label>
                <Input
                  id="chiffreAffairesPrev"
                  placeholder="Ex: 5.000.000 FCFA"
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

      {/* Step 2: Siège & Bail */}
      {step === 'siege' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-secondary mb-2">
              <Home className="h-5 w-5" />
              <span className="text-sm font-medium">Étape 2/6</span>
            </div>
            <CardTitle>Siège social & Contrat de bail</CardTitle>
            <CardDescription>
              Informations sur le siège social et le bailleur pour le contrat de bail commercial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-4">Siège social</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="adresseSiege">Adresse complète *</Label>
                  <Input
                    id="adresseSiege"
                    placeholder="Ex: Rue des Jardins, Cocody"
                    value={formData.adresseSiege}
                    onChange={(e) => updateField('adresseSiege', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="commune">Commune *</Label>
                  <Input
                    id="commune"
                    placeholder="Ex: Cocody"
                    value={formData.commune}
                    onChange={(e) => updateField('commune', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quartier">Quartier *</Label>
                  <Input
                    id="quartier"
                    placeholder="Ex: Angré"
                    value={formData.quartier}
                    onChange={(e) => updateField('quartier', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lot">Lot n°</Label>
                  <Input
                    id="lot"
                    placeholder="Ex: 123"
                    value={formData.lot}
                    onChange={(e) => updateField('lot', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ilot">Îlot n°</Label>
                  <Input
                    id="ilot"
                    placeholder="Ex: 45"
                    value={formData.ilot}
                    onChange={(e) => updateField('ilot', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomImmeuble">Nom immeuble</Label>
                  <Input
                    id="nomImmeuble"
                    placeholder="Ex: Immeuble ABC"
                    value={formData.nomImmeuble}
                    onChange={(e) => updateField('nomImmeuble', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroEtage">Numéro étage</Label>
                  <Input
                    id="numeroEtage"
                    placeholder="Ex: 2ème"
                    value={formData.numeroEtage}
                    onChange={(e) => updateField('numeroEtage', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroPorte">Numéro porte</Label>
                  <Input
                    id="numeroPorte"
                    placeholder="Ex: 12"
                    value={formData.numeroPorte}
                    onChange={(e) => updateField('numeroPorte', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    placeholder="Ex: A"
                    value={formData.section}
                    onChange={(e) => updateField('section', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parcelle">Parcelle</Label>
                  <Input
                    id="parcelle"
                    placeholder="Ex: 123"
                    value={formData.parcelle}
                    onChange={(e) => updateField('parcelle', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tfNumero">TF n°</Label>
                  <Input
                    id="tfNumero"
                    placeholder="Ex: 12345"
                    value={formData.tfNumero}
                    onChange={(e) => updateField('tfNumero', e.target.value)}
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
                <div className="space-y-2">
                  <Label htmlFor="boitePostale">Boîte postale</Label>
                  <Input
                    id="boitePostale"
                    placeholder="Ex: BP 1234"
                    value={formData.boitePostale}
                    onChange={(e) => updateField('boitePostale', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone *</Label>
                  <Input
                    id="telephone"
                    placeholder="Ex: 0707070707"
                    value={formData.telephone}
                    onChange={(e) => updateField('telephone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fax">Fax</Label>
                  <Input
                    id="fax"
                    placeholder="Ex: 0707070708"
                    value={formData.fax}
                    onChange={(e) => updateField('fax', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adressePostale">Adresse postale</Label>
                  <Input
                    id="adressePostale"
                    placeholder="Ex: 01 BP 1234 Abidjan 01"
                    value={formData.adressePostale}
                    onChange={(e) => updateField('adressePostale', e.target.value)}
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
            </div>

            <div>
              <h3 className="font-semibold mb-4">Bailleur (Propriétaire)</h3>
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
                <div className="space-y-2">
                  <Label htmlFor="bailleurAdresse">Adresse du bailleur *</Label>
                  <Input
                    id="bailleurAdresse"
                    value={formData.bailleurAdresse}
                    onChange={(e) => updateField('bailleurAdresse', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bailleurContact">Contact bailleur *</Label>
                  <Input
                    id="bailleurContact"
                    placeholder="Téléphone"
                    value={formData.bailleurContact}
                    onChange={(e) => updateField('bailleurContact', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="loyerMensuel">Loyer mensuel (FCFA) *</Label>
                  <Input
                    id="loyerMensuel"
                    type="number"
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
                  <Label htmlFor="dureeBailAnnees">Durée du bail (années) *</Label>
                  <Input
                    id="dureeBailAnnees"
                    type="number"
                    value={formData.dureeBailAnnees}
                    onChange={(e) => updateField('dureeBailAnnees', Number(e.target.value))}
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
                Continuer
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Associés */}
      {step === 'associes' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-secondary mb-2">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Étape 3/6</span>
            </div>
            <CardTitle>Associés ({formData.associes.length})</CardTitle>
            <CardDescription>
              Renseignez les informations de chaque associé. Minimum 2 associés requis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.associes.map((associe, index) => (
              <div key={associe.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Associé {index + 1}</h4>
                  {formData.associes.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => removeAssocie(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nom *</Label>
                    <Input
                      placeholder="Nom de famille"
                      value={associe.nom}
                      onChange={(e) => updateAssocie(index, 'nom', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prénom(s) *</Label>
                    <Input
                      placeholder="Prénoms"
                      value={associe.prenoms}
                      onChange={(e) => updateAssocie(index, 'prenoms', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de naissance *</Label>
                    <Input
                      type="date"
                      value={associe.dateNaissance}
                      onChange={(e) => updateAssocie(index, 'dateNaissance', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lieu de naissance *</Label>
                    <Input
                      value={associe.lieuNaissance}
                      onChange={(e) => updateAssocie(index, 'lieuNaissance', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nationalité *</Label>
                    <Input
                      value={associe.nationalite}
                      onChange={(e) => updateAssocie(index, 'nationalite', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Profession *</Label>
                    <Input
                      value={associe.profession}
                      onChange={(e) => updateAssocie(index, 'profession', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Adresse domicile *</Label>
                    <Input
                      value={associe.adresseDomicile}
                      onChange={(e) => updateAssocie(index, 'adresseDomicile', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type d'identité *</Label>
                    <Select
                      value={associe.typeIdentite}
                      onValueChange={(value) => updateAssocie(index, 'typeIdentite', value)}
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
                    <Label>N° d'identité *</Label>
                    <Input
                      value={associe.numeroIdentite}
                      onChange={(e) => updateAssocie(index, 'numeroIdentite', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de délivrance *</Label>
                    <Input
                      type="date"
                      value={associe.dateDelivranceId}
                      onChange={(e) => updateAssocie(index, 'dateDelivranceId', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de validité *</Label>
                    <Input
                      type="date"
                      value={associe.dateValiditeId}
                      onChange={(e) => updateAssocie(index, 'dateValiditeId', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Lieu de délivrance *</Label>
                    <Input
                      value={associe.lieuDelivranceId}
                      onChange={(e) => updateAssocie(index, 'lieuDelivranceId', e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h5 className="text-sm font-medium mb-3">Parts sociales</h5>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Nombre de parts *</Label>
                      <Input
                        type="number"
                        value={associe.nombreParts}
                        onChange={(e) => updateAssocie(index, 'nombreParts', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Valeur par part (FCFA) *</Label>
                      <Input
                        type="number"
                        value={associe.valeurParts}
                        onChange={(e) => updateAssocie(index, 'valeurParts', Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Apport total (FCFA)</Label>
                      <Input
                        type="number"
                        value={associe.apportNumeraire}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addAssocie} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un associé
            </Button>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Total des parts :</span>
                <span className="font-semibold">{totalParts} parts</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Capital total :</span>
                <span className="font-semibold">{totalCapital.toLocaleString()} FCFA</span>
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

      {/* Step 4: Gérants */}
      {step === 'gerant' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-secondary mb-2">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Étape 4/6</span>
            </div>
            <CardTitle>Gérance de la société</CardTitle>
            <CardDescription>
              Renseignez les informations des gérants (représentants légaux).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.gerants.map((gerant, index) => (
              <div key={gerant.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Gérant {index + 1}</h4>
                  {formData.gerants.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => removeGerant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Sélection de la source du gérant */}
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <Label className="text-sm font-medium">Source des informations du gérant</Label>
                  <Select
                    value={gerant.isFromAssociate ? gerant.associateId : 'manual'}
                    onValueChange={(value) => selectAssociateAsGerant(index, value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choisir la source..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Saisie manuelle (gérant externe)
                        </div>
                      </SelectItem>
                      {formData.associes.map((associe) => (
                        <SelectItem key={associe.id} value={associe.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {associe.nom} {associe.prenoms} (Associé)
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {gerant.isFromAssociate && (
                    <p className="text-xs text-muted-foreground">
                      ✓ Les informations de base ont été copiées depuis l'associé. Complétez les champs supplémentaires ci-dessous.
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`gerantNom-${index}`}>Nom *</Label>
                    <Input
                      id={`gerantNom-${index}`}
                      placeholder="Nom de famille"
                      value={gerant.nom}
                      onChange={(e) => updateGerant(index, 'nom', e.target.value)}
                      disabled={gerant.isFromAssociate}
                      className={gerant.isFromAssociate ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantPrenoms-${index}`}>Prénom(s) *</Label>
                    <Input
                      id={`gerantPrenoms-${index}`}
                      value={gerant.prenoms}
                      onChange={(e) => updateGerant(index, 'prenoms', e.target.value)}
                      disabled={gerant.isFromAssociate}
                      className={gerant.isFromAssociate ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantDateNaissance-${index}`}>Date de naissance *</Label>
                    <Input
                      id={`gerantDateNaissance-${index}`}
                      type="date"
                      value={gerant.dateNaissance}
                      onChange={(e) => updateGerant(index, 'dateNaissance', e.target.value)}
                      disabled={gerant.isFromAssociate}
                      className={gerant.isFromAssociate ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantLieuNaissance-${index}`}>Lieu de naissance *</Label>
                    <Input
                      id={`gerantLieuNaissance-${index}`}
                      value={gerant.lieuNaissance}
                      onChange={(e) => updateGerant(index, 'lieuNaissance', e.target.value)}
                      disabled={gerant.isFromAssociate}
                      className={gerant.isFromAssociate ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantNationalite-${index}`}>Nationalité *</Label>
                    <Input
                      id={`gerantNationalite-${index}`}
                      value={gerant.nationalite}
                      onChange={(e) => updateGerant(index, 'nationalite', e.target.value)}
                      disabled={gerant.isFromAssociate}
                      className={gerant.isFromAssociate ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantProfession-${index}`}>Profession *</Label>
                    <Input
                      id={`gerantProfession-${index}`}
                      placeholder="Ex: Commerçant"
                      value={gerant.profession}
                      onChange={(e) => updateGerant(index, 'profession', e.target.value)}
                      disabled={gerant.isFromAssociate}
                      className={gerant.isFromAssociate ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantAdresse-${index}`}>Adresse domicile *</Label>
                    <Input
                      id={`gerantAdresse-${index}`}
                      value={gerant.adresse}
                      onChange={(e) => updateGerant(index, 'adresse', e.target.value)}
                      disabled={gerant.isFromAssociate}
                      className={gerant.isFromAssociate ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type d'identité *</Label>
                    <Select
                      value={gerant.typeIdentite}
                      onValueChange={(value: 'CNI' | 'Passeport' | 'Carte de séjour' | 'Carte de résident') => updateGerant(index, 'typeIdentite', value)}
                      disabled={gerant.isFromAssociate}
                    >
                      <SelectTrigger className={gerant.isFromAssociate ? "bg-muted" : ""}>
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
                    <Label htmlFor={`gerantNumeroIdentite-${index}`}>N° d'identité *</Label>
                    <Input
                      id={`gerantNumeroIdentite-${index}`}
                      value={gerant.numeroIdentite}
                      onChange={(e) => updateGerant(index, 'numeroIdentite', e.target.value)}
                      disabled={gerant.isFromAssociate}
                      className={gerant.isFromAssociate ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantDateDelivranceId-${index}`}>Date de délivrance *</Label>
                    <Input
                      id={`gerantDateDelivranceId-${index}`}
                      type="date"
                      value={gerant.dateDelivranceId}
                      onChange={(e) => updateGerant(index, 'dateDelivranceId', e.target.value)}
                      disabled={gerant.isFromAssociate}
                      className={gerant.isFromAssociate ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantDateValiditeId-${index}`}>Date de validité * <span className="text-xs text-amber-600">(à compléter)</span></Label>
                    <Input
                      id={`gerantDateValiditeId-${index}`}
                      type="date"
                      value={gerant.dateValiditeId}
                      onChange={(e) => updateGerant(index, 'dateValiditeId', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantLieuDelivranceId-${index}`}>Lieu de délivrance *</Label>
                    <Input
                      id={`gerantLieuDelivranceId-${index}`}
                      value={gerant.lieuDelivranceId}
                      onChange={(e) => updateGerant(index, 'lieuDelivranceId', e.target.value)}
                      disabled={gerant.isFromAssociate}
                      className={gerant.isFromAssociate ? "bg-muted" : ""}
                    />
                  </div>
                </div>

                {/* Champs spécifiques au gérant (toujours modifiables) */}
                <div className="border-t pt-4 mt-4">
                  <h5 className="text-sm font-medium mb-3 text-amber-700">Informations complémentaires du gérant (à remplir)</h5>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`gerantPereNom-${index}`}>Nom et Prénoms du Père *</Label>
                      <Input
                        id={`gerantPereNom-${index}`}
                        placeholder="Ex: KOUASSI Jean-Baptiste"
                        value={gerant.pereNom}
                        onChange={(e) => updateGerant(index, 'pereNom', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`gerantMereNom-${index}`}>Nom et Prénoms de la Mère *</Label>
                      <Input
                        id={`gerantMereNom-${index}`}
                        placeholder="Ex: KOFFI Marie-Claire"
                        value={gerant.mereNom}
                        onChange={(e) => updateGerant(index, 'mereNom', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Durée du mandat */}
                <div className="border-t pt-4 mt-4">
                  <h5 className="text-sm font-medium mb-3">Durée du mandat</h5>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Type de mandat *</Label>
                      <Select
                        value={gerant.dureeMandat}
                        onValueChange={(value: 'determinee' | 'indeterminee') => updateGerant(index, 'dureeMandat', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indeterminee">Durée indéterminée</SelectItem>
                          <SelectItem value="determinee">Durée déterminée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {gerant.dureeMandat === 'determinee' && (
                      <div className="space-y-2">
                        <Label>Durée (années) *</Label>
                        <Input
                          type="number"
                          value={gerant.dureeMandatAnnees || ''}
                          onChange={(e) => updateGerant(index, 'dureeMandatAnnees', Number(e.target.value))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addGerant} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un gérant
            </Button>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button variant="gold" onClick={nextStep}>
                Continuer vers CEPICI
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: CEPICI - Déclarant & Projections */}
      {step === 'cepici' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-secondary mb-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">Étape 5/6</span>
            </div>
            <CardTitle>Formulaire CEPICI</CardTitle>
            <CardDescription>
              Informations pour le déclarant et projections sur 3 ans.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-4">Déclarant responsable</h3>
              
              {/* Sélecteur pour pré-remplir avec un associé ou gérant */}
              <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <Label className="text-sm font-medium mb-2 block">Pré-remplir avec un associé ou gérant</Label>
                <Select
                  onValueChange={(value) => {
                    if (value === 'manual') return;
                    
                    // Chercher dans les associés
                    const assoc = formData.associes.find(a => a.id === value);
                    if (assoc) {
                      setFormData(prev => ({
                        ...prev,
                        declarantNom: `${assoc.nom} ${assoc.prenoms}`,
                        declarantQualite: 'ASSOCIÉ',
                        declarantAdresse: assoc.adresseDomicile,
                        declarantMobile: '',
                        declarantEmail: ''
                      }));
                      return;
                    }
                    
                    // Chercher dans les gérants
                    const gerant = formData.gerants.find(g => g.id === value);
                    if (gerant) {
                      setFormData(prev => ({
                        ...prev,
                        declarantNom: `${gerant.nom} ${gerant.prenoms}`,
                        declarantQualite: 'GÉRANT',
                        declarantAdresse: gerant.adresse,
                        declarantMobile: '',
                        declarantEmail: ''
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une personne..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Saisie manuelle</SelectItem>
                    {formData.associes.length > 0 && (
                      <>
                        <SelectItem value="__group_associes" disabled className="font-semibold text-xs text-muted-foreground">— Associés —</SelectItem>
                        {formData.associes.map((assoc) => (
                          <SelectItem key={`assoc-${assoc.id}`} value={assoc.id}>
                            {assoc.nom} {assoc.prenoms} (Associé)
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {formData.gerants.length > 0 && (
                      <>
                        <SelectItem value="__group_gerants" disabled className="font-semibold text-xs text-muted-foreground">— Gérants —</SelectItem>
                        {formData.gerants.map((gerant) => (
                          <SelectItem key={`gerant-${gerant.id}`} value={gerant.id}>
                            {gerant.nom} {gerant.prenoms} (Gérant)
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="declarantNom">Nom complet *</Label>
                  <Input
                    id="declarantNom"
                    placeholder="Ex: KOUACOU HARRISON"
                    value={formData.declarantNom}
                    onChange={(e) => updateField('declarantNom', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declarantQualite">Qualité *</Label>
                  <Input
                    id="declarantQualite"
                    placeholder="Ex: CONSULTANT COMPTABLE"
                    value={formData.declarantQualite}
                    onChange={(e) => updateField('declarantQualite', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="declarantAdresse">Adresse personnelle *</Label>
                  <Input
                    id="declarantAdresse"
                    placeholder="Ex: COCODY RIVIERA (ABIDJAN)"
                    value={formData.declarantAdresse}
                    onChange={(e) => updateField('declarantAdresse', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declarantTelephone">Téléphone</Label>
                  <Input
                    id="declarantTelephone"
                    placeholder="Ex: 20 21 22 23"
                    value={formData.declarantTelephone}
                    onChange={(e) => updateField('declarantTelephone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declarantMobile">Mobile *</Label>
                  <Input
                    id="declarantMobile"
                    placeholder="Ex: +225 01 51 25 29 99"
                    value={formData.declarantMobile}
                    onChange={(e) => updateField('declarantMobile', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declarantFax">Fax</Label>
                  <Input
                    id="declarantFax"
                    placeholder="Ex: 20 21 22 24"
                    value={formData.declarantFax}
                    onChange={(e) => updateField('declarantFax', e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="declarantEmail">E-mail *</Label>
                  <Input
                    id="declarantEmail"
                    type="email"
                    placeholder="Ex: archexcellence18@gmail.com"
                    value={formData.declarantEmail}
                    onChange={(e) => updateField('declarantEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-b pb-4 mb-4">
              <h3 className="font-semibold mb-4">Projections sur 3 ans</h3>
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Montant d'Investissement (projeté)</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="investissementAnnee1">Année 1 (FCFA)</Label>
                    <Input
                      id="investissementAnnee1"
                      type="number"
                      placeholder="0"
                      value={formData.investissementAnnee1}
                      onChange={(e) => updateField('investissementAnnee1', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="investissementAnnee2">Année 2 (FCFA)</Label>
                    <Input
                      id="investissementAnnee2"
                      type="number"
                      placeholder="0"
                      value={formData.investissementAnnee2}
                      onChange={(e) => updateField('investissementAnnee2', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="investissementAnnee3">Année 3 (FCFA)</Label>
                    <Input
                      id="investissementAnnee3"
                      type="number"
                      placeholder="0"
                      value={formData.investissementAnnee3}
                      onChange={(e) => updateField('investissementAnnee3', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <h4 className="text-sm font-medium text-muted-foreground">Nombre d'Emplois (projetés)</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="emploisAnnee1">Année 1</Label>
                    <Input
                      id="emploisAnnee1"
                      type="number"
                      placeholder="0"
                      value={formData.emploisAnnee1}
                      onChange={(e) => updateField('emploisAnnee1', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emploisAnnee2">Année 2</Label>
                    <Input
                      id="emploisAnnee2"
                      type="number"
                      placeholder="0"
                      value={formData.emploisAnnee2}
                      onChange={(e) => updateField('emploisAnnee2', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emploisAnnee3">Année 3</Label>
                    <Input
                      id="emploisAnnee3"
                      type="number"
                      placeholder="0"
                      value={formData.emploisAnnee3}
                      onChange={(e) => updateField('emploisAnnee3', Number(e.target.value))}
                    />
                  </div>
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

      {/* Step 6: Récapitulatif */}
      {step === 'recap' && (
        <Card variant="gold">
          <CardHeader>
            <CardTitle>Récapitulatif - SARL Pluripersonnelle</CardTitle>
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capital</span>
                    <span className="font-medium">{formData.capitalSocial.toLocaleString()} FCFA</span>
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
                    <span className="font-medium">{formData.adresseSiege || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ville</span>
                    <span className="font-medium">{formData.commune}, {formData.ville}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loyer</span>
                    <span className="font-medium">{formData.loyerMensuel.toLocaleString()} FCFA/mois</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-secondary" />
                  Associés ({formData.associes.length})
                </h4>
                <div className="space-y-2 text-sm">
                  {formData.associes.map((a, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-muted-foreground">{a.nom} {a.prenoms}</span>
                      <span className="font-medium">{a.nombreParts} parts</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-secondary" />
                  Gérance ({formData.gerants.length})
                </h4>
                <div className="space-y-2 text-sm">
                  {formData.gerants.map((g, i) => (
                    <div key={g.id} className="border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between font-medium text-secondary">
                        <span>Gérant {i + 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nom</span>
                        <span className="font-medium">{g.nom} {g.prenoms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mandat</span>
                        <span className="font-medium">
                          {g.dureeMandat === 'indeterminee' 
                            ? 'Durée indéterminée' 
                            : `${g.dureeMandatAnnees} ans`}
                        </span>
                      </div>
                    </div>
                  ))}
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
