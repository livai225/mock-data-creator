import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function PaymentError() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ref = params.get("ref");

  return (
    <Layout>
      <section className="min-h-[60vh] flex items-center justify-center py-16">
        <div className="container max-w-md text-center space-y-6">
          <XCircle className="h-20 w-20 text-destructive mx-auto" />
          <h1 className="text-3xl font-bold">Paiement échoué</h1>
          <p className="text-muted-foreground">
            Votre paiement n'a pas pu être traité. Veuillez réessayer ou contacter le support si le problème persiste.
          </p>
          {ref && (
            <p className="text-xs text-muted-foreground font-mono">Référence : {ref}</p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/contact")}>
              Contacter le support
            </Button>
            <Button className="flex-1" onClick={() => navigate("/dashboard")}>
              Retour au tableau de bord
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
