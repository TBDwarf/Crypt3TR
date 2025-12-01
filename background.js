const MENU_ID_ENCRYPT = "crypt3tr-encrypt";
const MENU_ID_DECRYPT = "crypt3tr-decrypt";

function getLang() {
    const lang = (navigator.language || "en").toLowerCase();
    if (lang.startsWith("fr")) return "fr";
    return "en";
}

function getMenuTitles() {
    const lang = getLang();
    if (lang === "fr") {
        return {
            encrypt: "Chiffrement du message",
            decrypt: "Déchiffrement du message"
        };
    }
    return {
        encrypt: "Encrypt message",
        decrypt: "Decrypt message"
    };
}

function createContextMenu() {
    const titles = getMenuTitles();

    if (browser.menus && browser.menus.removeAll) {
        browser.menus.removeAll().then(() => {
            // Menu chiffrement avec icône dédiée
            browser.menus.create({
                id: MENU_ID_ENCRYPT,
                title: titles.encrypt,
                contexts: ["editable"],
                icons: {
                    "16": "icon-encrypt-16.png",
                    "32": "icon-encrypt-32.png"
                }
            });

            // Menu déchiffrement avec icône dédiée
            browser.menus.create({
                id: MENU_ID_DECRYPT,
                title: titles.decrypt,
                contexts: ["editable"],
                icons: {
                    "16": "icon-decrypt-16.png",
                    "32": "icon-decrypt-32.png"
                }
            });
        });
    } else if (browser.contextMenus) {
        browser.contextMenus.removeAll(() => {
            browser.contextMenus.create({
                id: MENU_ID_ENCRYPT,
                title: titles.encrypt,
                contexts: ["editable"],
                icons: {
                    "16": "icon-encrypt-16.png",
                    "32": "icon-encrypt-32.png"
                }
            });

            browser.contextMenus.create({
                id: MENU_ID_DECRYPT,
                title: titles.decrypt,
                contexts: ["editable"],
                icons: {
                    "16": "icon-decrypt-16.png",
                    "32": "icon-decrypt-32.png"
                }
            });
        });
    }
}

if (browser.runtime && browser.runtime.onInstalled) {
    browser.runtime.onInstalled.addListener(() => {
        createContextMenu();
    });
}

// Pour le chargement temporaire via about:debugging
createContextMenu();

function onMenuClick(info, tab) {
    if (info.menuItemId === MENU_ID_ENCRYPT) {
        if (browser.tabs && browser.tabs.sendMessage) {
            browser.tabs
            .sendMessage(tab.id, { type: "ENCRYPT_FIELD" })
            .catch(() => {});
        }
        return;
    }
    if (info.menuItemId === MENU_ID_DECRYPT) {
        if (browser.tabs && browser.tabs.sendMessage) {
            browser.tabs
            .sendMessage(tab.id, { type: "DECRYPT_FIELD" })
            .catch(() => {});
        }
        return;
    }
}

if (browser.menus && browser.menus.onClicked) {
    browser.menus.onClicked.addListener(onMenuClick);
} else if (browser.contextMenus && browser.contextMenus.onClicked) {
    browser.contextMenus.onClicked.addListener(onMenuClick);
}
