import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Download, Eye, CheckCircle, Clock, XCircle, AlertCircle, Receipt, Building2, Calendar, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Badge } from "@/components/ui/badge";

interface Payment {
  id: number;
  company_id: number;
  company_name: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  payment_reference: string | null;
  payment_date: string | null;
  created_at: string;
  description: string;
}

export default function MesPaiements() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, token } = useAuth();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    totalAmount: 0,
  });

  // Protection de la route
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/connexion", { state: { redirectTo: "/mes-paiements" }, replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Charger les paiements
  useEffect(() => {
    const fetchPayments = async () => {
      if (!token) return;
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setPayments(data.data || []);
          
          // Calculer les stats
          const paymentsData = data.data || [];
          setStats({
            total: paymentsData.length,
            pending: paymentsData.filter((p: Payment) => p.status === 'pending').length,
            completed: paymentsData.filter((p: Payment) => p.status === 'completed').length,
            totalAmount: paymentsData
              .filter((p: Payment) => p.status === 'completed')
              .reduce((sum: number, p: Payment) => sum + p.amount, 0),
          });
        }
      } catch (error) {
        console.error('Erreur chargement paiements:', error);
      } finally {
        setIsLoadingData(false);
      }
    };
    
    if (isAuthenticated && token) {
      fetchPayments();
    }
  }, [isAuthenticated, token]);

  const getStatusBadge = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Payé
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Échoué
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            Remboursé
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleDownloadReceipt = async (paymentId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/${paymentId}/receipt`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recu-paiement-${paymentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Reçu téléchargé");
      } else {
        toast.error("Erreur lors du téléchargement");
      }
    } catch (error) {
      toast.error("Erreur de connexion");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Dashboard */}
        <DashboardNav activeTab="paiements" />
        
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Mes Paiements</h1>
              <p className="text-muted-foreground">Suivez l'historique de vos paiements et téléchargez vos reçus</p>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total paiements</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Complétés</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Montant total</p>
                    <p className="text-2xl font-bold text-primary">
                      {stats.totalAmount.toLocaleString('fr-FR')} <span className="text-sm">FCFA</span>
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des paiements */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des paiements</CardTitle>
              <CardDescription>
                Tous vos paiements pour la création d'entreprises
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingData ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun paiement</h3>
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore effectué de paiement
                  </p>
                  <Button onClick={() => navigate('/creation-entreprise')}>
                    Créer une entreprise
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-4 mb-4 md:mb-0">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{payment.company_name}</h4>
                          <p className="text-sm text-muted-foreground">{payment.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(payment.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            {payment.payment_reference && (
                              <span>Réf: {payment.payment_reference}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {payment.amount.toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span>
                          </p>
                          <div className="mt-1">
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                        
                        {payment.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(payment.id)}
                            title="Télécharger le reçu"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {payment.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => navigate(`/paiement/${payment.id}`)}
                          >
                            Payer maintenant
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations de paiement */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Moyens de paiement acceptés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <span className="text-2xl">🟠</span>
                  </div>
                  <div>
                    <p className="font-medium">Orange Money</p>
                    <p className="text-sm text-muted-foreground">Paiement mobile instantané</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <span className="text-2xl">💳</span>
                  </div>
                  <div>
                    <p className="font-medium">MTN Mobile Money</p>
                    <p className="text-sm text-muted-foreground">Paiement mobile sécurisé</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <span className="text-2xl">🏦</span>
                  </div>
                  <div>
                    <p className="font-medium">Virement bancaire</p>
                    <p className="text-sm text-muted-foreground">Paiement par compte bancaire</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

