const utilisateur = getUser();

if (utilisateur) {
    const avatar = document.getElementById('sidebarAvatar');
    const nom = document.getElementById('sidebarNom');
    if (avatar) avatar.textContent = utilisateur.name ? utilisateur.name.charAt(0).toUpperCase() : 'C';
    if (nom) nom.textContent = utilisateur.name || 'Citoyen';
}

const btnDeconnexion = document.getElementById('btnDeconnexion');
if (btnDeconnexion) {
    btnDeconnexion.addEventListener('click', (e) => {
        e.preventDefault();
        deconnexion();
    });
}

let casActifId = null;

function rendreCas(cas) {
    const div = document.createElement('div');
    div.className = 'carte-cas';
    div.innerHTML = `
        <div class="carte-cas-entete">
            <div>
                <div class="carte-cas-titre">${cas.disease || 'Symptomes signales'}</div>
                <div class="carte-cas-meta">${cas.commune} — ${formaterDate(cas.createdAt)}</div>
            </div>
            <span class="badge-statut ${classeStatut(cas.status)}">${labelStatut(cas.status)}</span>
        </div>
        <div class="carte-cas-corps">${cas.description || ''}</div>
        <div class="carte-cas-pied">
            <span class="carte-cas-meta">Signalement #${cas._id ? cas._id.slice(-6).toUpperCase() : '—'}</span>
            ${cas.status === 'signale' || cas.status === 'encadrement' || cas.status === 'en_attente'
                ? '<button type="button" class="btn-action" onclick="ouvrirSuivi(\'' + cas._id + '\')">Faire un point de suivi</button>'
                : ''}
        </div>
    `;
    return div;
}

function ouvrirSuivi(casId) {
    casActifId = casId;
    const zone = document.getElementById('zoneConversation');
    if (!zone) return;

    zone.style.display = 'block';
    zone.scrollIntoView({ behavior: 'smooth' });

    const liste = document.getElementById('messagesListe');
    if (liste) liste.innerHTML = '';

    ajouterMessageChat('ia', 'Comment vous sentez-vous depuis votre dernier signalement ? Remplissez le bilan ci-dessous.');
    afficherFormulaireSuivi();
}

function ajouterMessageChat(auteur, texte, type) {
    const liste = document.getElementById('messagesListe');
    if (!liste) return;

    const wrapper = document.createElement('div');

    const bulle = document.createElement('div');
    bulle.className = 'message-bulle ' + auteur;

    if (auteur === 'ia' && type && type !== 'information') {
        const labels = { urgence: 'Urgence', alerte: 'Alerte', conseil: 'Conseil', orientation: 'Orientation', prevention: 'Prevention' };
        const classes = { urgence: 'ia-badge-urgence', alerte: 'ia-badge-alerte', conseil: 'ia-badge-conseil', orientation: 'ia-badge-orientation', prevention: 'ia-badge-prevention' };
        const badge = document.createElement('span');
        badge.className = 'ia-badge-type ' + (classes[type] || '');
        badge.textContent = labels[type] || type;
        bulle.appendChild(badge);
        bulle.appendChild(document.createElement('br'));
    }

    bulle.appendChild(document.createTextNode(texte));

    const heure = document.createElement('div');
    heure.className = 'message-heure' + (auteur === 'utilisateur' ? ' utilisateur' : '');
    heure.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    wrapper.appendChild(bulle);
    wrapper.appendChild(heure);
    liste.appendChild(wrapper);
    liste.scrollTop = liste.scrollHeight;
}

function afficherFormulaireSuivi() {
    const existant = document.getElementById('zoneFormulaireSuivi');
    if (existant) { existant.style.display = 'block'; return; }

    const conversationInput = document.querySelector('.conversation-input');
    if (!conversationInput) return;

    const formulaire = document.createElement('div');
    formulaire.id = 'zoneFormulaireSuivi';
    formulaire.style.cssText = 'padding:16px 20px;border-top:1.5px solid #eee;display:flex;flex-direction:column;gap:12px;';
    formulaire.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="champ">
                <label style="font-size:.82rem;font-weight:600;">Evolution</label>
                <select id="suiviEvolution" style="font-family:inherit;font-size:.88rem;border:1.5px solid #ddd;border-radius:8px;padding:9px 11px;outline:none;appearance:none;">
                    <option value="">Choisir</option>
                    <option value="mieux">Mieux</option>
                    <option value="pareil">Pareil</option>
                    <option value="pire">Pire</option>
                </select>
            </div>
            <div class="champ">
                <label style="font-size:.82rem;font-weight:600;">Temperature (°C)</label>
                <input type="number" id="suiviTemperature" placeholder="Ex: 38.5" step="0.1" min="35" max="43" style="font-family:inherit;font-size:.88rem;border:1.5px solid #ddd;border-radius:8px;padding:9px 11px;outline:none;">
            </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="champ">
                <label style="font-size:.82rem;font-weight:600;">Jours depuis les symptomes</label>
                <input type="number" id="suiviJours" placeholder="Ex: 3" min="1" max="30" style="font-family:inherit;font-size:.88rem;border:1.5px solid #ddd;border-radius:8px;padding:9px 11px;outline:none;">
            </div>
            <div class="champ">
                <label style="font-size:.82rem;font-weight:600;">Entourage malade ?</label>
                <select id="suiviEntourage" style="font-family:inherit;font-size:.88rem;border:1.5px solid #ddd;border-radius:8px;padding:9px 11px;outline:none;appearance:none;">
                    <option value="non">Non</option>
                    <option value="oui">Oui</option>
                </select>
            </div>
        </div>
        <div class="champ">
            <label style="font-size:.82rem;font-weight:600;">Nouveaux symptomes (facultatif)</label>
            <input type="text" id="suiviNouveauxSymptomes" placeholder="Ex: maux de ventre, toux..." style="font-family:inherit;font-size:.88rem;border:1.5px solid #ddd;border-radius:8px;padding:9px 11px;outline:none;">
        </div>
        <button type="button" id="btnEnvoyerSuivi" class="btn-primaire" style="align-self:flex-start;">Envoyer le bilan</button>
    `;

    conversationInput.parentNode.insertBefore(formulaire, conversationInput);
    document.getElementById('btnEnvoyerSuivi').addEventListener('click', envoyerSuivi);
}

async function envoyerSuivi() {
    const evolution = document.getElementById('suiviEvolution').value;
    const temperature = document.getElementById('suiviTemperature').value;
    const joursSymptomes = document.getElementById('suiviJours').value;
    const entourageMalade = document.getElementById('suiviEntourage').value;
    const nouveauxSymptomesRaw = document.getElementById('suiviNouveauxSymptomes').value.trim();

    if (!evolution) {
        alert('Veuillez indiquer votre evolution.');
        return;
    }

    const labelEvolution = { mieux: 'Je me sens mieux', pareil: 'Pareil, pas de changement', pire: 'Je me sens pire' };
    let msgUtilisateur = labelEvolution[evolution];
    if (nouveauxSymptomesRaw) msgUtilisateur += '. Nouveaux symptomes : ' + nouveauxSymptomesRaw;
    if (temperature) msgUtilisateur += '. Temperature : ' + temperature + '°C';
    if (entourageMalade === 'oui') msgUtilisateur += '. Mon entourage est egalement malade.';

    ajouterMessageChat('utilisateur', msgUtilisateur);

    const btnEnvoyer = document.getElementById('btnEnvoyerSuivi');
    const zone = document.getElementById('zoneFormulaireSuivi');
    if (btnEnvoyer) { btnEnvoyer.disabled = true; btnEnvoyer.textContent = 'Analyse en cours...'; }
    if (zone) zone.style.display = 'none';

    try {
        const nouveauxSymptomes = nouveauxSymptomesRaw
            ? nouveauxSymptomesRaw.split(',').map(s => s.trim()).filter(Boolean)
            : [];

        const data = await apiPost('/ia/suivi', {
            casId: casActifId,
            evolution,
            nouveauxSymptomes,
            temperature: temperature || null,
            joursSymptomes: joursSymptomes || null,
            entourageMalade: entourageMalade === 'oui'
        });

        if (data && data.reponse) {
            ajouterMessageChat('ia', data.reponse.message, data.reponse.type);
        }

        if (data && data.evaluation) {
            const { statut, nouveauStatutCas } = data.evaluation;

            if (statut === 'critique' || statut === 'aggravation') {
                setTimeout(() => {
                    ajouterMessageChat('ia', 'Votre cas a ete transmis aux equipes de sante de votre commune. Vous serez contacte sous peu.');
                }, 1200);
            }

            if (nouveauStatutCas) {
                setTimeout(() => chargerDashboard(), 2500);
            }
        }

    } catch (err) {
        ajouterMessageChat('ia', 'Impossible de traiter votre bilan pour le moment. Verifiez votre connexion.');
        if (btnEnvoyer) { btnEnvoyer.disabled = false; btnEnvoyer.textContent = 'Envoyer le bilan'; }
        if (zone) zone.style.display = 'block';
    }
}

async function chargerDashboard() {
    if (!utilisateur) {
        window.location.href = '../auth/login.html';
        return;
    }

    const titreBonjour = document.getElementById('titreBonjour');
    if (titreBonjour && utilisateur.name) {
        titreBonjour.textContent = 'Bonjour, ' + utilisateur.name.split(' ')[0];
    }

    try {
        const data = await apiGet('/cases/mine');
        const cas = data.cases || data || [];

        const nbTotal = document.getElementById('nbCasTotal');
        const nbEnCours = document.getElementById('nbCasEnCours');
        const nbClos = document.getElementById('nbCasClos');

        if (nbTotal) nbTotal.textContent = cas.length;
        if (nbEnCours) nbEnCours.textContent = cas.filter(c => ['signale', 'encadrement', 'pris_en_charge', 'en_attente'].includes(c.status)).length;
        if (nbClos) nbClos.textContent = cas.filter(c => c.status === 'clos').length;

        const zone = document.getElementById('zoneCas');
        if (!zone) return;
        zone.innerHTML = '';

        if (cas.length === 0) {
            zone.innerHTML = '<div class="vide-etat">Vous n\'avez pas encore signale de cas. <a href="report.html" style="color:#00596a;font-weight:600;">Faire un signalement</a></div>';
            return;
        }

        cas.forEach(c => zone.appendChild(rendreCas(c)));

    } catch (err) {
        const zone = document.getElementById('zoneCas');
        if (zone) zone.innerHTML = '<div class="vide-etat">Impossible de charger vos cas. Verifiez votre connexion.</div>';
    }
}

async function obtenirReponseIaSignalement(description, maladie, commune) {
    try {
        const message = [
            description,
            maladie ? 'Maladie suspectee : ' + maladie : '',
            commune ? 'Commune : ' + commune : ''
        ].filter(Boolean).join('. ');

        const data = await apiPost('/ia/message', { message });

        if (data && data.reponse && data.reponse.message) {
            return data.reponse.message;
        }

        return 'Merci pour votre signalement. Un agent de sante prend en charge votre cas et vous contactera sous peu.';

    } catch (err) {
        return 'Merci pour votre signalement. Un agent de sante prend en charge votre cas et vous contactera sous peu.';
    }
}

const formSignalement = document.getElementById('formSignalement');
if (formSignalement) {
    formSignalement.addEventListener('submit', async (e) => {
        e.preventDefault();

        const commune = document.getElementById('commune').value;
        const maladie = document.getElementById('maladie').value;
        const description = document.getElementById('description').value.trim();
        const quartier = document.getElementById('quartier').value.trim();
        const btnSignalement = document.getElementById('btnSignalement');
        const msgErreur = document.getElementById('msgErreur');

        if (msgErreur) msgErreur.classList.remove('visible');

        if (!commune || !description) {
            if (msgErreur) { msgErreur.textContent = 'Veuillez remplir la commune et la description.'; msgErreur.classList.add('visible'); }
            return;
        }

        btnSignalement.disabled = true;
        btnSignalement.textContent = 'Envoi en cours...';

        try {
            await apiPost('/cases', {
                commune,
                disease: maladie || null,
                description,
                location: quartier || null
            });

            const messageIa = await obtenirReponseIaSignalement(description, maladie, commune);

            const zone = document.getElementById('zoneFormulaire');
            const confirmation = document.getElementById('zoneConfirmation');
            const premierMsg = document.getElementById('premierMessageIa');

            if (zone) zone.style.display = 'none';
            if (confirmation) confirmation.style.display = 'block';
            if (premierMsg) premierMsg.textContent = messageIa;

        } catch (err) {
            if (msgErreur) { msgErreur.textContent = err.message || 'Une erreur est survenue.'; msgErreur.classList.add('visible'); }
            btnSignalement.disabled = false;
            btnSignalement.textContent = 'Envoyer le signalement';
        }
    });
}

async function chargerAlertes() {
    const liste = document.getElementById('alertesListe');
    if (!liste) return;
    try {
        const data = await apiGet('/alerts?limit=5');
        const alertes = data.alerts || data || [];
        if (alertes.length === 0) {
            liste.innerHTML = '<p class="texte-chargement">Aucune alerte active pour le moment.</p>';
            return;
        }
        liste.innerHTML = '';
        alertes.forEach(a => {
            const item = document.createElement('div');
            item.className = 'alerte-item';
            item.innerHTML = `
                <div class="alerte-item-gauche">
                    <div class="alerte-maladie">${a.disease || 'Alerte sanitaire'}</div>
                    <div class="alerte-commune">${a.commune || 'Toutes communes'} — ${formaterDate(a.createdAt)}</div>
                </div>
                <span class="badge-risque ${a.level || 'moyen'}">${a.level === 'eleve' ? 'Risque eleve' : a.level === 'faible' ? 'Risque faible' : 'Risque moyen'}</span>
            `;
            liste.appendChild(item);
        });
    } catch (err) {
        liste.innerHTML = '<p class="texte-chargement">Impossible de charger les alertes.</p>';
    }
}

async function chargerStatsAccueil() {
    try {
        const data = await apiGet('/stats/summary');
        const totalCas = document.getElementById('totalCas');
        const totalAlertes = document.getElementById('totalAlertes');
        const statCas = document.getElementById('statCas');
        const statAlertes = document.getElementById('statAlertes');
        if (totalCas && data.totalCases !== undefined) totalCas.textContent = data.totalCases;
        if (totalAlertes && data.activeAlerts !== undefined) totalAlertes.textContent = data.activeAlerts;
        if (statCas && data.totalCases !== undefined) statCas.textContent = data.totalCases;
        if (statAlertes && data.activeAlerts !== undefined) statAlertes.textContent = data.activeAlerts;
    } catch (err) {}
}

function redirigerSiConnecte() {
    const user = getUser();
    if (!user) return;
    if (user.role === 'citoyen') {
        window.location.href = 'citizen/feed.html';
    } else if (user.role === 'centre') {
        window.location.href = 'center/dashboard.html';
    } else if (user.role === 'autorite') {
        window.location.href = 'authority/dashboard.html';
    }
}

if (document.getElementById('zoneCas')) {
    chargerDashboard();
}

if (document.getElementById('alertesListe')) {
    chargerAlertes();
}

if (document.getElementById('totalCas') || document.getElementById('statCas')) {
    redirigerSiConnecte();
    chargerStatsAccueil();
}
