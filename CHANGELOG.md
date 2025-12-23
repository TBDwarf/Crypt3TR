# 📝 Changelog

Tous les changements notables de **Crypt3TR** seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.3.0] - 2025-12-23

### ✨ Ajouté

#### Nouvel éditeur sécurisé

- 🎨 Remplacement de l’ancien éditeur minimal (simple fenêtre texte + Annuler / Envoyer) par un **éditeur dédié** :
  - Interface modernisée (thème clair/sombre, bords arrondis, meilleure lisibilité).
  - Mise en page optimisée pour une utilisation fréquente dans les chats / webmails.
- 😀 **Sélecteur d’emojis intégré** :
  - Bouton emoji dans la barre d’outils de l’éditeur.
  - Panneau d’emojis avec **recherche** par mots-clés.
  - Insertion directe des emojis dans le texte avant chiffrement, sans passer par la page.

---

### 🔧 Modifié

#### Whitelist de domaines par défaut

- 🌐 Changement de la configuration **par défaut** de la whitelist :
  - Ancien comportement : `*.*` (tous les sites) autorisés par défaut.
  - Nouveau comportement : par défaut, Crypt3TR ne fonctionne que sur une liste restreinte de services de messagerie / mail privés :
    - `*.google.com`
    - `*.tuta.com`
    - `*.whatsapp.com`
    - `*.discordapp.com`
    - `*.discord.com`
    - `*.proton.me`
    - `*.protonmail.com`
    - `outlook.live.com`
    - `mail.yahoo.com`
    - `web.telegram.org`
  - L’utilisateur peut toujours :
    - Ajouter / supprimer des motifs ;
    - Étendre à des domaines supplémentaires ;
    - Mettre `*.*` s’il accepte d’ouvrir l’extension à tout le web.
- 🧭 Mise à jour des valeurs par défaut dans :
  - `background.js` (chargement des paramètres, fallback de whitelist).
  - `content-script.js` (cache local des paramètres).
  - `popup.js` (état initial affiché si aucune configuration n’est encore stockée).

#### Texte et documentation intégrée

- 📝 Ajustement des textes d’aide liés aux domaines (`lang.js`) :
  - Les messages ne disent plus que `*.*` est la valeur par défaut.
  - `*.*` est présenté comme **option avancée** pour autoriser tous les sites.
  - Explication plus claire du fonctionnement par motifs (`*.example.com`, etc.).
- 🌍 L’éditeur bénéficie aussi de l’I18N existante :
  - Placeholder, boutons, messages d’erreur adaptés en FR/EN.
  - Libellés de recherche d’emojis traduits.

---

### 🐛 Corrigé

- 🧹 Nettoyage de comportements résiduels où le texte en clair pouvait transiter inutilement par la page avant chiffrement.

---

### 🔒 Sécurité

- 🛡️ Durcissement des échanges internes via `postMessage` entre :
  - le **content-script** injecté dans la page ;
  - les **iframes d’extension** (viewer et éditeur).
- 🔍 Vérifications supplémentaires ajoutées côté `content-script` :
  - Contrôle strict de `event.origin` : seuls les messages provenant d’une origine `moz-extension://` sont traités.
  - Vérification de la **fenêtre source** (`event.source`) contre les iframes internes connues (`crypt3trViewers`, `crypt3trEditorIframes`).
- 🔐 Renforcement global du modèle :
  - Le texte en clair reste confiné dans le contexte extension (viewer/editor) ;  
    le site ne voit que :
    - le **texte chiffré** inséré dans les champs ;
    - ou le rendu déchiffré dans des iframes `moz-extension://` inaccessibles à son JavaScript.
  - Réduction de la surface d’attaque en limitant par défaut l’extension à quelques services de messagerie ciblés plutôt qu’à tout le web.

---

## [1.2.0] - 2025-12-08

### ✨ Ajouté

#### Isolation DOM / iframe d’extension

- 🧩 Clarification et amélioration de l’**isolation entre le DOM de la page et l’extension** :
  - Mise en avant du fait que le traitement sensible (mot de passe, dérivation de clé, chiffrement/déchiffrement) se fait dans le **contexte de l’extension** (background / iframe d’extension), et non dans la page.
  - Documentation de l’utilisation d’une **iframe d’extension isolée** (`moz-extension://…`) pour certaines opérations d’UI/sécurité.
- 📖 Nouveau sous-chapitre dans le README :
  - `Isolation via iframe d’extension` dans la section **Sécurité**.
  - Explication du fait que le **JavaScript de la page** n’a pas accès aux variables internes de l’extension.

#### Comportement DOM et iframes

- 🧱 Documentation plus précise sur le traitement :
  - des champs à l’intérieur d’**iframes** dont le domaine est autorisé dans la whitelist ;
  - du **Shadow DOM** et des webcomponents modernes.
- 🔍 Ajout dans le README d’une mention explicite :
  - Support des champs texte dans les iframes (si le domaine de l’iframe est autorisé).
  - Rappel que, dès qu’un texte est réinjecté en clair dans le DOM (page ou iframe), **le site peut techniquement le lire**.

---

### 🔧 Modifié

#### Modèle de menace & explications sécurité

- 📚 Mise à jour de la section **Modèle de menace & limites** dans le README :
  - Clarification de ce qui est protégé par l’isolation d’extension (background / iframe d’extension).
  - Reformulation pour insister sur la séparation entre :
    - le **contexte de la page** (DOM, JavaScript du site) ;
    - le **contexte de l’extension** (background, iframe d’extension, WebCrypto).
- 💬 Reformulation légère du paragraphe indiquant que :
  - le **content-script** ne voit jamais le mot de passe en clair ;
  - tout le secret (mot de passe, master key) reste dans le **contexte de l’extension**, jamais dans le DOM de la page.

#### Documentation technique

- 📝 Ajout d’une phrase explicite dans la documentation :
  - Les opérations sensibles (mot de passe, dérivation de clé, chiffrement/déchiffrement) restent dans le **contexte isolé de l’extension** ; le DOM de la page ne voit que le résultat final quand l’utilisateur choisit d’afficher le texte en clair.
- 🧠 Mise en cohérence des sections expliquant le rôle du `background.js`, du content-script et de l’iframe d’extension.

---

### 🐛 Corrigé

#### Incohérences de format de blocs chiffrés dans la doc

- 🐞 Correction des références documentaires erronées au format :
  - `[[Erreur de déchiffrement]]` remplacé par le format réel :  
    `[[crypt3tr]]...[[/crypt3tr]]`
- 📚 Harmonisation du README et du CHANGELOG pour :
  - la description du format de données chiffrées ;
  - les exemples de messages chiffrés/déchiffrés ;
  - les mentions dans le modèle de menace.

---

### 🔒 Sécurité

- 🧱 Mise en avant de l’**isolation entre page et extension** dans la doc :
  - Rappel que le site ne peut pas “lire une variable JS” pour récupérer le mot de passe / clé maîtresse, celles-ci ne vivant que dans le contexte de l’extension.
- 🛡️ Clarification de la limite :
  - Une fois qu’un message est déchiffré et inséré en clair dans le DOM (page ou iframe autorisée), il devient lisible par le JavaScript de ce site comme n’importe quel autre contenu.

---

## [1.1.0] - 2025-12-05

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

## [1.0.0] - 2025-12-01

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
