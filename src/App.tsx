import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import RequireAdmin from "@/admin/RequireAdmin";
import AdminLayout from "@/admin/AdminLayout";
import Index from "./pages/Index";
import CreationEntreprise from "./pages/CreationEntreprise";
import DocumentsGeneres from "./pages/DocumentsGeneres";
import Connexion from "./pages/Connexion";
import Inscription from "./pages/Inscription";
import EspaceDocuments from "./pages/EspaceDocuments";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminDocuments from "./pages/admin/AdminDocuments";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminBanner from "./pages/admin/AdminBanner";
import Services from "./pages/Services";
import Fiscalite from "./pages/Fiscalite";
import Boutique from "./pages/Boutique";
import Tarifs from "./pages/Tarifs";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/creation-entreprise" element={<CreationEntreprise />} />
            <Route path="/documents-generes" element={<DocumentsGeneres />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/espace/documents" element={<EspaceDocuments />} />
            <Route path="/dashboard" element={<ClientDashboard />} />

            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="utilisateurs" element={<AdminUsers />} />
              <Route path="entreprises" element={<AdminCompanies />} />
              <Route path="documents" element={<AdminDocuments />} />
              <Route path="tarifs" element={<AdminPricing />} />
              <Route path="banniere" element={<AdminBanner />} />
            </Route>

            <Route path="/services" element={<Services />} />
            <Route path="/fiscalite" element={<Fiscalite />} />
            <Route path="/boutique" element={<Boutique />} />
            <Route path="/tarifs" element={<Tarifs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
