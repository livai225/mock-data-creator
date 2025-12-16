import { ReactNode, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { companyTypes, type CompanyType } from "@/lib/mock-data";

type Props = {
  children: ReactNode;
  to?: string;
};

export function CreateEnterpriseDialog({ children, to = "/creation-entreprise" }: Props) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CompanyType | "">("");

  const checklist = useMemo(() => {
    const base = [
      "Pièce d'identité valide (CNI ou passeport)",
      "Contacts (téléphone, email)",
      "Adresse complète du siège + justificatif (contrat de bail / attestation de domiciliation)",
      "Objet social (activité principale)",
    ];

    if (!selectedType) return base;

    switch (selectedType) {
      case "EI":
        return [
          ...base,
          "Nom commercial / dénomination (si applicable)",
          "Adresse du domicile du promoteur (si différente du siège)",
        ];

      case "SARLU":
        return [
          ...base,
          "Dénomination sociale",
          "Capital social (≤ 10M FCFA si procédure standard)",
          "Informations de l'associé unique (identité, apports)",
          "Identité du gérant",
        ];

      case "SARL_PLURI":
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
  }, [selectedType]);

  const selectableTypes = useMemo(
    () => companyTypes.map((c) => ({ id: c.id, label: `${c.id} — ${c.fullName}` })),
    [],
  );

  const selectedTypeLabel = useMemo(() => {
    if (!selectedType) return "";
    return selectableTypes.find((t) => t.id === selectedType)?.label ?? selectedType;
  }, [selectableTypes, selectedType]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Avant de continuer</DialogTitle>
          <DialogDescription>
            Prépare ces éléments pour renseigner les informations demandées et/ou poursuivre la procédure au CEPICI.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm font-medium">Choisis la forme juridique</p>
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as CompanyType)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner...">{selectedTypeLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {selectableTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Fermer
            </Button>
            <Button
              variant="gold"
              onClick={() => {
                setOpen(false);
                navigate(`${to}?type=${encodeURIComponent(selectedType)}`);
              }}
              type="button"
              disabled={!selectedType}
            >
              Continuer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
