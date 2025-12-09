import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message envoyé avec succès!", {
      description: "Nous vous répondrons dans les plus brefs délais.",
    });
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-20">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary-foreground mb-6">
              Contactez-nous
            </h1>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              Notre équipe d'experts est à votre disposition pour répondre à toutes vos questions 
              et vous accompagner dans vos projets.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Envoyez-nous un message</CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input id="firstName" placeholder="Votre prénom" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input id="lastName" placeholder="Votre nom" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="votre@email.ci" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="0707070707" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input id="subject" placeholder="Objet de votre message" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Décrivez votre demande en détail..." 
                      rows={5}
                      required 
                    />
                  </div>
                  <Button variant="gold" size="lg" className="w-full">
                    <Send className="h-4 w-4" />
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <Card variant="gold">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      <Phone className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Téléphone</h3>
                      <a href="tel:0151252999" className="text-secondary font-medium text-lg hover:underline">
                        01 51 25 29 99
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">
                        Lundi - Vendredi, 8h - 18h
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Email</h3>
                      <a href="mailto:contact@archexcellence.ci" className="text-secondary font-medium hover:underline">
                        contact@archexcellence.ci
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">
                        Réponse sous 24-48h ouvrées
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Adresse</h3>
                      <p className="text-muted-foreground">
                        Abidjan, Côte d'Ivoire<br />
                        Cocody - Riviera Palmeraie
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Horaires d'ouverture</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><span className="font-medium text-foreground">Lundi - Vendredi :</span> 8h00 - 18h00</p>
                        <p><span className="font-medium text-foreground">Samedi :</span> 9h00 - 13h00</p>
                        <p><span className="font-medium text-foreground">Dimanche :</span> Fermé</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp CTA */}
              <Card variant="outline" className="border-accent/30 bg-accent/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
                      <MessageSquare className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">
                        Besoin d'une réponse rapide ?
                      </p>
                    </div>
                    <Button variant="gold" asChild>
                      <a href="https://wa.me/2250151252999" target="_blank" rel="noopener noreferrer">
                        Écrire
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-muted-foreground">
              Trouvez rapidement les réponses à vos questions.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {[
              {
                q: "Combien de temps faut-il pour créer une SARL ?",
                a: "Avec notre plateforme, vous recevez vos documents sous 24-48h. Le dépôt au CEPICI prend ensuite 3-5 jours ouvrés.",
              },
              {
                q: "Quels documents dois-je fournir ?",
                a: "Pièce d'identité des associés, justificatif de domicile, et attestation de domiciliation ou contrat de bail.",
              },
              {
                q: "Puis-je créer une entreprise en tant qu'étranger ?",
                a: "Oui, nous accompagnons les investisseurs étrangers avec des packs dédiés incluant toutes les démarches administratives.",
              },
              {
                q: "Quels moyens de paiement acceptez-vous ?",
                a: "Mobile Money (Orange, MTN, Moov, Wave) et cartes bancaires via CinetPay.",
              },
            ].map((faq, index) => (
              <Card key={index} variant="outline">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
