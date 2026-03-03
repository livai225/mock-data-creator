import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  X,
  Phone,
  CreditCard,
  ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { submitPaymentProofApi } from "@/lib/api";
import { useAuth } from "@/auth/AuthContext";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  companyId: number;
  amount: number;
  onPaymentSuccess?: () => void;
}

export function PaymentModal({ 
  open, 
  onClose, 
  companyId, 
  amount,
  onPaymentSuccess 
}: PaymentModalProps) {
  const { token } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 5 MB");
        return;
      }

      // Vérifier le type
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image valide");
        return;
      }

      setProofImage(file);

      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!phoneNumber) {
      toast.error("Veuillez entrer le numéro de téléphone utilisé pour le paiement");
      return;
    }

    if (!transactionRef) {
      toast.error("Veuillez entrer la référence de transaction");
      return;
    }

    if (!proofImage) {
      toast.error("Veuillez joindre une capture d'écran de la transaction");
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer un FormData pour envoyer le fichier
      const formData = new FormData();
      formData.append('companyId', companyId.toString());
      formData.append('phoneNumber', phoneNumber);
      formData.append('transactionReference', transactionRef);
      formData.append('proofImage', proofImage);

      await submitPaymentProofApi(token!, formData);

      toast.success("Preuve de paiement envoyée avec succès ! Un administrateur va la vérifier.");
      
      // Réinitialiser le formulaire
      setPhoneNumber("");
      setTransactionRef("");
      setProofImage(null);
      setImagePreview(null);

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }

      onClose();
    } catch (error: any) {
      console.error('Erreur envoi preuve:', error);
      toast.error(error?.message || "Erreur lors de l'envoi de la preuve de paiement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setProofImage(null);
    setImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Paiement de {amount.toLocaleString()} FCFA
          </DialogTitle>
          <DialogDescription>
            Effectuez le paiement via Mobile Money et joignez la preuve de transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Instructions de paiement
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Effectuez un dépôt de <strong>{amount.toLocaleString()} FCFA</strong></li>
              <li>Vers l'un de ces numéros Mobile Money :</li>
              <ul className="ml-8 space-y-1 text-blue-700">
                <li>📱 <strong>Orange Money:</strong> 07 XX XX XX XX</li>
                <li>📱 <strong>MTN Money:</strong> 05 XX XX XX XX</li>
                <li>📱 <strong>Moov Money:</strong> 01 XX XX XX XX</li>
              </ul>
              <li>Prenez une <strong>capture d'écran</strong> de la transaction</li>
              <li>Remplissez le formulaire ci-dessous</li>
            </ol>
          </div>

          {/* Formulaire */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                <Phone className="h-4 w-4 inline mr-1" />
                Numéro de téléphone utilisé *
              </Label>
              <Input
                id="phoneNumber"
                placeholder="Ex: 07 12 34 56 78"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground">
                Le numéro depuis lequel vous avez effectué le paiement
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionRef">
                Référence de transaction *
              </Label>
              <Input
                id="transactionRef"
                placeholder="Ex: OM123456789 ou MTN987654321"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                La référence affichée sur votre SMS de confirmation
              </p>
            </div>

            <div className="space-y-2">
              <Label>
                <ImageIcon className="h-4 w-4 inline mr-1" />
                Capture d'écran de la transaction *
              </Label>
              
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preuve de paiement" 
                    className="w-full h-48 object-contain border rounded-lg bg-muted"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('proofImage')?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium mb-1">
                    Cliquez pour télécharger une image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, JPEG (max 5 MB)
                  </p>
                  <Input
                    id="proofImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Votre demande sera vérifiée sous 30 min. Vous recevrez une notification par email une fois le paiement validé.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button 
            variant="default" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Envoi en cours...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Soumettre la preuve
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
