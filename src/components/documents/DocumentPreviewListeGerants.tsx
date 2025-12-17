import { SARLUFormData } from "@/lib/sarlu-types";
import { SARLPluriFormData } from "@/lib/sarl-pluri-types";

interface DocumentPreviewListeGerantsProps {
  formData: SARLUFormData | SARLPluriFormData;
  companyType: 'SARLU' | 'SARL_PLURI';
}

export function DocumentPreviewListeGerants({ formData, companyType }: DocumentPreviewListeGerantsProps) {
  const isSARLU = companyType === 'SARLU';
  const sarluData = formData as SARLUFormData;
  const sarlPluriData = formData as SARLPluriFormData;

  return (
    <div className="bg-white text-black p-8 shadow-lg max-w-4xl mx-auto font-serif">
      {/* En-tête */}
      <div className="text-center border-b-2 border-black pb-6 mb-6">
        <h1 className="text-xl font-bold tracking-wide">LISTE DES DIRIGEANTS SOCIAUX</h1>
        <h2 className="text-lg mt-2">
          {formData.denominationSociale || "[DÉNOMINATION SOCIALE]"}
        </h2>
        <p className="text-sm mt-1 text-gray-600">
          {isSARLU ? "Société à Responsabilité Limitée Unipersonnelle" : "Société à Responsabilité Limitée"}
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        {/* Introduction */}
        <section>
          <p>
            Conformément aux dispositions de l'Acte Uniforme OHADA relatif au droit des sociétés 
            commerciales et du groupement d'intérêt économique, la liste des dirigeants sociaux 
            de la société <span className="font-bold">{formData.denominationSociale}</span> est établie comme suit :
          </p>
        </section>

        {/* Liste des gérants */}
        <section>
          <h3 className="font-bold text-base mb-4 bg-gray-100 p-2">GÉRANT(S)</h3>
          
          {isSARLU ? (
            <div className="border-2 border-primary/30 p-6 rounded-lg bg-green-50">
              <div className="flex items-start gap-4">
                <div className="w-24 h-28 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 text-xs text-center">
                  Photo<br/>d'identité
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-lg font-bold text-primary">
                    <span className="bg-yellow-100 px-1">{sarluData.associeNom}</span>{" "}
                    <span className="bg-yellow-100 px-1">{sarluData.associePrenoms}</span>
                  </p>
                  <p><strong>Qualité :</strong> Gérant - Associé Unique</p>
                  <p><strong>Date de naissance :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeDateNaissance || "[DATE]"}</span></p>
                  <p><strong>Lieu de naissance :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeLieuNaissance || "[LIEU]"}</span></p>
                  <p><strong>Nationalité :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeNationalite || "[NATIONALITÉ]"}</span></p>
                  <p><strong>Domicile :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeAdresseDomicile || "[ADRESSE]"}</span></p>
                  <p><strong>Ville de résidence :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeVilleResidence || "[VILLE]"}</span></p>
                  <div className="border-t pt-2 mt-2">
                    <p><strong>Type de pièce d'identité :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeTypeIdentite}</span></p>
                    <p><strong>Numéro :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeNumeroIdentite || "[NUMÉRO]"}</span></p>
                    <p><strong>Délivrée le :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeDateDelivranceId || "[DATE]"}</span></p>
                    <p><strong>À :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeLieuDelivranceId || "[LIEU]"}</span></p>
                    <p><strong>Valide jusqu'au :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeDateValiditeId || "[DATE]"}</span></p>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <p><strong>Nom du père :</strong> <span className="bg-yellow-100 px-1">{sarluData.associePereNom || "[NOM]"}</span></p>
                    <p><strong>Nom de la mère :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeMereNom || "[NOM]"}</span></p>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <p><strong>Durée du mandat :</strong> <span className="bg-yellow-100 px-1">{sarluData.gerantDureeMandat} ans</span></p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {sarlPluriData.gerants?.map((gerant, index) => (
                <div key={gerant.id} className="border-2 border-primary/30 p-6 rounded-lg bg-green-50">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-28 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-400 text-xs text-center">
                      Photo<br/>d'identité
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-lg font-bold text-primary">
                        Gérant {index + 1} {index === 0 && "(Principal)"}
                      </p>
                      <p className="text-lg">
                        <span className="bg-yellow-100 px-1">{gerant.nom}</span>{" "}
                        <span className="bg-yellow-100 px-1">{gerant.prenoms}</span>
                      </p>
                      <p><strong>Date de naissance :</strong> <span className="bg-yellow-100 px-1">{gerant.dateNaissance || "[DATE]"}</span></p>
                      <p><strong>Lieu de naissance :</strong> <span className="bg-yellow-100 px-1">{gerant.lieuNaissance || "[LIEU]"}</span></p>
                      <p><strong>Nationalité :</strong> <span className="bg-yellow-100 px-1">{gerant.nationalite || "[NATIONALITÉ]"}</span></p>
                      <p><strong>Domicile :</strong> <span className="bg-yellow-100 px-1">{gerant.adresse || "[ADRESSE]"}</span></p>
                      <div className="border-t pt-2 mt-2">
                        <p><strong>Type de pièce d'identité :</strong> <span className="bg-yellow-100 px-1">{gerant.typeIdentite}</span></p>
                        <p><strong>Numéro :</strong> <span className="bg-yellow-100 px-1">{gerant.numeroIdentite || "[NUMÉRO]"}</span></p>
                        <p><strong>Délivrée le :</strong> <span className="bg-yellow-100 px-1">{gerant.dateDelivranceId || "[DATE]"}</span></p>
                        <p><strong>À :</strong> <span className="bg-yellow-100 px-1">{gerant.lieuDelivranceId || "[LIEU]"}</span></p>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <p><strong>Nom du père :</strong> <span className="bg-yellow-100 px-1">{gerant.pereNom || "[NOM]"}</span></p>
                        <p><strong>Nom de la mère :</strong> <span className="bg-yellow-100 px-1">{gerant.mereNom || "[NOM]"}</span></p>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <p><strong>Durée du mandat :</strong>{" "}
                          <span className="bg-yellow-100 px-1">
                            {gerant.dureeMandat === 'determinee' 
                              ? `${gerant.dureeMandatAnnees} ans` 
                              : 'Durée indéterminée'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Certification */}
        <section className="mt-8 pt-6 border-t-2 border-black">
          <p className="text-center italic mb-8">
            Je certifie sur l'honneur l'exactitude des informations ci-dessus.
          </p>
          <p className="text-center mb-8">
            Fait à {formData.ville || "[VILLE]"}, le {formData.dateConstitution || "[DATE]"}
          </p>
          
          <div className="text-center">
            <p className="font-semibold">Le Gérant</p>
            <div className="mt-12 border-b border-black w-48 mx-auto"></div>
            <p className="mt-2">
              {isSARLU 
                ? `${sarluData.associeNom} ${sarluData.associePrenoms}`
                : sarlPluriData.gerants?.[0] 
                  ? `${sarlPluriData.gerants[0].nom} ${sarlPluriData.gerants[0].prenoms}`
                  : "[NOM DU GÉRANT]"
              }
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
