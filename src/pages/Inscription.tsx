import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthContext";

type LocationState = {
  redirectTo?: string;
  fromPreview?: boolean;
};

export default function Inscription() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loading } = useAuth();

  const state = (location.state ?? {}) as LocationState;
  const redirectTo = state.redirectTo ?? "/dashboard";
  const fromPreview = state.fromPreview ?? false;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const disabled = useMemo(() => submitting || loading || !email || !password, [email, loading, password, submitting]);

  return (
    <Layout>
      <section className="py-12">
        <div className="container max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Inscription</CardTitle>
              <CardDescription>Crée un compte pour recevoir tes documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@domaine.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 caractères, 1 maj, 1 min, 1 chiffre"
                />
              </div>

              <Button
                className="w-full"
                variant="gold"
                disabled={disabled}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    await register(email, password);
                    if (redirectTo === "/preview-documents") {
                      const pendingPreviewStateRaw = sessionStorage.getItem("pending_preview_state");
                      sessionStorage.removeItem("pending_preview_state");

                      if (pendingPreviewStateRaw) {
                        try {
                          const pendingPreviewState = JSON.parse(pendingPreviewStateRaw);
                          navigate("/preview-documents", { replace: true, state: pendingPreviewState });
                          return;
                        } catch {
                          // fallback below
                        }
                      }
                    }

                    navigate(redirectTo, { replace: true });
                  } finally {
                    setSubmitting(false);
                  }
                }}
                type="button"
              >
                Créer mon compte
              </Button>

              <p className="text-sm text-muted-foreground">
                Déjà un compte ?{" "}
                <Link className="text-secondary underline" to="/connexion" state={{ redirectTo }}>
                  Se connecter
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
