# 🍽️ Planificateur de Repas pour Notion

Solution complète pour planifier vos repas et gérer vos listes de courses directement dans Notion avec une interface simplifiée.

## 🎯 Fonctionnalités

- **Widget intégré Notion** : Interface simple pour planifier en quelques clics
- **Templates de semaines** : Modèles pré-configurés pour répéter facilement
- **Génération automatique** : Liste de courses créée automatiquement
- **Scripts d'automatisation** : Actions rapides via l'API Notion

## 📁 Structure du Projet

```
notion-meal-planner/
├── widget/                 # Widget HTML/JavaScript
│   ├── index.html         # Interface principale
│   ├── styles.css         # Styles du widget
│   └── script.js          # Logique d'interaction
├── scripts/               # Scripts d'automatisation
│   ├── notion-api.js      # Interactions avec l'API Notion
│   ├── meal-planner.js    # Logique de planification
│   └── shopping-list.js   # Génération de listes
├── templates/             # Templates Notion
│   ├── semaine-template.md
│   ├── vues-optimisees.md
│   └── formules-utiles.md
└── docs/                  # Documentation
    ├── installation.md
    └── utilisation.md
```

## 🚀 Installation Rapide

1. **Copiez le widget** dans un bloc Embed de votre page Notion
2. **Importez les templates** dans vos bases de données
3. **Configurez votre clé API** Notion
4. **Commencez à planifier** !

## 🔧 Configuration

Vos bases de données Notion existantes :
- **Ingrédients** : `${ingredients_id}`
- **Recettes** : `${recettes_id}`
- **Semaines** : `${semaines_id}`
- **Repas hebdomadaires** : `${repas_id}`
- **Liste de courses** : `${courses_id}`

## 📖 Utilisation

1. **Planification rapide** : Sélectionnez vos recettes par glisser-déposer
2. **Génération automatique** : La liste de courses se remplit automatiquement
3. **Templates intelligents** : Dupliquez vos semaines favorites
4. **Vue d'ensemble** : Consultez votre planning hebdomadaire en un coup d'œil

---
*Créé avec ❤️ pour simplifier votre planification de repas*
