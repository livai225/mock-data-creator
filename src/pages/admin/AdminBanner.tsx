import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/auth/AuthContext";
import { adminGetBannerApi, adminUpdateBannerApi } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Save, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type BannerVariant = "info" | "warning" | "success" | "danger";

type Banner = {
  enabled: boolean;
  message: string;
  variant: BannerVariant;
};

const variantConfig: Record<BannerVariant, { label: string; icon: any; className: string; previewClass: string }> = {
  info: {
    label: "Information",
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-700",
    previewClass: "bg-blue-500 text-white",
  },
  warning: {
    label: "Avertissement",
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 text-amber-700",
    previewClass: "bg-amber-500 text-white",
  },
  success: {
    label: "Succès",
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    previewClass: "bg-emerald-500 text-white",
  },
  danger: {
    label: "Urgent",
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-700",
    previewClass: "bg-red-500 text-white",
  },
};

const templates = [
  { label: "Maintenance", message: "🔧 Maintenance prévue le [date]. Le service sera temporairement indisponible.", variant: "warning" as BannerVariant },
  { label: "Promotion", message: "🎉 Offre spéciale : -20% sur toutes les créations d'entreprise jusqu'au [date] !", variant: "success" as BannerVariant },
  { label: "Information", message: "ℹ️ Nouvelle fonctionnalité disponible : [description]", variant: "info" as BannerVariant },
  { label: "Urgent", message: "⚠️ [Description du problème]. Nous travaillons à sa résolution.", variant: "danger" as BannerVariant },
];

export default function AdminBanner() {
  const { token } = useAuth();
  const [banner, setBanner] = useState<Banner>({ enabled: false, message: "", variant: "info" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    adminGetBannerApi(token).then((r) => setBanner(r.data)).catch(() => null);
  }, [token]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await adminUpdateBannerApi(token, banner);
      setBanner(res.data);
      toast.success("Bannière enregistrée");
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
    setSaving(false);
  };

  const VariantIcon = variantConfig[banner.variant].icon;

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="Bannière" 
        description="Gérez le bandeau d'annonce affiché sur le site"
        actions={
          <Button variant="gold" onClick={handleSave} disabled={saving}>
            {saving ? "Enregistrement..." : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          {/* Toggle */}
          <Card>
            <CardHeader>
              <CardTitle>Activation</CardTitle>
              <CardDescription>Activez ou désactivez la bannière sur le site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Afficher la bannière</p>
                  <p className="text-sm text-muted-foreground">
                    {banner.enabled ? "Visible sur toutes les pages" : "Masquée pour les visiteurs"}
                  </p>
                </div>
                <Switch
                  checked={banner.enabled}
                  onCheckedChange={(v) => setBanner((b) => ({ ...b, enabled: v }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Variant Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Style</CardTitle>
              <CardDescription>Choisissez l'apparence de la bannière</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(variantConfig) as [BannerVariant, typeof variantConfig.info][]).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setBanner((b) => ({ ...b, variant: key }))}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-3 transition-all",
                        banner.variant === key
                          ? cn(config.className, "ring-2 ring-offset-2 ring-primary")
                          : "hover:bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{config.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
              <CardDescription>Le texte affiché dans la bannière</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={banner.message}
                onChange={(e) => setBanner((b) => ({ ...b, message: e.target.value }))}
                placeholder="Entrez votre message..."
              />
              <p className="text-sm text-muted-foreground">
                {banner.message.length} caractères
              </p>
            </CardContent>
          </Card>

          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Modèles</CardTitle>
              <CardDescription>Utilisez un modèle prédéfini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates.map((t) => (
                  <Button
                    key={t.label}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => setBanner((b) => ({ ...b, message: t.message, variant: t.variant }))}
                  >
                    <div>
                      <p className="font-medium">{t.label}</p>
                      <p className="text-sm text-muted-foreground truncate">{t.message}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Aperçu
              </CardTitle>
              <CardDescription>Voici comment la bannière apparaîtra sur le site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                {/* Mock Header */}
                <div className="bg-card border-b p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded bg-primary" />
                    <div className="flex gap-4">
                      <div className="h-4 w-16 rounded bg-muted" />
                      <div className="h-4 w-16 rounded bg-muted" />
                      <div className="h-4 w-16 rounded bg-muted" />
                    </div>
                  </div>
                </div>

                {/* Banner Preview */}
                {banner.enabled && banner.message && (
                  <div className={cn(
                    "px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium",
                    variantConfig[banner.variant].previewClass
                  )}>
                    <VariantIcon className="h-4 w-4" />
                    <span>{banner.message}</span>
                  </div>
                )}

                {/* Mock Content */}
                <div className="p-6 bg-background">
                  <div className="space-y-3">
                    <div className="h-8 w-48 rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />
                  </div>
                </div>
              </div>

              {!banner.enabled && (
                <p className="text-center text-muted-foreground mt-4">
                  Activez la bannière pour voir l'aperçu
                </p>
              )}

              {banner.enabled && !banner.message && (
                <p className="text-center text-muted-foreground mt-4">
                  Ajoutez un message pour voir l'aperçu
                </p>
              )}
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className={cn(
            "border-2",
            banner.enabled ? "border-emerald-500" : "border-slate-200"
          )}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "rounded-full p-3",
                  banner.enabled ? "bg-emerald-100" : "bg-slate-100"
                )}>
                  {banner.enabled ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-lg">
                    {banner.enabled ? "Bannière active" : "Bannière inactive"}
                  </p>
                  <p className="text-muted-foreground">
                    {banner.enabled
                      ? "Les visiteurs voient cette bannière"
                      : "La bannière n'est pas visible"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
