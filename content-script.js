const STORAGE_KEY = "crypt3trSettings"; // utilisé seulement par background désormais

const CRYPT_REGEX = /\[\[crypt3tr\]\]([\s\S]*?)\[\[\/crypt3tr\]\]/gi;

// Intervalle minimum entre deux scans complets (throttle)
const THROTTLE_MS = 200;

let cachedSettings = null;

// ---- Chargement paramètres depuis background ----

async function loadSettingsRemote() {
    if (cachedSettings) return cachedSettings;
    try {
        const res = await browser.runtime.sendMessage({ type: "GET_SETTINGS" });
        cachedSettings = {
            enabled: !!res.enabled,
            whitelist: res.whitelist || ["*.*"],
            hasPassword: !!res.hasPassword
        };
        return cachedSettings;
    } catch (e) {
        console.error("[Crypt3TR] Error getting settings from background:", e);
        return { enabled: false, whitelist: [], hasPassword: false };
    }
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

// ---- Appels crypto vers le background ----

async function encryptMessageRemote(message) {
    try {
        const res = await browser.runtime.sendMessage({
            type: "ENCRYPT_TEXT",
            text: message
        });
        if (res && res.success) return res.text;
        return message;
    } catch (e) {
        console.error("[Crypt3TR] Error ENCRYPT_TEXT:", e);
        return message;
    }
}

async function decryptBlockRemote(b64Data) {
    try {
        const res = await browser.runtime.sendMessage({
            type: "DECRYPT_BLOCK",
            data: b64Data
        });
        if (res && res.success) return res.text;
        const t = (typeof getStrings === "function") ? getStrings() : null;
        return t ? t.decryptionError : "[[Decryption Error]]";
    } catch (e) {
        console.error("[Crypt3TR] Error DECRYPT_BLOCK:", e);
        const t = (typeof getStrings === "function") ? getStrings() : null;
        return t ? t.decryptionError : "[[Decryption Error]]";
    }
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

// ---- Déchiffrement d'une chaîne contenant des balises [[crypt3tr]] ----

async function decryptStringWithMarkers(text) {
    if (!text) return text;

    let resultParts = [];
    let lastIndex = 0;
    let match;

    CRYPT_REGEX.lastIndex = 0;
    while ((match = CRYPT_REGEX.exec(text)) !== null) {
        const fullMatch = match[0];
        const innerB64 = match[1];

        resultParts.push(text.slice(lastIndex, match.index));

        const decrypted = await decryptBlockRemote(innerB64);
        resultParts.push(decrypted);

        lastIndex = match.index + fullMatch.length;
    }

    resultParts.push(text.slice(lastIndex));
    return resultParts.join("");
}

// ---- Décryptage : niveau nœud texte (inline) ----

async function processTextNodes(root) {
    if (!root) return;

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
        const text = textNode.nodeValue;
        const finalText = await decryptStringWithMarkers(text);

        if (!finalText.includes("\n") || !textNode.parentNode) {
            textNode.nodeValue = finalText;
        } else {
            const frag = textToNodesWithBr(finalText);
            textNode.parentNode.replaceChild(frag, textNode);
        }
    }
}

// ---- Décryptage : éléments entiers (Gmail & co) ----

async function processElementBlocks(root) {
    if (!root) return;

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
        const decrypted = await decryptBlockRemote(innerB64);

        while (elToUpdate.firstChild) {
            elToUpdate.removeChild(elToUpdate.firstChild);
        }
        const frag = textToNodesWithBr(decrypted);
        elToUpdate.appendChild(frag);
        elToUpdate.setAttribute("data-crypt3tr-processed", "1");
    }
}

async function processRootAndShadows(root) {
    await processTextNodes(root);
    await processElementBlocks(root);

    if (root.querySelectorAll) {
        const allElements = root.querySelectorAll("*");
        for (const el of allElements) {
            if (el.shadowRoot) {
                await processRootAndShadows(el.shadowRoot);
            }
        }
    }
}

// ---- Chiffrement du champ actif ----

async function encryptActiveField() {
    const settings = await loadSettingsRemote();
    if (!settings.enabled || !settings.hasPassword) return;
    const host = window.location.hostname;
    if (!isHostAllowed(host, settings.whitelist)) return;

    const active = document.activeElement;
    if (!active) return;

    let textToEncrypt = "";
    let isInput = false;

    if (active.tagName) {
        const tag = active.tagName.toLowerCase();
        if (tag === "textarea" || tag === "input") {
            textToEncrypt = active.value || "";
            isInput = true;
        }
    }

    if (!isInput && active.isContentEditable) {
        textToEncrypt = getPlainTextWithNewlines(active);
        isInput = false;
    }

    if (!textToEncrypt || textToEncrypt.trim() === "") return;

    const encrypted = await encryptMessageRemote(textToEncrypt);

    if (isInput) {
        active.value = encrypted;
        active.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (active.isContentEditable) {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, encrypted);
    }
}

// ---- Déchiffrement du champ actif ----

async function decryptActiveField() {
    const settings = await loadSettingsRemote();
    if (!settings.enabled || !settings.hasPassword) return;
    const host = window.location.hostname;
    if (!isHostAllowed(host, settings.whitelist)) return;

    const active = document.activeElement;
    if (!active) return;

    if (active.tagName) {
        const tag = active.tagName.toLowerCase();
        if (tag === "textarea" || tag === "input") {
            const value = active.value || "";
            if (!value) return;
            const decrypted = await decryptStringWithMarkers(value);
            active.value = decrypted;
            active.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
    }

    if (active.isContentEditable) {
        const text = getPlainTextWithNewlines(active);
        if (!text) return;
        const decrypted = await decryptStringWithMarkers(text);

        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, decrypted);
        return;
    }
}

// ---- Messages depuis background (Encrypt / Decrypt champ actif) ----

browser.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.type) return;

    if (msg.type === "ENCRYPT_FIELD") {
        return encryptActiveField();
    }
    if (msg.type === "DECRYPT_FIELD") {
        return decryptActiveField();
    }
});

// ---- Init : décryptage auto en lecture avec THROTTLE ----

(async function init() {
    const settings = await loadSettingsRemote();
    const host = window.location.hostname;

    if (!settings.enabled) return;
    if (!settings.hasPassword) return;
    if (!isHostAllowed(host, settings.whitelist)) return;

    // Scan initial complet
    await processRootAndShadows(document);

    let lastProcessTime = 0;
    let pendingTimeout = null;
    let pendingRootList = [];

    async function runProcess() {
        const roots = pendingRootList.length ? pendingRootList.slice() : [document];
        pendingRootList = [];
        lastProcessTime = Date.now();
        pendingTimeout = null;

        for (const root of roots) {
            try {
                await processRootAndShadows(root);
            } catch (e) {
                console.error("[Crypt3TR] Error in processRootAndShadows:", e);
            }
        }
    }

    const observer = new MutationObserver((mutations) => {
        const now = Date.now();

        for (const mut of mutations) {
            for (const node of mut.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    pendingRootList.push(node);
                    if (node.shadowRoot) {
                        pendingRootList.push(node.shadowRoot);
                    }
                }
            }
        }

        if (pendingRootList.length === 0) return;

        const delta = now - lastProcessTime;

        if (delta >= THROTTLE_MS) {
            if (pendingTimeout) {
                clearTimeout(pendingTimeout);
                pendingTimeout = null;
            }
            runProcess();
        } else {
            if (!pendingTimeout) {
                const wait = THROTTLE_MS - delta;
                pendingTimeout = setTimeout(() => {
                    runProcess();
                }, wait);
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
