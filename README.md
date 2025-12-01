# 🔐 Crypt3TR

<div align="center">

<img width="150" height="150" alt="Crypt3TR" src="https://github.com/user-attachments/assets/0b1919bb-59a2-4484-8916-2944ad6a855b" />


**Chiffrement de texte côté client pour le web — Simple, rapide et transparent**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Firefox](https://img.shields.io/badge/Firefox-Compatible-orange.svg)](https://www.mozilla.org/firefox/)
[![Version](https://img.shields.io/badge/Version-1.0.0-green.svg)](CHANGELOG.md)
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
- [Utilisation](#-utilisation)
- [Sécurité](#-sécurité)
- [Compatibilité](#-compatibilité)
- [FAQ](#-faq)
- [Contribution](#-contribution)
- [License](#-license)

---

## 🎯 Qu'est-ce que Crypt3TR ?

**Crypt3TR** est une extension Firefox qui permet de **chiffrer et déchiffrer du texte directement dans votre navigateur**, sur n'importe quel site web. Que ce soit sur Gmail, un forum, un réseau social ou une messagerie, Crypt3TR protège vos messages de manière transparente.

### 🌟 Fonctionnalités principales

- 🔒 **Chiffrement AES-256-GCM** avec dérivation de clé PBKDF2 (100 000 itérations)
- ⚡ **Déchiffrement automatique** des messages sur les pages web
- 🖱️ **Menu contextuel** pour chiffrer/déchiffrer en un clic
- 🌐 **Whitelist de domaines** pour activer l'extension uniquement où vous le souhaitez
- 📝 **Support complet** des champs éditables (textarea, input, contentEditable)
- 🎭 **Shadow DOM** pris en charge pour les webapps modernes
- 💾 **Stockage local sécurisé** du mot de passe (obfusqué)
- 🌍 **Multilingue** (Français, Anglais)

---

## 💡 Pourquoi Crypt3TR ?

### Le problème

Vous voulez envoyer un message confidentiel par email, sur un forum ou via une messagerie web ? Les solutions existantes sont souvent :
- **Complexes** à mettre en place (PGP, GPG)
- **Lourdes** à utiliser (génération de clés, échange de clés publiques, etc.)
- **Incompatibles** avec les webmails et messageries instantanées
- **Peu pratiques** pour des échanges rapides

### La solution Crypt3TR

**Crypt3TR** rend le chiffrement aussi simple que :
1. 📝 Écrivez votre message
2. 🖱️ Clic droit → "Chiffrement du message"
3. ✉️ Envoyez !

Le destinataire qui possède le même mot de passe verra automatiquement le message déchiffré dans son navigateur.

---

## 📧 Exemple concret : Email Gmail

### Scénario

Alice veut envoyer un email confidentiel à Bob via Gmail. Ils partagent un mot de passe commun : `MonMotDePasseSecret2024`

### Étape par étape

#### 1️⃣ Alice configure Crypt3TR

- Installe l'extension
- Clique sur l'icône Crypt3TR
- Entre le mot de passe : `MonMotDePasseSecret2024`
- Ajoute `*.google.com` à la whitelist ou garde le parametrage par défaut

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
✅ **Aucun tiers ne peut le lire** (même Gmail)  
✅ **Processus transparent** pour Bob  
✅ **Simple et rapide** pour Alice  

---

## 🆚 Comparaison avec PGP

| Critère | Crypt3TR | PGP/GPG |
|---------|----------|---------|
| **Simplicité** | ⭐⭐⭐⭐⭐ Aucune configuration complexe | ⭐⭐ Génération de clés, échange de clés publiques |
| **Installation** | ⭐⭐⭐⭐⭐ Extension Firefox en 1 clic | ⭐⭐ Logiciel + plugin email + configuration |
| **Utilisation** | ⭐⭐⭐⭐⭐ Clic droit → Chiffrer | ⭐⭐⭐ Commandes CLI ou plugin |
| **Compatibilité** | ⭐⭐⭐⭐⭐ Tout site web (Gmail, forums, etc.) | ⭐⭐ Principalement emails |
| **Transparence** | ⭐⭐⭐⭐⭐ Déchiffrement automatique | ⭐⭐⭐ Déchiffrement manuel |
| **Partage de clés** | ⭐⭐⭐⭐ Mot de passe partagé | ⭐⭐⭐⭐⭐ Clés publiques/privées |
| **Sécurité** | ⭐⭐⭐⭐ AES-256-GCM | ⭐⭐⭐⭐⭐ RSA + AES |

### 🎯 Quand utiliser Crypt3TR ?

**Crypt3TR est idéal pour :**
- ✅ Échanger rapidement des messages confidentiels
- ✅ Protéger vos conversations sur les webmails
- ✅ Chiffrer des notes sur des forums ou wikis
- ✅ Communiquer de manière sécurisée sur des messageries web
- ✅ Partager des informations sensibles avec des collègues

**PGP est préférable pour :**
- ✅ Authentification forte de l'identité (signature numérique)
- ✅ Échange avec des personnes inconnues (pas de mot de passe partagé)
- ✅ Conformité réglementaire stricte
- ✅ Protection contre la compromission d'un mot de passe unique

---

## 🚀 Installation

### Firefox (Recommandé)

#### Option 1 : Firefox Add-ons (À venir)
```
🔜 Bientôt disponible sur addons.mozilla.org
```

#### Option 2 : Installation manuelle (Développement)

1. **Clonez le dépôt**
   ```bash
   git clone https://github.com/TBDwarf/Crypt3TR.git
   cd Crypt3TR
   ```

2. **Ouvrez Firefox**
   - Tapez `about:debugging` dans la barre d'adresse
   - Cliquez sur "Ce Firefox" (This Firefox)

3. **Chargez l'extension**
   - Cliquez sur "Charger un module complémentaire temporaire"
   - Sélectionnez le fichier `manifest.json` dans le dossier Crypt3TR

4. **C'est fait !** 🎉

---

## ⚙️ Configuration

### Première utilisation

1. **Cliquez sur l'icône Crypt3TR** dans la barre d'outils Firefox
2. **Activez l'extension** (cochée par défaut)
3. **Définissez votre mot de passe** de chiffrement
   - Ce mot de passe sera utilisé pour chiffrer/déchiffrer vos messages
   - ⚠️ **Important :** Partagez ce mot de passe avec vos correspondants via un canal sécurisé (Signal, rencontre physique, etc.)
4. **Configurez la whitelist** (optionnel)
   - Par défaut : `*.*` (tous les sites)
   - Exemples :
     ```
     *.google.com
     *.tuta.com
     *.protonmail.com
     *.reddit.com
     ```

### Paramètres

| Paramètre | Description | Valeur par défaut |
|-----------|-------------|-------------------|
| **Extension activée** | Active/désactive Crypt3TR | ✅ Activée |
| **Mot de passe** | Mot de passe de chiffrement | (vide) |
| **Whitelist** | Domaines autorisés | `*.*` (tous) |

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

- **Algorithm** : AES-256-GCM (Galois/Counter Mode)
- **Dérivation de clé** : PBKDF2 avec SHA-256
- **Itérations PBKDF2** : 100 000
- **Salt** : 128 bits aléatoires (16 octets)
- **IV (Initialization Vector)** : 96 bits aléatoires (12 octets)
- **Longueur de clé** : 256 bits

### Structure des données chiffrées

```
[[crypt3tr]]<base64(salt || iv || ciphertext)>[[/crypt3tr]]
```

- **Salt** (16 octets) : Utilisé pour la dérivation de clé PBKDF2
- **IV** (12 octets) : Vecteur d'initialisation pour AES-GCM
- **Ciphertext** (variable) : Texte chiffré + tag d'authentification GCM

### Stockage du mot de passe

Le mot de passe est **stocké localement** dans le navigateur :
- **Obfuscation** : XOR avec une clé aléatoire (32 octets)
- **Encodage** : Base64
- **Localisation** : `browser.storage.local`

⚠️ **Important :** L'obfuscation n'est **pas un chiffrement fort**. Elle protège contre une lecture passive du storage, mais pas contre un attaquant ayant accès au code de l'extension. Le mot de passe reste dans la mémoire du navigateur tant que l'extension est active.

### Bonnes pratiques

✅ **À faire :**
- Utilisez un **mot de passe fort et unique** (20+ caractères, alphanumérique + symboles)
- **Partagez le mot de passe** via un canal sécurisé (Signal, rencontre physique etc.)
- **Limitez la whitelist** aux domaines où vous utilisez le chiffrement

❌ **À éviter :**
- ❌ Ne partagez **jamais** le mot de passe par email non chiffré
- ❌ N'utilisez **pas** le même mot de passe que vos comptes en ligne
- ❌ N'utilisez **pas** Crypt3TR sur des ordinateurs publics ou non sécurisés
- ❌ Ne stockez **pas** le mot de passe dans un fichier texte non chiffré

### Limitations connues

⚠️ **Crypt3TR ne protège pas contre :**
- Les keyloggers ou malwares sur votre système
- Les attaques par force brute si votre mot de passe est faible
- La compromission de votre session Firefox (XSS, extensions malveillantes)
- L'analyse de trafic réseau (métadonnées, taille des messages)

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
| **Tuta** | Webmail | ✅ Complet |

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
