import { SARLUFormData } from "@/lib/sarlu-types";
import { SARLPluriFormData } from "@/lib/sarl-pluri-types";

interface DocumentPreviewStatutsProps {
  formData: SARLUFormData | SARLPluriFormData;
  companyType: 'SARLU' | 'SARL_PLURI';
}

export function DocumentPreviewStatuts({ formData, companyType }: DocumentPreviewStatutsProps) {
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

  return (
    <div className="bg-white text-black p-8 shadow-lg max-w-4xl mx-auto font-serif">
      {/* En-tête */}
      <div className="text-center border-b-2 border-black pb-6 mb-6">
        <h1 className="text-2xl font-bold tracking-wide">STATUTS</h1>
        <h2 className="text-xl mt-2 font-semibold">
          {isSARLU ? "SOCIÉTÉ À RESPONSABILITÉ LIMITÉE UNIPERSONNELLE" : "SOCIÉTÉ À RESPONSABILITÉ LIMITÉE"}
        </h2>
        <p className="text-lg mt-4 font-bold text-primary">
          <span className="bg-yellow-200 px-2 py-1">{formData.denominationSociale || "[DÉNOMINATION]"}</span>
        </p>
        {formData.sigle && (
          <p className="text-sm mt-1">Sigle : {formData.sigle}</p>
        )}
      </div>

      {/* Articles */}
      <div className="space-y-6 text-sm leading-relaxed">
        {/* Article 1 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 1 - FORME JURIDIQUE</h3>
          <p>
            Il est formé entre les soussignés une société à responsabilité limitée {isSARLU ? "unipersonnelle" : ""} 
            qui sera régie par l'Acte Uniforme de l'OHADA relatif au droit des sociétés commerciales 
            et du groupement d'intérêt économique, ainsi que par les présents statuts.
          </p>
        </section>

        {/* Article 2 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 2 - OBJET SOCIAL</h3>
          <p>
            La société a pour objet, en Côte d'Ivoire et à l'étranger, directement ou indirectement :
          </p>
          <p className="mt-2 bg-yellow-100 p-2 border-l-4 border-yellow-400">
            {formData.objetSocial || "[OBJET SOCIAL À DÉFINIR]"}
          </p>
          {isSARLU && sarluData.activiteSecondaire && (
            <p className="mt-2">
              Et plus généralement : {sarluData.activiteSecondaire}
            </p>
          )}
        </section>

        {/* Article 3 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 3 - DÉNOMINATION SOCIALE</h3>
          <p>
            La société prend la dénomination de : <span className="font-bold bg-yellow-100 px-1">{formData.denominationSociale || "[DÉNOMINATION]"}</span>
          </p>
          <p className="mt-2">
            Dans tous les actes et documents émanant de la société, la dénomination sociale devra 
            toujours être précédée ou suivie des mots "Société à Responsabilité Limitée {isSARLU ? "Unipersonnelle" : ""}" 
            ou des initiales "{isSARLU ? "SARLU" : "SARL"}" et de l'énonciation du capital social.
          </p>
        </section>

        {/* Article 4 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 4 - SIÈGE SOCIAL</h3>
          <p>
            Le siège social est fixé à : <span className="bg-yellow-100 px-1">{formData.adresseSiege || "[ADRESSE]"}</span>, 
            {formData.commune && ` ${formData.commune},`} {formData.ville || "[VILLE]"}, République de Côte d'Ivoire.
          </p>
          <p className="mt-2">
            Il pourra être transféré en tout autre endroit de la même ville par simple décision 
            {isSARLU ? " de l'associé unique" : " des associés"}, et en tout autre lieu par décision 
            {isSARLU ? " de l'associé unique" : " collective extraordinaire des associés"}.
          </p>
        </section>

        {/* Article 5 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 5 - DURÉE</h3>
          <p>
            La durée de la société est fixée à <span className="bg-yellow-100 px-1">{formData.dureeAnnees || 99}</span> années 
            à compter de son immatriculation au Registre du Commerce et du Crédit Mobilier.
          </p>
        </section>

        {/* Article 6 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 6 - CAPITAL SOCIAL</h3>
          <p>
            Le capital social est fixé à la somme de <span className="bg-yellow-100 px-1 font-bold">{capital.toLocaleString('fr-FR')} FCFA</span> 
            {isSARLU ? (
              <span> ({formData.capitalEnLettres || "[EN LETTRES]"}), divisé en <span className="bg-yellow-100 px-1">{sarluData.nombreParts}</span> parts 
              sociales de <span className="bg-yellow-100 px-1">{sarluData.valeurPart.toLocaleString('fr-FR')} FCFA</span> chacune, 
              entièrement souscrites et libérées par l'associé unique.</span>
            ) : (
              <span> ({sarlPluriData.capitalEnLettres || "[EN LETTRES]"}), divisé en parts sociales 
              entièrement souscrites et libérées par les associés.</span>
            )}
          </p>
        </section>

        {/* Article 7 - Associé(s) */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 7 - {isSARLU ? "ASSOCIÉ UNIQUE" : "ASSOCIÉS"}</h3>
          {isSARLU ? (
            <div className="bg-yellow-50 p-4 border border-yellow-300 rounded">
              <p><strong>Nom :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeNom || "[NOM]"}</span></p>
              <p><strong>Prénom(s) :</strong> <span className="bg-yellow-100 px-1">{sarluData.associePrenoms || "[PRÉNOMS]"}</span></p>
              <p><strong>Né(e) le :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeDateNaissance || "[DATE]"}</span> 
                à <span className="bg-yellow-100 px-1">{sarluData.associeLieuNaissance || "[LIEU]"}</span></p>
              <p><strong>Nationalité :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeNationalite || "[NATIONALITÉ]"}</span></p>
              <p><strong>Profession :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeProfession || "[PROFESSION]"}</span></p>
              <p><strong>Domicile :</strong> <span className="bg-yellow-100 px-1">{sarluData.associeAdresseDomicile || "[ADRESSE]"}</span></p>
              <p className="mt-2"><strong>Nombre de parts :</strong> {sarluData.nombreParts} parts (100%)</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sarlPluriData.associes?.map((associe, index) => (
                <div key={associe.id} className="bg-yellow-50 p-4 border border-yellow-300 rounded">
                  <p className="font-semibold text-primary">Associé {index + 1}</p>
                  <p><strong>Nom :</strong> <span className="bg-yellow-100 px-1">{associe.nom || "[NOM]"}</span></p>
                  <p><strong>Prénom(s) :</strong> <span className="bg-yellow-100 px-1">{associe.prenoms || "[PRÉNOMS]"}</span></p>
                  <p><strong>Né(e) le :</strong> <span className="bg-yellow-100 px-1">{associe.dateNaissance || "[DATE]"}</span> 
                    à <span className="bg-yellow-100 px-1">{associe.lieuNaissance || "[LIEU]"}</span></p>
                  <p><strong>Nationalité :</strong> <span className="bg-yellow-100 px-1">{associe.nationalite || "[NATIONALITÉ]"}</span></p>
                  <p><strong>Profession :</strong> <span className="bg-yellow-100 px-1">{associe.profession || "[PROFESSION]"}</span></p>
                  <p><strong>Domicile :</strong> <span className="bg-yellow-100 px-1">{associe.adresseDomicile || "[ADRESSE]"}</span></p>
                  <p className="mt-2">
                    <strong>Apport :</strong> {associe.apportNumeraire?.toLocaleString('fr-FR') || 0} FCFA 
                    ({associe.nombreParts || 0} parts)
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Article 8 - Gérance */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 8 - GÉRANCE</h3>
          <p>
            La société est gérée par {isSARLU ? "un gérant" : "un ou plusieurs gérants"}, 
            {isSARLU ? " associé unique ou non" : " associés ou non"}, personnes physiques, 
            nommé{isSARLU ? "" : "s"} pour une durée {isSARLU ? `de ${sarluData.gerantDureeMandat} ans` : "déterminée ou indéterminée"}.
          </p>
          <div className="mt-4 bg-green-50 p-4 border border-green-300 rounded">
            <p className="font-semibold">Gérant désigné :</p>
            <p className="text-lg font-bold bg-yellow-100 px-2 py-1 inline-block mt-2">
              {gerantNom || "[NOM DU GÉRANT]"}
            </p>
          </div>
        </section>

        {/* Article 9 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 9 - AUGMENTATION ET RÉDUCTION DU CAPITAL</h3>
          <p>
            Le capital social peut être augmenté ou réduit dans les conditions prévues par l'Acte Uniforme 
            relatif au droit des sociétés commerciales et du groupement d'intérêt économique.
          </p>
        </section>

        {/* Article 10 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 10 - PARTS SOCIALES</h3>
          <p>
            Les parts sociales ne peuvent être représentées par des titres négociables. Les droits de chaque 
            associé dans la société résultent seulement des statuts, des actes modificatifs et des cessions 
            de parts régulièrement notifiées et publiées.
          </p>
        </section>

        {/* Article 11 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 11 - INDIVISIBILITÉ DES PARTS</h3>
          <p>
            Les parts sociales sont indivisibles à l'égard de la société qui ne reconnaît qu'un seul 
            propriétaire pour chaque part.
          </p>
        </section>

        {/* Article 12 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 12 - DROITS DES ASSOCIÉS</h3>
          <p>
            Chaque part sociale confère à son propriétaire un droit égal dans les bénéfices de la société 
            et dans tout l'actif social. Elle donne droit à une voix dans tous les votes et délibérations.
          </p>
        </section>

        {/* Article 13 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 13 - RESPONSABILITÉ DES ASSOCIÉS</h3>
          <p>
            Les associés ne supportent les pertes qu'à concurrence de leurs apports. Au-delà, tout appel 
            de fonds est interdit.
          </p>
        </section>

        {/* Article 14 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 14 - CESSION DE PARTS SOCIALES</h3>
          <p>
            Les parts sociales sont librement cessibles entre associés. Elles ne peuvent être cédées à des 
            tiers étrangers à la société qu'avec le consentement de la majorité des associés représentant 
            au moins les trois quarts (3/4) des parts sociales.
          </p>
        </section>

        {/* Article 15 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 15 - TRANSMISSION DES PARTS</h3>
          <p>
            En cas de décès d'un associé, la société continue entre les associés survivants et les héritiers 
            et ayants droit de l'associé décédé.
          </p>
        </section>

        {/* Article 16 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 16 - NANTISSEMENT DES PARTS SOCIALES</h3>
          <p>
            Les parts sociales peuvent faire l'objet d'un nantissement constaté par acte authentique ou 
            par acte sous seing privé signifié à la société.
          </p>
        </section>

        {/* Article 17 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 17 - POUVOIRS DU GÉRANT</h3>
          <p>
            Le gérant peut faire tous les actes de gestion dans l'intérêt de la société. Dans les rapports 
            avec les tiers, le gérant est investi des pouvoirs les plus étendus pour agir en toute 
            circonstance au nom de la société.
          </p>
        </section>

        {/* Article 18 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 18 - RÉMUNÉRATION DU GÉRANT</h3>
          <p>
            En rémunération de ses fonctions, le gérant pourra recevoir un traitement fixe ou proportionnel, 
            dont le montant et les modalités de paiement seront déterminés par décision collective des associés.
          </p>
        </section>

        {/* Article 19 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 19 - RÉVOCATION DU GÉRANT</h3>
          <p>
            Le gérant peut être révoqué par décision des associés représentant plus de la moitié des parts 
            sociales. Si la révocation est décidée sans juste motif, elle peut donner lieu à des dommages 
            et intérêts.
          </p>
        </section>

        {/* Article 20 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 20 - DÉCISIONS COLLECTIVES</h3>
          <p>
            Les décisions collectives sont prises en assemblée ou par consultation écrite. Toutefois, la 
            réunion d'une assemblée est obligatoire pour statuer sur l'approbation des comptes de chaque exercice.
          </p>
        </section>

        {/* Article 21 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 21 - DÉCISIONS EXTRAORDINAIRES</h3>
          <p>
            Les décisions extraordinaires, notamment celles portant modification des statuts, sont prises 
            par les associés représentant au moins les trois quarts (3/4) des parts sociales.
          </p>
        </section>

        {/* Article 22 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 22 - EXERCICE SOCIAL</h3>
          <p>
            L'exercice social commence le premier janvier et se termine le trente et un décembre de chaque année.
          </p>
        </section>

        {/* Article 23 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 23 - INVENTAIRE - COMPTES ANNUELS</h3>
          <p>
            À la clôture de chaque exercice, le gérant dresse l'inventaire des divers éléments de l'actif 
            et du passif existant à cette date. Il dresse également le bilan, le compte de résultat et l'annexe.
          </p>
        </section>

        {/* Article 24 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 24 - AFFECTATION ET RÉPARTITION DES BÉNÉFICES</h3>
          <p>
            Le bénéfice distribuable est constitué par le bénéfice de l'exercice, diminué des pertes 
            antérieures et des sommes portées en réserve, et augmenté du report bénéficiaire.
          </p>
        </section>

        {/* Article 25 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 25 - DISSOLUTION - LIQUIDATION</h3>
          <p>
            La société à responsabilité limitée est dissoute pour les causes communes à toutes les sociétés 
            et, en outre, dans les cas prévus par l'Acte Uniforme.
          </p>
        </section>

        {/* Article 26 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 26 - CONTESTATIONS</h3>
          <p>
            Les contestations relatives aux affaires de la société survenant pendant la vie de la société 
            ou au cours de sa liquidation sont soumises au tribunal chargé des affaires commerciales.
          </p>
        </section>

        {/* Article 27 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 27 - FRAIS</h3>
          <p>
            Les frais, droits et honoraires des présents Statuts sont à la charge de la société.
          </p>
        </section>

        {/* Article 28 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 28 - ÉLECTION DE DOMICILE</h3>
          <p>
            Pour l'exécution des présentes et de leurs suites, les parties déclarent faire élection de 
            domicile au siège social.
          </p>
        </section>

        {/* Article 29 */}
        <section>
          <h3 className="font-bold text-base mb-2">ARTICLE 29 - POUVOIRS</h3>
          <p>
            Les associés donnent tous pouvoirs au gérant <span className="bg-yellow-100 px-1 font-bold">{gerantNom || "[NOM DU GÉRANT]"}</span> à 
            l'effet de procéder à l'enregistrement des présents statuts, accomplir les formalités 
            d'immatriculation au Registre du Commerce et du Crédit Mobilier.
          </p>
        </section>

        {/* Signature */}
        <section className="mt-12 pt-6 border-t">
          <p className="text-center mb-8">
            Fait à {formData.ville || "[VILLE]"}, le {formData.dateConstitution || "[DATE]"}
          </p>
          {isSARLU ? (
            <div className="text-center">
              <p className="font-semibold">L'associé unique</p>
              <div className="mt-8 border-b border-black w-64 mx-auto"></div>
              <p className="mt-2">{sarluData.associeNom} {sarluData.associePrenoms}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8">
              {sarlPluriData.associes?.slice(0, 4).map((associe, index) => (
                <div key={associe.id} className="text-center">
                  <p className="font-semibold">Associé {index + 1}</p>
                  <div className="mt-8 border-b border-black w-48 mx-auto"></div>
                  <p className="mt-2">{associe.nom} {associe.prenoms}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
