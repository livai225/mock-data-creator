import { useState } from "react";
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
  Smartphone, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Copy,
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { submitManualPaymentApi } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

interface ManualPaymentModalProps {
  open: boolean;
  onClose: () => void;
  companyId: number;
  amount: number;
  onPaymentSubmitted: () => void;
}

export function ManualPaymentModal({
  open,
  onClose,
  companyId,
  amount,
  onPaymentSubmitted,
}: ManualPaymentModalProps) {
  const { token } = useAuth();
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionReference, setTransactionReference] = useState<string>("");

  // Numéros de dépôt (à configurer selon vos besoins)
  const depositNumbers = [
    { operator: "MTN Mobile Money", number: "07 XX XX XX XX", color: "text-yellow-600" },
    { operator: "Orange Money", number: "07 XX XX XX XX", color: "text-orange-600" },
    { operator: "Moov Money", number: "01 XX XX XX XX", color: "text-blue-600" },
    { operator: "Wave", number: "07 XX XX XX XX", color: "text-pink-600" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image (JPG, PNG, etc.)");
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image est trop volumineuse (max 5MB)");
        return;
      }

      setPaymentProof(file);
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number.replace(/\s/g, ''));
    toast.success("Numéro copié !");
  };

  const handleSubmit = async () => {
    if (!paymentProof) {
      toast.error("Veuillez joindre la capture du reçu de paiement");
      return;
    }

    if (!transactionReference.trim()) {
      toast.error("Veuillez entrer la référence de la transaction");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('company_id', companyId.toString());
      formData.append('amount', amount.toString());
      formData.append('payment_proof', paymentProof);
      formData.append('transaction_reference', transactionReference);

      const response = await submitManualPaymentApi(token!, formData);

      if (response.success) {
        toast.success("Preuve de paiement soumise avec succès ! En attente de validation par l'administrateur.");
        onPaymentSubmitted();
        onClose();
      } else {
        toast.error(response.message || "Erreur lors de la soumission du paiement");
      }
    } catch (error: any) {
      console.error("Erreur soumission paiement:", error);
      toast.error(error?.message || "Erreur lors de la soumission du paiement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            Paiement par Mobile Money
          </DialogTitle>
          <DialogDescription>
            Effectuez votre dépôt et joignez la preuve de paiement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Montant */}
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-primary">Montant à payer</span>
              <span className="text-3xl font-bold text-primary">
                {amount.toLocaleString("fr-FR")} FCFA
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Étapes à suivre :
            </h3>

            {/* Étape 1 : Faire le dépôt */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium text-blue-900 mb-3">
                1️⃣ Faites un dépôt vers l'un de ces numéros :
              </p>
              <div className="space-y-2">
                {depositNumbers.map((deposit, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <p className={`font-semibold ${deposit.color}`}>{deposit.operator}</p>
                      <p className="text-lg font-mono font-bold">{deposit.number}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyNumber(deposit.number)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Étape 2 : Référence de transaction */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-medium text-green-900 mb-3">
                2️⃣ Entrez la référence de votre transaction :
              </p>
              <div className="space-y-2">
                <Label htmlFor="transaction-ref">Référence de transaction *</Label>
                <Input
                  id="transaction-ref"
                  placeholder="Ex: MP231225.1234.A12345"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-green-700">
                  La référence figure sur votre SMS ou reçu de confirmation
                </p>
              </div>
            </div>

            {/* Étape 3 : Upload de la capture */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="font-medium text-purple-900 mb-3">
                3️⃣ Joignez la capture du reçu de paiement :
              </p>
              
              {!paymentProof ? (
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                  <Input
                    id="payment-proof"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="payment-proof"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-purple-500" />
                    <span className="font-medium text-purple-900">
                      Cliquer pour sélectionner une image
                    </span>
                    <span className="text-xs text-purple-700">
                      JPG, PNG ou PDF (max 5MB)
                    </span>
                  </Label>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border-2 border-purple-300">
                    <img
                      src={previewUrl}
                      alt="Prévisualisation"
                      className="w-full h-48 object-contain bg-white"
                    />
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setPaymentProof(null);
                          setPreviewUrl("");
                        }}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <ImageIcon className="h-4 w-4" />
                    <span className="font-medium">{paymentProof.name}</span>
                    <span className="text-xs">
                      ({(paymentProof.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Note importante */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">⚠️ Important :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>La capture doit être claire et lisible</li>
                  <li>Assurez-vous que le montant et la référence sont visibles</li>
                  <li>Votre demande sera validée sous 24h maximum</li>
                  <li>Vous recevrez un email de confirmation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !paymentProof || !transactionReference.trim()}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Valider le paiement
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
