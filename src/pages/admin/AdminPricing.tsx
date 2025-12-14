import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/auth/AuthContext";
import { adminGetPricingApi, adminUpdatePricingApi } from "@/lib/api";
import { companyTypes, pricingPlans } from "@/lib/mock-data";

type PricingSetting = {
  pricingPlans: Array<{ id: string; price: number }>;
  companyTypePrices: Record<string, number>;
};

export default function AdminPricing() {
  const { token } = useAuth();
  const [setting, setSetting] = useState<PricingSetting>({ pricingPlans: [], companyTypePrices: {} });

  useEffect(() => {
    if (!token) return;
    adminGetPricingApi(token)
      .then((r) => setSetting(r.data))
      .catch(() => setSetting({ pricingPlans: [], companyTypePrices: {} }));
  }, [token]);

  const planDefaults = useMemo(() => pricingPlans.map((p) => ({ id: p.id, price: p.price })), []);

  const mergedPlans = useMemo(() => {
    const map = new Map(setting.pricingPlans.map((p) => [p.id, p.price]));
    return planDefaults.map((p) => ({ ...p, price: map.get(p.id) ?? p.price }));
  }, [planDefaults, setting.pricingPlans]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Tarifs / Prix</h1>

      <Card>
        <CardHeader>
          <CardTitle>Prix des formules (page Tarifs)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mergedPlans.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium">{p.id}</div>
              <Input
                className="max-w-[200px]"
                type="number"
                value={
                  setting.pricingPlans.find((x) => x.id === p.id)?.price ?? p.price
                }
                onChange={(e) => {
                  const price = Number(e.target.value);
                  setSetting((s) => {
                    const other = s.pricingPlans.filter((x) => x.id !== p.id);
                    return { ...s, pricingPlans: [...other, { id: p.id, price }] };
                  });
                }}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prix par type d’entreprise (création entreprise)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {companyTypes.map((ct) => (
            <div key={ct.id} className="flex items-center justify-between gap-4">
              <div className="text-sm font-medium">{ct.id}</div>
              <Input
                className="max-w-[200px]"
                type="number"
                value={setting.companyTypePrices[ct.id] ?? ct.price}
                onChange={(e) => {
                  const price = Number(e.target.value);
                  setSetting((s) => ({
                    ...s,
                    companyTypePrices: { ...s.companyTypePrices, [ct.id]: price },
                  }));
                }}
              />
            </div>
          ))}

          <Button
            variant="gold"
            type="button"
            onClick={async () => {
              if (!token) return;
              const res = await adminUpdatePricingApi(token, setting);
              setSetting(res.data);
            }}
          >
            Enregistrer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
