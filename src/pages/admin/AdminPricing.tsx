import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/auth/AuthContext";
import { adminGetPricingApi, adminUpdatePricingApi } from "@/lib/api";
import { companyTypes, pricingPlans } from "@/lib/mock-data";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CreditCard, Building2, Save, Check } from "lucide-react";
import { toast } from "sonner";

type PricingSetting = {
  pricingPlans: Array<{ id: string; price: number }>;
  companyTypePrices: Record<string, number>;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-FR").format(price) + " FCFA";
};

export default function AdminPricing() {
  const { token } = useAuth();
  const [setting, setSetting] = useState<PricingSetting>({ pricingPlans: [], companyTypePrices: {} });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    adminGetPricingApi(token)
      .then((r) => setSetting(r.data))
      .catch(() => setSetting({ pricingPlans: [], companyTypePrices: {} }));
  }, [token]);

  const planDefaults = useMemo(() => pricingPlans.map((p) => ({ id: p.id, name: p.name, price: p.price, description: p.description })), []);

  const mergedPlans = useMemo(() => {
    const map = new Map(setting.pricingPlans.map((p) => [p.id, p.price]));
    return planDefaults.map((p) => ({ ...p, price: map.get(p.id) ?? p.price }));
  }, [planDefaults, setting.pricingPlans]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await adminUpdatePricingApi(token, setting);
      setSetting(res.data);
      toast.success("Tarifs enregistrés avec succès");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Tarifs" 
        description="Configurez les prix des formules et types d'entreprise"
        actions={
          <Button variant="gold" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>Enregistrement...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        }
      />

      <Tabs defaultValue="formulas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="formulas" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Formules
          </TabsTrigger>
          <TabsTrigger value="companies" className="gap-2">
            <Building2 className="h-4 w-4" />
            Types d'entreprise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formulas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {mergedPlans.map((p) => {
              const currentPrice = setting.pricingPlans.find((x) => x.id === p.id)?.price ?? p.price;
              return (
                <Card key={p.id} className="relative overflow-hidden">
                  {p.id === "professionnel" && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                      Populaire
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      {p.name}
                    </CardTitle>
                    <CardDescription>{p.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Prix (FCFA)</label>
                      <Input
                        type="number"
                        value={currentPrice}
                        onChange={(e) => {
                          const price = Number(e.target.value);
                          setSetting((s) => {
                            const other = s.pricingPlans.filter((x) => x.id !== p.id);
                            return { ...s, pricingPlans: [...other, { id: p.id, price }] };
                          });
                        }}
                        className="mt-1"
                      />
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-sm text-muted-foreground">Affichage</p>
                      <p className="text-lg font-bold">{formatPrice(currentPrice)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prix par type d'entreprise</CardTitle>
              <CardDescription>
                Ces prix sont utilisés lors de la création d'entreprise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyTypes.map((ct) => {
                  const currentPrice = setting.companyTypePrices[ct.id] ?? ct.price;
                  return (
                    <div key={ct.id} className="flex items-center gap-4 rounded-lg border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{ct.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{ct.fullName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          className="w-32"
                          value={currentPrice}
                          onChange={(e) => {
                            const price = Number(e.target.value);
                            setSetting((s) => ({
                              ...s,
                              companyTypePrices: { ...s.companyTypePrices, [ct.id]: price },
                            }));
                          }}
                        />
                        <div className="w-32 text-right">
                          <p className="text-sm font-medium">{formatPrice(currentPrice)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-emerald-600" />
            Aperçu des tarifs
          </CardTitle>
          <CardDescription>Vérifiez vos modifications avant d'enregistrer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="font-medium mb-3">Formules</p>
              <div className="space-y-2 text-sm">
                {mergedPlans.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="font-medium">
                      {formatPrice(setting.pricingPlans.find((x) => x.id === p.id)?.price ?? p.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium mb-3">Types d'entreprise</p>
              <div className="space-y-2 text-sm">
                {companyTypes.slice(0, 5).map((ct) => (
                  <div key={ct.id} className="flex justify-between">
                    <span className="text-muted-foreground">{ct.id}</span>
                    <span className="font-medium">
                      {formatPrice(setting.companyTypePrices[ct.id] ?? ct.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
