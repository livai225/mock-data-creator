import { SARLUFormData } from "@/lib/sarlu-types";
import { SARLPluriFormData } from "@/lib/sarl-pluri-types";

interface DocumentPreviewCEPICIProps {
  formData: SARLUFormData | SARLPluriFormData;
  companyType: 'SARLU' | 'SARL_PLURI';
}

export function DocumentPreviewCEPICI({ formData, companyType }: DocumentPreviewCEPICIProps) {
  const isSARLU = companyType === 'SARLU';
  const sarluData = formData as SARLUFormData;
  const sarlPluriData = formData as SARLPluriFormData;

  const capital = isSARLU 
    ? sarluData.nombreParts * sarluData.valeurPart 
    : sarlPluriData.capitalSocial;

  const gerantNom = isSARLU 
    ? `${sarluData.associeNom} ${sarluData.associePrenoms}`
    : sarlPluriData.gerants?.[0] 
      ? `${sarlPluriData.gerants[0].nom} ${sarlPluriData.gerants[0].prenoms}`
      : '';

  const telephone = isSARLU ? (sarluData.mobile || sarluData.telephone) : sarlPluriData.telephone;

  return (
    <div className="bg-white text-black p-8 shadow-lg max-w-4xl mx-auto font-sans text-sm">
      {/* En-tête officiel */}
      <div className="border-2 border-black">
        {/* Header avec logos */}
        <div className="flex justify-between items-center p-4 border-b-2 border-black bg-gray-50">
          <div className="text-center flex-1">
            <p className="font-bold text-xs">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
            <p className="text-xs">Union - Discipline - Travail</p>
          </div>
          <div className="text-center flex-1 border-l-2 border-r-2 border-black px-4">
            <p className="font-bold">CEPICI</p>
            <p className="text-xs">Centre de Promotion des Investissements en Côte d'Ivoire</p>
          </div>
          <div className="text-center flex-1">
            <p className="font-bold text-xs">GUICHET UNIQUE</p>
            <p className="text-xs">Création d'Entreprise</p>
          </div>
        </div>

        {/* Titre */}
        <div className="text-center py-4 bg-primary/10 border-b-2 border-black">
          <h1 className="text-lg font-bold">FORMULAIRE UNIQUE DE DEMANDE</h1>
          <h2 className="text-base font-semibold">DE CRÉATION D'ENTREPRISE</h2>
        </div>

        {/* Corps du formulaire */}
        <div className="p-6 space-y-6">
          {/* Section A - Identification */}
          <section>
            <div className="bg-gray-100 px-3 py-2 font-bold border-b-2 border-black -mx-6 mb-4">
              SECTION A : IDENTIFICATION DE L'ENTREPRISE
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-2">
                <p className="text-xs text-gray-600">Dénomination sociale</p>
                <p className="font-bold bg-yellow-100 px-1">{formData.denominationSociale || "[À REMPLIR]"}</p>
              </div>
              <div className="border p-2">
                <p className="text-xs text-gray-600">Sigle</p>
                <p className="bg-yellow-100 px-1">{formData.sigle || "-"}</p>
              </div>
              <div className="border p-2">
                <p className="text-xs text-gray-600">Forme juridique</p>
                <p className="font-semibold bg-yellow-100 px-1">{isSARLU ? "SARL Unipersonnelle" : "SARL"}</p>
              </div>
              <div className="border p-2">
                <p className="text-xs text-gray-600">Capital social (FCFA)</p>
                <p className="font-bold bg-yellow-100 px-1">{capital.toLocaleString('fr-FR')}</p>
              </div>
            </div>

            <div className="border p-2 mt-4">
              <p className="text-xs text-gray-600">Activité principale (Objet social)</p>
              <p className="bg-yellow-100 px-1">{formData.objetSocial || "[À REMPLIR]"}</p>
            </div>

            <div className="border p-2 mt-4">
              <p className="text-xs text-gray-600">Chiffre d'affaires prévisionnel</p>
              <p className="bg-yellow-100 px-1">{formData.chiffreAffairesPrev || "[À REMPLIR]"}</p>
            </div>
          </section>

          {/* Section B - Siège social */}
          <section>
            <div className="bg-gray-100 px-3 py-2 font-bold border-b-2 border-black -mx-6 mb-4">
              SECTION B : SIÈGE SOCIAL
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-2 col-span-2">
                <p className="text-xs text-gray-600">Adresse complète</p>
                <p className="bg-yellow-100 px-1">{formData.adresseSiege || "[À REMPLIR]"}</p>
              </div>
              <div className="border p-2">
                <p className="text-xs text-gray-600">Commune</p>
                <p className="bg-yellow-100 px-1">{formData.commune || "[À REMPLIR]"}</p>
              </div>
              <div className="border p-2">
                <p className="text-xs text-gray-600">Ville</p>
                <p className="bg-yellow-100 px-1">{formData.ville || "[À REMPLIR]"}</p>
              </div>
              <div className="border p-2">
                <p className="text-xs text-gray-600">Téléphone</p>
                <p className="bg-yellow-100 px-1">{telephone || "[À REMPLIR]"}</p>
              </div>
              <div className="border p-2">
                <p className="text-xs text-gray-600">Email</p>
                <p className="bg-yellow-100 px-1">{formData.email || "[À REMPLIR]"}</p>
              </div>
              <div className="border p-2">
                <p className="text-xs text-gray-600">Boîte postale</p>
                <p className="bg-yellow-100 px-1">{formData.boitePostale || "-"}</p>
              </div>
            </div>
          </section>

          {/* Section C - Dirigeants */}
          <section>
            <div className="bg-gray-100 px-3 py-2 font-bold border-b-2 border-black -mx-6 mb-4">
              SECTION C : DIRIGEANT(S) / GÉRANT(S)
            </div>
            
            {isSARLU ? (
              <div className="border p-4 bg-green-50">
                <p className="font-semibold mb-2">Gérant (Associé unique)</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-600">Nom :</span> <span className="bg-yellow-100 px-1">{sarluData.associeNom}</span></p>
                  <p><span className="text-gray-600">Prénom(s) :</span> <span className="bg-yellow-100 px-1">{sarluData.associePrenoms}</span></p>
                  <p><span className="text-gray-600">Date de naissance :</span> <span className="bg-yellow-100 px-1">{sarluData.associeDateNaissance}</span></p>
                  <p><span className="text-gray-600">Lieu de naissance :</span> <span className="bg-yellow-100 px-1">{sarluData.associeLieuNaissance}</span></p>
                  <p><span className="text-gray-600">Nationalité :</span> <span className="bg-yellow-100 px-1">{sarluData.associeNationalite}</span></p>
                  <p><span className="text-gray-600">Profession :</span> <span className="bg-yellow-100 px-1">{sarluData.associeProfession}</span></p>
                  <p className="col-span-2"><span className="text-gray-600">Domicile :</span> <span className="bg-yellow-100 px-1">{sarluData.associeAdresseDomicile}</span></p>
                  <p><span className="text-gray-600">Type pièce :</span> <span className="bg-yellow-100 px-1">{sarluData.associeTypeIdentite}</span></p>
                  <p><span className="text-gray-600">N° pièce :</span> <span className="bg-yellow-100 px-1">{sarluData.associeNumeroIdentite}</span></p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sarlPluriData.gerants?.map((gerant, index) => (
                  <div key={gerant.id} className="border p-4 bg-green-50">
                    <p className="font-semibold mb-2">Gérant {index + 1}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="text-gray-600">Nom :</span> <span className="bg-yellow-100 px-1">{gerant.nom}</span></p>
                      <p><span className="text-gray-600">Prénom(s) :</span> <span className="bg-yellow-100 px-1">{gerant.prenoms}</span></p>
                      <p><span className="text-gray-600">Date de naissance :</span> <span className="bg-yellow-100 px-1">{gerant.dateNaissance}</span></p>
                      <p><span className="text-gray-600">Lieu de naissance :</span> <span className="bg-yellow-100 px-1">{gerant.lieuNaissance}</span></p>
                      <p><span className="text-gray-600">Nationalité :</span> <span className="bg-yellow-100 px-1">{gerant.nationalite}</span></p>
                      <p className="col-span-2"><span className="text-gray-600">Domicile :</span> <span className="bg-yellow-100 px-1">{gerant.adresse}</span></p>
                      <p><span className="text-gray-600">Type pièce :</span> <span className="bg-yellow-100 px-1">{gerant.typeIdentite}</span></p>
                      <p><span className="text-gray-600">N° pièce :</span> <span className="bg-yellow-100 px-1">{gerant.numeroIdentite}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Section D - Associés */}
          <section>
            <div className="bg-gray-100 px-3 py-2 font-bold border-b-2 border-black -mx-6 mb-4">
              SECTION D : ASSOCIÉ(S) / ACTIONNAIRE(S)
            </div>
            
            {isSARLU ? (
              <div className="border p-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Nom et Prénoms</th>
                      <th className="border p-2 text-center">Nationalité</th>
                      <th className="border p-2 text-center">Parts</th>
                      <th className="border p-2 text-center">Montant (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2 bg-yellow-100">{sarluData.associeNom} {sarluData.associePrenoms}</td>
                      <td className="border p-2 text-center bg-yellow-100">{sarluData.associeNationalite}</td>
                      <td className="border p-2 text-center bg-yellow-100">{sarluData.nombreParts}</td>
                      <td className="border p-2 text-center bg-yellow-100">{capital.toLocaleString('fr-FR')}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td className="border p-2" colSpan={2}>TOTAL</td>
                      <td className="border p-2 text-center">{sarluData.nombreParts}</td>
                      <td className="border p-2 text-center">{capital.toLocaleString('fr-FR')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="border p-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Nom et Prénoms</th>
                      <th className="border p-2 text-center">Nationalité</th>
                      <th className="border p-2 text-center">Parts</th>
                      <th className="border p-2 text-center">Montant (FCFA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sarlPluriData.associes?.map((associe) => (
                      <tr key={associe.id}>
                        <td className="border p-2 bg-yellow-100">{associe.nom} {associe.prenoms}</td>
                        <td className="border p-2 text-center bg-yellow-100">{associe.nationalite}</td>
                        <td className="border p-2 text-center bg-yellow-100">{associe.nombreParts}</td>
                        <td className="border p-2 text-center bg-yellow-100">{associe.apportNumeraire?.toLocaleString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 font-bold">
                    <tr>
                      <td className="border p-2" colSpan={2}>TOTAL</td>
                      <td className="border p-2 text-center">
                        {sarlPluriData.associes?.reduce((sum, a) => sum + (a.nombreParts || 0), 0)}
                      </td>
                      <td className="border p-2 text-center">{sarlPluriData.capitalSocial?.toLocaleString('fr-FR')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </section>

          {/* Signature */}
          <section className="pt-6 border-t-2 border-black mt-8">
            <p className="text-center mb-4">
              Je soussigné(e), <span className="bg-yellow-100 px-1 font-bold">{gerantNom}</span>, certifie sur l'honneur 
              l'exactitude des informations ci-dessus.
            </p>
            <p className="text-center mb-8">
              Fait à {formData.ville || "[VILLE]"}, le {formData.dateConstitution || "[DATE]"}
            </p>
            <div className="text-center">
              <p className="font-semibold">Signature du déclarant</p>
              <div className="mt-12 border-b border-black w-48 mx-auto"></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
