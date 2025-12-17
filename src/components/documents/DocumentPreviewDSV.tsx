import { SARLUFormData } from "@/lib/sarlu-types";
import { SARLPluriFormData } from "@/lib/sarl-pluri-types";

interface DocumentPreviewDSVProps {
  formData: SARLUFormData | SARLPluriFormData;
  companyType: 'SARLU' | 'SARL_PLURI';
}

export function DocumentPreviewDSV({ formData, companyType }: DocumentPreviewDSVProps) {
  const isSARLU = companyType === 'SARLU';
  const sarluData = formData as SARLUFormData;
  const sarlPluriData = formData as SARLPluriFormData;

  const capital = isSARLU 
    ? sarluData.nombreParts * sarluData.valeurPart 
    : sarlPluriData.capitalSocial;

  const nombreParts = isSARLU 
    ? sarluData.nombreParts 
    : sarlPluriData.associes?.reduce((sum, a) => sum + (a.nombreParts || 0), 0) || 0;

  const valeurPart = isSARLU 
    ? sarluData.valeurPart 
    : sarlPluriData.associes?.[0]?.valeurParts || 10000;

  return (
    <div className="bg-white text-black p-8 shadow-lg max-w-4xl mx-auto font-serif">
      {/* En-tête */}
      <div className="text-center border-b-2 border-black pb-6 mb-6">
        <h1 className="text-xl font-bold tracking-wide">
          DÉCLARATION DE SOUSCRIPTION ET DE VERSEMENT
        </h1>
        <p className="text-sm mt-2 text-gray-600">
          (Conformément à l'article 315 de l'Acte Uniforme OHADA)
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        {/* Identification de la société */}
        <section>
          <h3 className="font-bold text-base mb-4 bg-gray-100 p-2 -mx-2">
            I. IDENTIFICATION DE LA SOCIÉTÉ
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-xs">Dénomination sociale</p>
              <p className="font-bold bg-yellow-100 px-1">{formData.denominationSociale || "[À REMPLIR]"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Forme juridique</p>
              <p className="bg-yellow-100 px-1">{isSARLU ? "SARL Unipersonnelle" : "SARL"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Siège social</p>
              <p className="bg-yellow-100 px-1">{formData.adresseSiege}, {formData.ville}</p>
            </div>
            <div>
              <p className="text-gray-600 text-xs">Date de constitution</p>
              <p className="bg-yellow-100 px-1">{formData.dateConstitution || "[DATE]"}</p>
            </div>
          </div>
        </section>

        {/* Capital social */}
        <section>
          <h3 className="font-bold text-base mb-4 bg-gray-100 p-2 -mx-2">
            II. CAPITAL SOCIAL
          </h3>
          
          <div className="bg-amber-50 p-4 border border-amber-300 rounded">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-600 text-xs">Capital souscrit</p>
                <p className="text-xl font-bold bg-yellow-100 px-2 py-1 inline-block">
                  {capital.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Nombre de parts</p>
                <p className="text-xl font-bold bg-yellow-100 px-2 py-1 inline-block">
                  {nombreParts}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-xs">Valeur nominale</p>
                <p className="text-xl font-bold bg-yellow-100 px-2 py-1 inline-block">
                  {valeurPart.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 italic">
            Soit en lettres : <span className="bg-yellow-100 px-1">{formData.capitalEnLettres || "[EN LETTRES]"}</span>
          </p>
        </section>

        {/* Tableau de souscription */}
        <section>
          <h3 className="font-bold text-base mb-4 bg-gray-100 p-2 -mx-2">
            III. TABLEAU DE SOUSCRIPTION ET DE VERSEMENT
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-black">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-2 text-left">Associé</th>
                  <th className="border border-black p-2 text-center">Nationalité</th>
                  <th className="border border-black p-2 text-center">Parts souscrites</th>
                  <th className="border border-black p-2 text-center">Montant souscrit</th>
                  <th className="border border-black p-2 text-center">Montant versé</th>
                  <th className="border border-black p-2 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {isSARLU ? (
                  <tr>
                    <td className="border border-black p-2 bg-yellow-100">
                      {sarluData.associeNom} {sarluData.associePrenoms}
                    </td>
                    <td className="border border-black p-2 text-center bg-yellow-100">
                      {sarluData.associeNationalite}
                    </td>
                    <td className="border border-black p-2 text-center bg-yellow-100">
                      {sarluData.nombreParts}
                    </td>
                    <td className="border border-black p-2 text-center bg-yellow-100">
                      {capital.toLocaleString('fr-FR')}
                    </td>
                    <td className="border border-black p-2 text-center bg-yellow-100">
                      {capital.toLocaleString('fr-FR')}
                    </td>
                    <td className="border border-black p-2 text-center font-bold">
                      100%
                    </td>
                  </tr>
                ) : (
                  sarlPluriData.associes?.map((associe) => {
                    const pourcentage = ((associe.nombreParts || 0) / nombreParts * 100).toFixed(2);
                    return (
                      <tr key={associe.id}>
                        <td className="border border-black p-2 bg-yellow-100">
                          {associe.nom} {associe.prenoms}
                        </td>
                        <td className="border border-black p-2 text-center bg-yellow-100">
                          {associe.nationalite}
                        </td>
                        <td className="border border-black p-2 text-center bg-yellow-100">
                          {associe.nombreParts}
                        </td>
                        <td className="border border-black p-2 text-center bg-yellow-100">
                          {associe.apportNumeraire?.toLocaleString('fr-FR')}
                        </td>
                        <td className="border border-black p-2 text-center bg-yellow-100">
                          {associe.apportNumeraire?.toLocaleString('fr-FR')}
                        </td>
                        <td className="border border-black p-2 text-center font-bold">
                          {pourcentage}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200 font-bold">
                  <td className="border border-black p-2">TOTAL</td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2 text-center">{nombreParts}</td>
                  <td className="border border-black p-2 text-center">{capital.toLocaleString('fr-FR')}</td>
                  <td className="border border-black p-2 text-center">{capital.toLocaleString('fr-FR')}</td>
                  <td className="border border-black p-2 text-center">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Attestation */}
        <section className="mt-8">
          <h3 className="font-bold text-base mb-4 bg-gray-100 p-2 -mx-2">
            IV. ATTESTATION
          </h3>
          
          <div className="bg-green-50 p-4 border border-green-300 rounded">
            <p className="text-justify">
              {isSARLU ? (
                <>
                  Je soussigné(e), <span className="font-bold bg-yellow-100 px-1">{sarluData.associeNom} {sarluData.associePrenoms}</span>, 
                  associé unique et gérant de la société <span className="font-bold">{formData.denominationSociale}</span>, 
                  atteste que :
                </>
              ) : (
                <>
                  Nous soussignés, associés de la société <span className="font-bold">{formData.denominationSociale}</span>, 
                  attestons que :
                </>
              )}
            </p>
            
            <ul className="list-disc ml-6 mt-4 space-y-2">
              <li>
                Le capital social de <span className="font-bold">{capital.toLocaleString('fr-FR')} FCFA</span> a été 
                <span className="font-bold text-green-700"> intégralement souscrit</span>
              </li>
              <li>
                Les parts sociales ont été <span className="font-bold text-green-700">intégralement libérées</span> en numéraire
              </li>
              <li>
                Les fonds correspondants ont été déposés auprès de la banque désignée à cet effet
              </li>
            </ul>
          </div>
        </section>

        {/* Signatures */}
        <section className="mt-12 pt-6 border-t-2 border-black">
          <p className="text-center mb-8">
            Fait à <span className="bg-yellow-100 px-1">{formData.ville || "[VILLE]"}</span>, 
            le <span className="bg-yellow-100 px-1">{formData.dateConstitution || "[DATE]"}</span>
          </p>
          
          {isSARLU ? (
            <div className="text-center">
              <p className="font-semibold">L'Associé Unique</p>
              <div className="mt-12 border-b border-black w-48 mx-auto"></div>
              <p className="mt-2">{sarluData.associeNom} {sarluData.associePrenoms}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8">
              {sarlPluriData.associes?.slice(0, 4).map((associe, index) => (
                <div key={associe.id} className="text-center">
                  <p className="font-semibold">Associé {index + 1}</p>
                  <div className="mt-12 border-b border-black w-40 mx-auto"></div>
                  <p className="mt-2 text-sm">{associe.nom} {associe.prenoms}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
