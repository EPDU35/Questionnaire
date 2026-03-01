const express = require("express");
const router = express.Router();
const Case = require("../models/case.model");

const COMMUNES = [
    "Abobo", "Adjame", "Attécoubé", "Cocody", "Koumassi",
    "Marcory", "Plateau", "Port-Bouet", "Treichville", "Yopougon",
    "Songon", "Anyama", "Bingerville"
];

function normaliser(str) {
    return (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function calculerNiveauRisque(totalCas, casValides) {
    if (casValides >= 10 || totalCas >= 20) return "eleve";
    if (casValides >= 4  || totalCas >= 8)  return "moyen";
    if (totalCas > 0)                        return "faible";
    return "aucun";
}

router.get("/map", async (req, res) => {
    try {
        const resultats = await Case.aggregate([
            {
                $group: {
                    _id: { $toLower: "$commune" },
                    total_cas:       { $sum: 1 },
                    cas_valides:     { $sum: { $cond: [{ $eq: ["$statut", "valide"] }, 1, 0] } },
                    alertes_actives: { $sum: { $cond: [{ $in:  ["$statut", ["valide", "pris_en_charge"]] }, 1, 0] } }
                }
            }
        ]);

        const mapDonnees = {};
        resultats.forEach(r => { mapDonnees[normaliser(r._id)] = r; });

        const data = COMMUNES.map(nom => {
            const cle = normaliser(nom);
            const d = mapDonnees[cle] || {};
            const total    = d.total_cas       || 0;
            const valides  = d.cas_valides      || 0;
            const alertes  = d.alertes_actives  || 0;

            return {
                commune:         nom,
                total_cas:       total,
                cas_valides:     valides,
                alertes_actives: alertes,
                niveau_risque:   calculerNiveauRisque(total, valides)
            };
        });

        res.json({ succes: true, data });
    } catch (err) {
        console.error("GET /api/alerts/map :", err);
        res.status(500).json({ succes: false, message: "Erreur serveur." });
    }
});

router.get("/", async (req, res) => {
    try {
        const { commune, niveau_risque } = req.query;
        const filtre = { statut: { $in: ["valide", "pris_en_charge"] } };

        if (commune)       filtre.commune      = { $regex: new RegExp(commune, "i") };
        if (niveau_risque) filtre.niveau_risque = niveau_risque;

        const alertes = await Case.find(filtre)
            .sort({ createdAt: -1 })
            .limit(50)
            .select("commune maladie statut createdAt niveau_risque");

        res.json({ succes: true, data: alertes });
    } catch (err) {
        console.error("GET /api/alerts :", err);
        res.status(500).json({ succes: false, message: "Erreur serveur." });
    }
});

module.exports = router;
