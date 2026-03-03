import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthContext";
import { adminGetServicesContentApi, adminUpdateServicesContentApi } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { defaultServicesContent, normalizeServicesContent, type ServicesContent } from "@/lib/site-content";
import { Plus, Save, RotateCcw, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const linesToArray = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const arrayToLines = (values: string[]) => values.join("\n");

const availableIcons = ["Calculator", "FileText", "Search", "Building2", "Users", "Globe"];

export default function AdminServicesContent() {
  const { token } = useAuth();
  const [content, setContent] = useState<ServicesContent>(defaultServicesContent);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    adminGetServicesContentApi(token)
      .then((res) => {
        setContent(normalizeServicesContent(res.data));
      })
      .catch(() => {
        setContent(defaultServicesContent);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleReset = () => {
    setContent(defaultServicesContent);
    toast.success("Contenu par défaut chargé");
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const payload = normalizeServicesContent(content);
      const res = await adminUpdateServicesContentApi(token, payload);
      setContent(normalizeServicesContent(res.data));
      toast.success("Contenu Services enregistré");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contenu Services"
        description="Modifiez la page Services avec des champs simples: titres, textes, cartes, listes et boutons."
        actions={
          <>
            <Button variant="outline" onClick={handleReset} disabled={saving || loading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Valeurs par défaut
            </Button>
            <Button variant="outline" asChild>
              <a href="/services" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Voir la page
              </a>
            </Button>
            <Button variant="gold" onClick={handleSave} disabled={saving || loading}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>En-tête de la page</CardTitle>
          <CardDescription>Bloc principal en haut de la page Services.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Titre principal</Label>
            <Input
              value={content.header.title}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, header: { ...prev.header, title: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={content.header.description}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, header: { ...prev.header, description: e.target.value } }))
              }
              className="min-h-[100px]"
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cartes de services</CardTitle>
          <CardDescription>Chaque carte représente un service affiché dans la grille.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.services.map((service, index) => (
            <div key={`${service.id}-${index}`} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">Carte #{index + 1}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      services: prev.services.filter((_, i) => i !== index),
                    }))
                  }
                  disabled={loading || content.services.length <= 1}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ID technique</Label>
                  <Input
                    value={service.id}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.services];
                        next[index] = { ...next[index], id: e.target.value };
                        return { ...prev, services: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icône</Label>
                  <Input
                    list="service-icons"
                    value={service.icon}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.services];
                        next[index] = { ...next[index], icon: e.target.value };
                        return { ...prev, services: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Titre</Label>
                  <Input
                    value={service.title}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.services];
                        next[index] = { ...next[index], title: e.target.value };
                        return { ...prev, services: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={service.description}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.services];
                        next[index] = { ...next[index], description: e.target.value };
                        return { ...prev, services: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Points (1 ligne = 1 point)</Label>
                  <Textarea
                    value={arrayToLines(service.features)}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.services];
                        next[index] = { ...next[index], features: linesToArray(e.target.value) };
                        return { ...prev, services: next };
                      })
                    }
                    className="min-h-[110px]"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() =>
              setContent((prev) => ({
                ...prev,
                services: [
                  ...prev.services,
                  {
                    id: `service-${prev.services.length + 1}`,
                    title: "Nouveau service",
                    description: "Description du service",
                    icon: "Building2",
                    features: ["Point 1", "Point 2"],
                  },
                ],
              }))
            }
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une carte
          </Button>

          <datalist id="service-icons">
            {availableIcons.map((icon) => (
              <option key={icon} value={icon} />
            ))}
          </datalist>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section investisseurs</CardTitle>
          <CardDescription>Bloc "investisseurs étrangers" au milieu de la page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Badge</Label>
            <Input
              value={content.investor.badge}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, investor: { ...prev.investor, badge: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Bouton principal</Label>
            <Input
              value={content.investor.ctaLabel}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, investor: { ...prev.investor, ctaLabel: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Titre</Label>
            <Input
              value={content.investor.title}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, investor: { ...prev.investor, title: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={content.investor.description}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, investor: { ...prev.investor, description: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Éléments de la liste (1 ligne = 1 élément)</Label>
            <Textarea
              value={arrayToLines(content.investor.items)}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, investor: { ...prev.investor, items: linesToArray(e.target.value) } }))
              }
              className="min-h-[120px]"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Éléments du pack (1 ligne = 1 élément)</Label>
            <Textarea
              value={arrayToLines(content.investor.packItems)}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, investor: { ...prev.investor, packItems: linesToArray(e.target.value) } }))
              }
              className="min-h-[120px]"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Titre du pack</Label>
            <Input
              value={content.investor.packTitle}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, investor: { ...prev.investor, packTitle: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Prix affiché</Label>
            <Input
              value={content.investor.packPrice}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, investor: { ...prev.investor, packPrice: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description du pack</Label>
            <Textarea
              value={content.investor.packDescription}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, investor: { ...prev.investor, packDescription: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Bouton du pack</Label>
            <Input
              value={content.investor.packCtaLabel}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, investor: { ...prev.investor, packCtaLabel: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bloc d'appel à l'action (bas de page)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Titre</Label>
            <Input
              value={content.cta.title}
              onChange={(e) => setContent((prev) => ({ ...prev, cta: { ...prev.cta, title: e.target.value } }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={content.cta.description}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, cta: { ...prev.cta, description: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Texte bouton Appel</Label>
            <Input
              value={content.cta.callLabel}
              onChange={(e) => setContent((prev) => ({ ...prev, cta: { ...prev.cta, callLabel: e.target.value } }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Texte bouton Contact</Label>
            <Input
              value={content.cta.contactLabel}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, cta: { ...prev.cta, contactLabel: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
