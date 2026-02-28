const SYMPTOMES_GRAVES = [
    'convulsion', 'inconscient', 'respire pas', 'saignement', 'paralysie',
    'coma', 'detresse', 'urgent', 'grave', 'critique', 'sang', 'vomit sang',
    'diarrhee sang', 'evanouissement', 'perdu connaissance'
];

const SYMPTOMES_AGGRAVATION = [
    'pire', 'empire', 'aggrave', 'empiré', 'plus grave', 'de plus en plus',
    'toujours', 'encore', 'persiste', 'persistant', 'augmente', 'augmentation',
    'spreads', 'propagation', 'plusieurs personnes', 'entourage malade',
    'voisins malades', 'famille malade', 'collegues malades'
];

function evaluerStatutSuivi(donneesSuivi, casOriginal) {
    const { evolution, nouveauxSymptomes, temperature, consultationMedicale, entourageMalade, joursSymptomes } = donneesSuivi;

    let score = 0;
    let raisons = [];

    if (evolution === 'pire') {
        score += 3;
        raisons.push('evolution negative');
    } else if (evolution === 'pareil') {
        score += 1;
        raisons.push('pas d\'amelioration');
    }

    if (nouveauxSymptomes && nouveauxSymptomes.length > 0) {
        const grave = nouveauxSymptomes.some(s =>
            SYMPTOMES_GRAVES.some(sg => s.toLowerCase().includes(sg))
        );
        if (grave) {
            score += 5;
            raisons.push('symptomes graves detectes');
        } else {
            score += 2;
            raisons.push('nouveaux symptomes');
        }
    }

    if (temperature && parseFloat(temperature) >= 39.5) {
        score += 2;
        raisons.push('temperature elevee : ' + temperature + '°C');
    } else if (temperature && parseFloat(temperature) >= 38.5) {
        score += 1;
        raisons.push('fievre moderee');
    }

    if (joursSymptomes && parseInt(joursSymptomes) >= 5) {
        score += 2;
        raisons.push('symptomes depuis ' + joursSymptomes + ' jours');
    } else if (joursSymptomes && parseInt(joursSymptomes) >= 3) {
        score += 1;
        raisons.push('symptomes persistants');
    }

    if (entourageMalade === true || entourageMalade === 'oui') {
        score += 3;
        raisons.push('cas similaires dans l\'entourage');
    }

    if (score >= 7) {
        return { statut: 'critique', raisons, score };
    } else if (score >= 3) {
        return { statut: 'aggravation', raisons, score };
    } else {
        return { statut: 'stable', raisons, score };
    }
}

function genererReponseIaSuivi(evaluation, casOriginal) {
    const { statut, raisons } = evaluation;

    if (statut === 'critique') {
        return {
            type: 'urgence',
            message: 'Votre etat necessite une attention medicale immediate. Rendez-vous aux urgences ou appelez le SAMU (185) maintenant. Votre cas a ete signale en priorite aux autorites sanitaires.'
        };
    }

    if (statut === 'aggravation') {
        return {
            type: 'alerte',
            message: 'Votre etat semble s\'aggraver. Nous avons transmis une alerte au centre de sante de votre commune. Un agent de sante prendra contact avec vous. En attendant, reposez-vous et hydratez-vous.'
        };
    }

    return {
        type: 'conseil',
        message: 'Vos symptomes semblent stables ou en amelioration. Continuez a vous reposer, boire suffisamment d\'eau et evitez les efforts. Si votre etat se degrade, revenez nous informer immediatement.'
    };
}

module.exports = { evaluerStatutSuivi, genererReponseIaSuivi, SYMPTOMES_GRAVES };
