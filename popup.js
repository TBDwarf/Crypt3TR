const STORAGE_KEY = "crypt3trSettings";

// ---- I18N ----

function applyI18n() {
    const t = getStrings();

    // Titre de la fenêtre / onglet du popup
    document.title = t.popupTitle;

    // Texte du header
    const appTitle = document.getElementById("appTitle");
    if (appTitle) appTitle.textContent = t.appTitle;

    const logoImg = document.getElementById("logoImg");
    if (logoImg) logoImg.alt = t.logoAlt;

    // Navigation bas et textes principaux
    const map = {
        navSettings: "navSettings",
        navHelp: "navHelp",
        navInfo: "navInfo",
        labelEnabled: "labelEnabled",
        labelPassword: "labelPassword",
        labelWhitelist: "labelWhitelist",
        titleUsage: "titleUsage",
        helpNote: "helpNote",
        titlePrivacy: "titlePrivacy",
        textPrivacy: "textPrivacy",
        aboutOpenSourceLabel: "aboutOpenSourceLabel",
        aboutGithubLinkText: "aboutGithubLinkText"
    };

    Object.entries(map).forEach(([key, id]) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = t[key];
    });

    // Boutons
    const btnSavePassword = document.getElementById("savePassword");
    const btnClearPassword = document.getElementById("clearPassword");
    const btnSaveWhitelist = document.getElementById("saveWhitelist");
    if (btnSavePassword) btnSavePassword.textContent = t.btnSavePassword;
    if (btnClearPassword) btnClearPassword.textContent = t.btnClearPassword;
    if (btnSaveWhitelist) btnSaveWhitelist.textContent = t.btnSaveWhitelist;

    // Aide : titres des étapes
    const step1Title = document.getElementById("step1Title");
    const step2Title = document.getElementById("step2Title");
    const step3Title = document.getElementById("step3Title");
    if (step1Title) step1Title.textContent = t.step1Title;
    if (step2Title) step2Title.textContent = t.step2Title;
    if (step3Title) step3Title.textContent = t.step3Title;

    // Aide : descriptions (construction DOM sans innerHTML)

    // 1) helpEncrypt : texte + <b>...</b> + texte
    const helpEncrypt = document.getElementById("helpEncrypt");
    if (helpEncrypt) {
        helpEncrypt.textContent = ""; // on vide

        const before = document.createTextNode(t.helpEncrypt_before || "");
        const bold = document.createElement("b");
        bold.textContent = t.helpEncrypt_bold || "";
        const after = document.createTextNode(t.helpEncrypt_after || "");

        helpEncrypt.appendChild(before);
        helpEncrypt.appendChild(bold);
        helpEncrypt.appendChild(after);
    }

    // 2) helpDecrypt : texte + <b>...</b> + texte
    const helpDecrypt = document.getElementById("helpDecrypt");
    if (helpDecrypt) {
        helpDecrypt.textContent = "";

        const before = document.createTextNode(t.helpDecrypt_before || "");
        const bold = document.createElement("b");
        bold.textContent = t.helpDecrypt_bold || "";
        const after = document.createTextNode(t.helpDecrypt_after || "");

        helpDecrypt.appendChild(before);
        helpDecrypt.appendChild(bold);
        helpDecrypt.appendChild(after);
    }

    // 3) helpDomains : deux lignes avec <code> et <br>
    const helpDomains = document.getElementById("helpDomains");
    if (helpDomains) {
        helpDomains.textContent = "";

        // Ligne 1 : before + <code>*.*</code> + after
        const line1Before = document.createTextNode(t.helpDomains_line1_beforeCode || "");
        const codeAll = document.createElement("code");
        codeAll.textContent = t.helpDomains_line1_codeAll || "";
        const line1After = document.createTextNode(t.helpDomains_line1_afterCode || "");

        helpDomains.appendChild(line1Before);
        helpDomains.appendChild(codeAll);
        helpDomains.appendChild(line1After);

        // Saut de ligne
        helpDomains.appendChild(document.createElement("br"));

        // Ligne 2 : prefix + <code>*.gmail.com</code> + suffix
        const line2Prefix = document.createTextNode(t.helpDomains_line2_prefix || "");
        const codeExample = document.createElement("code");
        codeExample.textContent = t.helpDomains_line2_codeExample || "";
        const line2Suffix = document.createTextNode(t.helpDomains_line2_suffix || "");

        helpDomains.appendChild(line2Prefix);
        helpDomains.appendChild(codeExample);
        helpDomains.appendChild(line2Suffix);
    }

    // Texte d'aide sous le champ mot de passe
    const hintPassword = document.getElementById("hintPassword");
    if (hintPassword) hintPassword.textContent = t.hintPassword;

    // Footer "About" : deux lignes séparées par un <br>
    const aboutFooter = document.getElementById("aboutFooter");
    if (aboutFooter) {
        aboutFooter.textContent = "";

        const line1 = document.createTextNode(t.aboutFooter_line1 || "");
        const br = document.createElement("br");
        const line2 = document.createTextNode(t.aboutFooter_line2 || "");

        aboutFooter.appendChild(line1);
        aboutFooter.appendChild(br);
        aboutFooter.appendChild(line2);
    }

    // Placeholders
    const inputPassword = document.getElementById("password");
    const textareaWhitelist = document.getElementById("whitelist");
    if (inputPassword) inputPassword.placeholder = t.passwordPlaceholder;
    if (textareaWhitelist) textareaWhitelist.placeholder = t.whitelistPlaceholder;
}

function updateStatusUI(enabled, hasPassword) {
    const dot = document.getElementById("statusDot");
    if (!dot) return;
    const isConfigured = enabled && hasPassword;
    if (isConfigured) {
        dot.className = "status-dot active";
    } else {
        dot.className = "status-dot";
    }
}

// ---- Tabs Logic ----
function initTabs() {
    const buttons = document.querySelectorAll('.nav-item');
    const contents = document.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ---- Main ----

document.addEventListener("DOMContentLoaded", async () => {
    applyI18n();
    initTabs();

    const checkboxEnabled = document.getElementById("enabled");
    const inputPassword = document.getElementById("password");
    const textareaWhitelist = document.getElementById("whitelist");
    const btnSavePassword = document.getElementById("savePassword");
    const btnClearPassword = document.getElementById("clearPassword");
    const btnSaveWhitelist = document.getElementById("saveWhitelist");
    const passwordFeedback = document.getElementById("passwordFeedback");
    const whitelistFeedback = document.getElementById("whitelistFeedback");
    const t = getStrings();

    let settings = {
        enabled: true,
        whitelist: ["*.*"],
        hasPassword: false
    };

    function showFeedback(el, msg, ok = true) {
        if (!el) return;
        el.textContent = msg;
        el.className = "feedback " + (ok ? "ok" : "error");
        // Afficher plus longtemps (30 secondes)
        setTimeout(() => {
            el.textContent = "";
        }, 30000);
    }

    async function refreshSettingsFromBackground() {
        try {
            const res = await browser.runtime.sendMessage({ type: "GET_SETTINGS" });
            settings.enabled = !!res.enabled;
            settings.whitelist = res.whitelist || ["*.*"];
            settings.hasPassword = !!res.hasPassword;

            checkboxEnabled.checked = settings.enabled;
            textareaWhitelist.value = settings.whitelist.join("\n");

            if (settings.hasPassword) {
                inputPassword.placeholder = t.passwordPlaceholder;
                inputPassword.value = "";
            } else {
                inputPassword.placeholder = "";
                inputPassword.value = "";
            }

            updateStatusUI(settings.enabled, settings.hasPassword);
        } catch (e) {
            console.error("[Crypt3TR] Error refreshing settings in popup:", e);
        }
    }

    await refreshSettingsFromBackground();

    checkboxEnabled.addEventListener("change", async () => {
        settings.enabled = checkboxEnabled.checked;
        try {
            await browser.runtime.sendMessage({
                type: "SET_ENABLED",
                enabled: settings.enabled
            });
        } catch (e) {
            console.error("[Crypt3TR] Error SET_ENABLED:", e);
        }
        updateStatusUI(settings.enabled, settings.hasPassword);
    });

    btnSavePassword.addEventListener("click", async () => {
        const val = inputPassword.value || "";
        if (val) {
            try {
                await browser.runtime.sendMessage({
                    type: "SET_PASSWORD",
                    password: val
                });
                showFeedback(passwordFeedback, t.msgPwdSaved, true);
                inputPassword.value = "";
                await refreshSettingsFromBackground();
            } catch (e) {
                console.error("[Crypt3TR] Error SET_PASSWORD:", e);
                showFeedback(passwordFeedback, t.errorGeneric, false);
            }
        }
    });

    btnClearPassword.addEventListener("click", async () => {
        try {
            await browser.runtime.sendMessage({ type: "CLEAR_PASSWORD" });
            showFeedback(passwordFeedback, t.msgPwdCleared, true);
            inputPassword.value = "";
            await refreshSettingsFromBackground();
        } catch (e) {
            console.error("[Crypt3TR] Error CLEAR_PASSWORD:", e);
            showFeedback(passwordFeedback, t.errorGeneric, false);
        }
    });

    btnSaveWhitelist.addEventListener("click", async () => {
        const lines = textareaWhitelist.value
        .split("\n")
        .map(l => l.trim())
        .filter(l => l.length > 0);
        const wl = lines.length > 0 ? lines : ["*.*"];

        try {
            await browser.runtime.sendMessage({
                type: "SET_WHITELIST",
                whitelist: wl
            });
            showFeedback(whitelistFeedback, t.msgWhitelistSaved, true);
            await refreshSettingsFromBackground();
        } catch (e) {
            console.error("[Crypt3TR] Error SET_WHITELIST:", e);
            showFeedback(whitelistFeedback, t.errorGeneric, false);
        }
    });
});
