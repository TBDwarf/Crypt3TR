(function () {
    const txt = document.getElementById("editor");
    const btnOk = document.getElementById("btnOk");
    const btnCancel = document.getElementById("btnCancel");
    const errorEl = document.getElementById("error");

    function getParams() {
        try {
            const params = new URLSearchParams(window.location.search);
            return {
                id: params.get("id") || "",
 init: params.get("init") || ""
            };
        } catch (e) {
            return { id: "", init: "" };
        }
    }

    function decodeBase64ToString(b64) {
        try {
            const bin = atob(b64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) {
                bytes[i] = bin.charCodeAt(i);
            }
            return new TextDecoder().decode(bytes);
        } catch (e) {
            return "";
        }
    }

    function getIdFromUrl() {
        const p = getParams();
        return p.id || "";
    }

    function showError(msg) {
        errorEl.textContent = msg || "";
    }

    // Pré-remplissage sécurisé via postMessage
    window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "CRYPT3TR_EDITOR_INIT") {
            txt.value = event.data.text || "";
        }
    });

    btnCancel.addEventListener("click", () => {
        const id = getIdFromUrl();
        window.parent.postMessage({
            type: "CRYPT3TR_EDITOR_CANCEL",
            id
        }, "*");
    });

    btnOk.addEventListener("click", async () => {
        showError("");
        const id = getIdFromUrl();
        const plain = txt.value || "";

        if (!plain.trim()) {
            showError("Texte vide.");
            return;
        }

        try {
            // Chiffrement via background : le texte clair NE SORT PAS de l'extension
            const res = await browser.runtime.sendMessage({
                type: "ENCRYPT_TEXT",
                text: plain
            });
            if (!res || !res.success || !res.text) {
                showError("Erreur de chiffrement (mot de passe manquant ?).");
                return;
            }

            const ciphertext = res.text;

            // On renvoie SEULEMENT le texte chiffré au parent (page + content-script).
            window.parent.postMessage({
                type: "CRYPT3TR_EDITOR_RESULT",
                id,
                ciphertext
            }, "*");
        } catch (e) {
            console.error("[Crypt3TR editor] Error ENCRYPT_TEXT:", e);
            showError("Erreur de chiffrement.");
        }
    });
})();
