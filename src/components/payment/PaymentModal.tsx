import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Smartphone, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { initiatePaymentApi, checkPaymentStatusApi, simulatePaymentApi } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  companyId: number;
  amount: number;
  onPaymentSuccess: () => void;
}

export function PaymentModal({
  open,
  onClose,
  companyId,
  amount,
  onPaymentSuccess,
}: PaymentModalProps) {
  const { token } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<string>("mobile_money");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "completed" | "failed">("pending");
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [isTestMode, setIsTestMode] = useState<boolean>(false);

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setPhoneNumber("");
      setPaymentMethod("mobile_money");
      setPaymentReference("");
      setPaymentStatus("pending");
    }
  }, [open]);

  const handleInitiatePayment = async () => {
    if (!token) {
      toast.error("Vous devez être connecté pour effectuer un paiement");
      return;
    }

    if (paymentMethod === "mobile_money" && !phoneNumber) {
      toast.error("Veuillez entrer votre numéro de téléphone");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await initiatePaymentApi(token, {
        company_id: companyId,
        amount,
        payment_method: paymentMethod,
      });

      if (response.success && response.data) {
        const payment = response.data.payment;
        setPaymentReference(payment.payment_reference);
        setPaymentId(payment.id);
        setIsTestMode(response.data.test_mode || false);

        if (response.data.already_paid) {
          setPaymentStatus("completed");
          toast.success("Paiement déjà effectué pour cette entreprise");
          setTimeout(() => {
            onPaymentSuccess();
            onClose();
          }, 1500);
        } else if (response.data.test_mode) {
          // Mode TEST : Le paiement sera confirmé automatiquement
          toast.info(
            `Mode TEST : Paiement initié. Référence: ${payment.payment_reference}. Confirmation automatique dans 3 secondes...`
          );

          // Vérifier le statut après 4 secondes (donne le temps au backend de simuler)
          setTimeout(async () => {
            if (payment.id) {
              await checkPaymentStatus(payment.id);
            }
          }, 4000);
        } else {
          // Mode production : Attendre le webhook ou la confirmation manuelle
          toast.info(
            `Paiement initié. Référence: ${payment.payment_reference}. En attente de confirmation...`
          );

          // Vérifier périodiquement le statut
          const checkInterval = setInterval(async () => {
            if (payment.id) {
              const statusResponse = await checkPaymentStatusApi(token, payment.id);
              if (statusResponse.success && statusResponse.data?.is_paid) {
                clearInterval(checkInterval);
                setPaymentStatus("completed");
                toast.success("Paiement confirmé avec succès !");
                setTimeout(() => {
                  onPaymentSuccess();
                  onClose();
                }, 1500);
              }
            }
          }, 3000);

          // Arrêter après 5 minutes
          setTimeout(() => clearInterval(checkInterval), 300000);
        }
      } else {
        toast.error(response.message || "Erreur lors de l'initiation du paiement");
      }
    } catch (error) {
      console.error("Erreur paiement:", error);
      toast.error("Erreur lors de l'initiation du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (paymentId: number) => {
    if (!token) return;

    try {
      const response = await checkPaymentStatusApi(token, paymentId);
      if (response.success && response.data) {
        const isPaid = response.data.is_paid;
        if (isPaid) {
          setPaymentStatus("completed");
          toast.success("Paiement confirmé avec succès !");
          setTimeout(() => {
            onPaymentSuccess();
            onClose();
          }, 1500);
        } else {
          // Continuer à vérifier
          setTimeout(() => checkPaymentStatus(paymentId), 3000);
        }
      }
    } catch (error) {
      console.error("Erreur vérification paiement:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Paiement des documents
          </DialogTitle>
          <DialogDescription>
            Veuillez effectuer le paiement pour télécharger vos documents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Montant */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Montant à payer</span>
              <span className="text-2xl font-bold text-primary">
                {amount.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>

          {paymentStatus === "pending" && (
            <>
              {/* Méthode de paiement */}
              <div className="space-y-2">
                <Label>Méthode de paiement</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobile_money">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Mobile Money (MTN, Orange, Moov)
                      </div>
                    </SelectItem>
                    <SelectItem value="card">Carte bancaire</SelectItem>
                    <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Numéro de téléphone pour Mobile Money */}
              {paymentMethod === "mobile_money" && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="07 XX XX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Entrez votre numéro MTN Mobile Money, Orange Money ou Moov Money
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Instructions de paiement :</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Cliquez sur "Payer maintenant"</li>
                      <li>Vous recevrez une demande de paiement sur votre téléphone</li>
                      <li>Confirmez le paiement depuis votre application Mobile Money</li>
                      <li>Le statut sera mis à jour automatiquement</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {paymentStatus === "completed" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                <div>
                  <p className="font-medium">Paiement confirmé !</p>
                  <p className="text-sm text-green-700">
                    Référence : {paymentReference}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing || paymentStatus === "completed"}
              className="flex-1"
            >
              Annuler
            </Button>
            {paymentStatus === "pending" && !paymentId && (
              <Button
                onClick={handleInitiatePayment}
                disabled={isProcessing || (paymentMethod === "mobile_money" && !phoneNumber)}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Payer maintenant"
                )}
              </Button>
            )}
            {paymentStatus === "pending" && paymentId && isTestMode && (
              <Button
                onClick={async () => {
                  if (!token || !paymentId) return;
                  setIsProcessing(true);
                  try {
                    const response = await simulatePaymentApi(token, paymentId);
                    if (response.success) {
                      setPaymentStatus("completed");
                      toast.success("Paiement simulé avec succès !");
                      setTimeout(() => {
                        onPaymentSuccess();
                        onClose();
                      }, 1500);
                    }
                  } catch (error) {
                    toast.error("Erreur lors de la simulation du paiement");
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Simulation...
                  </>
                ) : (
                  "Simuler le paiement (TEST)"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

