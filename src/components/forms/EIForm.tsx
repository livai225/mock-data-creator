import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, FileText, User, Building2, MapPin, FileSignature, CheckCircle2, Home } from "lucide-react";
import { EIFormData, EIStep, eiSteps, defaultEIFormData } from "@/lib/ei-types";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";

interface EIFormProps {
  onBack: () => void;
  price: number;
  docs: string[];
  companyTypeName: string;
}

const EI_DRAFT_KEY = 'ei_form_draft';
const EI_STEP_KEY = 'ei_form_step';

export function EIForm({ onBack, price, docs, companyTypeName }: EIFormProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<EIFormData>(() => {
    try {
      const saved = localStorage.getItem(EI_DRAFT_KEY);
      if (saved) return { ...defaultEIFormData, ...JSON.parse(saved) };
    } catch {}
    return defaultEIFormData;
  });

  const [step, setStep] = useState<EIStep>(() => {
    try {
      const saved = localStorage.getItem(EI_STEP_KEY);
      if (saved && eiSteps.find(s => s.id === saved)) return saved as EIStep;
    } catch {}
    return 'proprietaire';
  });

  const [showDraftBanner, setShowDraftBanner] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(EI_DRAFT_KEY);
      if (saved) return !!JSON.parse(saved).proprietaireNom?.trim();
    } catch {}
    return false;
  });

  // Sauvegarde automatique à chaque changement
  useEffect(() => {
    try { localStorage.setItem(EI_DRAFT_KEY, JSON.stringify(formData)); } catch {}
  }, [formData]);

  useEffect(() => {
    try { localStorage.setItem(EI_STEP_KEY, step); } catch {}
  }, [step]);

  const clearDraft = () => {
    localStorage.removeItem(EI_DRAFT_KEY);
    localStorage.removeItem(EI_STEP_KEY);
    setFormData(defaultEIFormData);
    setStep('proprietaire');
    setShowDraftBanner(false);
  };

  const updateField = <K extends keyof EIFormData>(field: K, value: EIFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentIndex = eiSteps.findIndex(s => s.id === step);

  const handleNext = () => {
    if (currentIndex < eiSteps.length - 1) {
      setStep(eiSteps[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setStep(eiSteps[currentIndex - 1].id);
    } else {
      onBack();
    }
  };

  const handleGenerate = () => {
    if (!formData.proprietaireNom || !formData.proprietairePrenoms) {
      toast.error("Veuillez renseigner le nom et prénom du propriétaire");
      return;
    }
    if (!formData.activitesExercees) {
      toast.error("Veuillez renseigner les activités exercées");
      return;
    }
    if (!formData.ville) {
      toast.error("Veuillez renseigner la ville");
      return;
    }

    if (!isAuthenticated) {
      toast.info("Veuillez vous connecter pour continuer");
      navigate("/connexion");
      return;
    }

    const payload = {
      companyType: 'EI',
      companyName: formData.nomCommercial || `${formData.proprietaireNom} ${formData.proprietairePrenoms}`,
      nomCommercial: formData.nomCommercial,
      sigle: formData.sigle,
      activity: formData.activitesExercees,
      capital: 0,
      address: formData.adresseSiege || formData.ville || 'Abidjan',
      city: formData.ville,
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
      adressePostale: formData.adressePostale,
      telephone: formData.telephone,
      fax: formData.fax,
      email: formData.email,
      chiffreAffairesPrev: formData.chiffreAffairesPrev,
      paymentAmount: price,
      declarant: {
        nom: formData.declarantNom,
        qualite: formData.declarantQualite,
        adresse: formData.declarantAdresse,
        telephone: formData.declarantTelephone,
        fax: formData.declarantFax,
        mobile: formData.declarantMobile,
        email: formData.declarantEmail,
        numeroCompte: formData.declarantNumeroCompte,
      },
      projections: {
        investissementAnnee1: formData.investissementAnnee1,
        investissementAnnee2: formData.investissementAnnee2,
        investissementAnnee3: formData.investissementAnnee3,
        emploisAnnee1: formData.emploisAnnee1,
        emploisAnnee2: formData.emploisAnnee2,
        emploisAnnee3: formData.emploisAnnee3,
      },
      // Propriétaire comme manager principal
      managers: [{
        nom: formData.proprietaireNom,
        prenoms: formData.proprietairePrenoms,
        dateNaissance: formData.proprietaireDateNaissance,
        lieuNaissance: formData.proprietaireLieuNaissance,
        adresse: formData.proprietaireDomicile,
        nationalite: formData.proprietaireNationalite,
        regimeMatrimonial: formData.proprietaireSituationMatrimoniale,
        pereNom: formData.proprietairePereNom,
        mereNom: formData.proprietaireMereNom,
        isMain: true,
      }],
      // Bailleur pour le contrat de bail
      bailleur: {
        nom: formData.bailleurNom,
        prenom: formData.bailleurPrenom,
        adresse: formData.bailleurAdresse,
        telephone: formData.bailleurContact,
        loyerMensuel: formData.loyerMensuel,
        cautionMois: formData.cautionMois,
        avanceMois: formData.avanceMois,
        dureeBailAnnees: formData.dureeBailAnnees,
        dateDebutBail: formData.dateDebutBail,
        dateFinBail: formData.dateFinBail,
      },
      // Données EI spécifiques dans additionalData
      eiData: {
        conjointNom: formData.conjointNom,
        conjointPrenoms: formData.conjointPrenoms,
        conjointDateNaissance: formData.conjointDateNaissance,
        conjointLieuNaissance: formData.conjointLieuNaissance,
        conjointNationalite: formData.conjointNationalite,
        conjointDomicile: formData.conjointDomicile,
        conjointRegimeMatrimonial: formData.conjointRegimeMatrimonial,
        formeExploitation: formData.formeExploitation,
        dateDebutExploitation: formData.dateDebutExploitation,
        nombreEmployes: formData.nombreEmployes,
        dateEmbauchePremierEmploye: formData.dateEmbauchePremierEmploye,
        situationMatrimoniale: formData.proprietaireSituationMatrimoniale,
      },
    };

    // Effacer le brouillon
    localStorage.removeItem(EI_DRAFT_KEY);
    localStorage.removeItem(EI_STEP_KEY);

    navigate('/preview-documents', {
      state: {
        formData,
        companyType: 'EI',
        payload,
        price,
        docs,
        companyTypeName,
      }
    });
  };

  const stepIcons: Record<EIStep, React.ReactNode> = {
    proprietaire: <User className="h-4 w-4" />,
    conjoint: <User className="h-4 w-4" />,
    entreprise: <Building2 className="h-4 w-4" />,
    localisation: <MapPin className="h-4 w-4" />,
    bail: <Home className="h-4 w-4" />,
    declarant: <FileSignature className="h-4 w-4" />,
    recap: <FileText className="h-4 w-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Bannière brouillon restauré */}
      {showDraftBanner && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800 font-medium">
            📂 Brouillon restauré — votre saisie précédente a été récupérée.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearDraft}
            className="border-amber-400 text-amber-700 hover:bg-amber-100 shrink-0"
          >
            Effacer et recommencer
          </Button>
        </div>
      )}

      {/* Barre de progression */}
      <div className="flex items-center justify-between overflow-x-auto gap-1 pb-2">
        {eiSteps.map((s, index) => (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => index < currentIndex && setStep(s.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                s.id === step
                  ? 'bg-secondary text-secondary-foreground'
                  : index < currentIndex
                    ? 'bg-secondary/20 text-secondary cursor-pointer hover:bg-secondary/30'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {index < currentIndex ? <CheckCircle2 className="h-3 w-3" /> : stepIcons[s.id]}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {index < eiSteps.length - 1 && (
              <div className={`w-4 h-0.5 mx-1 ${index < currentIndex ? 'bg-secondary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Étape 1 : Propriétaire */}
      {step === 'proprietaire' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Identification du propriétaire</CardTitle>
            <CardDescription>Informations personnelles du promoteur de l'entreprise individuelle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="proprietaireNom">Nom *</Label>
                <Input id="proprietaireNom" placeholder="Ex: KOUAME" value={formData.proprietaireNom} onChange={e => updateField('proprietaireNom', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proprietairePrenoms">Prénoms *</Label>
                <Input id="proprietairePrenoms" placeholder="Ex: Jean-Baptiste" value={formData.proprietairePrenoms} onChange={e => updateField('proprietairePrenoms', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proprietaireDateNaissance">Date de naissance</Label>
                <Input id="proprietaireDateNaissance" type="date" value={formData.proprietaireDateNaissance} onChange={e => updateField('proprietaireDateNaissance', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proprietaireLieuNaissance">Lieu de naissance</Label>
                <Input id="proprietaireLieuNaissance" placeholder="Ex: Abidjan" value={formData.proprietaireLieuNaissance} onChange={e => updateField('proprietaireLieuNaissance', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proprietaireNationalite">Nationalité</Label>
                <Input id="proprietaireNationalite" placeholder="Ex: Ivoirienne" value={formData.proprietaireNationalite} onChange={e => updateField('proprietaireNationalite', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proprietaireSituationMatrimoniale">Situation matrimoniale</Label>
                <Select value={formData.proprietaireSituationMatrimoniale} onValueChange={v => updateField('proprietaireSituationMatrimoniale', v)}>
                  <SelectTrigger id="proprietaireSituationMatrimoniale">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Célibataire">Célibataire</SelectItem>
                    <SelectItem value="Marié(e)">Marié(e)</SelectItem>
                    <SelectItem value="Divorcé(e)">Divorcé(e)</SelectItem>
                    <SelectItem value="Veuf/Veuve">Veuf/Veuve</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proprietaireDomicile">Domicile</Label>
              <Input id="proprietaireDomicile" placeholder="Ex: Cocody, Abidjan" value={formData.proprietaireDomicile} onChange={e => updateField('proprietaireDomicile', e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="proprietairePereNom">Nom du père <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                <Input id="proprietairePereNom" placeholder="Ex: KOUAME" value={formData.proprietairePereNom} onChange={e => updateField('proprietairePereNom', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proprietaireMereNom">Nom de la mère <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                <Input id="proprietaireMereNom" placeholder="Ex: ADJOUA" value={formData.proprietaireMereNom} onChange={e => updateField('proprietaireMereNom', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button variant="gold" onClick={handleNext}>Suivant <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 2 : Conjoint */}
      {step === 'conjoint' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Identification du conjoint</CardTitle>
            <CardDescription>Informations sur le conjoint (si marié). Laisser vide si non applicable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="conjointNom">Nom</Label>
                <Input id="conjointNom" placeholder="Ex: KONAN" value={formData.conjointNom} onChange={e => updateField('conjointNom', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conjointPrenoms">Prénoms</Label>
                <Input id="conjointPrenoms" placeholder="Ex: Marie" value={formData.conjointPrenoms} onChange={e => updateField('conjointPrenoms', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conjointDateNaissance">Date de naissance</Label>
                <Input id="conjointDateNaissance" type="date" value={formData.conjointDateNaissance} onChange={e => updateField('conjointDateNaissance', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conjointLieuNaissance">Lieu de naissance</Label>
                <Input id="conjointLieuNaissance" placeholder="Ex: Yamoussoukro" value={formData.conjointLieuNaissance} onChange={e => updateField('conjointLieuNaissance', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conjointNationalite">Nationalité</Label>
                <Input id="conjointNationalite" placeholder="Ex: Ivoirienne" value={formData.conjointNationalite} onChange={e => updateField('conjointNationalite', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="conjointRegimeMatrimonial">Régime matrimonial</Label>
                <Select value={formData.conjointRegimeMatrimonial} onValueChange={v => updateField('conjointRegimeMatrimonial', v)}>
                  <SelectTrigger id="conjointRegimeMatrimonial">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Communauté de biens">Communauté de biens</SelectItem>
                    <SelectItem value="Séparation de biens">Séparation de biens</SelectItem>
                    <SelectItem value="Participation aux acquêts">Participation aux acquêts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="conjointDomicile">Domicile</Label>
              <Input id="conjointDomicile" placeholder="Ex: Cocody, Abidjan" value={formData.conjointDomicile} onChange={e => updateField('conjointDomicile', e.target.value)} />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrev}><ArrowLeft className="h-4 w-4 mr-2" /> Précédent</Button>
              <Button variant="gold" onClick={handleNext}>Suivant <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 3 : Entreprise */}
      {step === 'entreprise' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Informations sur l'entreprise</CardTitle>
            <CardDescription>Renseignements relatifs à l'activité de l'entreprise individuelle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nomCommercial">Nom commercial (optionnel)</Label>
                <Input id="nomCommercial" placeholder="Ex: SERVICES KOUAME" value={formData.nomCommercial} onChange={e => updateField('nomCommercial', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sigle">Sigle utilisé (optionnel)</Label>
                <Input id="sigle" placeholder="Ex: SK" value={formData.sigle} onChange={e => updateField('sigle', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activitesExercees">Activités exercées / Objet *</Label>
              <Textarea id="activitesExercees" placeholder="Décrivez les activités exercées par l'entreprise..." rows={3} value={formData.activitesExercees} onChange={e => updateField('activitesExercees', e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="formeExploitation">Forme d'exploitation</Label>
                <Select value={formData.formeExploitation} onValueChange={v => updateField('formeExploitation', v)}>
                  <SelectTrigger id="formeExploitation">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Propriétaire">Propriétaire</SelectItem>
                    <SelectItem value="Locataire">Locataire</SelectItem>
                    <SelectItem value="Gérant libre">Gérant libre</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chiffreAffairesPrev">Chiffre d'affaires prévisionnel (FCFA)</Label>
                <Input id="chiffreAffairesPrev" placeholder="Ex: 5000000" value={formData.chiffreAffairesPrev} onChange={e => updateField('chiffreAffairesPrev', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateDebutExploitation">Date de début d'exploitation</Label>
                <Input id="dateDebutExploitation" type="date" value={formData.dateDebutExploitation} onChange={e => updateField('dateDebutExploitation', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombreEmployes">Nombre d'employés</Label>
                <Input id="nombreEmployes" type="number" placeholder="Ex: 2" value={formData.nombreEmployes} onChange={e => updateField('nombreEmployes', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateEmbauchePremierEmploye">Date d'embauche 1er employé</Label>
                <Input id="dateEmbauchePremierEmploye" type="date" value={formData.dateEmbauchePremierEmploye} onChange={e => updateField('dateEmbauchePremierEmploye', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrev}><ArrowLeft className="h-4 w-4 mr-2" /> Précédent</Button>
              <Button variant="gold" onClick={handleNext}>Suivant <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 4 : Localisation */}
      {step === 'localisation' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Localisation du siège</CardTitle>
            <CardDescription>Adresse et coordonnées du siège de l'entreprise.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nomImmeuble">Nom immeuble</Label>
                <Input id="nomImmeuble" placeholder="Ex: Immeuble ABC" value={formData.nomImmeuble} onChange={e => updateField('nomImmeuble', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroEtage">Numéro étage</Label>
                <Input id="numeroEtage" placeholder="Ex: 2" value={formData.numeroEtage} onChange={e => updateField('numeroEtage', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroPorte">Numéro porte</Label>
                <Input id="numeroPorte" placeholder="Ex: 12" value={formData.numeroPorte} onChange={e => updateField('numeroPorte', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresseSiege">Adresse</Label>
              <Input id="adresseSiege" placeholder="Ex: Rue des Jardins" value={formData.adresseSiege} onChange={e => updateField('adresseSiege', e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="ville">Ville *</Label>
                <Input id="ville" placeholder="Ex: Abidjan" value={formData.ville} onChange={e => updateField('ville', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commune">Commune</Label>
                <Input id="commune" placeholder="Ex: Cocody" value={formData.commune} onChange={e => updateField('commune', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quartier">Quartier</Label>
                <Input id="quartier" placeholder="Ex: II Plateaux" value={formData.quartier} onChange={e => updateField('quartier', e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="lot">Lot n°</Label>
                <Input id="lot" value={formData.lot} onChange={e => updateField('lot', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ilot">Ilot</Label>
                <Input id="ilot" value={formData.ilot} onChange={e => updateField('ilot', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input id="section" value={formData.section} onChange={e => updateField('section', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parcelle">Parcelle</Label>
                <Input id="parcelle" value={formData.parcelle} onChange={e => updateField('parcelle', e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tfNumero">TF n°</Label>
                <Input id="tfNumero" value={formData.tfNumero} onChange={e => updateField('tfNumero', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adressePostale">Adresse postale</Label>
                <Input id="adressePostale" placeholder="Ex: BP 1234 Abidjan" value={formData.adressePostale} onChange={e => updateField('adressePostale', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input id="telephone" placeholder="Ex: 0707070707" value={formData.telephone} onChange={e => updateField('telephone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fax">Fax</Label>
                <Input id="fax" value={formData.fax} onChange={e => updateField('fax', e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Ex: contact@exemple.ci" value={formData.email} onChange={e => updateField('email', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrev}><ArrowLeft className="h-4 w-4 mr-2" /> Précédent</Button>
              <Button variant="gold" onClick={handleNext}>Suivant <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 5 : Bail */}
      {step === 'bail' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Home className="h-5 w-5" /> Contrat de bail</CardTitle>
            <CardDescription>Informations sur le bailleur et les conditions de location du local commercial.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bailleurNom">Nom du bailleur</Label>
                <Input id="bailleurNom" placeholder="Ex: TRAORE" value={formData.bailleurNom} onChange={e => updateField('bailleurNom', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bailleurPrenom">Prénom(s) du bailleur</Label>
                <Input id="bailleurPrenom" placeholder="Ex: Adama" value={formData.bailleurPrenom} onChange={e => updateField('bailleurPrenom', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bailleurAdresse">Adresse du bailleur</Label>
                <Input id="bailleurAdresse" placeholder="Ex: Cocody, Abidjan" value={formData.bailleurAdresse} onChange={e => updateField('bailleurAdresse', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bailleurContact">Téléphone du bailleur</Label>
                <Input id="bailleurContact" placeholder="Ex: 07 07 07 07" value={formData.bailleurContact} onChange={e => updateField('bailleurContact', e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="loyerMensuel">Loyer mensuel (FCFA)</Label>
                <Input id="loyerMensuel" type="number" placeholder="Ex: 50000" value={formData.loyerMensuel || ''} onChange={e => updateField('loyerMensuel', Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dureeBailAnnees">Durée du bail (années)</Label>
                <Input id="dureeBailAnnees" type="number" placeholder="Ex: 1" value={formData.dureeBailAnnees || ''} onChange={e => updateField('dureeBailAnnees', Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cautionMois">Caution (nombre de mois)</Label>
                <Input id="cautionMois" type="number" placeholder="Ex: 2" value={formData.cautionMois || ''} onChange={e => updateField('cautionMois', Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avanceMois">Avance (nombre de mois)</Label>
                <Input id="avanceMois" type="number" placeholder="Ex: 2" value={formData.avanceMois || ''} onChange={e => updateField('avanceMois', Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateDebutBail">Date de début du bail</Label>
                <Input id="dateDebutBail" type="date" value={formData.dateDebutBail} onChange={e => updateField('dateDebutBail', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFinBail">Date de fin du bail</Label>
                <Input id="dateFinBail" type="date" value={formData.dateFinBail} onChange={e => updateField('dateFinBail', e.target.value)} />
              </div>
            </div>
            {formData.loyerMensuel > 0 && (formData.cautionMois > 0 || formData.avanceMois > 0) && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <span className="text-muted-foreground">Garantie totale : </span>
                <span className="font-semibold">{(formData.loyerMensuel * (formData.cautionMois + formData.avanceMois)).toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrev}><ArrowLeft className="h-4 w-4 mr-2" /> Précédent</Button>
              <Button variant="gold" onClick={handleNext}>Suivant <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 6 : Déclarant + Projections */}
      {step === 'declarant' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileSignature className="h-5 w-5" /> Déclarant & Projections</CardTitle>
            <CardDescription>Informations du déclarant responsable et projections financières.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3 text-sm">Déclarant responsable</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="declarantNom">Déclaration établie par</Label>
                  <Input id="declarantNom" placeholder="Nom complet" value={formData.declarantNom} onChange={e => updateField('declarantNom', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declarantQualite">Agissant en qualité de</Label>
                  <Input id="declarantQualite" placeholder="Ex: CONSULTANT COMPTABLE" value={formData.declarantQualite} onChange={e => updateField('declarantQualite', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declarantNumeroCompte">N° compte contribuable</Label>
                  <Input id="declarantNumeroCompte" value={formData.declarantNumeroCompte} onChange={e => updateField('declarantNumeroCompte', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declarantAdresse">Adresse personnelle</Label>
                  <Input id="declarantAdresse" value={formData.declarantAdresse} onChange={e => updateField('declarantAdresse', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declarantTelephone">Tél.</Label>
                  <Input id="declarantTelephone" value={formData.declarantTelephone} onChange={e => updateField('declarantTelephone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declarantFax">Fax</Label>
                  <Input id="declarantFax" value={formData.declarantFax} onChange={e => updateField('declarantFax', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declarantMobile">Mobile</Label>
                  <Input id="declarantMobile" value={formData.declarantMobile} onChange={e => updateField('declarantMobile', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="declarantEmail">E-mail</Label>
                  <Input id="declarantEmail" type="email" value={formData.declarantEmail} onChange={e => updateField('declarantEmail', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3 text-sm">Projections (3 ans)</h4>
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(yr => (
                  <div key={yr} className="space-y-3 border rounded p-3">
                    <p className="font-medium text-sm">Année {yr}</p>
                    <div className="space-y-2">
                      <Label>Investissement (FCFA)</Label>
                      <Input type="number" placeholder="0" value={formData[`investissementAnnee${yr}` as keyof EIFormData] as number}
                        onChange={e => updateField(`investissementAnnee${yr}` as keyof EIFormData, Number(e.target.value) as any)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Emplois</Label>
                      <Input type="number" placeholder="0" value={formData[`emploisAnnee${yr}` as keyof EIFormData] as number}
                        onChange={e => updateField(`emploisAnnee${yr}` as keyof EIFormData, Number(e.target.value) as any)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrev}><ArrowLeft className="h-4 w-4 mr-2" /> Précédent</Button>
              <Button variant="gold" onClick={handleNext}>Récapitulatif <ArrowRight className="h-4 w-4 ml-2" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 6 : Récapitulatif */}
      {step === 'recap' && (
        <Card variant="gold">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Récapitulatif</CardTitle>
            <CardDescription>Vérifiez les informations avant de générer votre formulaire CEPICI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Propriétaire</p>
                <p className="font-semibold">{formData.proprietaireNom} {formData.proprietairePrenoms || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nationalité</p>
                <p className="font-semibold">{formData.proprietaireNationalite || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Nom commercial</p>
                <p className="font-semibold">{formData.nomCommercial || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Activités</p>
                <p className="font-semibold line-clamp-2">{formData.activitesExercees || '-'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Siège social</p>
                <p className="font-semibold">{formData.ville}{formData.commune ? `, ${formData.commune}` : ''}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Forme d'exploitation</p>
                <p className="font-semibold">{formData.formeExploitation || '-'}</p>
              </div>
              {formData.bailleurNom && (
                <div>
                  <p className="text-muted-foreground">Bailleur</p>
                  <p className="font-semibold">{formData.bailleurNom} {formData.bailleurPrenom}</p>
                </div>
              )}
              {formData.loyerMensuel > 0 && (
                <div>
                  <p className="text-muted-foreground">Loyer mensuel</p>
                  <p className="font-semibold">{formData.loyerMensuel.toLocaleString()} FCFA</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <p className="font-semibold text-sm mb-2">Documents générés :</p>
              {docs.map(doc => (
                <div key={doc} className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-secondary" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-secondary">{price.toLocaleString()} FCFA</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrev}><ArrowLeft className="h-4 w-4 mr-2" /> Précédent</Button>
                <Button variant="hero" onClick={handleGenerate}>
                  Générer les documents <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
