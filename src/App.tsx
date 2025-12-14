import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreationEntreprise from "./pages/CreationEntreprise";
import DocumentsGeneres from "./pages/DocumentsGeneres";
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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/creation-entreprise" element={<CreationEntreprise />} />
          <Route path="/documents-generes" element={<DocumentsGeneres />} />
          <Route path="/services" element={<Services />} />
          <Route path="/fiscalite" element={<Fiscalite />} />
          <Route path="/boutique" element={<Boutique />} />
          <Route path="/tarifs" element={<Tarifs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
