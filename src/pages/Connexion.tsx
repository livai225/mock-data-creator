import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";

type LocationState = {
  redirectTo?: string;
};

export default function Connexion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const state = (location.state ?? {}) as LocationState;
  // Default redirect is now /dashboard for users
  const redirectTo = state.redirectTo;

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
              <CardTitle>Connexion</CardTitle>
              <CardDescription>Connecte-toi pour accéder à ton espace.</CardDescription>
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
                  placeholder="********"
                />
              </div>

              <Button
                className="w-full"
                variant="gold"
                disabled={disabled}
                onClick={async () => {
                  setSubmitting(true);
                  try {
                    const user = await login(email, password);
                    
                    if (user.role === 'admin') {
                      navigate("/admin", { replace: true });
                    } else {
                      navigate(redirectTo ?? "/dashboard", { replace: true });
                    }
                  } catch (e: any) {
                    // Gérer les différents types d'erreurs
                    let errorMessage = "Une erreur est survenue lors de la connexion";
                    
                    if (e?.response?.status === 502 || e?.response?.status === 503) {
                      errorMessage = "Le serveur est temporairement indisponible. Veuillez réessayer dans quelques instants.";
                    } else if (e?.response?.status === 500) {
                      errorMessage = "Une erreur serveur est survenue. Veuillez contacter le support si le problème persiste.";
                    } else if (e?.response?.status === 401) {
                      errorMessage = "Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.";
                    } else if (e?.response?.status === 403) {
                      errorMessage = "Votre compte a été désactivé. Veuillez contacter le support.";
                    } else if (e?.response?.status === 404) {
                      errorMessage = "Aucun compte n'existe avec cet email. Veuillez créer un compte.";
                    } else if (e?.message) {
                      errorMessage = e.message;
                    } else if (!navigator.onLine) {
                      errorMessage = "Vous êtes hors ligne. Veuillez vérifier votre connexion internet.";
                    }
                    
                    toast.error(errorMessage, {
                      duration: 5000,
                    });
                  } finally {
                    setSubmitting(false);
                  }
                }}
                type="button"
              >
                Se connecter
              </Button>

              <p className="text-sm text-muted-foreground">
                Pas de compte ?{" "}
                <Link className="text-secondary underline" to="/inscription" state={{ redirectTo }}>
                  Créer un compte
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
