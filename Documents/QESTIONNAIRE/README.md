# Hackathon L1 — MIAGE-GI

Questionnaire etudiant pour la participation au Hackathon special Licence 1.
Organise par Eliel Poster x le BDE MIAGE-GI.

---

## Structure du projet

```
hackathon-l1/
├── frontend/
│   └── index.html          Interface utilisateur
├── backend/
│   ├── server.js           Serveur Express
│   └── data.db             Base de donnees SQLite (generee automatiquement)
├── package.json
└── README.md
```

---

## Installation

### Prerequis
- Node.js 18 ou superieur

### Demarrage

```bash
npm install
npm start
```

Le serveur sera accessible sur `http://localhost:3000`.

Pour le mode developpement avec rechargement automatique :

```bash
npm run dev
```

---

## Base de donnees

SQLite via `better-sqlite3`. Le fichier `data.db` est cree automatiquement au premier lancement.

Schema de la table `reponses` :

| Colonne     | Type     | Description                     |
|-------------|----------|---------------------------------|
| id          | INTEGER  | Identifiant auto-incremente     |
| nom         | TEXT     | Nom de l'etudiant               |
| prenom      | TEXT     | Prenom de l'etudiant            |
| reponse     | TEXT     | Valeur : "oui" ou "non"         |
| created_at  | DATETIME | Date et heure de la soumission  |

---

## API

### POST /api/reponse

Enregistre une reponse etudiant.

**Corps de la requete (JSON) :**
```json
{
  "nom": "Martin",
  "prenom": "Lucas",
  "reponse": "oui"
}
```

**Reponse succes (201) :**
```json
{ "id": 42 }
```

### GET /api/stats

Retourne le bilan des reponses.

**Reponse (200) :**
```json
{
  "total": 150,
  "oui": 112,
  "non": 38
}
```

---

## Deploiement

Pour un deploiement en production, definir la variable d'environnement `PORT` :

```bash
PORT=8080 npm start
```
