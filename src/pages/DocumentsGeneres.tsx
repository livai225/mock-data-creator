import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, ArrowLeft } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { generateDocumentsApi } from "@/lib/api";

type LocationState = {
  docs?: string[];
  companyTypeName?: string;
};

const PENDING_KEY = "arch_excellence_pending_docs";

export default function DocumentsGeneres() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, token } = useAuth();
  const state = (location.state ?? {}) as LocationState;
  const [submitting, setSubmitting] = useState(false);

  const docs = state.docs ?? [];

  useEffect(() => {
    if (docs.length === 0) {
      navigate("/creation-entreprise", { replace: true });
    }
  }, [docs.length, navigate]);

  if (docs.length === 0) return null;

  const downloadDisabled = useMemo(() => loading || submitting, [loading, submitting]);

  return (
    <Layout>
      <section className="bg-primary py-16">
        <div className="container">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
            Vérification des documents
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl">
            Vérifie les documents générés{state.companyTypeName ? ` pour ${state.companyTypeName}` : ""} avant de les télécharger.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-4xl space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={() => navigate(-1)} type="button">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>

            <Button
              variant="gold"
              disabled={downloadDisabled}
              onClick={() => {
                try {
                  sessionStorage.setItem(
                    PENDING_KEY,
                    JSON.stringify({ docs, companyTypeName: state.companyTypeName }),
                  );
                } catch {
                  // ignore
                }

                if (!loading && !isAuthenticated) {
                  navigate("/connexion", {
                    state: { redirectTo: "/espace/documents" },
                  });
                  return;
                }

                if (!token) {
                  navigate("/connexion", {
                    state: { redirectTo: "/espace/documents" },
                  });
                  return;
                }

                setSubmitting(true);
                generateDocumentsApi(token, { companyTypeName: state.companyTypeName, docs })
                  .then(() => {
                    navigate("/espace/documents");
                  })
                  .finally(() => {
                    setSubmitting(false);
                  });
              }}
              type="button"
            >
              <Download className="h-4 w-4" />
              {submitting ? "Génération..." : "Télécharger"}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Documents générés</CardTitle>
              <CardDescription>Assure-toi que tout est correct avant téléchargement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {docs.map((doc) => (
                <div key={doc} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />
                  <span>{doc}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
