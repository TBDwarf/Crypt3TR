// content-script.js (version avec édition + cas Discord)

const STORAGE_KEY = "crypt3trSettings";

const CRYPT_REGEX = /\[\[crypt3tr\]\]([\s\S]*?)\[\[\/crypt3tr\]\]/gi;
// Pour détecter un champ qui contient UNIQUEMENT un bloc crypt3tr
const FULL_CRYPT_REGEX = /^\s*\[\[crypt3tr\]\]([\s\S]*?)\[\[\/crypt3tr\]\]\s*$/i;

const THROTTLE_MS = 200;

let cachedSettings = null;

// id -> { data: b64 } pour les viewers inline
const crypt3trBlocks = new Map();
// id -> iframe viewer
const crypt3trViewers = new Map();

// id éditeur -> { element, isInput, isContentEditable }
const crypt3trEditors = new Map();
// id éditeur -> iframe editor
const crypt3trEditorIframes = new Map();

function isTrustedIframeWindow(win) {
    if (!win) return false;

    for (const iframe of crypt3trViewers.values()) {
        if (iframe.contentWindow === win) return true;
    }
    for (const iframe of crypt3trEditorIframes.values()) {
        if (iframe.contentWindow === win) return true;
    }
    return false;
}

function generateSecureId(prefix) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
    return `${prefix}-${hex}`;
}

// ---- Helpers base64 pour init éditeur ----

function encodeStringToBase64(str) {
    const utf8 = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < utf8.length; i++) {
        binary += String.fromCharCode(utf8[i]);
    }
    return btoa(binary);
}

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

// ---- Zones éditables ----

function isEditableElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
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

function isEditableNode(node) {
    if (!node) return false;
    if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
    }
    return isEditableElement(node);
}

// remonte jusqu'au "root" éditable (textarea/input ou premier contentEditable)
function getEditableRoot(el) {
    let cur = el;
    while (cur && cur !== document.documentElement && cur.nodeType === Node.ELEMENT_NODE) {
        if (isEditableElement(cur)) return cur;
        cur = cur.parentElement;
    }
    return null;
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

        if (tag === "span" || tag === "i" || tag === "wbr") {
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

// ---- Récupération de la couleur de texte de l'hôte ----

function getHostTextColor(hostEl) {
    try {
        const el = hostEl || document.body;
        const cs = window.getComputedStyle(el);
        return cs.color || "";
    } catch (e) {
        return "";
    }
}

// ---- VIEWER INLINE : IFRAME POUR CHAQUE BLOC CHIFFRÉ ----

function createViewerIframe(b64Data, hostEl) {
    const id = generateSecureId("crypt3tr-view");
    crypt3trBlocks.set(id, { data: b64Data });

    const color = getHostTextColor(hostEl);

    const params = new URLSearchParams();
    params.set("id", id);
    if (color) params.set("color", color);

    const iframe = document.createElement("iframe");
    iframe.src = browser.runtime.getURL("viewer.html") + "?" + params.toString();
    iframe.style.border = "none";
    iframe.style.display = "inline-block";
    iframe.style.verticalAlign = "baseline";
    iframe.style.background = "transparent";
    iframe.style.padding = "0";
    iframe.style.margin = "0";
    iframe.style.width = "100%";
    iframe.style.minWidth = "1px";
    iframe.style.minHeight = "1em";
    iframe.setAttribute("scrolling", "no");

    crypt3trViewers.set(id, iframe);
    return iframe;
}

function processTextNodeForViewers(textNode) {
    const text = textNode.nodeValue;
    if (!text) return;

    CRYPT_REGEX.lastIndex = 0;
    let match;
    let lastIndex = 0;
    let found = false;

    const frag = document.createDocumentFragment();

    while ((match = CRYPT_REGEX.exec(text)) !== null) {
        found = true;
        const fullMatch = match[0];
        const innerB64 = match[1];

        if (match.index > lastIndex) {
            const before = text.slice(lastIndex, match.index);
            frag.appendChild(document.createTextNode(before));
        }

        const iframe = createViewerIframe(innerB64, textNode.parentNode);
        frag.appendChild(iframe);

        lastIndex = match.index + fullMatch.length;
    }

    if (!found) return;

    if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    if (textNode.parentNode) {
        textNode.parentNode.replaceChild(frag, textNode);
    }
}

async function processTextNodesForAllViewers(root) {
    if (!root) return;

    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );

    const nodesToProcess = [];
    let node;

    while ((node = walker.nextNode())) {
        if (!node.nodeValue) continue;
        if (isEditableNode(node)) continue;

        if (CRYPT_REGEX.test(node.nodeValue)) {
            nodesToProcess.push(node);
        }
        CRYPT_REGEX.lastIndex = 0;
    }

    for (const textNode of nodesToProcess) {
        processTextNodeForViewers(textNode);
    }
}

async function processElementBlocksForViewers(root) {
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
        if (isEditableElement(el)) continue;
        if (el.hasAttribute("data-crypt3tr-view-processed")) continue;

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

        elementsToUpdate.push({ el, innerB64: match[1] });
    }

    for (const { el, innerB64 } of elementsToUpdate) {
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        const iframe = createViewerIframe(innerB64, el);
        iframe.style.width = "100%";
        el.appendChild(iframe);
        el.setAttribute("data-crypt3tr-view-processed", "1");
    }
}

// ---- Gestion des shadow roots ----

async function processRootAndShadows(root) {
    await processTextNodesForAllViewers(root);
    await processElementBlocksForViewers(root);

    if (root.querySelectorAll) {
        const allElements = root.querySelectorAll("*");
        for (const el of allElements) {
            if (el.shadowRoot) {
                await processRootAndShadows(el.shadowRoot);
            }
        }
    }
}

// ---- ÉDITEUR SÉCURISÉ POUR LE CHIFFREMENT ----
// possibilité de passer un texte initial (déjà déchiffré)

function openSecureEditorForActiveField(initialPlainText = "") {
    const active = document.activeElement;
    if (!active) return;

    const rootEditable = getEditableRoot(active);
    if (!rootEditable) return;

    const id = generateSecureId("crypt3tr-editor");
    const tag = rootEditable.tagName ? rootEditable.tagName.toLowerCase() : "";
    const isInput = (tag === "input" || tag === "textarea");
    const isContentEditable = !!rootEditable.isContentEditable;

    crypt3trEditors.set(id, {
        element: rootEditable,
        isInput,
        isContentEditable
    });

    const params = new URLSearchParams();
    params.set("id", id);
    // ON NE PASSE PLUS LE TEXTE DANS L'URL ICI

    const iframe = document.createElement("iframe");

    // On envoie le texte sécurisé une fois l'iframe chargée
    iframe.onload = () => {
        iframe.contentWindow.postMessage({
            type: "CRYPT3TR_EDITOR_INIT",
            text: initialPlainText
        }, "*");
    };
    iframe.src = browser.runtime.getURL("editor.html") + "?" + params.toString();
    iframe.style.position = "fixed";
    iframe.style.left = "50%";
    iframe.style.top = "50%";
    iframe.style.transform = "translate(-50%, -50%)";
    iframe.style.width = "420px";
    iframe.style.height = "260px";
    iframe.style.border = "1px solid rgba(0,0,0,0.4)";
    iframe.style.borderRadius = "8px";
    iframe.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
    iframe.style.zIndex = "2147483647";
    iframe.style.background = "transparent";

    document.documentElement.appendChild(iframe);
    crypt3trEditorIframes.set(id, iframe);

    createEditorOverlay(id);
}

function createEditorOverlay(id) {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.left = "0";
    overlay.style.top = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.background = "rgba(0,0,0,0.4)";
    overlay.style.zIndex = "2147483646";
    overlay.dataset.crypt3trEditorOverlay = id;

    overlay.addEventListener("click", () => {
        closeSecureEditor(id);
    });

    document.documentElement.appendChild(overlay);
}

function closeSecureEditor(id) {
    const iframe = crypt3trEditorIframes.get(id);
    if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
    }
    crypt3trEditorIframes.delete(id);

    const overlay = document.querySelector(`div[data-crypt3tr-editor-overlay="${id}"]`);
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }

    const info = crypt3trEditors.get(id);
    if (info && info.element && info.element.focus) {
        info.element.focus();
    }
    crypt3trEditors.delete(id);
}

// ---- Réception des messages des iframes (viewer + editor) ----

window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (!data.type) return;

    // Ne traiter que les messages venant de nos iframes (viewer/editor)
    if (!isTrustedIframeWindow(event.source)) {
        return;
    }

    // --- VIEWER : demande de data ou resize ---
    if (data.type === "CRYPT3TR_REQUEST_DATA" && data.id) {
        const info = crypt3trBlocks.get(data.id);
        if (!info) return;
        try {
            event.source.postMessage({
                type: "CRYPT3TR_DATA",
                id: data.id,
                data: info.data
            }, "*");
        } catch (e) {
            console.error("[Crypt3TR] Error postMessage DATA:", e);
        }
        return;
    }

    if (data.type === "CRYPT3TR_RESIZE" && data.id) {
        const iframe = crypt3trViewers.get(data.id);
        if (!iframe) return;
        if (typeof data.height === "number" && data.height > 0) {
            iframe.style.height = data.height + "px";
        }
        return;
    }

    // --- EDITOR : résultat chiffré ou annulation ---
    if (data.type === "CRYPT3TR_EDITOR_RESULT" && data.id) {
        const info = crypt3trEditors.get(data.id);
        if (!info) {
            closeSecureEditor(data.id);
            return;
        }

        const ciphertext = data.ciphertext || "";
        if (ciphertext) {
            const el = info.element;

            if (info.isInput) {
                el.value = ciphertext;
                el.dispatchEvent(new Event("input", { bubbles: true }));

            } else if (info.isContentEditable) {
                const hostname = window.location.hostname || "";
                const isDiscord = /(^|\.)discord\.com$/i.test(hostname);

                if (isDiscord) {
                    // ---- Chemin spécial Discord : beforeinput / input synthétiques ----
                    if (el.focus) el.focus();

                    try {
                        const sel = window.getSelection();
                        if (sel) {
                            const range = document.createRange();
                            range.selectNodeContents(el);
                            sel.removeAllRanges();
                            sel.addRange(range);
                        }
                    } catch (e) {
                        // ignore
                    }

                    try {
                        const before = new InputEvent("beforeinput", {
                            bubbles: true,
                            cancelable: true,
                            data: ciphertext,
                            inputType: "insertReplacementText"
                        });
                        el.dispatchEvent(before);
                    } catch (e) {
                        // ignore
                    }

                    try {
                        const inputEv = new InputEvent("input", {
                            bubbles: true,
                            cancelable: true,
                            data: ciphertext,
                            inputType: "insertReplacementText"
                        });
                        el.dispatchEvent(inputEv);
                    } catch (e) {
                        el.dispatchEvent(new Event("input", { bubbles: true }));
                    }

                } else {
                    // ---- Chemin standard (WhatsApp, etc.) ----
                    if (el.focus) {
                        el.focus();
                    }

                    // Effacer le contenu actuel
                    try {
                        const sel = window.getSelection();
                        if (sel) {
                            const range = document.createRange();
                            range.selectNodeContents(el);
                            sel.removeAllRanges();
                            sel.addRange(range);
                            range.deleteContents();
                        }
                    } catch (e) {
                        // ignore
                    }

                    let usedExec = false;
                    try {
                        if (document.queryCommandSupported &&
                            document.queryCommandSupported("insertText")) {
                            usedExec = document.execCommand("insertText", false, ciphertext);
                        }
                    } catch (e) {
                        usedExec = false;
                    }

                    if (!usedExec) {
                        while (el.firstChild) el.removeChild(el.firstChild);
                        el.appendChild(document.createTextNode(ciphertext));

                        try {
                            const ev = new InputEvent("input", {
                                bubbles: true,
                                cancelable: true,
                                data: ciphertext,
                                inputType: "insertFromPaste"
                            });
                            el.dispatchEvent(ev);
                        } catch (e) {
                            el.dispatchEvent(new Event("input", { bubbles: true }));
                        }
                    }
                }
            }
        }

        closeSecureEditor(data.id);
        return;
    }

    if (data.type === "CRYPT3TR_EDITOR_CANCEL" && data.id) {
        closeSecureEditor(data.id);
        return;
    }
});

// ---- Chiffrement / “édition/déchiffrement” du champ actif (menu contextuel) ----

async function encryptActiveField() {
    const settings = await loadSettingsRemote();
    if (!settings.enabled || !settings.hasPassword) return;
    const host = window.location.hostname;
    if (!isHostAllowed(host, settings.whitelist)) return;

    const active = document.activeElement;
    if (!active) return;

    const rootEditable = getEditableRoot(active);
    if (!rootEditable) return;

    const tag = rootEditable.tagName ? rootEditable.tagName.toLowerCase() : "";
    let currentText = "";

    if (tag === "textarea" || tag === "input") {
        currentText = rootEditable.value || "";
    } else if (rootEditable.isContentEditable) {
        currentText = getPlainTextWithNewlines(rootEditable);
    }

    currentText = currentText || "";
    let initialPlain = "";

    const m = FULL_CRYPT_REGEX.exec(currentText);
    FULL_CRYPT_REGEX.lastIndex = 0;

    if (m && m[1]) {
        // Le champ contient UNIQUEMENT un bloc [[crypt3tr]]... : on le déchiffre pour l'édition
        try {
            const res = await browser.runtime.sendMessage({
                type: "DECRYPT_BLOCK",
                data: m[1]
            });
            if (res && res.success && res.text) {
                initialPlain = res.text;
            }
        } catch (e) {
            console.error("[Crypt3TR] Error DECRYPT_BLOCK for editor init:", e);
        }
    } else {
        // Champ normal : on peut pré-remplir l'éditeur avec le texte actuel si tu veux
        // (pour l'instant on laisse vide pour rester proche de ton comportement initial)
        // initialPlain = currentText;
    }

    openSecureEditorForActiveField(initialPlain);
}

// ---- Déchiffrement automatique dans les champs (via marqueurs) ----

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

        const res = await browser.runtime.sendMessage({
            type: "DECRYPT_BLOCK",
            data: innerB64
        });
        if (res && res.success) {
            resultParts.push(res.text);
        }

        lastIndex = match.index + fullMatch.length;
    }

    resultParts.push(text.slice(lastIndex));
    return resultParts.join("");
}


// ---- Messages depuis background (Encrypt champ actif) ----

browser.runtime.onMessage.addListener((msg) => {
    if (!msg || !msg.type) return;
    if (msg.type === "ENCRYPT_FIELD") {
        encryptActiveField();
    }
});

// ---- Init : remplacement auto des blocs par des VIEWERS inline ----

(async function init() {
    const settings = await loadSettingsRemote();
    const host = window.location.hostname;

    if (!settings.enabled) return;
    if (!settings.hasPassword) return;
    if (!isHostAllowed(host, settings.whitelist)) return;

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
