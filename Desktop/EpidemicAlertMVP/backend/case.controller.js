// controllers/case.controller.js (extrait — après l'analyse IA)
const NotificationService = require('../services/notification.service');

// Exemple : après réception du statut IA
async function handleAIResponse(req, res) {
  try {
    const { case_id, ai_status } = req.body; 
    // ai_status = 'stable' | 'aggravation' | 'critique'

    // ... logique de mise à jour du cas ...

    // IDs des admins/agents à notifier (à récupérer selon votre logique métier)
    const adminIds = await getUserIdsByRole(['admin', 'authority']);

    await NotificationService.notifyMultiple(
      ai_status,
      adminIds,
      { case_id, zone: 'Abidjan', disease: 'Mpox' } // contexte enrichi
    );

    return res.status(200).json({ success: true, ai_status });

  } catch (error) {
    console.error('[handleAIResponse]', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
}