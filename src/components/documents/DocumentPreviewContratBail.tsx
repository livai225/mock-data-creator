import { SARLUFormData } from "@/lib/sarlu-types";
import { SARLPluriFormData } from "@/lib/sarl-pluri-types";

interface DocumentPreviewContratBailProps {
  formData: SARLUFormData | SARLPluriFormData;
  companyType: 'SARLU' | 'SARL_PLURI';
}

export function DocumentPreviewContratBail({ formData, companyType }: DocumentPreviewContratBailProps) {
  const isSARLU = companyType === 'SARLU';
  const sarluData = formData as SARLUFormData;
  const sarlPluriData = formData as SARLPluriFormData;

  const gerantNom = isSARLU 
    ? `${sarluData.associeNom} ${sarluData.associePrenoms}`
    : sarlPluriData.gerants?.[0] 
      ? `${sarlPluriData.gerants[0].nom} ${sarlPluriData.gerants[0].prenoms}`
      : '';

  const loyerMensuel = formData.loyerMensuel || 0;
  const cautionMois = isSARLU ? sarluData.cautionMois : sarlPluriData.cautionMois;
  const dureeBail = isSARLU ? sarluData.dureeBailAnnees : sarlPluriData.dureeBailAnnees;
  const cautionTotal = loyerMensuel * cautionMois;

  return (
    <div className="bg-white text-black p-8 shadow-lg max-w-4xl mx-auto font-serif">
      {/* En-tête */}
      <div className="text-center border-b-2 border-black pb-6 mb-6">
        <h1 className="text-2xl font-bold tracking-wide">CONTRAT DE BAIL COMMERCIAL</h1>
        <p className="text-sm mt-2 text-gray-600">À usage professionnel</p>
      </div>

      {/* Parties */}
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h3 className="font-bold text-base mb-4 text-center">ENTRE LES SOUSSIGNÉS</h3>
          
          {/* Bailleur */}
          <div className="bg-blue-50 p-4 border border-blue-300 rounded mb-4">
            <p className="font-semibold text-blue-800 mb-2">LE BAILLEUR :</p>
            <p>
              <strong>Monsieur/Madame</strong> <span className="bg-yellow-100 px-1">{formData.bailleurPrenom || "[PRÉNOM]"}</span>{" "}
              <span className="bg-yellow-100 px-1">{formData.bailleurNom || "[NOM]"}</span>
            </p>
            <p><strong>Demeurant à :</strong> <span className="bg-yellow-100 px-1">{formData.bailleurAdresse || "[ADRESSE]"}</span></p>
            <p><strong>Contact :</strong> <span className="bg-yellow-100 px-1">{formData.bailleurContact || "[TÉLÉPHONE]"}</span></p>
            <p className="mt-2 italic">Ci-après dénommé "LE BAILLEUR"</p>
          </div>

          {/* Locataire */}
          <div className="text-center my-4 font-semibold">ET</div>

          <div className="bg-green-50 p-4 border border-green-300 rounded">
            <p className="font-semibold text-green-800 mb-2">LE PRENEUR :</p>
            <p>
              La société <span className="bg-yellow-100 px-1 font-bold">{formData.denominationSociale || "[DÉNOMINATION]"}</span>, 
              {isSARLU ? " SARL Unipersonnelle" : " SARL"} en cours de constitution
            </p>
            <p><strong>Représentée par :</strong> <span className="bg-yellow-100 px-1">{gerantNom || "[GÉRANT]"}</span>, en qualité de Gérant</p>
            <p><strong>Siège social :</strong> <span className="bg-yellow-100 px-1">{formData.adresseSiege || "[ADRESSE]"}</span>, {formData.ville || "[VILLE]"}</p>
            <p className="mt-2 italic">Ci-après dénommé "LE PRENEUR"</p>
          </div>
        </section>

        {/* Article 1 */}
        <section className="pt-4">
          <h3 className="font-bold text-base mb-2">ARTICLE 1 - OBJET DU BAIL</h3>
          <p>
            Le Bailleur donne à bail au Preneur, qui accepte, les locaux situés à :
          </p>
          <p className="bg-yellow-100 p-2 mt-2 font-semibold">
            {formData.adresseSiege || "[ADRESSE COMPLÈTE]"}, {formData.commune || "[COMMUNE]"}, {formData.ville || "[VILLE]"}
          </p>
          <p className="mt-2">
            À usage exclusivement commercial et professionnel pour l'exercice de l'activité suivante :
          </p>
          <p className="bg-yellow-100 p-2 mt-2">
            {formData.objetSocial || "[ACTIVITÉ]"}
          </p>
        </section>

        {/* Article 2 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 2 - DURÉE DU BAIL</h3>
          <p>
            Le présent bail est consenti et accepté pour une durée de{" "}
            <span className="bg-yellow-100 px-1 font-bold">{dureeBail || "[X]"} an(s)</span>,
            à compter du <span className="bg-yellow-100 px-1">{isSARLU ? sarluData.dateDebutBail : formData.dateConstitution || "[DATE]"}</span>.
          </p>
          <p className="mt-2">
            Le bail sera renouvelable par tacite reconduction, sauf dénonciation par l'une des parties 
            avec un préavis de trois (3) mois avant l'échéance.
          </p>
        </section>

        {/* Article 3 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 3 - LOYER</h3>
          <div className="bg-amber-50 p-4 border border-amber-300 rounded">
            <p className="text-lg">
              Le loyer mensuel est fixé à : <span className="bg-yellow-100 px-2 py-1 font-bold text-xl">{loyerMensuel.toLocaleString('fr-FR')} FCFA</span>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Soit un loyer annuel de {(loyerMensuel * 12).toLocaleString('fr-FR')} FCFA
            </p>
          </div>
          <p className="mt-3">
            Le loyer sera payable mensuellement et d'avance, au plus tard le cinq (5) de chaque mois.
          </p>
        </section>

        {/* Article 4 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 4 - DÉPÔT DE GARANTIE (CAUTION)</h3>
          <div className="bg-red-50 p-4 border border-red-300 rounded">
            <p>
              Le Preneur verse au Bailleur, à titre de dépôt de garantie, une somme équivalente à{" "}
              <span className="bg-yellow-100 px-1 font-bold">{cautionMois || "[X]"} mois</span> de loyer, soit :
            </p>
            <p className="text-xl font-bold mt-2 text-center">
              <span className="bg-yellow-100 px-2 py-1">{cautionTotal.toLocaleString('fr-FR')} FCFA</span>
            </p>
          </div>
          <p className="mt-3">
            Cette somme sera restituée au Preneur en fin de bail, déduction faite des sommes 
            éventuellement dues au Bailleur et des réparations locatives à la charge du Preneur.
          </p>
        </section>

        {/* Article 5 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 5 - CHARGES ET CONDITIONS</h3>
          <p>Le Preneur s'engage à :</p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>Payer le loyer aux termes convenus</li>
            <li>User des locaux en bon père de famille</li>
            <li>N'exercer que l'activité prévue au bail</li>
            <li>Entretenir les locaux et effectuer les réparations locatives</li>
            <li>Ne pas sous-louer ni céder le bail sans accord écrit du Bailleur</li>
            <li>Acquitter les charges locatives (eau, électricité, etc.)</li>
          </ul>
        </section>

        {/* Article 6 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 6 - LOYER</h3>
          <div className="bg-amber-50 p-4 border border-amber-300 rounded">
            <p className="text-lg">
              Le loyer mensuel est fixé à : <span className="bg-yellow-100 px-2 py-1 font-bold text-xl">{loyerMensuel.toLocaleString('fr-FR')} FCFA</span>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Soit un loyer annuel de {(loyerMensuel * 12).toLocaleString('fr-FR')} FCFA
            </p>
          </div>
          <p className="mt-3">
            Le loyer sera payable mensuellement et d'avance, au plus tard le cinq (5) de chaque mois.
          </p>
          <p className="mt-2">
            Les parties conviennent que le prix fixé ci-dessus ne peut être révisé au cours du bail.
          </p>
          <p className="mt-2">
            Dans le cas où il surviendrait une contestation sur le montant du loyer tel qu'il est défini par le présent bail, 
            le preneur devra aviser le bailleur qui s'engage à s'en remettre à une expertise amiable.
          </p>
        </section>

        {/* Article 7 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 7 - SOUS-LOCATION</h3>
          <p>
            Sauf stipulation contraire du bail, toute sous-location totale ou partielle est interdite.
          </p>
        </section>

        {/* Article 8 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 8 - CLAUSE RÉSOLUTOIRE</h3>
          <p>
            À défaut de paiement d'un seul terme de loyer ou en cas d'inexécution d'une clause du bail, 
            le bailleur pourra demander à la juridiction compétente la résiliation du bail et l'expulsion 
            du preneur, et de tous occupants de son chef, après avoir fait délivrer, par acte extrajudiciaire, 
            une mise en demeure d'avoir à respecter les clauses et conditions du bail.
          </p>
        </section>

        {/* Article 9 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 9 - ÉLECTION DE DOMICILE</h3>
          <p>
            En cas de litige, si aucun accord amiable n'est trouvé, le tribunal d'Abidjan sera seul compétent.
          </p>
        </section>

        {/* Signatures */}
        <section className="mt-12 pt-6 border-t">
          <p className="text-center mb-2">
            Fait en deux (2) exemplaires originaux
          </p>
          <p className="text-center mb-8">
            À {formData.ville || "[VILLE]"}, le {isSARLU ? sarluData.dateDebutBail : formData.dateConstitution || "[DATE]"}
          </p>
          
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="font-semibold">LE BAILLEUR</p>
              <p className="text-sm text-gray-600 mt-1">(Lu et approuvé, bon pour accord)</p>
              <div className="mt-12 border-b border-black w-48 mx-auto"></div>
              <p className="mt-2">{formData.bailleurPrenom} {formData.bailleurNom}</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">LE PRENEUR</p>
              <p className="text-sm text-gray-600 mt-1">(Lu et approuvé, bon pour accord)</p>
              <div className="mt-12 border-b border-black w-48 mx-auto"></div>
              <p className="mt-2">{gerantNom}</p>
              <p className="text-sm text-gray-600">Pour {formData.denominationSociale}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
