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
};

export default function Connexion() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();

  const state = (location.state ?? {}) as LocationState;
  const redirectTo = state.redirectTo ?? "/espace/documents";

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
              <CardDescription>Connecte-toi pour accéder à tes documents.</CardDescription>
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
                    await login(email, password);
                    navigate(redirectTo, { replace: true });
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
