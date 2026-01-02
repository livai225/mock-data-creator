import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Clock, 
  AlertCircle, 
  User, 
  Building2,
  CreditCard,
  FileImage,
  Loader2
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { getPendingPaymentsApi, validateManualPaymentApi, rejectManualPaymentApi } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Payment {
  id: number;
  payment_reference: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_reference: string;
  payment_proof_path: string;
  created_at: string;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  company_name: string;
  company_type: string;
  metadata: any;
}

export default function AdminPayments() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadPayments = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await getPendingPaymentsApi(token, 100);
      if (response.success) {
        setPayments(response.data || []);
      }
    } catch (error: any) {
      console.error("Erreur chargement paiements:", error);
      toast.error("Erreur lors du chargement des paiements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [token]);

  const handleValidate = async (payment: Payment) => {
    if (!token) return;

    setIsProcessing(true);
    try {
      const response = await validateManualPaymentApi(token, payment.id);
      if (response.success) {
        toast.success("Paiement validé avec succès !");
        await loadPayments();
        setSelectedPayment(null);
      }
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la validation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!token || !selectedPayment) return;

    if (!rejectReason.trim()) {
      toast.error("Veuillez indiquer la raison du rejet");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await rejectManualPaymentApi(token, selectedPayment.id, rejectReason);
      if (response.success) {
        toast.success("Paiement rejeté");
        await loadPayments();
        setShowRejectDialog(false);
        setSelectedPayment(null);
        setRejectReason("");
      }
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors du rejet");
    } finally {
      setIsProcessing(false);
    }
  };

  const getImageUrl = (path: string) => {
    // Construire l'URL complète vers l'image
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${baseUrl}/${path}`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return dateString;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Accès refusé</CardTitle>
              <CardDescription>Vous n'avez pas les permissions nécessaires</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Gestion des Paiements
          </h1>
          <p className="text-muted-foreground mt-2">
            Validez ou rejetez les preuves de paiement soumises par les clients
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Paiements en attente</CardTitle>
                <CardDescription>
                  {payments.length} paiement{payments.length > 1 ? 's' : ''} à traiter
                </CardDescription>
              </div>
              <Button onClick={loadPayments} variant="outline" size="sm">
                <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">Aucun paiement en attente</p>
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <Card key={payment.id} className="border-orange-200 bg-orange-50/30">
                      <CardContent className="pt-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Info client et entreprise */}
                          <div className="space-y-3">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground">Client</p>
                                <p className="font-semibold">
                                  {payment.user_first_name} {payment.user_last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">{payment.user_email}</p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Building2 className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground">Entreprise</p>
                                <p className="font-semibold">{payment.company_name}</p>
                                <Badge variant="secondary" className="text-xs">
                                  {payment.company_type}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-gray-600 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-muted-foreground">Date de soumission</p>
                                <p className="font-medium">{formatDate(payment.created_at)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Info paiement */}
                          <div className="space-y-3">
                            <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                              <p className="text-sm text-muted-foreground">Montant</p>
                              <p className="text-2xl font-bold text-primary">
                                {payment.amount.toLocaleString('fr-FR')} {payment.currency}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">Référence transaction</p>
                              <p className="font-mono text-sm font-semibold bg-white px-2 py-1 rounded border">
                                {payment.transaction_reference}
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground mb-2">Preuve de paiement</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setShowImageDialog(true);
                                }}
                                className="w-full"
                              >
                                <FileImage className="h-4 w-4 mr-2" />
                                Voir la capture
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 mt-4 pt-4 border-t">
                          <Button
                            onClick={() => handleValidate(payment)}
                            disabled={isProcessing}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Valider
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowRejectDialog(true);
                            }}
                            disabled={isProcessing}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Dialog pour voir l'image */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Preuve de paiement</DialogTitle>
              <DialogDescription>
                Vérifiez que le montant et la référence correspondent
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-2">
                  <img
                    src={getImageUrl(selectedPayment.payment_proof_path)}
                    alt="Preuve de paiement"
                    className="w-full h-auto rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Montant attendu</p>
                    <p className="font-bold text-lg">
                      {selectedPayment.amount.toLocaleString('fr-FR')} {selectedPayment.currency}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Référence</p>
                    <p className="font-mono font-semibold">{selectedPayment.transaction_reference}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog pour rejeter */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rejeter le paiement</DialogTitle>
              <DialogDescription>
                Indiquez la raison du rejet. Le client sera notifié.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium mb-2">Raison du rejet *</p>
                <Textarea
                  placeholder="Ex: Le montant sur la capture ne correspond pas, la référence est illisible, etc."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
              {selectedPayment && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800">
                      <p className="font-medium">Le client sera informé par email</p>
                      <p>Il pourra soumettre une nouvelle preuve de paiement</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason("");
                }}
                disabled={isProcessing}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
