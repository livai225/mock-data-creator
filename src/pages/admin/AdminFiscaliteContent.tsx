import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthContext";
import { adminGetFiscaliteContentApi, adminUpdateFiscaliteContentApi } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { defaultFiscaliteContent, normalizeFiscaliteContent, type FiscaliteContent } from "@/lib/site-content";
import { Plus, Save, RotateCcw, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const linesToArray = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const arrayToLines = (values: string[]) => values.join("\n");

export default function AdminFiscaliteContent() {
  const { token } = useAuth();
  const [content, setContent] = useState<FiscaliteContent>(defaultFiscaliteContent);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    adminGetFiscaliteContentApi(token)
      .then((res) => {
        setContent(normalizeFiscaliteContent(res.data));
      })
      .catch(() => {
        setContent(defaultFiscaliteContent);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleReset = () => {
    setContent(defaultFiscaliteContent);
    toast.success("Contenu par défaut chargé");
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const payload = normalizeFiscaliteContent(content);
      const res = await adminUpdateFiscaliteContentApi(token, payload);
      setContent(normalizeFiscaliteContent(res.data));
      toast.success("Contenu Fiscalité enregistré");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contenu Fiscalité"
        description="Modifiez la page Fiscalité avec des champs clairs (titres, taxes, régimes, calendrier, CNPS, CTA)."
        actions={
          <>
            <Button variant="outline" onClick={handleReset} disabled={saving || loading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Valeurs par défaut
            </Button>
            <Button variant="outline" asChild>
              <a href="/fiscalite" target="_blank" rel="noopener noreferrer">
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
          <CardTitle>En-tête</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Badge</Label>
            <Input
              value={content.header.badge}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, header: { ...prev.header, badge: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Titre</Label>
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
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Libellés des onglets</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Onglet 1</Label>
            <Input
              value={content.tabs.impots}
              onChange={(e) => setContent((prev) => ({ ...prev, tabs: { ...prev.tabs, impots: e.target.value } }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Onglet 2</Label>
            <Input
              value={content.tabs.regimes}
              onChange={(e) => setContent((prev) => ({ ...prev, tabs: { ...prev.tabs, regimes: e.target.value } }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Onglet 3</Label>
            <Input
              value={content.tabs.calendrier}
              onChange={(e) => setContent((prev) => ({ ...prev, tabs: { ...prev.tabs, calendrier: e.target.value } }))}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Onglet 4</Label>
            <Input
              value={content.tabs.cnps}
              onChange={(e) => setContent((prev) => ({ ...prev, tabs: { ...prev.tabs, cnps: e.target.value } }))}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Impôts et taxes</CardTitle>
          <CardDescription>Cartes de la section Impôts & Taxes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.taxes.map((tax, index) => (
            <div key={`${tax.id}-${index}`} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">Taxe #{index + 1}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setContent((prev) => ({ ...prev, taxes: prev.taxes.filter((_, i) => i !== index) }))
                  }
                  disabled={loading || content.taxes.length <= 1}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ID</Label>
                  <Input
                    value={tax.id}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.taxes];
                        next[index] = { ...next[index], id: e.target.value };
                        return { ...prev, taxes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taux (optionnel)</Label>
                  <Input
                    value={tax.rate ?? ""}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.taxes];
                        next[index] = { ...next[index], rate: e.target.value };
                        return { ...prev, taxes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Titre</Label>
                  <Input
                    value={tax.title}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.taxes];
                        next[index] = { ...next[index], title: e.target.value };
                        return { ...prev, taxes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={tax.description}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.taxes];
                        next[index] = { ...next[index], description: e.target.value };
                        return { ...prev, taxes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Applicable à (1 ligne = 1 élément)</Label>
                  <Textarea
                    value={arrayToLines(tax.applicableTo)}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.taxes];
                        next[index] = { ...next[index], applicableTo: linesToArray(e.target.value) };
                        return { ...prev, taxes: next };
                      })
                    }
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
                taxes: [
                  ...prev.taxes,
                  { id: `tax-${prev.taxes.length + 1}`, title: "Nouvelle taxe", description: "Description", rate: "", applicableTo: ["Type"] },
                ],
              }))
            }
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une taxe
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Régimes fiscaux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.regimes.map((regime, index) => (
            <div key={`${regime.id}-${index}`} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">Régime #{index + 1}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setContent((prev) => ({ ...prev, regimes: prev.regimes.filter((_, i) => i !== index) }))
                  }
                  disabled={loading || content.regimes.length <= 1}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ID</Label>
                  <Input
                    value={regime.id}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.regimes];
                        next[index] = { ...next[index], id: e.target.value };
                        return { ...prev, regimes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Condition d'application</Label>
                  <Input
                    value={regime.applicable}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.regimes];
                        next[index] = { ...next[index], applicable: e.target.value };
                        return { ...prev, regimes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Nom</Label>
                  <Input
                    value={regime.name}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.regimes];
                        next[index] = { ...next[index], name: e.target.value };
                        return { ...prev, regimes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={regime.description}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.regimes];
                        next[index] = { ...next[index], description: e.target.value };
                        return { ...prev, regimes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Obligations (1 ligne = 1 élément)</Label>
                  <Textarea
                    value={arrayToLines(regime.obligations)}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.regimes];
                        next[index] = { ...next[index], obligations: linesToArray(e.target.value) };
                        return { ...prev, regimes: next };
                      })
                    }
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
                regimes: [
                  ...prev.regimes,
                  {
                    id: `regime-${prev.regimes.length + 1}`,
                    name: "Nouveau régime",
                    description: "Description",
                    applicable: "Condition",
                    obligations: ["Obligation 1", "Obligation 2"],
                  },
                ],
              }))
            }
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un régime
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taxes additionnelles</CardTitle>
          <CardDescription>Cartes supplémentaires affichées dans l'onglet Impôts & Taxes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {content.additionalTaxes.map((tax, index) => (
            <div key={`${tax.id}-${index}`} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">Taxe additionnelle #{index + 1}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      additionalTaxes: prev.additionalTaxes.filter((_, i) => i !== index),
                    }))
                  }
                  disabled={loading || content.additionalTaxes.length <= 1}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>ID</Label>
                  <Input
                    value={tax.id}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.additionalTaxes];
                        next[index] = { ...next[index], id: e.target.value };
                        return { ...prev, additionalTaxes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taux</Label>
                  <Input
                    value={tax.rate}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.additionalTaxes];
                        next[index] = { ...next[index], rate: e.target.value };
                        return { ...prev, additionalTaxes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Titre</Label>
                  <Input
                    value={tax.title}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.additionalTaxes];
                        next[index] = { ...next[index], title: e.target.value };
                        return { ...prev, additionalTaxes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={tax.description}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.additionalTaxes];
                        next[index] = { ...next[index], description: e.target.value };
                        return { ...prev, additionalTaxes: next };
                      })
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Applicable à (1 ligne = 1 élément)</Label>
                  <Textarea
                    value={arrayToLines(tax.applicableTo)}
                    onChange={(e) =>
                      setContent((prev) => {
                        const next = [...prev.additionalTaxes];
                        next[index] = { ...next[index], applicableTo: linesToArray(e.target.value) };
                        return { ...prev, additionalTaxes: next };
                      })
                    }
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
                additionalTaxes: [
                  ...prev.additionalTaxes,
                  {
                    id: `extra-tax-${prev.additionalTaxes.length + 1}`,
                    title: "Nouvelle taxe additionnelle",
                    rate: "0%",
                    description: "Description",
                    applicableTo: ["Type"],
                  },
                ],
              }))
            }
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une taxe additionnelle
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calendrier fiscal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Titre section calendrier</Label>
              <Input
                value={content.calendrier.title}
                onChange={(e) =>
                  setContent((prev) => ({ ...prev, calendrier: { ...prev.calendrier, title: e.target.value } }))
                }
                disabled={loading}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description section calendrier</Label>
              <Textarea
                value={content.calendrier.description}
                onChange={(e) =>
                  setContent((prev) => ({ ...prev, calendrier: { ...prev.calendrier, description: e.target.value } }))
                }
                disabled={loading}
              />
            </div>
          </div>

          {content.calendrier.items.map((item, index) => (
            <div key={`${item.mois}-${index}`} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium">Mois #{index + 1}</p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      calendrier: {
                        ...prev.calendrier,
                        items: prev.calendrier.items.filter((_, i) => i !== index),
                      },
                    }))
                  }
                  disabled={loading || content.calendrier.items.length <= 1}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Nom du mois</Label>
                <Input
                  value={item.mois}
                  onChange={(e) =>
                    setContent((prev) => {
                      const next = [...prev.calendrier.items];
                      next[index] = { ...next[index], mois: e.target.value };
                      return { ...prev, calendrier: { ...prev.calendrier, items: next } };
                    })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Obligations (1 ligne = 1 obligation)</Label>
                <Textarea
                  value={arrayToLines(item.obligations)}
                  onChange={(e) =>
                    setContent((prev) => {
                      const next = [...prev.calendrier.items];
                      next[index] = { ...next[index], obligations: linesToArray(e.target.value) };
                      return { ...prev, calendrier: { ...prev.calendrier, items: next } };
                    })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() =>
              setContent((prev) => ({
                ...prev,
                calendrier: {
                  ...prev.calendrier,
                  items: [...prev.calendrier.items, { mois: "Nouveau mois", obligations: ["Nouvelle obligation"] }],
                },
              }))
            }
            disabled={loading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un mois
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CNPS et social</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 space-y-3">
            <p className="font-medium">Bloc Employeur</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Titre</Label>
                <Input
                  value={content.cnps.employeur.title}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      cnps: { ...prev.cnps, employeur: { ...prev.cnps.employeur, title: e.target.value } },
                    }))
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={content.cnps.employeur.description}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      cnps: { ...prev.cnps, employeur: { ...prev.cnps.employeur, description: e.target.value } },
                    }))
                  }
                  disabled={loading}
                />
              </div>
              {content.cnps.employeur.items.map((row, idx) => (
                <div key={`${row.label}-${idx}`} className="md:col-span-2 grid gap-2 md:grid-cols-[1fr_180px_auto] items-end">
                  <div className="space-y-2">
                    <Label>Libellé</Label>
                    <Input
                      value={row.label}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.cnps.employeur.items];
                          next[idx] = { ...next[idx], label: e.target.value };
                          return {
                            ...prev,
                            cnps: { ...prev.cnps, employeur: { ...prev.cnps.employeur, items: next } },
                          };
                        })
                      }
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valeur</Label>
                    <Input
                      value={row.value}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.cnps.employeur.items];
                          next[idx] = { ...next[idx], value: e.target.value };
                          return {
                            ...prev,
                            cnps: { ...prev.cnps, employeur: { ...prev.cnps.employeur, items: next } },
                          };
                        })
                      }
                      disabled={loading}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setContent((prev) => ({
                        ...prev,
                        cnps: {
                          ...prev.cnps,
                          employeur: {
                            ...prev.cnps.employeur,
                            items: prev.cnps.employeur.items.filter((_, i) => i !== idx),
                          },
                        },
                      }))
                    }
                    disabled={loading || content.cnps.employeur.items.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="md:col-span-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      cnps: {
                        ...prev.cnps,
                        employeur: {
                          ...prev.cnps.employeur,
                          items: [...prev.cnps.employeur.items, { label: "Nouveau", value: "0%" }],
                        },
                      },
                    }))
                  }
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une ligne
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Libellé total</Label>
                <Input
                  value={content.cnps.employeur.totalLabel}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      cnps: { ...prev.cnps, employeur: { ...prev.cnps.employeur, totalLabel: e.target.value } },
                    }))
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Valeur totale</Label>
                <Input
                  value={content.cnps.employeur.totalValue}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      cnps: { ...prev.cnps, employeur: { ...prev.cnps.employeur, totalValue: e.target.value } },
                    }))
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <p className="font-medium">Bloc Salarié</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Titre</Label>
                <Input
                  value={content.cnps.salarie.title}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      cnps: { ...prev.cnps, salarie: { ...prev.cnps.salarie, title: e.target.value } },
                    }))
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={content.cnps.salarie.description}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      cnps: { ...prev.cnps, salarie: { ...prev.cnps.salarie, description: e.target.value } },
                    }))
                  }
                  disabled={loading}
                />
              </div>
              {content.cnps.salarie.items.map((row, idx) => (
                <div key={`${row.label}-${idx}`} className="md:col-span-2 grid gap-2 md:grid-cols-[1fr_180px_auto] items-end">
                  <div className="space-y-2">
                    <Label>Libellé</Label>
                    <Input
                      value={row.label}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.cnps.salarie.items];
                          next[idx] = { ...next[idx], label: e.target.value };
                          return {
                            ...prev,
                            cnps: { ...prev.cnps, salarie: { ...prev.cnps.salarie, items: next } },
                          };
                        })
                      }
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valeur</Label>
                    <Input
                      value={row.value}
                      onChange={(e) =>
                        setContent((prev) => {
                          const next = [...prev.cnps.salarie.items];
                          next[idx] = { ...next[idx], value: e.target.value };
                          return {
                            ...prev,
                            cnps: { ...prev.cnps, salarie: { ...prev.cnps.salarie, items: next } },
                          };
                        })
                      }
                      disabled={loading}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setContent((prev) => ({
                        ...prev,
                        cnps: {
                          ...prev.cnps,
                          salarie: {
                            ...prev.cnps.salarie,
                            items: prev.cnps.salarie.items.filter((_, i) => i !== idx),
                          },
                        },
                      }))
                    }
                    disabled={loading || content.cnps.salarie.items.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="md:col-span-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setContent((prev) => ({
                      ...prev,
                      cnps: {
                        ...prev.cnps,
                        salarie: {
                          ...prev.cnps.salarie,
                          items: [...prev.cnps.salarie.items, { label: "Nouveau", value: "0%" }],
                        },
                      },
                    }))
                  }
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une ligne
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Libellé total</Label>
                <Input
                  value={content.cnps.salarie.totalLabel}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      cnps: { ...prev.cnps, salarie: { ...prev.cnps.salarie, totalLabel: e.target.value } },
                    }))
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Valeur totale</Label>
                <Input
                  value={content.cnps.salarie.totalValue}
                  onChange={(e) =>
                    setContent((prev) => ({
                      ...prev,
                      cnps: { ...prev.cnps, salarie: { ...prev.cnps.salarie, totalValue: e.target.value } },
                    }))
                  }
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-3">
            <p className="font-medium">Bloc information</p>
            <div className="space-y-2">
              <Label>Titre</Label>
              <Input
                value={content.cnps.info.title}
                onChange={(e) =>
                  setContent((prev) => ({ ...prev, cnps: { ...prev.cnps, info: { ...prev.cnps.info, title: e.target.value } } }))
                }
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Texte</Label>
              <Textarea
                value={content.cnps.info.description}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    cnps: { ...prev.cnps, info: { ...prev.cnps.info, description: e.target.value } },
                  }))
                }
                disabled={loading}
              />
            </div>
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
            <Label>Bouton principal</Label>
            <Input
              value={content.cta.primaryLabel}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, cta: { ...prev.cta, primaryLabel: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Bouton secondaire</Label>
            <Input
              value={content.cta.secondaryLabel}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, cta: { ...prev.cta, secondaryLabel: e.target.value } }))
              }
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
