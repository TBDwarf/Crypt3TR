(function () {
    const contentEl = document.getElementById("content");

    function getParams() {
        try {
            const params = new URLSearchParams(window.location.search);
            return {
                id: params.get("id") || "",
 color: params.get("color") || "",
 fontSize: params.get("fontSize") || "14px",
 lineHeight: params.get("lineHeight") || "1.4",
 fontFamily: params.get("fontFamily") || "system-ui, sans-serif"
            };
        } catch (e) {
            return {
                id: "",
                color: "",
                fontSize: "14px",
                lineHeight: "1.4",
                fontFamily: "system-ui, sans-serif"
            };
        }
    }

    function applyStyles(p) {
        if (p.color) {
            document.body.style.color = p.color;
        }
        document.body.style.fontSize = p.fontSize;
        document.body.style.lineHeight = p.lineHeight;
        document.body.style.fontFamily = p.fontFamily;
    }

    function notifySize(id) {
        const height = contentEl.scrollHeight || 16;
        window.parent.postMessage({
            type: "CRYPT3TR_RESIZE",
            id,
            height
        }, "*");
    }

    async function startDissolveAnimation(b64, plaintext, id) {
        const len = b64.length;
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        // Afficher le base64 brut pendant 150ms
        contentEl.textContent = b64;
        notifySize(id);

        await new Promise(resolve => setTimeout(resolve, 150));

        // Remplacer progressivement les caractères
        let current = b64.split('');
        const target = plaintext.split('');

        // Ajuster la longueur si nécessaire
        while (target.length < len) {
            target.push(' ');
        }

        const frames = 100; // nombre d'étapes
        const interval = 2; // ms entre chaque étape

        for (let step = 0; step < frames; step++) {
            // Remplacer 10% des positions aléatoires par le caractère cible
            const toReplace = Math.floor(len * 0.1);
            for (let i = 0; i < toReplace; i++) {
                const pos = Math.floor(Math.random() * len);
                if (current[pos] !== target[pos]) {
                    current[pos] = target[pos];
                }
            }

            contentEl.textContent = current.join('');
            notifySize(id);

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        // Final : afficher le plaintext complet
        contentEl.textContent = plaintext;
        notifySize(id);
    }

    async function requestDecryption(p) {
        const id = p.id;
        if (!id) {
            contentEl.textContent = "Invalid ID.";
            contentEl.classList.add("error");
            notifySize(id);
            return;
        }

        window.parent.postMessage({
            type: "CRYPT3TR_REQUEST_DATA",
            id
        }, "*");

        function onMessage(event) {
            const data = event.data;
            if (!data || typeof data !== "object") return;
            if (data.type !== "CRYPT3TR_DATA") return;
            if (data.id !== id) return;

            window.removeEventListener("message", onMessage);

            const b64 = data.data || "";
            if (!b64) {
                contentEl.textContent = "No data.";
                contentEl.classList.add("error");
                notifySize(id);
                return;
            }

            // Toujours utiliser l'effet "Dissolution"
            decryptAndDisplay(b64, id).then(plaintext => {
                if (plaintext) {
                    startDissolveAnimation(b64, plaintext, id);
                }
            });
        }

        window.addEventListener("message", onMessage);
    }

    async function decryptAndDisplay(b64, id) {
        try {
            const res = await browser.runtime.sendMessage({
                type: "DECRYPT_BLOCK",
                data: b64
            });
            if (!res || !res.success) {
                contentEl.textContent = "Decryption error.";
                contentEl.classList.add("error");
                return ""; // ← retourne vide pour éviter l'erreur dans l'animation
            } else {
                contentEl.textContent = res.text;
                return res.text; // ← retourne le texte pour l'animation
            }
        } catch (e) {
            console.error("[Crypt3TR viewer] Error DECRYPT_BLOCK:", e);
            contentEl.textContent = "Error.";
            contentEl.classList.add("error");
            return "";
        }
    }

    window.addEventListener("load", () => {
        const p = getParams();
        applyStyles(p);
        requestDecryption(p);
    });
})();
