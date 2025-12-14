import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/auth/AuthContext";
import { adminGetBannerApi, adminUpdateBannerApi } from "@/lib/api";

type Banner = {
  enabled: boolean;
  message: string;
  variant: "info" | "warning" | "success" | "danger";
};

export default function AdminBanner() {
  const { token } = useAuth();
  const [banner, setBanner] = useState<Banner>({ enabled: false, message: "", variant: "info" });

  useEffect(() => {
    if (!token) return;
    adminGetBannerApi(token).then((r) => setBanner(r.data)).catch(() => null);
  }, [token]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Bannière</h1>

      <Card>
        <CardHeader>
          <CardTitle>Message global (maintenance / promo)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Activer</div>
              <div className="text-sm text-muted-foreground">Affiche un bandeau en haut du site.</div>
            </div>
            <Switch checked={banner.enabled} onCheckedChange={(v) => setBanner((b) => ({ ...b, enabled: v }))} />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Message</div>
            <Input value={banner.message} onChange={(e) => setBanner((b) => ({ ...b, message: e.target.value }))} />
          </div>

          <Button
            variant="gold"
            type="button"
            onClick={async () => {
              if (!token) return;
              const res = await adminUpdateBannerApi(token, banner);
              setBanner(res.data);
            }}
          >
            Enregistrer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
