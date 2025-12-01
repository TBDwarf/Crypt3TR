const PBKDF2_ITERATIONS = 100000;
const PBKDF2_HASH = "SHA-256";
const KEY_LENGTH_BITS = 256;
const AES_ALGO = "AES-GCM";
const STORAGE_KEY = "crypt3trSettings";

const CRYPT_REGEX = /\[\[crypt3tr\]\]([\s\S]*?)\[\[\/crypt3tr\]\]/gi;

let cachedSettings = null;

// ---- Obfuscation helpers (lecture seule) ----

function decodeBase64(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
}

function xorBytes(data, key) {
    const out = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        out[i] = data[i] ^ key[i % key.length];
    }
    return out;
}

function deobfuscatePassword(obfPassword, obfKey) {
    if (!obfPassword || !obfKey) return "";
    try {
        const obfBytes = decodeBase64(obfPassword);
        const keyBytes = decodeBase64(obfKey);
        const plainBytes = xorBytes(obfBytes, keyBytes);
        const pw = new TextDecoder().decode(plainBytes);
        return pw.replace(/\0+$/g, ""); // nettoyage éventuel
    } catch (e) {
        console.error("[Crypt3TR] Erreur de dé-obfuscation du mot de passe:", e);
        return "";
    }
}

// ---- Storage / settings ----

async function loadSettings() {
    const res = await browser.storage.local.get(STORAGE_KEY);
    const raw = res[STORAGE_KEY] || {};

    const settings = {
        enabled: raw.enabled !== undefined ? raw.enabled : true,
        obfPassword: raw.obfPassword || "",
        obfKey: raw.obfKey || "",
        whitelist: raw.whitelist || ["*.*"],
        password: ""
    };

    settings.password = deobfuscatePassword(settings.obfPassword, settings.obfKey);
    cachedSettings = settings;
    return settings;
}

// Wildcard simple : * -> .*, ? -> .
function wildcardToRegExp(pattern) {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    const regexStr = "^" + escaped.replace(/\*/g, ".*").replace(/\?/g, ".") + "$";
    return new RegExp(regexStr, "i");
}

function isHostAllowed(host, whitelist) {
    if (!whitelist || whitelist.length === 0) return false;
    return whitelist.some(pattern => {
        try {
            const re = wildcardToRegExp(pattern);
            return re.test(host);
        } catch (e) {
            console.error("[Crypt3TR] Pattern invalide dans whitelist:", pattern, e);
            return false;
        }
    });
}

// ---- Crypto helpers ----

function base64ToArrayBuffer(b64) {
    const binary = atob(b64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function arrayBufferToString(buf) {
    return new TextDecoder().decode(new Uint8Array(buf));
}

function stringToArrayBuffer(str) {
    return new TextEncoder().encode(str);
}

async function deriveKey(passphrase, salt) {
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

async function decryptBlock(b64Data, passphrase) {
    try {
        const data = new Uint8Array(base64ToArrayBuffer(b64Data.trim()));

        if (data.length < 16 + 12 + 16) {
            throw new Error("Données trop courtes");
        }

        const salt = data.slice(0, 16);
        const iv = data.slice(16, 28);
        const ciphertext = data.slice(28);

        const key = await deriveKey(passphrase, salt);

        const decrypted = await crypto.subtle.decrypt(
            { name: AES_ALGO, iv: iv },
            key,
            ciphertext
        );

        return arrayBufferToString(decrypted);
    } catch (e) {
        console.error("[Crypt3TR] Erreur de déchiffrement : ", e);
        return "[[Erreur de déchiffrement]]";
    }
}

async function encryptMessage(passphrase, message) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey(passphrase, salt);
    const ciphertext = new Uint8Array(
        await crypto.subtle.encrypt(
            { name: AES_ALGO, iv: iv },
            key,
            stringToArrayBuffer(message)
        )
    );

    const data = new Uint8Array(salt.length + iv.length + ciphertext.length);
    data.set(salt, 0);
    data.set(iv, salt.length);
    data.set(ciphertext, salt.length + iv.length);

    const b64 = btoa(String.fromCharCode(...data));
    return `[[crypt3tr]]${b64}[[/crypt3tr]]`;
}

// ---- Zones éditables ----

function isEditableNode(node) {
    if (!node) return false;
    if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
    }
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;

    const el = node;
    const tag = el.tagName ? el.tagName.toLowerCase() : "";

    if (tag === "textarea") return true;
    if (tag === "input") {
        const type = (el.getAttribute("type") || "text").toLowerCase();
        if (["text", "search", "email", "password", "url", "tel"].includes(type)) {
            return true;
        }
    }
    if (el.isContentEditable) return true;

    return false;
}

// ---- Extraction texte avec \n pour contentEditable + emojis ----

function getPlainTextWithNewlines(root) {
    let result = "";

    function emojiFromElement(el) {
        if (!el || el.nodeType !== Node.ELEMENT_NODE) return "";
        const dataEmoji = el.getAttribute && el.getAttribute("data-emoji");
        if (dataEmoji) return dataEmoji;
        const alt = el.getAttribute && el.getAttribute("alt");
        if (alt) return alt;
        const aria = el.getAttribute && el.getAttribute("aria-label");
        if (aria) return aria;
        return "";
    }

    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            result += node.nodeValue;
            return;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const tag = node.tagName ? node.tagName.toLowerCase() : "";

        if (tag === "img") {
            const em = emojiFromElement(node);
            if (em) {
                result += em;
            }
            return;
        }

        if (tag === "span" || tag === "i") {
            const em = emojiFromElement(node);
            if (em && !node.textContent) {
                result += em;
                return;
            }
        }

        if (tag === "br") {
            result += "\n";
            return;
        }

        const blockLike = ["div", "p", "li", "pre"];

        if (blockLike.includes(tag)) {
            const beforeLength = result.length;
            for (const child of node.childNodes) {
                walk(child);
            }
            if (result.length > beforeLength) {
                result += "\n";
            }
        } else {
            for (const child of node.childNodes) {
                walk(child);
            }
        }
    }

    walk(root);
    return result;
}

// ---- Conversion texte avec \n -> nœuds texte + <br> ----

function textToNodesWithBr(text) {
    const frag = document.createDocumentFragment();
    const parts = text.split("\n");

    for (let i = 0; i < parts.length; i++) {
        if (parts[i].length > 0) {
            frag.appendChild(document.createTextNode(parts[i]));
        }
        if (i < parts.length - 1) {
            frag.appendChild(document.createElement("br"));
        }
    }

    return frag;
}

// ---- Décryptage : niveau nœud texte (inline) ----

async function processTextNodes(root, passphrase) {
    if (!root || !passphrase) return;

    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const nodesToUpdate = [];
    let node;

    while ((node = walker.nextNode())) {
        if (isEditableNode(node)) continue;
        if (!node.nodeValue) continue;

        if (CRYPT_REGEX.test(node.nodeValue)) {
            nodesToUpdate.push(node);
        }
        CRYPT_REGEX.lastIndex = 0;
    }

    for (const textNode of nodesToUpdate) {
        let text = textNode.nodeValue;
        let match;
        let resultParts = [];
        let lastIndex = 0;

        while ((match = CRYPT_REGEX.exec(text)) !== null) {
            const fullMatch = match[0];
            const innerB64 = match[1];

            resultParts.push(text.slice(lastIndex, match.index));

            const decrypted = await decryptBlock(innerB64, passphrase);
            resultParts.push(decrypted);

            lastIndex = match.index + fullMatch.length;
        }

        resultParts.push(text.slice(lastIndex));
        const finalText = resultParts.join("");

        if (!finalText.includes("\n") || !textNode.parentNode) {
            textNode.nodeValue = finalText;
        } else {
            const frag = textToNodesWithBr(finalText);
            textNode.parentNode.replaceChild(frag, textNode);
        }
    }
}

// ---- Décryptage : éléments entiers (Gmail & co) ----

async function processElementBlocks(root, passphrase) {
    if (!root || !passphrase) return;

    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT,
        null,
        false
    );

    let el;
    const elementsToUpdate = [];

    while ((el = walker.nextNode())) {
        if (isEditableNode(el)) continue;
        if (el.hasAttribute("data-crypt3tr-processed")) continue;

        let hasTextChild = false;
        for (const child of el.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                hasTextChild = true;
                break;
            }
        }
        if (!hasTextChild) continue;

        const text = el.textContent || "";
        if (!text.includes("[[crypt3tr]]")) continue;

        const trimmed = text.trim();
        CRYPT_REGEX.lastIndex = 0;
        const match = CRYPT_REGEX.exec(trimmed);

        if (!match) continue;

        const fullMatch = match[0];

        if (fullMatch.length !== trimmed.length) continue;

        elementsToUpdate.push(el);
    }

    for (const elToUpdate of elementsToUpdate) {
        const text = elToUpdate.textContent || "";
        const trimmed = text.trim();

        CRYPT_REGEX.lastIndex = 0;
        const match = CRYPT_REGEX.exec(trimmed);
        if (!match) continue;

        const innerB64 = match[1];
        const decrypted = await decryptBlock(innerB64, passphrase);

        while (elToUpdate.firstChild) {
            elToUpdate.removeChild(elToUpdate.firstChild);
        }
        const frag = textToNodesWithBr(decrypted);
        elToUpdate.appendChild(frag);
        elToUpdate.setAttribute("data-crypt3tr-processed", "1");
    }
}

async function processRootAndShadows(root, passphrase) {
    await processTextNodes(root, passphrase);
    await processElementBlocks(root, passphrase);

    if (root.querySelectorAll) {
        const allElements = root.querySelectorAll("*");
        for (const el of allElements) {
            if (el.shadowRoot) {
                await processRootAndShadows(el.shadowRoot, passphrase);
            }
        }
    }
}

// ---- Déchiffrement d'une chaîne contenant des balises [[crypt3tr]] ----

async function decryptStringWithMarkers(text, passphrase) {
    if (!text || !passphrase) return text;

    let resultParts = [];
    let lastIndex = 0;
    let match;

    CRYPT_REGEX.lastIndex = 0;
    while ((match = CRYPT_REGEX.exec(text)) !== null) {
        const fullMatch = match[0];
        const innerB64 = match[1];

        resultParts.push(text.slice(lastIndex, match.index));

        const decrypted = await decryptBlock(innerB64, passphrase);
        resultParts.push(decrypted);

        lastIndex = match.index + fullMatch.length;
    }

    resultParts.push(text.slice(lastIndex));
    return resultParts.join("");
}

// ---- Chiffrement du champ actif ----

async function encryptActiveField(passphrase) {
    if (!passphrase) return;

    const active = document.activeElement;
    if (!active) return;

    if (active.tagName) {
        const tag = active.tagName.toLowerCase();
        if (tag === "textarea" || tag === "input") {
            const value = active.value || "";
            if (!value) return;
            const encrypted = await encryptMessage(passphrase, value);
            active.value = encrypted;
            return;
        }
    }

    if (active.isContentEditable) {
        const text = getPlainTextWithNewlines(active);
        if (!text) return;
        const encrypted = await encryptMessage(passphrase, text);
        active.textContent = encrypted;
        return;
    }
}

// ---- Déchiffrement du champ actif ----

// ---- Déchiffrement du champ actif ----

async function decryptActiveField(passphrase) {
    if (!passphrase) return;

    const active = document.activeElement;
    if (!active) return;

    if (active.tagName) {
        const tag = active.tagName.toLowerCase();
        if (tag === "textarea" || tag === "input") {
            const value = active.value || "";
            if (!value) return;
            const decrypted = await decryptStringWithMarkers(value, passphrase);
            active.value = decrypted;
            return;
        }
    }

    if (active.isContentEditable) {
        const text = getPlainTextWithNewlines(active);
        if (!text) return;
        const decrypted = await decryptStringWithMarkers(text, passphrase);

        // IMPORTANT : on reconstruit avec <br> pour garder les sauts de ligne
        while (active.firstChild) {
            active.removeChild(active.firstChild);
        }
        const frag = textToNodesWithBr(decrypted);
        active.appendChild(frag);
        return;
    }
}

// ---- Messages depuis background (Encrypt / Decrypt) ----

browser.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.type) return;

    if (msg.type === "ENCRYPT_FIELD") {
        return (async () => {
            const settings = await loadSettings();
            if (!settings.enabled || !settings.password) return;
            const host = window.location.hostname;
            if (!isHostAllowed(host, settings.whitelist)) return;

            await encryptActiveField(settings.password);
        })();
    }

    if (msg.type === "DECRYPT_FIELD") {
        return (async () => {
            const settings = await loadSettings();
            if (!settings.enabled || !settings.password) return;
            const host = window.location.hostname;
            if (!isHostAllowed(host, settings.whitelist)) return;

            await decryptActiveField(settings.password);
        })();
    }
});

// ---- Init : décryptage auto en lecture ----

(async function init() {
    const settings = await loadSettings();
    const host = window.location.hostname;

    if (!settings.enabled) return;
    if (!settings.password) return;
    if (!isHostAllowed(host, settings.whitelist)) return;

    const passphrase = settings.password;

    processRootAndShadows(document, passphrase);

    const observer = new MutationObserver((mutations) => {
        for (const mut of mutations) {
            for (const node of mut.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    processRootAndShadows(node, passphrase);
                    if (node.shadowRoot) {
                        processRootAndShadows(node.shadowRoot, passphrase);
                    }
                }
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
