# 📝 Changelog

Tous les changements notables de **Crypt3TR** seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.1.0] - 2025-XX-XX

### ✨ Ajouté

#### Stockage sécurisé du mot de passe

- 🔐 Introduction d’une **clé maîtresse AES‑256‑GCM non extractible** pour protéger le mot de passe utilisateur.
- 🗄️ Stockage de la clé maîtresse dans une base **IndexedDB** dédiée (`crypt3tr-keystore`) :
  - Objet `CryptoKey` AES‑GCM non extractible.
  - Utilisée uniquement dans le contexte de l’extension (background).
- 🔑 Chiffrement du **mot de passe utilisateur** avec cette clé maîtresse :
  - Génération d’un IV aléatoire (96 bits).
  - Stockage du mot de passe sous la forme : `base64(iv || ciphertext)` dans `browser.storage.local`.

#### Architecture & messages internes

- 🧠 Centralisation de la **crypto des messages** dans le `background.js` :
  - `ENCRYPT_TEXT` : chiffrement d’un texte avec le mot de passe stocké.
  - `DECRYPT_BLOCK` : déchiffrement d’un bloc `[[Erreur de déchiffrement]]`.
- 📡 API interne `runtime.sendMessage` pour :
  - Récupérer la configuration (`GET_SETTINGS`).
  - Activer/désactiver l’extension (`SET_ENABLED`).
  - Mettre à jour la whitelist (`SET_WHITELIST`).
  - Gérer le mot de passe (`SET_PASSWORD`, `CLEAR_PASSWORD`).

#### Expérience utilisateur

- 🟢 **Indicateur de statut** mis à jour :
  - Dot verte uniquement si **extension activée** + **mot de passe défini**.
- 🔁 **Rafraîchissement automatique** du statut dans le popup après :
  - Sauvegarde / effacement du mot de passe.
  - Modification de la whitelist.
- 🌍 I18N améliorée dans le popup (`popup.js`) :
  - Tous les textes principaux (labels, boutons, aides) pilotés par une table de traduction FR/EN.

---

### 🔧 Modifié

#### Modèle de stockage du mot de passe

- 🧊 Ancien modèle : obfuscation XOR + Base64 dans `browser.storage.local`.
- 🔐 Nouveau modèle : **chiffrement fort** AES‑GCM avec clé maîtresse non extractible.
- 🔄 Le mot de passe n’est plus “obfusqué” mais **réellement chiffré** côté extension.

#### Architecture crypto

- ♻️ Déplacement de la logique PBKDF2 + AES‑GCM :
  - Du `content-script` vers le `background.js`.
- 🧩 Le **content-script** ne manipule plus jamais le mot de passe en clair :
  - Il envoie uniquement du texte à chiffrer / des blocs à déchiffrer au background.

#### Comportement du content-script

- ⚙️ Chargement des paramètres :
  - `loadSettingsRemote()` interroge désormais uniquement le background (`GET_SETTINGS`).
- 🕒 Amélioration du **throttling** du `MutationObserver` :
  - Intervalle `THROTTLE_MS = 200` ms pour éviter les scans trop fréquents sur les pages dynamiques.
- 🔍 Détection des zones éditables unifiée dans `isEditableNode()` (inputs, textarea, contentEditable).

#### Documentation & texte

- 📚 Mise à jour de la description de l’extension :
  - Explication claire du nouveau modèle de sécurité (clé maîtresse, IndexedDB, AES‑GCM).
  - Clarification du **modèle de menace** (ce que l’extension protège / ne protège pas).
- 📝 Ajustement de la description du format de données chiffrées :
  - Toujours au format : `[[Erreur de déchiffrement]]`.

---

### 🗑️ Retiré

- ❌ **Obfuscation XOR** du mot de passe stocké :
  - Remplacée par un chiffrement AES‑GCM avec clé maîtresse non extractible.
  - Le mot de passe n’est plus stocké dans une forme réversible simple.

---

### 🔒 Sécurité

- 🧱 **Renforcement du stockage des secrets** :
  - Master key AES‑GCM marquée `extractable: false`.
  - Stockage dans IndexedDB (store `keys`, clé `masterKey`).
- 🚫 Aucune donnée utilisateur envoyée à un serveur :
  - Les opérations de chiffrement/déchiffrement restent **100 % locales**.
- 🧪 Gestion robuste des erreurs de déchiffrement :
  - En cas d’échec, retour d’un message clair `[[Decryption Error]]` sans fuite d’info.

---

## [1.0.0] - 2024-12-01

### 🎉 Première version publique

Version initiale de Crypt3TR avec toutes les fonctionnalités de base.

### ✨ Ajouté

#### Cryptographie
- 🔐 Implémentation du chiffrement **AES-256-GCM** avec authentification
- 🔑 Dérivation de clé via **PBKDF2** (100 000 itérations, SHA-256)
- 🎲 Génération aléatoire de **salt** (128 bits) et **IV** (96 bits)
- 📦 Format de données : `[[crypt3tr]]<base64>[[/crypt3tr]]`

#### Interface utilisateur
- 🖱️ Menu contextuel bilingue (FR/EN) avec icônes dédiées
  - "Chiffrement du message" / "Encrypt message"
  - "Déchiffrement du message" / "Decrypt message"
- 🎨 Popup de configuration avec design moderne (dark theme)
- ✅ Indicateur de statut en temps réel :
  - 🔴 Extension désactivée
  - 🟠 Activée mais mot de passe non défini
  - 🟢 Activée et configurée
- 🌍 Détection automatique de la langue (français/anglais)

#### Fonctionnalités de chiffrement
- 🔒 Chiffrement de champs éditables via menu contextuel
  - Support des `<textarea>`
  - Support des `<input>` (text, email, password, url, tel, search)
  - Support des éléments `contentEditable`
- ⚡ Préservation des sauts de ligne dans les `contentEditable` (conversion vers `<br>`)
- 🎭 Support des emojis dans les `contentEditable` (attributs `data-emoji`, `alt`, `aria-label`)

#### Fonctionnalités de déchiffrement
- 🔓 Déchiffrement automatique au chargement de la page
  - Détection des blocs `[[Erreur de déchiffrement]]`
  - Traitement des nœuds texte (inline)
  - Traitement des éléments entiers (Gmail, etc.)
- 🌲 Support du Shadow DOM (webcomponents)
- 👀 MutationObserver pour déchiffrer le contenu ajouté dynamiquement
- 🖱️ Déchiffrement manuel via menu contextuel

#### Sécurité et stockage
- 💾 Stockage local du mot de passe avec obfuscation XOR
  - Clé aléatoire de 32 octets
  - Encodage Base64
- 🛡️ Protection par whitelist de domaines
  - Support des wildcards (`*`)
  - Exemples : `*.*`, `*.google.com`, `*.mail.tuta.com`
- ⚙️ Configuration par défaut sécurisée
  - Whitelist : `*.*` (tous les domaines)
  - Extension activée par défaut
  - Pas de mot de passe pré-rempli

#### Compatibilité
- 🦊 Support de Firefox 60+ (Manifest V2)
- 🌐 Testé sur :
  - Gmail (webmail)
  - Tuta(webmail)

#### Code et architecture
- 📄 Architecture modulaire :
  - `background.js` : Gestion des menus contextuels
  - `popup.js` : Interface de configuration
  - `content-script.js` : Injection et traitement des pages
- 🧹 Code propre et commenté (français)
- 🔄 Gestion d'erreurs robuste (try/catch)
- 🚀 Performance optimisée (regex compilées, cache des settings)

### 🔧 Technique

#### Paramètres de sécurité
```javascript
PBKDF2_ITERATIONS = 100000
PBKDF2_HASH = "SHA-256"
KEY_LENGTH_BITS = 256
AES_ALGO = "AES-GCM"
```

#### Format des données
```
Structure : salt(16) || iv(12) || ciphertext(variable)
Encodage : Base64
Marqueurs : [[crypt3tr]]...[/crypt3tr]]
```

#### Permissions
- `storage` : Stockage local des paramètres
- `menus` / `contextMenus` : Menu contextuel
- `<all_urls>` : Injection sur tous les sites (respecte la whitelist)

### 📚 Documentation
- ✅ README complet avec :
  - Description détaillée du projet
  - Exemple concret d'utilisation (Gmail)
  - Comparaison avec PGP
  - Instructions d'installation
  - Guide de configuration
  - Section sécurité
  - FAQ exhaustive
- ✅ CHANGELOG initial
- ✅ LICENSE (Apache 2.0)

### 🎯 Limitations connues

- ⚠️ Un seul mot de passe global (pas de multi-mots de passe par contact)
- ⚠️ Pas de chiffrement de pièces jointes

Ces limitations pourront être adressées dans les versions futures selon les retours de la communauté.

---

## Format du changelog

### Types de changements

- **Ajouté** (`✨ Ajouté`) : Nouvelles fonctionnalités
- **Modifié** (`🔧 Modifié`) : Changements dans les fonctionnalités existantes
- **Déprécié** (`⚠️ Déprécié`) : Fonctionnalités qui seront retirées
- **Retiré** (`🗑️ Retiré`) : Fonctionnalités retirées
- **Corrigé** (`🐛 Corrigé`) : Corrections de bugs
- **Sécurité** (`🔒 Sécurité`) : Corrections de vulnérabilités

### Numérotation des versions

**Crypt3TR** suit le [Semantic Versioning](https://semver.org/lang/fr/) :

- **MAJOR** (X.0.0) : Changements incompatibles avec les versions précédentes
- **MINOR** (0.X.0) : Nouvelles fonctionnalités compatibles
- **PATCH** (0.0.X) : Corrections de bugs compatibles

---

<div align="center">

**Merci d'utiliser Crypt3TR !** 🔐

[Retour au README](README.md) • [GitHub](https://github.com/TBDwarf/Crypt3TR) • [Issues](https://github.com/TBDwarf/Crypt3TR/issues)

</div>
