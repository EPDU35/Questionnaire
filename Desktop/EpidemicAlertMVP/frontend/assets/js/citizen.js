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
let derniereNotifId = parseInt(localStorage.getItem('babi_derniere_notif') || '0');
let premierChargement = true;

function creerClocheNotification() {
    const nav = document.querySelector('.nav-principale');
    if (!nav || document.getElementById('btn-cloche')) return;

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;display:inline-flex;align-items:center;';
    wrapper.innerHTML =
        '<button id="btn-cloche" style="background:none;border:none;cursor:pointer;position:relative;padding:6px;display:flex;align-items:center;color:#1c1e21;">' +
            '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">' +
                '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>' +
                '<path d="M13.73 21a2 2 0 0 1-3.46 0"/>' +
            '</svg>' +
            '<span id="badge-notif" style="display:none;position:absolute;top:2px;right:2px;min-width:16px;height:16px;border-radius:8px;background:#d0021b;color:#fff;font-size:10px;font-weight:700;line-height:16px;text-align:center;padding:0 3px;">0</span>' +
        '</button>' +
        '<div id="panneau-notif" style="display:none;position:absolute;top:38px;right:0;width:300px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.14);border:1px solid #e4e6ea;z-index:999;overflow:hidden;">' +
            '<div style="padding:14px 16px;border-bottom:1px solid #e4e6ea;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:.9rem;font-weight:700;">Notifications</span>' +
                '<button id="btn-tout-lire" style="font-size:.78rem;color:#00596a;background:none;border:none;cursor:pointer;font-family:inherit;">Tout marquer lu</button>' +
            '</div>' +
            '<div id="liste-notifs" style="max-height:340px;overflow-y:auto;"></div>' +
            '<div style="padding:10px 16px;border-top:1px solid #e4e6ea;text-align:center;">' +
                '<a href="feed.html" style="font-size:.82rem;color:#00596a;font-weight:600;">Voir le fil d\'actualite</a>' +
            '</div>' +
        '</div>';

    nav.insertBefore(wrapper, nav.firstChild);

    document.getElementById('btn-cloche').addEventListener('click', (e) => {
        e.stopPropagation();
        const panneau = document.getElementById('panneau-notif');
        panneau.style.display = panneau.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('btn-tout-lire').addEventListener('click', () => {
        const maxId = parseInt(localStorage.getItem('babi_max_notif_id') || '0');
        derniereNotifId = maxId;
        localStorage.setItem('babi_derniere_notif', maxId);
        mettreAJourBadge(0);
    });

    document.addEventListener('click', () => {
        const panneau = document.getElementById('panneau-notif');
        if (panneau) panneau.style.display = 'none';
    });
}

function mettreAJourBadge(nb) {
    const badge = document.getElementById('badge-notif');
    if (!badge) return;
    if (nb > 0) {
        badge.style.display = 'block';
        badge.textContent = nb > 99 ? '99+' : nb;
    } else {
        badge.style.display = 'none';
    }
}

function afficherNotifDansListe(notif) {
    const liste = document.getElementById('liste-notifs');
    if (!liste) return;

    const estNonLu = notif.id > derniereNotifId;
    const estOfficiel = notif.type === 'officiel';

    const item = document.createElement('div');
    item.style.cssText = 'padding:12px 16px;border-bottom:1px solid #f0f2f5;background:' + (estNonLu ? '#f0f9fa' : '#fff') + ';';
    item.innerHTML =
        '<div style="font-size:.85rem;font-weight:' + (estNonLu ? '700' : '600') + ';color:#1c1e21;margin-bottom:2px;">' +
            notif.titre +
            (estOfficiel ? '<span style="font-size:.7rem;background:#d0021b;color:#fff;border-radius:4px;padding:1px 5px;margin-left:5px;">Officiel</span>' : '') +
        '</div>' +
        '<div style="font-size:.8rem;color:#65676b;line-height:1.5;">' + (notif.contenu || '') + '</div>' +
        '<div style="font-size:.72rem;color:#adb5bd;margin-top:3px;">' + formaterDateHeure(notif.cree_le || notif.createdAt) + '</div>';

    liste.appendChild(item);
}

function afficherToast(notif) {
    const estOfficiel = notif.type === 'officiel';

    if (!document.getElementById('style-toast')) {
        const style = document.createElement('style');
        style.id = 'style-toast';
        style.textContent = '@keyframes entreeToast { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }';
        document.head.appendChild(style);
    }

    const toast = document.createElement('div');
    toast.style.cssText =
        'position:fixed;bottom:24px;right:24px;z-index:9999;background:#fff;border-radius:12px;' +
        'box-shadow:0 8px 32px rgba(0,0,0,.18);border-left:4px solid ' + (estOfficiel ? '#d0021b' : '#00596a') + ';' +
        'padding:14px 18px;max-width:300px;animation:entreeToast .3s ease;';
    toast.innerHTML =
        '<div style="display:flex;gap:10px;align-items:flex-start;">' +
            '<div style="flex:1;">' +
                '<div style="font-size:.88rem;font-weight:700;color:#1c1e21;margin-bottom:2px;">' +
                    notif.titre +
                    (estOfficiel ? ' <span style="font-size:.7rem;background:#d0021b;color:#fff;border-radius:3px;padding:1px 4px;">SMS envoye</span>' : '') +
                '</div>' +
                '<div style="font-size:.82rem;color:#65676b;">' + (notif.contenu || '').substring(0, 90) + '</div>' +
            '</div>' +
            '<button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:#adb5bd;cursor:pointer;font-size:1rem;padding:0;">x</button>' +
        '</div>';

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.transition = 'opacity .4s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, estOfficiel ? 8000 : 5000);
}

async function verifierNotifications() {
    try {
        const data = await apiGet('/notifications/mine');
        const notifs = data.notifications || data || [];

        if (notifs.length === 0) return;

        const maxId = Math.max(...notifs.map(n => n.id || 0));
        localStorage.setItem('babi_max_notif_id', maxId);

        const nonLues = notifs.filter(n => (n.id || 0) > derniereNotifId);

        const liste = document.getElementById('liste-notifs');
        if (liste) {
            liste.innerHTML = '';
            if (notifs.length === 0) {
                liste.innerHTML = '<div style="padding:24px;text-align:center;color:#adb5bd;font-size:.88rem;">Aucune notification</div>';
            } else {
                notifs.slice(0, 20).forEach(n => afficherNotifDansListe(n));
            }
        }

        mettreAJourBadge(nonLues.length);

        if (!premierChargement && nonLues.length > 0) {
            nonLues.slice(0, 2).forEach((n, i) => {
                setTimeout(() => afficherToast(n), i * 700);
            });
        }

        premierChargement = false;
    } catch (err) {
        premierChargement = false;
    }
}

function rendreCas(cas) {
    const div = document.createElement('div');
    div.className = 'carte-cas';
    div.innerHTML =
        '<div class="carte-cas-entete">' +
            '<div>' +
                '<div class="carte-cas-titre">' + (cas.disease || 'Symptomes signales') + '</div>' +
                '<div class="carte-cas-meta">' + cas.commune + ' — ' + formaterDate(cas.createdAt) + '</div>' +
            '</div>' +
            '<span class="badge-statut ' + classeStatut(cas.status) + '">' + labelStatut(cas.status) + '</span>' +
        '</div>' +
        '<div class="carte-cas-corps">' + (cas.description || '') + '</div>' +
        '<div class="carte-cas-pied">' +
            '<span class="carte-cas-meta">Signalement #' + (cas._id ? cas._id.toString().slice(-6).toUpperCase() : '—') + '</span>' +
            (cas.status === 'signale' || cas.status === 'encadrement' || cas.status === 'en_attente'
                ? '<button type="button" class="btn-action" onclick="ouvrirSuivi(\'' + cas._id + '\')">Faire un point de suivi</button>'
                : '') +
        '</div>';
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
    formulaire.innerHTML =
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
            '<div class="champ">' +
                '<label style="font-size:.82rem;font-weight:600;">Evolution</label>' +
                '<select id="suiviEvolution" style="font-family:inherit;font-size:.88rem;border:1.5px solid #ddd;border-radius:8px;padding:9px 11px;outline:none;appearance:none;">' +
                    '<option value="">Choisir</option>' +
                    '<option value="mieux">Mieux</option>' +
                    '<option value="pareil">Pareil</option>' +
                    '<option value="pire">Pire</option>' +
                '</select>' +
            '</div>' +
            '<div class="champ">' +
                '<label style="font-size:.82rem;font-weight:600;">Temperature (C)</label>' +
                '<input type="number" id="suiviTemperature" placeholder="Ex: 38.5" step="0.1" min="35" max="43" style="font-family:inherit;font-size:.88rem;border:1.5px solid #ddd;border-radius:8px;padding:9px 11px;outline:none;">' +
            '</div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
            '<div class="champ">' +
                '<label style="font-size:.82rem;font-weight:600;">Jours depuis les symptomes</label>' +
                '<input type="number" id="suiviJours" placeholder="Ex: 3" min="1" max="30" style="font-family:inherit;font-size:.88rem;border:1.5px solid #ddd;border-radius:8px;padding:9px 11px;outline:none;">' +
            '</div>' +
            '<div class="champ">' +
                '<label style="font-size:.82rem;font-weight:600;">Entourage malade ?</label>' +
                '<select id="suiviEntourage" style="font-family:inherit;font-size:.88rem;border:1.5px solid #ddd;border-radius:8px;padding:9px 11px;outline:none;appearance:none;">' +
                    '<option value="non">Non</option>' +
                    '<option value="oui">Oui</option>' +
                '</select>' +
            '</div>' +
        '</div>' +
        '<div class="champ">' +
            '<label style="font-size:.82rem;font-weight:600;">Nouveaux symptomes (facultatif)</label>' +
            '<input type="text" id="suiviNouveauxSymptomes" placeholder="Ex: maux de ventre, toux..." style="font-family:inherit;font-size:.88rem;border:1.5px solid #ddd;border-radius:8px;padding:9px 11px;outline:none;">' +
        '</div>' +
        '<button type="button" id="btnEnvoyerSuivi" class="btn-primaire" style="align-self:flex-start;">Envoyer le bilan</button>';

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
    if (temperature) msgUtilisateur += '. Temperature : ' + temperature + 'C';
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
            if (nouveauStatutCas) setTimeout(() => chargerDashboard(), 2500);
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
            item.innerHTML =
                '<div class="alerte-item-gauche">' +
                    '<div class="alerte-maladie">' + (a.disease || 'Alerte sanitaire') + '</div>' +
                    '<div class="alerte-commune">' + (a.commune || 'Toutes communes') + ' — ' + formaterDate(a.createdAt || a.cree_le) + '</div>' +
                '</div>' +
                '<span class="badge-risque ' + (a.level || 'moyen') + '">' +
                    (a.level === 'eleve' ? 'Risque eleve' : a.level === 'faible' ? 'Risque faible' : 'Risque moyen') +
                '</span>';
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
    if (user.role === 'citoyen') window.location.href = 'citizen/feed.html';
    else if (user.role === 'centre') window.location.href = 'center/dashboard.html';
    else if (user.role === 'autorite') window.location.href = 'authority/dashboard.html';
}

if (utilisateur) {
    creerClocheNotification();
    verifierNotifications();
    setInterval(verifierNotifications, 30000);
}

if (document.getElementById('zoneCas')) chargerDashboard();
if (document.getElementById('alertesListe')) chargerAlertes();
if (document.getElementById('totalCas') || document.getElementById('statCas')) {
    redirigerSiConnecte();
    chargerStatsAccueil();
}
