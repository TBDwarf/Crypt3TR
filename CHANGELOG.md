# 📝 Changelog

Tous les changements notables de **Crypt3TR** seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

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
  - Détection des blocs `[[crypt3tr]]...[[/crypt3tr]]`
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
- ⚠️ Pas de signature numérique (authentification)
- ⚠️ Obfuscation du mot de passe (non chiffrement fort)

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
