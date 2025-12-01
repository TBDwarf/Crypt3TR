const STORAGE_KEY = "crypt3trSettings";

// Valeurs par défaut
const DEFAULT_SETTINGS = {
    enabled: true,
    obfPassword: "",   // mot de passe obfusqué (base64)
    obfKey: "",        // clé d'obfuscation (base64)
    whitelist: ["*.*"] // tous les domaines
};

// ---- I18N ----

function getLang() {
    const lang = (navigator.language || "en").toLowerCase();
    if (lang.startsWith("fr")) return "fr";
    return "en";
}

const STRINGS = {
    en: {
        title: "Crypt3TR",
        enabled: "Extension enabled",
        statusOff: "Status: disabled",
        statusNoPass: "Status: enabled but password not set",
        statusOn: "Status: enabled and configured",
        labelPassword: "Password",
        placeholderPassword: "",
        btnSavePassword: "Save",
        btnClearPassword: "Clear",
        hintPassword: "Password used to encrypt and decrypt your text. Stored only in this browser.",
        labelWhitelist: "Domain whitelist (one per line)",
        placeholderWhitelist: "*.*\n*.mail.tuta.com",
        btnSaveWhitelist: "Save domains",
        hintWhitelist:
        "Use * as wildcard. Examples:\n*.* → all sites\n*.domain.com → only domain.com"
    },
    fr: {
        title: "Crypt3TR",
        enabled: "Extension activée",
        statusOff: "Statut : désactivée",
        statusNoPass: "Statut : activée mais mot de passe non défini",
        statusOn: "Statut : activée et configurée",
        labelPassword: "Mot de passe",
        placeholderPassword: "",
        btnSavePassword: "Enregistrer",
        btnClearPassword: "Effacer",
        hintPassword: "Mot de passe utilisé pour chiffrer et déchiffrer le texte. Stocké uniquement dans ce navigateur.",
        labelWhitelist: "Liste blanche de domaines (un par ligne)",
        placeholderWhitelist: "*.*\n*.mail.tuta.com",
        btnSaveWhitelist: "Enregistrer les domaines",
        hintWhitelist:
        "Utilise * comme joker. Exemples :\n*.* → tous les sites\n*.domain.com → uniquement domain.com"
    }
};

function applyI18n() {
    const lang = getLang();
    const t = STRINGS[lang];

    document.getElementById("title").textContent = t.title;
    document.getElementById("labelEnabled").textContent = t.enabled;
    document.getElementById("labelPassword").textContent = t.labelPassword;
    document.getElementById("password").placeholder = t.placeholderPassword;
    document.getElementById("savePassword").textContent = t.btnSavePassword;
    document.getElementById("clearPassword").textContent = t.btnClearPassword;
    document.getElementById("hintPassword").textContent = t.hintPassword;
    document.getElementById("labelWhitelist").textContent = t.labelWhitelist;
    document.getElementById("whitelist").placeholder = t.placeholderWhitelist;
    document.getElementById("saveWhitelist").textContent = t.btnSaveWhitelist;
    document.getElementById("hintWhitelist").textContent = t.hintWhitelist;
}

function getStrings() {
    return STRINGS[getLang()];
}

// ---- Obfuscation simple du mot de passe ----

function generateKey(length = 32) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return bytes;
}

function xorBytes(data, key) {
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        out[i] = data[i] ^ key[i % key.length];
    }
    return out;
}

function encodeBase64(bytes) {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decodeBase64(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
}

function obfuscatePassword(plain, existingKeyB64) {
    if (!plain) {
        return { obfPassword: "", obfKey: existingKeyB64 || "" };
    }
    const enc = new TextEncoder();
    const pwBytes = enc.encode(plain);
    let keyBytes;
    if (existingKeyB64) {
        keyBytes = decodeBase64(existingKeyB64);
    } else {
        keyBytes = generateKey(32);
    }
    const obfBytes = xorBytes(pwBytes, keyBytes);
    return {
        obfPassword: encodeBase64(obfBytes),
        obfKey: encodeBase64(keyBytes)
    };
}

// ---- Storage ----

async function loadSettings() {
    const res = await browser.storage.local.get(STORAGE_KEY);
    return { ...DEFAULT_SETTINGS, ...(res[STORAGE_KEY] || {}) };
}

async function saveSettings(settings) {
    await browser.storage.local.set({ [STORAGE_KEY]: settings });
}

function updateStatusText(settings) {
    const statusEl = document.getElementById("statusText");
    const t = getStrings();
    if (!statusEl) return;

    if (!settings.enabled) {
        statusEl.textContent = t.statusOff;
        statusEl.className = "status off";
    } else if (!settings.obfPassword || !settings.obfKey) {
        statusEl.textContent = t.statusNoPass;
        statusEl.className = "status off";
    } else {
        statusEl.textContent = t.statusOn;
        statusEl.className = "status on";
    }
}

// ---- UI ----

document.addEventListener("DOMContentLoaded", async () => {
    applyI18n();

    const checkboxEnabled = document.getElementById("enabled");
    const inputPassword = document.getElementById("password");
    const textareaWhitelist = document.getElementById("whitelist");
    const btnSavePassword = document.getElementById("savePassword");
    const btnClearPassword = document.getElementById("clearPassword");
    const btnSaveWhitelist = document.getElementById("saveWhitelist");

    let settings = await loadSettings();

    checkboxEnabled.checked = settings.enabled;
    // Par sécurité, on ne remplit jamais le champ avec le mot de passe stocké.
    inputPassword.value = "";
    textareaWhitelist.value = settings.whitelist.join("\n");

    updateStatusText(settings);

    checkboxEnabled.addEventListener("change", async () => {
        settings.enabled = checkboxEnabled.checked;
        await saveSettings(settings);
        updateStatusText(settings);
    });

    btnSavePassword.addEventListener("click", async () => {
        const plain = inputPassword.value || "";
        const { obfPassword, obfKey } = obfuscatePassword(
            plain,
            settings.obfKey || ""
        );
        settings.obfPassword = obfPassword;
        settings.obfKey = obfKey;
        await saveSettings(settings);
        inputPassword.value = "";
        updateStatusText(settings);
    });

    btnClearPassword.addEventListener("click", async () => {
        inputPassword.value = "";
        settings.obfPassword = "";
        settings.obfKey = settings.obfKey || "";
        await saveSettings(settings);
        updateStatusText(settings);
    });

    btnSaveWhitelist.addEventListener("click", async () => {
        const lines = textareaWhitelist.value
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0);
        settings.whitelist = lines.length > 0 ? lines : ["*.*"];
        await saveSettings(settings);
        updateStatusText(settings);
    });
});
