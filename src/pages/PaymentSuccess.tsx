import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthContext";
import { verifyPaymentApi } from "@/lib/api";

type VerifyState = "checking" | "paid" | "pending";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ref = params.get("ref");
  const { token } = useAuth();
  const [state, setState] = useState<VerifyState>("checking");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    if (!ref || !token) {
      // Pas de référence ou pas connecté : on affiche le message standard
      setState("paid");
      toast.success("Paiement effectué avec succès !");
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 5;

    const verify = async () => {
      attempts++;
      try {
        const res = await verifyPaymentApi(token, ref);
        if (cancelled) return;
        if (res.success && res.data?.is_paid) {
          setState("paid");
          toast.success("Paiement confirmé ! Vos documents sont disponibles.");
          return;
        }
      } catch {
        // on réessaie
      }
      if (cancelled) return;
      if (attempts < maxAttempts) {
        // Le webhook/règlement peut prendre quelques secondes
        setTimeout(verify, 3000);
      } else {
        setState("pending");
      }
    };

    verify();
    return () => { cancelled = true; };
  }, [ref, token]);

  return (
    <Layout>
      <section className="min-h-[60vh] flex items-center justify-center py-16">
        <div className="container max-w-md text-center space-y-6">
          {state === "checking" && (
            <>
              <Loader2 className="h-20 w-20 text-primary mx-auto animate-spin" />
              <h1 className="text-3xl font-bold">Vérification du paiement...</h1>
              <p className="text-muted-foreground">
                Merci de patienter quelques instants pendant que nous confirmons votre paiement.
              </p>
            </>
          )}

          {state === "paid" && (
            <>
              <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto" />
              <h1 className="text-3xl font-bold">Paiement réussi !</h1>
              <p className="text-muted-foreground">
                Votre paiement a bien été reçu. Vos documents sont maintenant disponibles en téléchargement dans votre tableau de bord.
              </p>
            </>
          )}

          {state === "pending" && (
            <>
              <AlertCircle className="h-20 w-20 text-amber-500 mx-auto" />
              <h1 className="text-3xl font-bold">Paiement en cours de traitement</h1>
              <p className="text-muted-foreground">
                Votre paiement est en cours de validation. Cela peut prendre quelques minutes.
                Rafraîchissez votre tableau de bord dans un instant — si le problème persiste, contactez le support.
              </p>
            </>
          )}

          {ref && (
            <p className="text-xs text-muted-foreground font-mono">Référence : {ref}</p>
          )}
          <Button className="w-full" onClick={() => navigate("/dashboard")} disabled={state === "checking"}>
            Accéder à mon tableau de bord
          </Button>
        </div>
      </section>
    </Layout>
  );
}
