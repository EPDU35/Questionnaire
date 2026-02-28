(function () {
    "use strict";

    const etat = {
        enChargement: false,
        enregistrement: false,
        etape: 0,
        collecte: { symptomes: [], duree: null, commune: null, age: null, exposition: null },
        modeLibre: false
    };

    const ETAPES = [
        {
            cle: "symptomes",
            question: "Quels symptomes ressentez-vous en ce moment ?",
            sousTitre: "Selectionnez tout ce qui s'applique",
            type: "multi",
            choix: [
                { label: "Fievre", valeur: "fievre" },
                { label: "Maux de tete", valeur: "maux de tete" },
                { label: "Diarrhee", valeur: "diarrhee" },
                { label: "Vomissements", valeur: "vomissements" },
                { label: "Frissons", valeur: "frissons" },
                { label: "Douleurs articulaires", valeur: "douleurs articulaires" },
                { label: "Toux", valeur: "toux" },
                { label: "Eruption cutanee", valeur: "eruption cutanee" },
                { label: "Fatigue intense", valeur: "fatigue" },
                { label: "Autre", valeur: "autre", libre: true }
            ]
        },
        {
            cle: "duree",
            question: "Depuis combien de temps avez-vous ces symptomes ?",
            type: "single",
            choix: [
                { label: "Moins de 24h", valeur: "moins de 24h" },
                { label: "1 a 2 jours", valeur: "1 a 2 jours" },
                { label: "3 a 5 jours", valeur: "3 a 5 jours" },
                { label: "Plus d'une semaine", valeur: "plus d'une semaine" },
                { label: "Je ne sais pas", valeur: "duree inconnue" }
            ]
        },
        {
            cle: "commune",
            question: "Dans quelle commune d'Abidjan vous trouvez-vous ?",
            type: "single",
            choix: [
                { label: "Abobo", valeur: "abobo" },
                { label: "Adjame", valeur: "adjame" },
                { label: "Anyama", valeur: "anyama" },
                { label: "Attiecoube", valeur: "attiecoube" },
                { label: "Cocody", valeur: "cocody" },
                { label: "Koumassi", valeur: "koumassi" },
                { label: "Marcory", valeur: "marcory" },
                { label: "Plateau", valeur: "plateau" },
                { label: "Port-Bouet", valeur: "port-bouet" },
                { label: "Treichville", valeur: "treichville" },
                { label: "Yopougon", valeur: "yopougon" },
                { label: "Bingerville", valeur: "bingerville" },
                { label: "Songon", valeur: "songon" }
            ]
        },
        {
            cle: "age",
            question: "Quelle est votre tranche d'age ?",
            type: "single",
            choix: [
                { label: "Enfant (0-12 ans)", valeur: "enfant" },
                { label: "Adolescent (13-17 ans)", valeur: "adolescent" },
                { label: "Adulte (18-59 ans)", valeur: "adulte" },
                { label: "Senior (60 ans et plus)", valeur: "senior" }
            ]
        },
        {
            cle: "exposition",
            question: "D'autres personnes dans votre entourage ont-ils les memes symptomes ?",
            type: "single",
            choix: [
                { label: "Oui, plusieurs personnes", valeur: "oui plusieurs" },
                { label: "Oui, une seule personne", valeur: "oui une personne" },
                { label: "Non, personne d'autre", valeur: "non" },
                { label: "Je ne sais pas", valeur: "inconnu" }
            ]
        }
    ];

    function init() {
        const conteneur = document.getElementById("ia-chat") || document.getElementById("zoneConversation");
        if (!conteneur) return;

        afficherMessage("ia", "Bonjour. Je suis l'assistant sanitaire Babi Alert.\n\nJe vais vous poser quelques questions pour evaluer votre situation et vous orienter vers les soins adaptes.");
        setTimeout(() => poserEtape(0), 900);

        const btnEnvoyer = document.getElementById("btnEnvoyerMsg");
        if (btnEnvoyer) btnEnvoyer.addEventListener("click", () => envoyerTexteLibre("champReponse"));

        const btnVocal = document.getElementById("ia-btn-vocal") || document.getElementById("btnVocal");
        const textarea = document.getElementById("ia-textarea") || document.getElementById("champReponse");
        if (btnVocal && textarea) initialiserVocal(btnVocal, textarea);

        ["ia-textarea", "champReponse"].forEach(id => {
            const ta = document.getElementById(id);
            if (!ta) return;
            ta.addEventListener("keydown", e => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (etat.modeLibre) envoyerTexteLibre(id); }
            });
            ta.addEventListener("input", function () { ajusterHauteur(this); });
        });
    }

    function poserEtape(n) {
        if (n >= ETAPES.length) { analyserEtConclure(); return; }
        etat.etape = n;
        afficherQuestion(ETAPES[n]);
    }

    function afficherQuestion(etape) {
        const liste = getListeMessages();
        if (!liste) return;

        const wrapper = document.createElement("div");
        wrapper.classList.add("message-wrapper", "ia");

        const avatar = document.createElement("div");
        avatar.classList.add("message-avatar-ia");
        avatar.innerHTML = iconIA();
        wrapper.appendChild(avatar);

        const bulle = document.createElement("div");
        bulle.classList.add("message-bulle", "ia");

        const texteEl = document.createElement("div");
        texteEl.classList.add("message-texte");
        texteEl.textContent = etape.question;
        bulle.appendChild(texteEl);

        if (etape.sousTitre) {
            const sous = document.createElement("div");
            sous.classList.add("ia-sous-titre");
            sous.textContent = etape.sousTitre;
            bulle.appendChild(sous);
        }

        const grille = document.createElement("div");
        grille.classList.add(etape.type === "multi" ? "ia-choix-grille-multi" : "ia-choix-grille");

        const selectionMulti = new Set();

        etape.choix.forEach(choix => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.classList.add("ia-choix-btn");
            btn.textContent = choix.label;

            if (etape.type === "multi") {
                btn.addEventListener("click", () => {
                    if (choix.libre) { demanderTexteLibre(grille, selectionMulti); return; }
                    btn.classList.toggle("selectionne");
                    if (selectionMulti.has(choix.valeur)) selectionMulti.delete(choix.valeur);
                    else selectionMulti.add(choix.valeur);
                });
            } else {
                btn.addEventListener("click", () => {
                    desactiverChoix(grille);
                    btn.classList.add("selectionne");
                    setTimeout(() => { etat.collecte[etape.cle] = choix.valeur; afficherMessage("utilisateur", choix.label); setTimeout(() => poserEtape(etat.etape + 1), 500); }, 350);
                });
            }
            grille.appendChild(btn);
        });

        bulle.appendChild(grille);

        if (etape.type === "multi") {
            const btnValider = document.createElement("button");
            btnValider.type = "button";
            btnValider.classList.add("ia-btn-valider");
            btnValider.textContent = "Confirmer";
            btnValider.addEventListener("click", () => {
                if (selectionMulti.size === 0) return;
                desactiverChoix(grille);
                btnValider.disabled = true;
                const valeur = Array.from(selectionMulti).join(", ");
                etat.collecte[etape.cle] = valeur;
                afficherMessage("utilisateur", valeur);
                setTimeout(() => poserEtape(etat.etape + 1), 500);
            });
            bulle.appendChild(btnValider);
        }

        wrapper.appendChild(bulle);

        const heure = document.createElement("div");
        heure.classList.add("message-heure");
        heure.textContent = heureActuelle();
        wrapper.appendChild(heure);

        liste.appendChild(wrapper);
        liste.scrollTop = liste.scrollHeight;
    }

    function demanderTexteLibre(grille, selectionMulti) {
        if (grille.querySelector(".ia-input-libre")) { grille.querySelector(".ia-input-libre").focus(); return; }
        const input = document.createElement("input");
        input.type = "text";
        input.classList.add("ia-input-libre");
        input.placeholder = "Decrivez votre symptome...";
        input.addEventListener("keydown", e => { if (e.key === "Enter" && input.value.trim()) { selectionMulti.add(input.value.trim()); input.value = ""; } });
        grille.appendChild(input);
        input.focus();
    }

    function desactiverChoix(grille) {
        grille.querySelectorAll(".ia-choix-btn").forEach(b => { b.disabled = true; b.style.pointerEvents = "none"; });
        const v = grille.parentElement && grille.parentElement.querySelector(".ia-btn-valider");
        if (v) v.disabled = true;
    }

    async function analyserEtConclure() {
        afficherMessage("ia", "Merci. J'analyse vos reponses...");
        afficherIndicateurChargement();
        etat.enChargement = true;

        try {
            const data = await apiPost("/ia/message", { message: construireSynthese() });
            retirerIndicateurChargement();

            if (data && data.reponse) afficherMessage("ia", data.reponse.message, data.reponse.type, data.reponse.extras);
            else afficherMessage("ia", "Je n'ai pas pu analyser votre situation. Consultez un centre de sante.");

            setTimeout(() => {
                etat.modeLibre = true;
                afficherMessage("ia", "Avez-vous d'autres questions ? Tapez votre message ci-dessous.");
                const ta = document.getElementById("ia-textarea") || document.getElementById("champReponse");
                if (ta) { ta.placeholder = "Posez une autre question..."; ta.disabled = false; }
                const btn = document.getElementById("btnEnvoyerMsg");
                if (btn) btn.disabled = false;
            }, 800);

        } catch {
            retirerIndicateurChargement();
            afficherMessage("ia", "Connexion impossible. Verifiez votre connexion et reessayez.");
        } finally {
            etat.enChargement = false;
        }
    }

    async function envoyerTexteLibre(id) {
        if (!etat.modeLibre) return;
        const ta = document.getElementById(id);
        if (!ta) return;
        const texte = ta.value.trim();
        if (!texte || etat.enChargement) return;
        ta.value = "";
        ajusterHauteur(ta);
        afficherMessage("utilisateur", texte);
        afficherIndicateurChargement();
        etat.enChargement = true;
        try {
            const data = await apiPost("/ia/message", { message: texte });
            retirerIndicateurChargement();
            if (data && data.reponse) afficherMessage("ia", data.reponse.message, data.reponse.type, data.reponse.extras);
        } catch {
            retirerIndicateurChargement();
            afficherMessage("ia", "Connexion impossible. Reessayez.");
        } finally {
            etat.enChargement = false;
        }
    }

    function construireSynthese() {
        const c = etat.collecte;
        const parties = [];
        if (c.symptomes) parties.push("Symptomes : " + (Array.isArray(c.symptomes) ? c.symptomes.join(", ") : c.symptomes));
        if (c.duree)     parties.push("Duree : " + c.duree);
        if (c.commune)   parties.push("Commune : " + c.commune);
        if (c.age)       parties.push("Age : " + c.age);
        if (c.exposition) parties.push("Exposition entourage : " + c.exposition);
        return parties.join(". ");
    }

    function afficherMessage(auteur, texte, type, extras) {
        const liste = getListeMessages();
        if (!liste) return;

        const wrapper = document.createElement("div");
        wrapper.classList.add("message-wrapper", auteur);

        if (auteur === "ia") {
            const avatar = document.createElement("div");
            avatar.classList.add("message-avatar-ia");
            avatar.innerHTML = iconIA();
            wrapper.appendChild(avatar);
        }

        const bulle = document.createElement("div");
        bulle.classList.add("message-bulle", auteur);

        if (auteur === "ia" && type && type !== "information") {
            const badge = document.createElement("span");
            badge.classList.add("ia-badge-type", "ia-badge-" + type);
            badge.textContent = libelleBadge(type);
            bulle.appendChild(badge);
        }

        const p = document.createElement("div");
        p.classList.add("message-texte");
        p.innerHTML = formaterTexte(texte);
        bulle.appendChild(p);

        if (extras && extras.maladiesSuspectes && extras.maladiesSuspectes.length > 0) {
            const lm = document.createElement("div");
            lm.classList.add("ia-maladies-suspectes");
            for (const m of extras.maladiesSuspectes) {
                const tag = document.createElement("span");
                tag.classList.add("ia-maladie-tag");
                tag.textContent = m.nom || m;
                lm.appendChild(tag);
            }
            bulle.appendChild(lm);
        }

        wrapper.appendChild(bulle);

        const heure = document.createElement("div");
        heure.classList.add("message-heure");
        heure.textContent = heureActuelle();
        wrapper.appendChild(heure);

        liste.appendChild(wrapper);
        liste.scrollTop = liste.scrollHeight;
    }

    function afficherIndicateurChargement() {
        const liste = getListeMessages();
        if (!liste) return;
        const div = document.createElement("div");
        div.id = "ia-chargement";
        div.classList.add("message-bulle", "ia", "ia-typing");
        div.innerHTML = "<span></span><span></span><span></span>";
        liste.appendChild(div);
        liste.scrollTop = liste.scrollHeight;
    }

    function retirerIndicateurChargement() {
        const el = document.getElementById("ia-chargement");
        if (el) el.remove();
    }

    function getListeMessages() {
        return document.getElementById("ia-messages-liste") || document.getElementById("messagesListe");
    }

    function initialiserVocal(btn, textarea) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { btn.style.display = "none"; return; }
        const recog = new SR();
        recog.lang = "fr-FR";
        recog.continuous = false;
        recog.interimResults = false;
        recog.onresult = e => { textarea.value = e.results[0][0].transcript; ajusterHauteur(textarea); };
        recog.onend = () => { etat.enregistrement = false; btn.classList.remove("actif"); };
        btn.addEventListener("click", () => {
            if (etat.enregistrement) { recog.stop(); } else { etat.enregistrement = true; btn.classList.add("actif"); recog.start(); }
        });
    }

    function ajusterHauteur(el) { el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 120) + "px"; }
    function heureActuelle() { return new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }); }
    function libelleBadge(type) { return { urgence: "Urgence", alerte: "Alerte", conseil: "Conseil medical", orientation: "Orientation", prevention: "Prevention" }[type] || type; }
    function formaterTexte(t) { return t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/_(.+?)_/g, "<em>$1</em>").replace(/\n/g, "<br>"); }
    function iconIA() { return '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 8v4l3 3"/></svg>'; }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();

})();
