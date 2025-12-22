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

  const updateGerant = (index: number, field: keyof GerantInfo, value: string | number) => {
    const newGerants = [...formData.gerants];
    newGerants[index] = { ...newGerants[index], [field]: value };
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
      address: formData.adresseSiege,
      commune: formData.commune,
      quartier: formData.quartier,
      lot: formData.lot,
      ilot: formData.ilot,
      city: formData.ville,
      telephone: formData.telephone,
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
      associates: formData.associes.map(a => ({
        name: `${a.nom} ${a.prenoms}`,
        parts: a.nombreParts,
        profession: a.profession,
        nationalite: a.nationalite,
        dateNaissance: a.dateNaissance,
        lieuNaissance: a.lieuNaissance,
        adresse: a.adresseDomicile,
        typeIdentite: a.typeIdentite,
        numeroIdentite: a.numeroIdentite,
        dateDelivranceId: a.dateDelivranceId,
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
              <span className="text-sm font-medium">Étape 1/5</span>
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
              <span className="text-sm font-medium">Étape 2/5</span>
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
              <span className="text-sm font-medium">Étape 3/5</span>
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
              <span className="text-sm font-medium">Étape 4/5</span>
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

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`gerantNom-${index}`}>Nom *</Label>
                    <Input
                      id={`gerantNom-${index}`}
                      placeholder="Nom de famille"
                      value={gerant.nom}
                      onChange={(e) => updateGerant(index, 'nom', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantPrenoms-${index}`}>Prénom(s) *</Label>
                    <Input
                      id={`gerantPrenoms-${index}`}
                      value={gerant.prenoms}
                      onChange={(e) => updateGerant(index, 'prenoms', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantDateNaissance-${index}`}>Date de naissance *</Label>
                    <Input
                      id={`gerantDateNaissance-${index}`}
                      type="date"
                      value={gerant.dateNaissance}
                      onChange={(e) => updateGerant(index, 'dateNaissance', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantLieuNaissance-${index}`}>Lieu de naissance *</Label>
                    <Input
                      id={`gerantLieuNaissance-${index}`}
                      value={gerant.lieuNaissance}
                      onChange={(e) => updateGerant(index, 'lieuNaissance', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantNationalite-${index}`}>Nationalité *</Label>
                    <Input
                      id={`gerantNationalite-${index}`}
                      value={gerant.nationalite}
                      onChange={(e) => updateGerant(index, 'nationalite', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantProfession-${index}`}>Profession *</Label>
                    <Input
                      id={`gerantProfession-${index}`}
                      placeholder="Ex: Commerçant"
                      value={gerant.profession}
                      onChange={(e) => updateGerant(index, 'profession', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantAdresse-${index}`}>Adresse domicile *</Label>
                    <Input
                      id={`gerantAdresse-${index}`}
                      value={gerant.adresse}
                      onChange={(e) => updateGerant(index, 'adresse', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type d'identité *</Label>
                    <Select
                      value={gerant.typeIdentite}
                      onValueChange={(value: 'CNI' | 'Passeport') => updateGerant(index, 'typeIdentite', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CNI">CNI</SelectItem>
                        <SelectItem value="Passeport">Passeport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantNumeroIdentite-${index}`}>N° d'identité *</Label>
                    <Input
                      id={`gerantNumeroIdentite-${index}`}
                      value={gerant.numeroIdentite}
                      onChange={(e) => updateGerant(index, 'numeroIdentite', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantDateDelivranceId-${index}`}>Date de délivrance *</Label>
                    <Input
                      id={`gerantDateDelivranceId-${index}`}
                      type="date"
                      value={gerant.dateDelivranceId}
                      onChange={(e) => updateGerant(index, 'dateDelivranceId', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantDateValiditeId-${index}`}>Date de validité *</Label>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantPereNom-${index}`}>Nom et Prénoms du Père</Label>
                    <Input
                      id={`gerantPereNom-${index}`}
                      value={gerant.pereNom}
                      onChange={(e) => updateGerant(index, 'pereNom', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`gerantMereNom-${index}`}>Nom et Prénoms de la Mère</Label>
                    <Input
                      id={`gerantMereNom-${index}`}
                      value={gerant.mereNom}
                      onChange={(e) => updateGerant(index, 'mereNom', e.target.value)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-semibold mb-4">Durée du mandat</h4>
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
