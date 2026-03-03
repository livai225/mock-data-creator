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
  Send
} from "lucide-react";
import { toast } from "sonner";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.48 0 .12 5.36.12 11.94c0 2.1.55 4.16 1.59 5.98L0 24l6.24-1.64a11.9 11.9 0 0 0 5.82 1.49h.01c6.58 0 11.94-5.36 11.94-11.94a11.86 11.86 0 0 0-3.49-8.43Zm-8.45 18.35h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.7.97.99-3.6-.24-.37A9.89 9.89 0 0 1 2.14 11.94c0-5.48 4.45-9.93 9.93-9.93 2.65 0 5.14 1.03 7.02 2.91a9.86 9.86 0 0 1 2.9 7.02c0 5.47-4.45 9.92-9.92 9.92Zm5.45-7.44c-.3-.15-1.78-.88-2.06-.98-.27-.1-.47-.15-.67.15-.2.3-.76.98-.93 1.18-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.88-.78-1.48-1.74-1.66-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.52-.08-.15-.67-1.62-.92-2.23-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.08-.8.38-.28.3-1.05 1.03-1.05 2.51 0 1.48 1.08 2.9 1.23 3.1.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.08-.13-.27-.2-.57-.35Z" />
    </svg>
  );
}

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
                      <a href="mailto:archexcellence18@gmail.com" className="text-secondary font-medium hover:underline">
                        archexcellence18@gmail.com
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">
                        Réponse sous 30 min ouvrées
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
                        Cocody , Riviera
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
                      <h3 className="font-semibold text-lg mb-1">Horaire</h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p><span className="font-medium text-foreground">Lundi - Vendredi :</span> 8h - 17h</p>
                        <p><span className="font-medium text-foreground">Samedi :</span> Fermé</p>
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
                      <WhatsAppIcon className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">
                        Envoyez un message à Arch Excellence SARL
                      </p>
                    </div>
                    <Button variant="gold" asChild>
                      <a href="https://wa.me/message/WAPHCIKXX77DE1" target="_blank" rel="noopener noreferrer">
                        Envoyer un message
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
                a: "Avec notre plateforme, vous recevez vos documents sous 30 min. Le dépôt au CEPICI prend ensuite 3-5 jours ouvrés.",
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
