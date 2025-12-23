(function () {
    const body = document.body;
    const txt = document.getElementById("editor");
    const themeToggle = document.getElementById("themeToggle");
    const btnOk = document.getElementById("btnOk");
    const btnCancel = document.getElementById("btnCancel");
    const btnEmoji = document.getElementById("btnEmoji");
    const emojiPicker = document.getElementById("emojiPicker");
    const emojiGrid = document.getElementById("emojiGrid");
    const emojiSearch = document.getElementById("emojiSearchInput");
    const errorEl = document.getElementById("error");

    // --- Traduction ---
    function applyI18n() {
        const t = getStrings();
        if (txt) txt.placeholder = t.editorPlaceholder;
        if (btnOk) btnOk.textContent = (getLang() === 'fr') ? "Chiffrer" : "Encrypt";
        if (btnCancel) btnCancel.textContent = (getLang() === 'fr') ? "Annuler" : "Cancel";
        if (emojiSearch) emojiSearch.placeholder = (getLang() === 'fr') ? "Rechercher..." : "Search...";
    }

    // --- Gestion du Thème ---
    function initTheme() {
        const savedTheme = localStorage.getItem("crypt3tr-theme");
        if (savedTheme) {
            body.setAttribute("data-theme", savedTheme);
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            body.setAttribute("data-theme", prefersDark ? "dark" : "light");
        }
    }

    themeToggle.onclick = () => {
        const current = body.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        body.setAttribute("data-theme", next);
        localStorage.setItem("crypt3tr-theme", next);
    };

    // --- Emojis ---
    function renderEmojis(filter = "") {
        emojiGrid.innerHTML = "";
        const filtered = EMOJI_LIST.filter(e =>
        e.keywords.toLowerCase().includes(filter.toLowerCase())
        );
        filtered.forEach(emoji => {
            const span = document.createElement("span");
            span.className = "emoji-item";
            span.textContent = emoji.char;
            span.onclick = (e) => {
                e.stopPropagation();
                insertAtCursor(emoji.char);
                emojiPicker.style.display = "none";
            };
            emojiGrid.appendChild(span);
        });
    }

    function insertAtCursor(value) {
        const start = txt.selectionStart;
        const end = txt.selectionEnd;
        txt.value = txt.value.substring(0, start) + value + txt.value.substring(end);
        txt.focus();
        txt.selectionStart = txt.selectionEnd = start + value.length;
    }

    btnEmoji.onclick = (e) => {
        e.stopPropagation();
        const isVisible = emojiPicker.style.display === "flex";
        emojiPicker.style.display = isVisible ? "none" : "flex";
        if (!isVisible) {
            renderEmojis();
            emojiSearch.value = "";
            setTimeout(() => emojiSearch.focus(), 10);
        }
    };

    emojiSearch.oninput = (e) => renderEmojis(e.target.value);

    document.onclick = (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== btnEmoji) {
            emojiPicker.style.display = "none";
        }
    };

    // --- Initialisation ---
    initTheme();
    applyI18n();

    function getParams() {
        const params = new URLSearchParams(window.location.search);
        return { id: params.get("id") || "" };
    }

    window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "CRYPT3TR_EDITOR_INIT") {
            txt.value = event.data.text || "";
            txt.focus();
        }
    });

    btnCancel.onclick = () => {
        window.parent.postMessage({ type: "CRYPT3TR_EDITOR_CANCEL", id: getParams().id }, "*");
    };

    btnOk.onclick = async () => {
        errorEl.textContent = "";
        const plain = txt.value.trim();
        if (!plain) return;
        try {
            const res = await browser.runtime.sendMessage({ type: "ENCRYPT_TEXT", text: plain });
            if (res && res.success) {
                window.parent.postMessage({ type: "CRYPT3TR_EDITOR_RESULT", id: getParams().id, ciphertext: res.text }, "*");
            } else {
                errorEl.textContent = (getLang() === 'fr') ? "Erreur : Mot de passe non configuré." : "Error: Password not configured.";
            }
        } catch (e) { errorEl.textContent = "Error."; }
    };
})();
