// routes/ia.routes.js
const express = require('express');
const router = express.Router();

router.post('/message', async (req, res) => {
    try {
        const { messages, systemPrompt } = req.body;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1000,
                system: systemPrompt,
                messages: messages
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ message: data.error?.message || 'Erreur API' });
        }

        const reponse = data.content
            .filter(b => b.type === 'text')
            .map(b => b.text)
            .join('\n');

        res.json({ reponse, usage: data.usage });

    } catch (err) {
        console.error('Erreur IA proxy:', err);
        res.status(500).json({ message: 'Erreur serveur IA' });
    }
});

module.exports = router;
