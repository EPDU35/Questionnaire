// ============================================================
// EXTRAIT À INTÉGRER DANS VOTRE backend/server.js
// Ajoutez la ligne marquée ✅ avec vos autres app.use(...)
// ============================================================

// Vos routes existantes (exemple)
app.use('/api/auth',    require('./routes/auth.routes'));
app.use('/api/cases',   require('./routes/cases.routes'));
app.use('/api/alerts',  require('./routes/alerts.routes'));
app.use('/api/stats',   require('./routes/stats.routes'));

// ✅ AJOUTEZ CETTE LIGNE — Route IA (résout le 404 sur /api/ia/suivi)
app.use('/api/ia',      require('./routes/ia.routes'));
