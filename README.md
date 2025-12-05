# 🔐 Crypt3TR

<div align="center">

<img width="150" height="150" alt="Crypt3TR" src="https://github.com/user-attachments/assets/0b1919bb-59a2-4484-8916-2944ad6a855b" />

**Chiffrement de texte côté client pour le web — Simple, rapide et transparent**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Firefox](https://img.shields.io/badge/Firefox-Compatible-orange.svg)](https://www.mozilla.org/firefox/)
[![Version](https://img.shields.io/badge/Version-1.1.0-green.svg)](CHANGELOG.md)
[![Crypto](https://img.shields.io/badge/Crypto-AES--256--GCM-red.svg)](#-sécurité)

[Installation](#-installation) • [Utilisation](#-utilisation) • [Exemples](#-exemple-concret--email-gmail) • [Sécurité](#-sécurité) • [FAQ](#-faq)

</div>

---

## 📋 Table des matières

- [Qu'est-ce que Crypt3TR ?](#-quest-ce-que-crypt3tr-)
- [Pourquoi Crypt3TR ?](#-pourquoi-crypt3tr-)
- [Exemple concret : Email Gmail](#-exemple-concret--email-gmail)
- [Comparaison avec PGP](#-comparaison-avec-pgp)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Sécurité](#-sécurité)
- [Compatibilité](#-compatibilité)
- [FAQ](#-faq)
- [Contribution](#-contribution)
- [License](#-license)

---

## 🎯 Qu'est-ce que Crypt3TR ?

**Crypt3TR** est une extension Firefox qui permet de **chiffrer et déchiffrer du texte directement dans votre navigateur**, sur n'importe quel site web.  
Webmail, forum, réseau social, messagerie en ligne, wiki, formulaire… si vous pouvez taper du texte, vous pouvez le chiffrer.

### 🌟 Fonctionnalités principales

- 🔒 **Chiffrement AES‑256‑GCM** avec dérivation de clé PBKDF2 (100 000 itérations)
- ⚡ **Déchiffrement automatique** des messages sur les pages web
- 🖱️ **Menu contextuel** pour chiffrer/déchiffrer en un clic (clic droit)
- 🌐 **Whitelist de domaines** pour activer l'extension uniquement où vous le souhaitez
- 📝 **Support complet** des champs éditables :
  - `<textarea>`
  - `<input>` (text, email, password, url, tel, search)
  - Éléments `contentEditable`
  - Contenus dans certains **Shadow DOM** (webapps modernes)
- 💾 **Stockage local sécurisé du mot de passe** :
  - Mot de passe chiffré avec une **clé maîtresse AES‑GCM non extractible**
- 🌍 **Multilingue** (Français / Anglais)
- 🧩 **100 % local** : aucune collecte de données, aucun serveur, aucun tracking

---

## 💡 Pourquoi Crypt3TR ?

### Le problème

Vous voulez envoyer un message **confidentiel** par email, sur un forum ou une messagerie web, mais :

- Les solutions type **PGP / GPG** sont :
  - 🧩 Complexes à configurer (génération de clés, gestion des clés publiques, etc.)
  - 🧱 Peu intégrées aux webmails et messageries modernes
- Les solutions “sécurisées” côté serveur demandent souvent :
  - Un **compte externe**
  - De **faire confiance** à un service tiers

### La solution Crypt3TR

**Crypt3TR** rend le chiffrement aussi simple que :

1. 📝 Écrivez votre message
2. 🖱️ Clic droit → **“Chiffrement du message”**
3. ✉️ Envoyez !

Le destinataire qui possède **le même mot de passe** et l’extension verra automatiquement le message déchiffré dans son navigateur (sur les domaines autorisés).

---

## 📧 Exemple concret : Email Gmail

### Scénario

Alice veut envoyer un email confidentiel à Bob via Gmail.  
Ils partagent un mot de passe commun : `MonMotDePasseSecret2024`

### Étape par étape

#### 1️⃣ Alice configure Crypt3TR

- Installe l'extension
- Clique sur l'icône Crypt3TR
- Entre le mot de passe : `MonMotDePasseSecret2024`
- Ajoute `*.google.com` à la whitelist (ou garde la configuration par défaut `*.*`)

#### 2️⃣ Alice rédige son email

```
De: alice@example.com
À: bob@example.com
Objet: Réunion confidentielle

Salut Bob,

Le projet secret avance bien. Voici les détails :
- Budget : 50 000 €
- Date de lancement : 15 mars 2025
- Code d'accès serveur : XK9-ZZP-443

On en parle demain ?

Alice
```

#### 3️⃣ Alice chiffre le message

- Clic droit sur la zone de texte du message → **"Chiffrement du message"**
- Le texte devient instantanément :

```
[[crypt3tr]]
5SvIzGYc2z7sg1Q44jBLC9D8BDTgNaEbxR45RNOMUUrm2KV43x8TR6ozNpUC1u5qqG7mzDVr7Fmu8nQ8m+xmwUmYwn2r5uWeuVKeEtcU7MKQMUCSb+Ds3mghIKe1BwfkfiEreNHjT6nkfBsBvzRGe9kwGtfNSbolMQF7eduVQItbLJ9UtLoAiEUMtEC5pAJT232UqxM9ZWAlp0mN86hxJywsBpMCUlnNXaSWQEwMIebZSr8VwLWhpfiflQkRhQmJRpa+gLVx2dgBcTMTIhHkeBzgR8paStwfEyGIbWtDqXBtNnw85m8qv9fYsgJmS1KRU+Jhxq0PNWhzAqjCJqKpW0oh8gElApu81vr/VeCdSJwiGXVDdkcDK0jKtQcx/Jx3UhFx7V7BybvCjdzwXOTc0L8aDQPQ4v+yL6Fbwar7RjRQ
[[/crypt3tr]]
```

#### 4️⃣ Alice envoie l'email

Alice clique sur "Envoyer". Gmail envoie le message chiffré.

#### 5️⃣ Bob reçoit et lit l'email

- Bob ouvre l'email dans Gmail
- **Magie !** Crypt3TR détecte automatiquement le message chiffré
- Le texte `[[crypt3tr]]...[[/crypt3tr]]` est automatiquement déchiffré
- Bob voit le message original en clair :

```
Salut Bob,

Le projet secret avance bien. Voici les détails :
- Budget : 50 000 €
- Date de lancement : 15 mars 2025
- Code d'accès serveur : XK9-ZZP-443

On en parle demain ?

Alice
```

### 🎉 Résultat

✅ **Message confidentiel transmis**  
✅ **Serveur et tiers ne voient que du texte chiffré**  
✅ **Expérience transparente** pour Bob  
✅ **Processus simple et rapide** pour Alice  

---

## 🆚 Comparaison avec PGP

| Critère              | Crypt3TR                                           | PGP/GPG                                      |
|----------------------|----------------------------------------------------|----------------------------------------------|
| **Simplicité**       | ⭐⭐⭐⭐⭐ Aucune config complexe                      | ⭐⭐ Génération & gestion de clés             |
| **Installation**     | ⭐⭐⭐⭐⭐ Extension Firefox                           | ⭐⭐ Logiciel + plugin mail                   |
| **Utilisation**      | ⭐⭐⭐⭐⭐ Clic droit → Chiffrer                       | ⭐⭐⭐ Souvent manuel ou via plugin            |
| **Compatibilité**    | ⭐⭐⭐⭐⭐ Tout site web (webmails, forums, chats)     | ⭐⭐ Principalement email                     |
| **Transparence**     | ⭐⭐⭐⭐⭐ Déchiffrement automatique côté client       | ⭐⭐⭐ Variable selon l’intégration            |
| **Partage de clé**   | ⭐⭐⭐⭐ Mot de passe partagé                         | ⭐⭐⭐⭐⭐ Clés publiques/privées                |
| **Sécurité**         | ⭐⭐⭐⭐ AES‑256‑GCM, mot de passe unique             | ⭐⭐⭐⭐⭐ PKI, signatures, modèles avancés      |

👉 **Crypt3TR est idéal pour :**

- Échanges rapides et confidentiels sur des **webmails**, forums, chats, wikis
- Partage de **codes**, **accès**, **notes sensibles**
- Des usages “quotidiens” où PGP est trop lourd

👉 **PGP reste préférable pour :**

- Signature numérique, non‑répudiation
- Environnements réglementés (entreprises, administrations)
- Communications avec des inconnus sans mot de passe partagé

---

## 🚀 Installation

### Firefox (Add-on officiel)

L’extension est disponible sur le **store officiel Firefox** :

➡️ **Page AMO :** <https://addons.mozilla.org/fr/firefox/addon/crypt3tr/>

1. Ouvrez le lien ci-dessus dans Firefox
2. Cliquez sur **“Ajouter à Firefox”**
3. Validez l’installation
4. L’icône Crypt3TR apparaît dans la barre d’outils

### Installation manuelle (développement)

Pour tester une version en développement ou modifier le code :

1. **Cloner le dépôt**

```bash
git clone https://github.com/TBDwarf/Crypt3TR.git
cd Crypt3TR
```

2. **Ouvrir Firefox**

- Tapez `about:debugging` dans la barre d'adresse
- Cliquez sur **“Ce Firefox”** (This Firefox)

3. **Charger l'extension en local**

- Cliquez sur **“Charger un module complémentaire temporaire”**
- Sélectionnez le fichier `manifest.json` dans le dossier `Crypt3TR`

4. ✅ L’icône Crypt3TR apparaît dans la barre d’outils

---

## ⚙️ Configuration

### Première utilisation

1. **Cliquez sur l'icône Crypt3TR** dans la barre d'outils
2. Vérifiez que l’extension est **activée**
3. **Définissez votre mot de passe** de chiffrement
   - Il sera utilisé pour chiffrer/déchiffrer tous vos messages
   - 🔐 Choisissez un mot de passe fort et unique
   - ⚠️ Partagez-le avec vos correspondants via un **canal sécurisé** (Signal, IRL, etc.)
4. **Configurez la whitelist** (si besoin)
   - Par défaut : `*.*` (tous les sites)
   - Vous pouvez restreindre à certains domaines :
     ```text
     *.google.com
     *.tuta.com
     *.protonmail.com
     *.reddit.com
     ```

### Paramètres

| Paramètre            | Description                                   | Valeur par défaut |
|----------------------|-----------------------------------------------|-------------------|
| **Extension activée**| Active/désactive Crypt3TR                     | ✅ Activée        |
| **Mot de passe**     | Mot de passe de chiffrement                   | (vide)            |
| **Whitelist**        | Domaines autorisés (wildcards supportés)      | `*.*`             |

L’indicateur dans le popup affiche :

- 🔴 Extension désactivée
- 🟢 Activée et mot de passe configuré

---

## 📖 Utilisation

### Chiffrer un message

#### Méthode 1 : Menu contextuel (Recommandé)
1. Rédigez votre message dans un champ de texte (email, forum, etc.)
2. **Sélectionnez le texte** (optionnel : fonctionne aussi sur le champ actif)
3. **Clic droit** → **"Chiffrement du message"**
4. Votre texte est remplacé par `[[crypt3tr]]...[[/crypt3tr]]`

#### Méthode 2 : Champs éditables
1. Placez votre curseur dans un champ de texte contenant votre message
2. **Clic droit** (sans sélectionner) → **"Chiffrement du message"**
3. Le contenu du champ est chiffré

### Déchiffrer un message

#### Déchiffrement automatique (Par défaut)
- Les messages `[[crypt3tr]]...[[/crypt3tr]]` sont **automatiquement déchiffrés** lors du chargement de la page
- Fonctionne sur Gmail, forums, réseaux sociaux, etc.

#### Déchiffrement manuel
1. **Clic droit** dans un champ contenant un message chiffré
2. **"Déchiffrement du message"**

---

## 🔒 Sécurité

### Cryptographie

- **Algorithme** : AES‑256‑GCM (Galois/Counter Mode)
- **Dérivation de clé** : PBKDF2 avec SHA‑256
- **Itérations PBKDF2** : 100 000
- **Salt** : 128 bits aléatoires (16 octets)
- **IV (Initialization Vector)** : 96 bits aléatoires (12 octets)
- **Longueur de clé** : 256 bits

### Structure des données chiffrées

```
[[crypt3tr]]<base64(salt || iv || ciphertext)>[[/crypt3tr]]
```

- **salt (16 octets)** : utilisé pour la dérivation de clé PBKDF2  
- **iv (12 octets)** : vecteur d’initialisation pour AES‑GCM  
- **ciphertext+tag** : texte chiffré + tag d’authentification GCM

---

### Stockage du mot de passe (v1.1)

Le mot de passe **n’est plus stocké en clair ni simplement obfusqué**.  
Il est désormais chiffré de manière forte :

- 🧩 **Clé maîtresse AES‑GCM non extractible**
  - Générée via WebCrypto dans `background.js`
  - `extractable: false` → les bits de la clé ne peuvent pas être exportés
  - Stockée dans **IndexedDB** (`crypt3tr-keystore`, store `keys`, clé `masterKey`)

- 🔐 **Chiffrement du mot de passe utilisateur**
  - Lors de la sauvegarde du mot de passe :
    - génération d’un IV aléatoire (96 bits),
    - chiffrement du mot de passe avec la clé maîtresse (AES‑GCM),
    - concaténation `iv || ciphertext`, puis encodage Base64,
    - stockage dans `browser.storage.local` (`encryptedPassword`).

- 🔓 **Utilisation pour chiffrer/déchiffrer les messages**
  - Lors d’un `ENCRYPT_TEXT` / `DECRYPT_BLOCK` :
    - le background récupère `encryptedPassword`,
    - le déchiffre avec la clé maîtresse,
    - dérive une clé de message avec PBKDF2 (salt inclus dans le bloc),
    - chiffre ou déchiffre le texte demandé.

- 🧠 Le **content-script ne voit jamais le mot de passe en clair** :
  - Il envoie uniquement :
    - du texte brut à chiffrer (`ENCRYPT_TEXT`),
    - des blocs encodés Base64 à déchiffrer (`DECRYPT_BLOCK`),
  - tout le secret (mot de passe, master key) reste dans le contexte du background.

---

### Modèle de menace & limites

Crypt3TR **protège principalement** contre :

- La lecture directe de vos messages par le **serveur** (webmail, forum, etc.) :
  - le serveur stocke le bloc chiffré `[[Erreur de déchiffrement]]`.
- La récupération simple de votre **mot de passe** à partir du `browser.storage.local` :
  - le mot de passe est chiffré avec une clé maîtresse non extractible.

Crypt3TR **ne protège pas** contre :

- Les **keyloggers**, malwares ou un système d’exploitation déjà compromis.
- Les **autres extensions malveillantes** capables de lire ou modifier le DOM.
- Un **site web malveillant** que vous auriez ajouté dans la whitelist :
  - dès qu’un message est déchiffré et inséré dans la page, ce site peut techniquement lire le texte comme n’importe quel autre contenu.
- Les compromissions locales de votre profil Firefox ou des accès physiques à votre machine.
- Les besoins avancés de PGP :
  - signature numérique, non‑répudiation,
  - gestion fine d’identités, modèles de confiance complexes.

---

### Bonnes pratiques

✅ **À faire :**

- Utiliser un **mot de passe fort et unique** :
  - au moins 20 caractères, mélange de lettres, chiffres et symboles.
- Partager ce mot de passe via un **canal sécurisé** :
  - Signal, rencontre physique, téléphone chiffré, etc.
- Restreindre la **whitelist** aux domaines réellement utilisés :
  - éviter de laisser `*.*` si vous n’en avez pas besoin partout.
- Garder votre système et votre navigateur **à jour**.

❌ **À éviter :**

- ❌ Ne pas envoyer le mot de passe par email non chiffré.
- ❌ Ne pas réutiliser un mot de passe déjà utilisé pour vos comptes (email, banque, etc.).
- ❌ Ne pas utiliser Crypt3TR sur des **machines publiques** ou non fiables.
- ❌ Ne pas stocker votre mot de passe dans un fichier texte non chiffré.

---

### Limitations connues

⚠️ **Crypt3TR ne protège pas contre :**

- Les enregistreurs de frappes (keyloggers) et malwares installés sur la machine.
- Les attaques sur le navigateur lui‑même (failles, profil compromis).
- Les autres extensions ayant accès au contenu des pages.
- L’analyse de trafic réseau (métadonnées, taille des messages).
- Les attaques par force brute sur un mot de passe faible.

Pour des besoins de **signature, non‑répudiation ou conformité réglementaire stricte**, préférez des solutions basées sur des **clés publiques/privées** (PGP, S/MIME, etc.).
---

## 🌐 Compatibilité

### Navigateurs

| Navigateur | Version | Support |
|------------|---------|---------|
| **Firefox** | 60+ | ✅ Complet |

### Sites testés

| Site | Type | Compatibilité |
|------|------|---------------|
| **Gmail** | Webmail | ✅ Complet |
| **Discord** | Messagerie | ✅ Complet |
| **Whatsapp** | Messagerie | ✅ Complet |

### Types de champs supportés

- ✅ `<textarea>`
- ✅ `<input type="text">` et variantes (email, url, search, etc.)
- ✅ Éléments `contentEditable`
- ✅ Shadow DOM (webcomponents)

---

## ❓ FAQ

<details>
<summary><strong>Q1 : Mes correspondants doivent-ils installer l'extension ?</strong></summary>

**Oui**, pour déchiffrer automatiquement vos messages, vos correspondants doivent :
1. Installer Crypt3TR
2. Configurer le **même mot de passe** que vous

Sinon, ils verront le texte chiffré `[[crypt3tr]]...[[/crypt3tr]]` qu'ils peuvent déchiffrer manuellement avec un outil compatible.
</details>

<details>
<summary><strong>Q2 : Puis-je utiliser des mots de passe différents avec différentes personnes ?</strong></summary>

**Non**, actuellement Crypt3TR ne supporte qu'un seul mot de passe global. Tous vos correspondants partageront le même mot de passe.

</details>

<details>
<summary><strong>Q3 : Est-ce que Gmail/Google peut lire mes messages ?</strong></summary>

**Non**. Le chiffrement se fait **côté client** (dans votre navigateur) avant l'envoi. Gmail ne stocke que le texte chiffré `[[crypt3tr]]...[[/crypt3tr]]`.

⚠️ **Attention :** Gmail peut toujours voir :
- Les métadonnées (expéditeur, destinataire, date, sujet)
- La taille approximative du message
- Les pièces jointes non chiffrées
</details>

<details>
<summary><strong>Q4 : Que se passe-t-il si j'oublie mon mot de passe ?</strong></summary>

🔴 **Il n'y a aucun moyen de récupérer un mot de passe oublié.**

- Vos anciens messages chiffrés seront **définitivement illisibles**
- Vous devrez configurer un nouveau mot de passe et le partager avec vos correspondants
</details>

<details>
<summary><strong>Q5 : Puis-je chiffrer des pièces jointes ?</strong></summary>

**Non**, Crypt3TR ne chiffre que le **texte**. Les pièces jointes restent en clair.

📌 **Solution :** Utilisez un outil de chiffrement de fichiers (7-Zip avec AES-256, VeraCrypt, etc.) avant de les joindre.
</details>

<details>
<summary><strong>Q6 : L'extension fonctionne-t-elle hors ligne ?</strong></summary>

**Oui**, le chiffrement/déchiffrement se fait **entièrement localement** dans votre navigateur. Aucune connexion Internet n'est requise pour ces opérations.
</details>

<details>
<summary><strong>Q7 : Puis-je voir le code source ?</strong></summary>

**Oui !** Crypt3TR est **100% open source** sous licence Apache 2.0. Le code est disponible sur GitHub : [https://github.com/TBDwarf/Crypt3TR](https://github.com/TBDwarf/Crypt3TR)
</details>

---

## 🤝 Contribution

Les contributions sont les bienvenues ! 🎉

### Idées de contributions

- 🐛 Correction de bugs
- ✨ Nouvelles fonctionnalités (support multi-mots de passe, etc.)
- 📝 Amélioration de la documentation
- 🔬 Tests et validation sur d'autres sites web

### Développement

```bash
# Cloner le dépôt
git clone https://github.com/TBDwarf/Crypt3TR.git
cd Crypt3TR

# Charger l'extension en mode développement
# Firefox: about:debugging > Charger un module temporaire > manifest.json
```

---

## 📜 License

Ce projet est distribué sous la **Apache License, Version 2.0**.

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

```
Copyright 2025 TBDwarf

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

## 📞 Contact

- **GitHub Issues :** [https://github.com/TBDwarf/Crypt3TR/issues](https://github.com/TBDwarf/Crypt3TR/issues)
- **Discussions :** [https://github.com/TBDwarf/Crypt3TR/discussions](https://github.com/TBDwarf/Crypt3TR/discussions)

---

<div align="center">

**Fait avec 🔐 et ❤️ en France**

⭐ Si Crypt3TR vous est utile, pensez à **mettre une étoile** sur GitHub ! ⭐

</div>
