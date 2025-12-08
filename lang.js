// lang.js
// Fichier centralisé pour toutes les chaînes de l'application

const STRINGS = {
    en: {
        // --- Général / document ---
        popupTitle: "Crypt3TR",

        // --- Popup / UI ---
        appTitle: "Crypt3TR",
        logoAlt: "Crypt3TR Logo",

        navSettings: "Settings",
        navHelp: "Help",
        navInfo: "Info",

        labelEnabled: "Extension enabled",
        labelPassword: "Encryption Password",
        btnSavePassword: "Save Password",
        btnClearPassword: "Clear",
        hintPassword:
        "Password used to encrypt and decrypt your text.\nIt is encrypted and stored only in this browser.",
        labelWhitelist: "Allowed Domains (one per line)",
        btnSaveWhitelist: "Save Domains",

        // Placeholders
        passwordPlaceholder: "••••••••",
        whitelistPlaceholder: "*.*",

        // Onglet "How to use"
        titleUsage: "How to use",
        step1Title: "1. Encrypting",
        step2Title: "2. Decrypting",
        step3Title: "3. Domains",

        // Aide : textes structurés (sans HTML brut)
        helpEncrypt_before: "Type your message. Right-click inside the field and select ",
        helpEncrypt_bold: "Encrypt Crypt3TR",
        helpEncrypt_after: ".",

        helpDecrypt_before: "Messages on allowed sites decrypt automatically if the password is saved. You can also right-click and choose ",
        helpDecrypt_bold: "Encrypt Crypt3TR to modify",
        helpDecrypt_after: ".",

        // Ligne 1 : "By default, <code>*.*</code> is used: automatic decryption on all websites."
        helpDomains_line1_beforeCode: "By default, ",
        helpDomains_line1_codeAll: "*.*",
        helpDomains_line1_afterCode: " is used: automatic decryption on all websites.",
        // Ligne 2 : "You can restrict this to specific sites by listing one pattern per line (e.g. <code>*.gmail.com</code>)."
        helpDomains_line2_prefix: "You can restrict this to specific sites by listing one pattern per line (e.g. ",
        helpDomains_line2_codeExample: "*.gmail.com",
        helpDomains_line2_suffix: ").",

        helpNote: "Works on WhatsApp, Discord, Gmail, and most forms.",

        // Onglet "About"
        titlePrivacy: "Privacy & Security",
        textPrivacy:
        "Crypt3TR operates 100% locally.\nAbsolutely no data is transmitted over the Internet.\nYour password is encrypted and stored locally in isolation in your browser.",

        aboutOpenSourceLabel: "Open Source project licensed under Apache 2.0",
        aboutGithubLinkText: "https://github.com/TBDwarf/Crypt3TR",

        // Footer "About" en deux lignes
        aboutFooter_line1: "Version 1.2 by TBDwarf",  // ← mise à jour
        aboutFooter_line2: "Made with ❤️ in 🇫🇷 to protect your privacy.",

        // Messages de feedback
        msgPwdSaved: "Password saved. Please refresh your pages so Crypt3TR can start working.",
        msgPwdCleared: "Password cleared.",
        msgWhitelistSaved: "Domains saved.",
        errorGeneric: "Error",

        // --- Menus contextuels ---
        encryptMenu: "Encrypt Crypt3TR",

        // --- Messages communs (erreur de déchiffrement) ---
        decryptionError: "[[Decryption Error]]"
    },

    fr: {
        // --- Général / document ---
        popupTitle: "Crypt3TR",

        // --- Popup / UI ---
        appTitle: "Crypt3TR",
        logoAlt: "Logo Crypt3TR",

        navSettings: "Config",
        navHelp: "Aide",
        navInfo: "Infos",

        labelEnabled: "Extension activée",
        labelPassword: "Mot de passe de chiffrement",
        btnSavePassword: "Sauvegarder",
        btnClearPassword: "Effacer",
        hintPassword:
        "Mot de passe utilisé pour chiffrer et déchiffrer le texte.\nIl est chiffré et stocké uniquement dans ce navigateur.",
        labelWhitelist: "Domaines autorisés (un par ligne)",
        btnSaveWhitelist: "Sauvegarder",

        // Placeholders
        passwordPlaceholder: "••••••••",
        whitelistPlaceholder: "*.*",

        // Onglet "Aide"
        titleUsage: "Mode d'emploi",
        step1Title: "1. Chiffrement",
        step2Title: "2. Déchiffrement",
        step3Title: "3. Domaines",

        // Aide : textes structurés (sans HTML brut)
        helpEncrypt_before: "Tape ton message. Fais un clic droit dans la zone de texte et choisis ",
        helpEncrypt_bold: "Chiffrement Crypt3TR",
        helpEncrypt_after: ".",

        helpDecrypt_before: "Les messages sont déchiffrés automatiquement sur les sites autorisés si le mot de passe est enregistré. Sinon, clic droit puis ",
        helpDecrypt_bold: "Chiffrement Crypt3TR pour l'editer",
        helpDecrypt_after: ".",

        // "Par défaut, <code>*.*</code> est utilisé : déchiffrement automatique sur tous les sites."
        helpDomains_line1_beforeCode: "Par défaut, ",
        helpDomains_line1_codeAll: "*.*",
        helpDomains_line1_afterCode: " est utilisé : déchiffrement automatique sur tous les sites.",
        // "Tu peux restreindre à certains sites en mettant un motif par ligne (ex : <code>*.gmail.com</code>)."
        helpDomains_line2_prefix: "Tu peux restreindre à certains sites en mettant un motif par ligne (ex : ",
        helpDomains_line2_codeExample: "*.gmail.com",
        helpDomains_line2_suffix: ").",

        helpNote: "Compatible WhatsApp, Discord, Gmail et la plupart des sites.",

        // Onglet "Infos"
        titlePrivacy: "Vie privée & Sécurité",
        textPrivacy:
        "Crypt3TR fonctionne 100% en local.\nStrictement aucune donnée ne transite via Internet.\nVotre mot de passe est chiffré et stocké localement de manière isolée dans votre navigateur.",

        aboutOpenSourceLabel: "Projet Open Source sous licence Apache 2.0 ",
        aboutGithubLinkText: "https://github.com/TBDwarf/Crypt3TR",

        // Footer "About" en deux lignes
        aboutFooter_line1: "Version 1.2 par TBDwarf",  // ← mise à jour
        aboutFooter_line2: "Créé avec ❤️ en 🇫🇷 pour protéger votre vie privée.",

        // Messages de feedback
        msgPwdSaved: "Mot de passe enregistré. Pense à rafraîchir tes pages pour que Crypt3TR commence à fonctionner.",
        msgPwdCleared: "Mot de passe effacé.",
        msgWhitelistSaved: "Domaines enregistrés.",
        errorGeneric: "Erreur",

        // --- Menus contextuels ---
        encryptMenu: "Chiffrement Crypt3TR",

        // --- Messages communs (erreur de déchiffrement) ---
        decryptionError: "[[Erreur de déchiffrement]]"
    }
};

// Langue détectée automatiquement (en / fr)
function getLang() {
    const lang = (navigator.language || "en").toLowerCase();
    if (lang.startsWith("fr")) return "fr";
    return "en";
}

// Raccourci pour récupérer l'objet de chaînes de la langue courante
function getStrings() {
    const lang = getLang();
    return STRINGS[lang] || STRINGS.en;
}
