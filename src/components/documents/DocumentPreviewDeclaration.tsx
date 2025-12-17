import { SARLUFormData } from "@/lib/sarlu-types";
import { SARLPluriFormData } from "@/lib/sarl-pluri-types";

interface DocumentPreviewDeclarationProps {
  formData: SARLUFormData | SARLPluriFormData;
  companyType: 'SARLU' | 'SARL_PLURI';
}

export function DocumentPreviewDeclaration({ formData, companyType }: DocumentPreviewDeclarationProps) {
  const isSARLU = companyType === 'SARLU';
  const sarluData = formData as SARLUFormData;
  const sarlPluriData = formData as SARLPluriFormData;

  const gerantNom = isSARLU 
    ? `${sarluData.associeNom} ${sarluData.associePrenoms}`
    : sarlPluriData.gerants?.[0] 
      ? `${sarlPluriData.gerants[0].nom} ${sarlPluriData.gerants[0].prenoms}`
      : '';

  const gerantDateNaissance = isSARLU 
    ? sarluData.associeDateNaissance
    : sarlPluriData.gerants?.[0]?.dateNaissance || '';

  const gerantLieuNaissance = isSARLU 
    ? sarluData.associeLieuNaissance
    : sarlPluriData.gerants?.[0]?.lieuNaissance || '';

  const gerantNationalite = isSARLU 
    ? sarluData.associeNationalite
    : sarlPluriData.gerants?.[0]?.nationalite || '';

  const gerantAdresse = isSARLU 
    ? sarluData.associeAdresseDomicile
    : sarlPluriData.gerants?.[0]?.adresse || '';

  return (
    <div className="bg-white text-black p-8 shadow-lg max-w-4xl mx-auto font-serif">
      {/* En-tête */}
      <div className="text-center border-b-2 border-black pb-6 mb-8">
        <h1 className="text-xl font-bold tracking-wide">DÉCLARATION SUR L'HONNEUR</h1>
        <p className="text-sm mt-2 text-gray-600">
          (Article 12 de l'Acte Uniforme OHADA relatif au droit des sociétés commerciales)
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        {/* Corps de la déclaration */}
        <section>
          <p className="text-justify">
            Je soussigné(e),
          </p>
          
          <div className="bg-yellow-50 p-4 border border-yellow-300 rounded my-4">
            <p className="font-bold text-lg">
              <span className="bg-yellow-100 px-1">{gerantNom || "[NOM ET PRÉNOMS]"}</span>
            </p>
            <p className="mt-2">
              Né(e) le <span className="bg-yellow-100 px-1">{gerantDateNaissance || "[DATE]"}</span>{" "}
              à <span className="bg-yellow-100 px-1">{gerantLieuNaissance || "[LIEU]"}</span>
            </p>
            <p>De nationalité <span className="bg-yellow-100 px-1">{gerantNationalite || "[NATIONALITÉ]"}</span></p>
            <p>Demeurant à <span className="bg-yellow-100 px-1">{gerantAdresse || "[ADRESSE]"}</span></p>
          </div>

          <p className="text-justify mt-6">
            Agissant en qualité de <strong>Gérant</strong> de la société :
          </p>

          <div className="bg-green-50 p-4 border border-green-300 rounded my-4 text-center">
            <p className="font-bold text-xl text-primary">
              <span className="bg-yellow-100 px-2 py-1">{formData.denominationSociale || "[DÉNOMINATION SOCIALE]"}</span>
            </p>
            <p className="text-sm mt-1">
              {isSARLU ? "Société à Responsabilité Limitée Unipersonnelle" : "Société à Responsabilité Limitée"}
            </p>
          </div>
        </section>

        {/* Déclarations */}
        <section className="mt-8">
          <p className="font-bold mb-4">DÉCLARE SUR L'HONNEUR :</p>
          
          <div className="space-y-4 ml-4">
            <div className="flex gap-3">
              <span className="font-bold">1.</span>
              <p>
                N'avoir fait l'objet d'aucune condamnation pour crime ou délit contraire à l'honneur, 
                à la probité ou aux bonnes mœurs ;
              </p>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold">2.</span>
              <p>
                N'avoir fait l'objet d'aucune condamnation pour infraction à la législation économique 
                et financière ;
              </p>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold">3.</span>
              <p>
                N'avoir fait l'objet d'aucune interdiction d'administrer, de gérer ou de diriger 
                une personne morale ;
              </p>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold">4.</span>
              <p>
                N'être frappé(e) d'aucune mesure de faillite personnelle ou d'interdiction de gérer ;
              </p>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold">5.</span>
              <p>
                Ne pas exercer actuellement une activité incompatible avec la fonction de gérant 
                de société commerciale ;
              </p>
            </div>
            
            <div className="flex gap-3">
              <span className="font-bold">6.</span>
              <p>
                Que toutes les informations fournies dans le cadre de la création de la société 
                <strong> {formData.denominationSociale}</strong> sont exactes et sincères.
              </p>
            </div>
          </div>
        </section>

        {/* Engagement */}
        <section className="mt-8 bg-gray-50 p-4 border rounded">
          <p className="text-justify">
            Je reconnais avoir été informé(e) que toute fausse déclaration m'expose aux sanctions 
            prévues par la loi, notamment celles prévues par le Code Pénal pour faux et usage de faux.
          </p>
        </section>

        {/* Signature */}
        <section className="mt-12 pt-6 border-t-2 border-black">
          <p className="text-center mb-8">
            Fait pour servir et valoir ce que de droit.
          </p>
          <p className="text-center mb-8">
            À <span className="bg-yellow-100 px-1">{formData.ville || "[VILLE]"}</span>, 
            le <span className="bg-yellow-100 px-1">{formData.dateConstitution || "[DATE]"}</span>
          </p>
          
          <div className="text-center">
            <p className="font-semibold">Le Déclarant</p>
            <p className="text-sm text-gray-600 mt-1">(Signature précédée de la mention "Lu et approuvé")</p>
            <div className="mt-16 border-b border-black w-64 mx-auto"></div>
            <p className="mt-2 font-semibold">{gerantNom}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
