const path = require('path');
const diseases     = require('../ia/knowledge/diseases.json');
const symptoms     = require('../ia/knowledge/symptoms.json');
const advice       = require('../ia/knowledge/advice.json');
const diseaseSymptoms = require('../ia/knowledge/disease_symptoms.json');
const detectDisease   = require('../ia/rules/detectDisease');
const assessRisk      = require('../ia/rules/assessRisk');
const generateResponse = require('../ia/rules/generateResponse');

async function analyserMessage(message) {
    const msg = message.toLowerCase();
    const symptomesDetectes  = detectSymptoms(msg);
    const maladiesSuspectes  = detectDisease(symptomesDetectes);
    const niveauRisque       = assessRisk(symptomesDetectes, maladiesSuspectes);
    const commune            = detectCommune(msg);

    const reponse = generateResponse({
        message: msg,
        symptomesDetectes,
        maladiesSuspectes,
        niveauRisque,
        commune
    });

    return {
        type: reponse.type,
        message: reponse.message,
        extras: {
            symptomesDetectes,
            maladiesSuspectes,
            commune
        }
    };
}

function detectSymptoms(msg) {
    return symptoms
        .filter(s => s.mots_cles.some(mot => msg.includes(mot.toLowerCase())))
        .map(s => s.nom);
}

function detectCommune(msg) {
    const communes = [
        'abobo', 'adjame', 'anyama', 'attiecoube', 'cocody',
        'koumassi', 'marcory', 'plateau', 'port-bouet', 'treichville',
        'yopougon', 'bingerville', 'songon'
    ];
    return communes.find(c => msg.includes(c)) || null;
}

module.exports = { analyserMessage };