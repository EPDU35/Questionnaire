const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ reponses: [], nextId: 1 }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/api/reponse', (req, res) => {
  const { nom, prenom, reponse } = req.body;

  if (!nom || !prenom || !reponse) {
    return res.status(400).json({ error: 'Champs manquants.' });
  }

  const nomClean = String(nom).trim();
  const prenomClean = String(prenom).trim();
  const reponseClean = String(reponse).trim().toLowerCase();

  if (!nomClean || !prenomClean) {
    return res.status(400).json({ error: 'Nom et prenom requis.' });
  }

  if (!['oui', 'non'].includes(reponseClean)) {
    return res.status(400).json({ error: 'Reponse invalide.' });
  }

  const db = readDB();
  const entry = {
    id: db.nextId++,
    nom: nomClean,
    prenom: prenomClean,
    reponse: reponseClean,
    created_at: new Date().toISOString()
  };
  db.reponses.push(entry);
  writeDB(db);

  return res.status(201).json({ id: entry.id });
});

app.get('/api/stats', (req, res) => {
  const db = readDB();
  const total = db.reponses.length;
  const oui = db.reponses.filter(r => r.reponse === 'oui').length;
  const non = db.reponses.filter(r => r.reponse === 'non').length;
  return res.json({ total, oui, non });
});

app.get('/api/reponses', (req, res) => {
  const db = readDB();
  const sorted = [...db.reponses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return res.json(sorted);
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Serveur actif sur http://localhost:${PORT}`);
});