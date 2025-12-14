import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, LogOut } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

type PendingDocs = {
  docs: string[];
  companyTypeName?: string;
};

const PENDING_KEY = "arch_excellence_pending_docs";

export default function EspaceDocuments() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, logout, user } = useAuth();
  const [pending, setPending] = useState<PendingDocs | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/connexion", { state: { redirectTo: "/espace/documents" }, replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_KEY);
      if (!raw) return;
      setPending(JSON.parse(raw) as PendingDocs);
    } catch {
      setPending(null);
    }
  }, []);

  const docs = useMemo(() => pending?.docs ?? [], [pending?.docs]);

  if (loading) return null;
  if (!isAuthenticated) return null;

  return (
    <Layout>
      <section className="bg-primary py-16">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-2">
                Mes documents
              </h1>
              <p className="text-primary-foreground/80 max-w-2xl">
                {user?.email}
                {pending?.companyTypeName ? ` • ${pending.companyTypeName}` : ""}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-4xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents disponibles</CardTitle>
              <CardDescription>
                Télécharge tes documents un par un. (L’enregistrement en base et les vrais fichiers PDF seront branchés ensuite.)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {docs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun document à afficher pour le moment.</p>
              ) : (
                docs.map((doc) => (
                  <div key={doc} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" />
                      <span>{doc}</span>
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      type="button"
                      onClick={() => {
                        // Placeholder: will download real file when backend documents are connected.
                      }}
                    >
                      <Download className="h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
