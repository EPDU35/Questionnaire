const express = require('express');
const router = express.Router();
const { analyserMessage } = require('../services/ia.service');
const { evaluerStatutSuivi, genererReponseIaSuivi } = require('../services/suivi.service');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/message', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ succes: false, message: 'Message vide.' });
        }
        const reponse = await analyserMessage(message.trim());
        return res.json({ succes: true, reponse });
    } catch (err) {
        return res.status(500).json({ succes: false, message: 'Erreur interne.' });
    }
});

router.post('/suivi', authMiddleware, async (req, res) => {
    try {
        const { casId, evolution, nouveauxSymptomes, temperature, consultationMedicale, entourageMalade, joursSymptomes } = req.body;

        if (!casId || !evolution) {
            return res.status(400).json({ succes: false, message: 'Donnees de suivi incompletes.' });
        }

        const donneesSuivi = { evolution, nouveauxSymptomes, temperature, consultationMedicale, entourageMalade, joursSymptomes };
        const evaluation = evaluerStatutSuivi(donneesSuivi, {});
        const reponseIa = genererReponseIaSuivi(evaluation, {});

        let nouveauStatutCas = null;
        if (evaluation.statut === 'critique') nouveauStatutCas = 'encadrement';
        if (evaluation.statut === 'aggravation') nouveauStatutCas = 'en_attente';

        return res.json({
            succes: true,
            evaluation: {
                statut: evaluation.statut,
                raisons: evaluation.raisons,
                nouveauStatutCas
            },
            reponse: reponseIa
        });

    } catch (err) {
        return res.status(500).json({ succes: false, message: 'Erreur lors du suivi.' });
    }
});

module.exports = router;
