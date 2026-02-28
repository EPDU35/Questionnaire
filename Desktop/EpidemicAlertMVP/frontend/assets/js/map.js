const COULEURS = {
    eleve:  { fill: '#d0021b', border: '#a80015', opacite: 0.55 },
    moyen:  { fill: '#e67e22', border: '#bf6c1c', opacite: 0.50 },
    faible: { fill: '#2e9e5b', border: '#247a47', opacite: 0.45 },
    aucun:  { fill: '#c8ccd2', border: '#aaa',    opacite: 0.25 }
};

const COMMUNES_DEFAUT = [
    'Abobo', 'Adjame', 'Attécoubé', 'Cocody', 'Koumassi',
    'Marcory', 'Plateau', 'Port-Bouet', 'Treichville', 'Yopougon',
    'Songon', 'Anyama', 'Bingerville'
];

let carte = null;
let coucheGeojson = null;
let donneesCommunes = {};
let filtreActif = 'tous';
let communeActive = null;

function normaliserCle(nom) {
    return (nom || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function obtenirDonnees(nom) {
    return donneesCommunes[normaliserCle(nom)] || donneesCommunes[nom] || {};
}

function initialiserCarte() {
    carte = L.map('carte-leaflet', {
        center: [5.345, -4.024],
        zoom: 12,
        zoomControl: false
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(carte);

    L.control.zoom({ position: 'bottomright' }).addTo(carte);

    document.getElementById('carteChargement').style.display = 'none';
}

function styleCouche(feature) {
    const nom = feature.properties?.name || feature.properties?.commune || '';
    const donnees = obtenirDonnees(nom);
    const risque = donnees.niveau_risque || 'aucun';

    if (filtreActif !== 'tous' && risque !== filtreActif) {
        return { fillColor: '#f0f2f5', weight: 1, color: '#ddd', fillOpacity: 0.2 };
    }

    const c = COULEURS[risque] || COULEURS.aucun;
    return { fillColor: c.fill, weight: 1.5, color: c.border, fillOpacity: c.opacite };
}

function surChaqueFeature(feature, layer) {
    const nom = feature.properties?.name || feature.properties?.commune || 'Commune';
    const cle = normaliserCle(nom);

    layer.on({
        mouseover: function(e) {
            const donnees = obtenirDonnees(nom);
            const c = COULEURS[donnees.niveau_risque || 'aucun'] || COULEURS.aucun;
            e.target.setStyle({ weight: 2.5, fillOpacity: Math.min(c.opacite + 0.15, 0.75) });
            afficherBuille(nom, donnees);
        },
        mouseout: function(e) {
            coucheGeojson.resetStyle(e.target);
            if (communeActive !== cle) masquerBuille();
        },
        click: function() {
            communeActive = cle;
            afficherBuille(nom, obtenirDonnees(nom));
            mettreEnSurbrillance(cle);
        }
    });
}

function afficherBuille(nom, donnees) {
    document.getElementById('infoNom').textContent = nom;
    document.getElementById('infoCas').textContent = donnees.total_cas ?? '0';
    document.getElementById('infoValides').textContent = donnees.cas_valides ?? '0';
    document.getElementById('infoAlertes').textContent = donnees.alertes_actives ?? '0';

    const risque = donnees.niveau_risque || 'aucun';
    const badge = document.getElementById('infoRisque');
    badge.textContent = risque.charAt(0).toUpperCase() + risque.slice(1);
    badge.className = 'badge-risque ' + (risque !== 'aucun' ? risque : '');

    if (risque === 'aucun') {
        badge.style.background = '#f0f2f5';
        badge.style.color = '#aaa';
    } else {
        badge.style.background = '';
        badge.style.color = '';
    }

    document.getElementById('infoBuille').classList.add('visible');
}

function masquerBuille() {
    document.getElementById('infoBuille').classList.remove('visible');
}

function mettreEnSurbrillance(cle) {
    document.querySelectorAll('.commune-item').forEach(el => {
        el.classList.toggle('selectionne', el.dataset.cle === cle);
    });
}

function selectionnerCommune(cle, nom) {
    communeActive = cle;
    mettreEnSurbrillance(cle);
    afficherBuille(nom, obtenirDonnees(nom));

    if (coucheGeojson) {
        coucheGeojson.eachLayer(layer => {
            const nomFeature = layer.feature?.properties?.name || layer.feature?.properties?.commune || '';
            if (normaliserCle(nomFeature) === cle) {
                carte.fitBounds(layer.getBounds(), { padding: [40, 40], maxZoom: 14 });
            }
        });
    }
}

function construireItemCommune(nom, donnees) {
    const cle = normaliserCle(nom);
    const risque = donnees.niveau_risque || 'aucun';
    const labels = { eleve: 'Eleve', moyen: 'Moyen', faible: 'Faible', aucun: 'Aucun' };
    const totalCas = Number(donnees.total_cas) || 0;
    const suffixe = totalCas > 1 ? 's' : '';
    const nomEchappe = nom.replace(/'/g, "\\'");

    return `<div class="commune-item" data-cle="${cle}" onclick="selectionnerCommune('${cle}', '${nomEchappe}')">
        <div class="commune-info">
            <span class="commune-nom">${nom}</span>
            <span class="commune-cas">${totalCas > 0 ? totalCas + ' cas signale' + suffixe : 'Aucune donnee'}</span>
        </div>
        <span class="commune-badge ${risque}">${labels[risque] || risque}</span>
    </div>`;
}

function afficherListeCommunes(liste) {
    const conteneur = document.getElementById('communesListe');

    if (!liste || !liste.length) {
        conteneur.innerHTML = COMMUNES_DEFAUT
            .map(nom => construireItemCommune(nom, {}))
            .join('');
        return;
    }

    const ordre = { eleve: 0, moyen: 1, faible: 2, aucun: 3 };
    const tries = [...liste].sort((a, b) =>
        (ordre[a.niveau_risque] ?? 3) - (ordre[b.niveau_risque] ?? 3)
    );

    conteneur.innerHTML = tries
        .map(item => construireItemCommune(item.commune, item))
        .join('');
}

function chargerGeojson() {
    fetch('../assets/data/abidjan.geojson')
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
            if (coucheGeojson) carte.removeLayer(coucheGeojson);
            coucheGeojson = L.geoJSON(data, {
                style: styleCouche,
                onEachFeature: surChaqueFeature
            }).addTo(carte);
            carte.fitBounds(coucheGeojson.getBounds(), { padding: [20, 20] });
        })
        .catch(() => {
            console.warn('GeoJSON introuvable — fond de carte seul');
        });
}

async function chargerDonneesRisque() {
    try {
        const data = await apiGet('/alerts/map');
        const liste = data.data || data || [];

        let totalCas = 0;
        let totalAlertes = 0;

        liste.forEach(item => {
            const cle = normaliserCle(item.commune);
            donneesCommunes[cle] = item;
            donneesCommunes[item.commune] = item;
            totalCas += Number(item.total_cas) || 0;
            totalAlertes += Number(item.alertes_actives) || 0;
        });

        document.getElementById('statTotalCas').textContent = totalCas;
        document.getElementById('statAlertes').textContent = totalAlertes;

        afficherListeCommunes(liste);

        if (coucheGeojson) coucheGeojson.setStyle(styleCouche);

    } catch (err) {
        afficherListeCommunes([]);
    }
}

document.querySelectorAll('.filtre-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filtre-btn').forEach(b => b.className = 'filtre-btn');
        filtreActif = this.dataset.filtre;
        this.classList.add(filtreActif === 'tous' ? 'actif' : 'actif-' + filtreActif);

        if (coucheGeojson) coucheGeojson.setStyle(styleCouche);
        masquerBuille();
        communeActive = null;
        document.querySelectorAll('.commune-item').forEach(el => el.classList.remove('selectionne'));
    });
});

initialiserCarte();
chargerGeojson();
chargerDonneesRisque();
