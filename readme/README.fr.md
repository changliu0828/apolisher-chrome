<p align="center">
  <img src="../public/icons/icon-raw.png" alt="APolish Logo" width="400">
</p>

<h1 align="center">APolish</h1>

<p align="center">
  <strong>Polissez votre texte avec l'IA</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.8.0-blue" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/chrome-extension-red" alt="Chrome">
  <img src="https://img.shields.io/badge/typescript-5.x-blue" alt="TypeScript">
</p>

<p align="center">
  <a href="../README.md">English</a> |
  <a href="README.zh-CN.md">简体中文</a> |
  <a href="README.zh-TW.md">繁體中文</a> |
  <a href="README.ja.md">日本語</a> |
  <a href="README.es.md">Español</a> |
  <a href="README.pt.md">Português</a> |
  <strong>Français</strong> |
  <a href="README.de.md">Deutsch</a> |
  <a href="README.ru.md">Русский</a> |
  <a href="README.hi.md">हिन्दी</a>
</p>

---

Une extension Chrome axée sur la confidentialité qui polit le texte sur n'importe quelle page web en utilisant l'IA. Sélectionnez du texte, cliquez sur le bouton de polissage et obtenez des suggestions améliorées par l'IA avec une comparaison visuelle des différences.

## Fonctionnalités

- **Support Multi-Fournisseur IA**: Choisissez entre OpenAI, Claude ou Gemini en utilisant votre propre clé API
- **Polissage de Texte**: Sélectionnez n'importe quel texte et polissez-le avec l'IA
- **Préréglages Multiples**: Prompts standard, professionnel, natif, simplifié ou personnalisé
- **Différences Visuelles**: Visualisez les modifications mises en évidence avec insertions (vert) et suppressions (rouge)
- **Confidentialité d'Abord**: Votre clé API reste locale, aucune collecte de données ni télémétrie
- **Compatibilité Universelle**: Fonctionne sur n'importe quelle page web, y compris Gmail, Google Docs et plus

## Installation

### Depuis le Code Source

1. Cloner le dépôt:
```bash
git clone https://github.com/changliu0828/apolisher-chrome.git
cd apolisher-chrome
```

2. Installer les dépendances:
```bash
npm install
```

3. Construire l'extension:
```bash
npm run build
```

4. Charger dans Chrome:
   - Ouvrir `chrome://extensions`
   - Activer "Mode développeur"
   - Cliquer sur "Charger l'extension non empaquetée"
   - Sélectionner le dossier `dist`

## Utilisation

1. **Configuration**: Choisissez votre fournisseur IA (OpenAI, Claude ou Gemini) et ajoutez votre clé API dans les paramètres de l'extension
2. **Sélectionner**: Surlignez du texte sur n'importe quelle page web
3. **Polir**: Cliquez sur le bouton <img src="../public/icons/icon32.png" width="16" height="16" alt="Icône APolish" style="vertical-align: middle;"> qui apparaît
4. **Réviser**: Visualisez la comparaison des différences dans le modal
5. **Accepter**: Cliquez sur la coche pour appliquer les modifications

## Configuration

Accédez aux paramètres en cliquant sur l'icône de l'extension ou en faisant un clic droit et en sélectionnant "Options":

- **Fournisseur IA**: Choisissez entre OpenAI (GPT-4o Mini), Claude (3.5 Haiku) ou Gemini (2.5 Flash)
- **Clé API**: Votre clé API spécifique au fournisseur (stockée en toute sécurité dans le stockage de synchronisation Chrome)
- **Préréglages de Prompt**: Choisissez entre standard, professionnel, natif, simplifié ou personnalisé
- **Maximum Token**: Contrôlez la longueur de la réponse (100-4000 Token, par défaut: 2000)

## Stack Technologique

- **React** + **TypeScript** - Composants UI
- **Vite** - Système de construction avec @crxjs/vite-plugin
- **Tailwind CSS** - Styles
- **Chrome Extension Manifest V3** - Architecture de l'extension
- **IA Multi-Fournisseur**: OpenAI (GPT-4o Mini), Claude (3.5 Haiku) ou Gemini (2.5 Flash)
- **Shadow DOM** - Isolation des styles pour le script de contenu

## Développement

```bash
# Installer les dépendances
npm install

# Construction de développement (avec HMR)
npm run dev

# Construction de production
npm run build

# Exécuter le linter
npm run lint

# Vérification des types
npm run type-check
```

## Structure du Projet

```
src/
├── background/      # Service worker pour les appels API
├── content/         # Script de contenu et composants UI
├── options/         # Page de configuration
├── prompts/         # Préréglages de prompts
├── services/        # Services IA multi-fournisseur (OpenAI, Claude, Gemini)
├── types/           # Types TypeScript
└── utils/           # Utilitaires
```

## Soutenez ce Projet

Si vous trouvez apolisher-chrome utile, envisagez de parrainer! Votre soutien aide à maintenir ce projet gratuit et open source.

[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-red?style=for-the-badge&logo=github-sponsors)](https://github.com/sponsors/changliu0828)

**Façons de soutenir:**
- ⭐ Donnez une étoile à ce dépôt
- 💖 [Devenez sponsor](https://github.com/sponsors/changliu0828) (à partir de $3/mois)
- 🐛 Signalez des bugs et contribuez avec du code
- 📢 Partagez avec d'autres qui pourraient trouver cela utile

### Sponsors

Merci à tous nos sponsors! 🙏

<!-- sponsors --><!-- sponsors -->

*Devenez le premier sponsor et mettez votre nom ici!*

## Licence

MIT
