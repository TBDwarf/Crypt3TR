const MENU_ID_ENCRYPT = "crypt3tr-encrypt";

const STORAGE_KEY = "crypt3trSettings";

// Crypto constants pour le chiffrement des messages
const PBKDF2_ITERATIONS = 500000;
const PBKDF2_HASH = "SHA-256";
const KEY_LENGTH_BITS = 256;
const AES_ALGO = "AES-GCM";

// IndexedDB pour stocker la master key non‑extractable
const DB_NAME = "crypt3tr-keystore";
const DB_VERSION = 1;
const STORE_NAME = "keys";
const MASTER_KEY_ID = "masterKey";

let masterKey = null; // CryptoKey AES-GCM non‑extractable (en mémoire)

// ---- Utils base64 / string ----

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

function stringToArrayBuffer(str) {
    return new TextEncoder().encode(str);
}

function arrayBufferToString(buf) {
    return new TextDecoder().decode(new Uint8Array(buf));
}

function base64ToArrayBuffer(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
    }
    return bytes.buffer;
}

// ---- IndexedDB : ouverture / master key ----

function openKeyDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

async function loadMasterKeyFromDB() {
    const db = await openKeyDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(MASTER_KEY_ID);
        getReq.onsuccess = async (e) => {
            const stored = e.target.result;
            if (stored) {
                resolve(stored); // CryptoKey est clonable par IndexedDB
            } else {
                resolve(null);
            }
        };
        getReq.onerror = (e) => reject(e.target.error);
    });
}

async function storeMasterKeyInDB(key) {
    const db = await openKeyDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const putReq = store.put(key, MASTER_KEY_ID);
        putReq.onsuccess = () => resolve();
        putReq.onerror = (e) => reject(e.target.error);
    });
}

async function getMasterKey() {
    if (masterKey) return masterKey;

    let key = await loadMasterKeyFromDB();
    if (!key) {
        // Génération d'une nouvelle master key non‑extractable
        key = await crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            false, // non‑extractable : on ne pourra pas exporter les bits
            ["encrypt", "decrypt"]
        );
        await storeMasterKeyInDB(key);
    }
    masterKey = key;
    return masterKey;
}

// ---- Storage settings ----

async function loadSettings() {
    const res = await browser.storage.local.get(STORAGE_KEY);
    const raw = res[STORAGE_KEY] || {};
    return {
        enabled: raw.enabled !== undefined ? raw.enabled : true,
        whitelist: raw.whitelist || [
            "*.google.com",
            "*.tuta.com",
            "*.whatsapp.com",
            "*.discordapp.com",
            "*.discord.com",
            "*.proton.me",
            "*.protonmail.com",
            "*.live.com",
            "*.yahoo.com",
            "*.telegram.org"
        ],
        encryptedPassword: raw.encryptedPassword || "" // base64(iv + ciphertext) chiffré avec masterKey
    };
}

async function saveSettings(settings) {
    await browser.storage.local.set({ [STORAGE_KEY]: settings });
}

// ---- Chiffrement / déchiffrement du mot de passe utilisateur avec masterKey ----

async function setUserPassword(plainPassword) {
    const settings = await loadSettings();
    if (!plainPassword) {
        settings.encryptedPassword = "";
        await saveSettings(settings);
        return;
    }

    const key = await getMasterKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            stringToArrayBuffer(plainPassword)
        )
    );

    const data = new Uint8Array(iv.length + ciphertext.length);
    data.set(iv, 0);
    data.set(ciphertext, iv.length);

    settings.encryptedPassword = encodeBase64(data);
    await saveSettings(settings);
}

async function getUserPassword() {
    const settings = await loadSettings();
    const enc = settings.encryptedPassword;
    if (!enc) return "";

    try {
        const key = await getMasterKey();
        const data = decodeBase64(enc);
        const iv = data.slice(0, 12);
        const ciphertext = data.slice(12);

        const plainBuf = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            key,
            ciphertext
        );
        return arrayBufferToString(plainBuf);
    } catch (e) {
        console.error("[Crypt3TR] Error decrypting user password:", e);
        return "";
    }
}

// ---- Crypto messages (AES-GCM + PBKDF2) ----

async function deriveMessageKey(passphrase, salt) {
    const passphraseKey = await crypto.subtle.importKey(
        "raw",
        stringToArrayBuffer(passphrase),
                                                        { name: "PBKDF2" },
                                                        false,
                                                        ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: PBKDF2_HASH
        },
        passphraseKey,
        { name: AES_ALGO, length: KEY_LENGTH_BITS },
        false,
        ["encrypt", "decrypt"]
    );
}

async function encryptMessageWithPassword(passphrase, message) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveMessageKey(passphrase, salt);

    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt(
            { name: AES_ALGO, iv },
            key,
            stringToArrayBuffer(message)
        )
    );

    const data = new Uint8Array(salt.length + iv.length + ciphertext.length);
    data.set(salt, 0);
    data.set(iv, salt.length);
    data.set(ciphertext, salt.length + iv.length);

    const b64 = encodeBase64(data);
    return `[[crypt3tr]]${b64}[[/crypt3tr]]`;
}

async function decryptBlockWithPassword(passphrase, b64Data) {
    try {
        const data = new Uint8Array(base64ToArrayBuffer(b64Data.trim()));
        if (data.length < 16 + 12 + 16) throw new Error("Data too short");

        const salt = data.slice(0, 16);
        const iv = data.slice(16, 28);
        const ciphertext = data.slice(28);

        const key = await deriveMessageKey(passphrase, salt);
        const decrypted = await crypto.subtle.decrypt({ name: AES_ALGO, iv }, key, ciphertext);
        return arrayBufferToString(decrypted);
    } catch (e) {
        console.error("[Crypt3TR] Decrypt error:", e);
        const t = (typeof getStrings === "function") ? getStrings() : null;
        return t ? t.decryptionError : "[[Decryption Error]]";
    }
}

// ---- I18N menus ----

function getMenuTitles() {
    const t = (typeof getStrings === "function") ? getStrings() : null;
    if (!t) {
        return {
            encrypt: "Encrypt message"
        };
    }
    return {
        encrypt: t.encryptMenu
    };
}

function createContextMenu() {
    const titles = getMenuTitles();
    const menus = browser.menus || browser.contextMenus;
    if (!menus) return;

    menus.removeAll(() => {
        menus.create({
            id: MENU_ID_ENCRYPT,
            title: titles.encrypt,
            contexts: ["editable"],
            icons: {
                "16": "/icons/icon-encrypt-16.png",
                "32": "/icons/icon-encrypt-32.png"
            }
        });
    });
}

if (browser.runtime && browser.runtime.onInstalled) {
    browser.runtime.onInstalled.addListener(() => {
        createContextMenu();
    });
}

// Pour le chargement temporaire via about:debugging
createContextMenu();

// ---- Gestion des clics de menus (ENCRYPT_FIELD) ----

function onMenuClick(info, tab) {
    const menus = browser.menus || browser.contextMenus;
    if (info.menuItemId === MENU_ID_ENCRYPT) {
        if (browser.tabs && browser.tabs.sendMessage) {
            browser.tabs.sendMessage(tab.id, { type: "ENCRYPT_FIELD" }).catch(() => {});
        }
        return;
    }
}

const menus = browser.menus || browser.contextMenus;
if (menus && menus.onClicked) {
    menus.onClicked.addListener(onMenuClick);
}

// ---- Messages depuis popup & content-scripts ----

browser.runtime.onMessage.addListener((msg, sender) => {
    if (!msg || !msg.type) return;

    return (async () => {
        // Gestion des settings (popup & content-script)
        if (msg.type === "GET_SETTINGS") {
            const settings = await loadSettings();
            const hasPassword = !!settings.encryptedPassword;
            return {
                enabled: settings.enabled,
                whitelist: settings.whitelist,
                hasPassword
            };
        }

        if (msg.type === "SET_ENABLED") {
            const settings = await loadSettings();
            settings.enabled = !!msg.enabled;
            await saveSettings(settings);
            return { ok: true };
        }

        if (msg.type === "SET_WHITELIST") {
            const settings = await loadSettings();
            settings.whitelist = Array.isArray(msg.whitelist) && msg.whitelist.length > 0
            ? msg.whitelist
            : [
                "*.google.com",
                "*.tuta.com",
                "*.whatsapp.com",
                "*.discordapp.com",
                "*.discord.com",
                "*.proton.me",
                "*.protonmail.com",
                "*.live.com",
                "*.yahoo.com",
                "*.telegram.org"
            ];
            await saveSettings(settings);
            return { ok: true };
        }

        if (msg.type === "SET_PASSWORD") {
            const pwd = msg.password || "";
            await setUserPassword(pwd);
            return { ok: true };
        }

        if (msg.type === "CLEAR_PASSWORD") {
            await setUserPassword("");
            return { ok: true };
        }

        // Crypto pour messages (appelé par content-script / viewer / editor)
        if (msg.type === "ENCRYPT_TEXT") {
            const pwd = await getUserPassword();
            if (!pwd) return { success: false, error: "NO_PASSWORD" };
            const text = msg.text || "";
            if (!text) return { success: false, error: "EMPTY" };
            const enc = await encryptMessageWithPassword(pwd, text);
            return { success: true, text: enc };
        }

        if (msg.type === "DECRYPT_BLOCK") {
            const pwd = await getUserPassword();
            if (!pwd) return { success: false, error: "NO_PASSWORD" };
            const b64 = msg.data || "";
            if (!b64) return { success: false, error: "EMPTY" };
            const dec = await decryptBlockWithPassword(pwd, b64);
            return { success: true, text: dec };
        }

        return;
    })();
});
