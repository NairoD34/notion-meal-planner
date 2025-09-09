# ⚡ Démarrage Ultra-Rapide

Votre planificateur de repas Notion est prêt ! Suivez ces 3 étapes pour commencer immédiatement.

## 🎯 Configuration Express (5 minutes)

### Étape 1 : Récupérez vos IDs de bases ✅
Vos bases de données sont déjà configurées avec ces IDs :
```
Ingrédients: 2690a2ef-5475-8188-8b3b-ebbfbc171c18
Recettes: 2690a2ef-5475-8133-a3f9-cdc0e15c6ddc
Semaines: 2690a2ef-5475-81a4-a9d5-cddef9b69379
Repas hebdomadaires: 2690a2ef-5475-8110-882c-f601be08126b
Liste de courses: 2690a2ef-5475-81c1-8285-e48c94b55b79
```

### Étape 2 : Configuration automatique ✅
Les IDs sont déjà configurés dans vos fichiers ! Il vous reste juste à :

1. **Vérifiez votre clé API** dans `widget/script.js` (ligne 3)
2. **Remplacez** par votre vraie clé API si différente

### Étape 3 : Test Immédiat !
1. **Option Simple** : Ouvrez `widget/index.html` dans votre navigateur
2. **Dans Notion** : Ajoutez un bloc "/embed" avec l'URL du fichier
3. **Testez** : Vous devriez voir l'interface de planification !

## 🚀 Premier Usage

### Planifiez votre première semaine :
1. **Navigation** : Utilisez ← → pour changer de semaine
2. **Recettes** : Parcourez la liste à droite
3. **Planification** : Glissez-déposez une recette sur un créneau
4. **Courses** : Cliquez "Générer la liste de courses"
5. **Sauvegarde** : Cliquez "💾 Sauvegarder la semaine"

### Vérifiez dans Notion :
- Allez dans votre base "Repas hebdomadaires"
- Vous devriez voir vos repas planifiés
- Votre "Liste de courses" est automatiquement remplie

## 🛠️ Si quelque chose ne fonctionne pas

### Widget vide ou erreurs :
1. Vérifiez votre clé API Notion
2. Confirmez les IDs de bases de données
3. Ouvrez la console du navigateur (F12) pour voir les erreurs

### Données de test manquantes :
Le widget contient des recettes d'exemple. Pour utiliser vos vraies recettes :
1. Ajoutez des recettes dans votre base Notion "Recettes"
2. Modifiez `loadRecipes()` dans `widget/script.js` pour utiliser l'API

## 📁 Structure de Votre Solution

```
notion-meal-planner/
├── 🎨 widget/          # Interface interactive
│   ├── index.html      # Page principale du widget
│   ├── styles.css      # Design et couleurs
│   └── script.js       # Logique de planification
├── ⚙️ scripts/         # Automatisations
│   ├── notion-api.js   # Connexion avec Notion
│   ├── meal-planner.js # Logique métier
│   └── shopping-list.js # Gestion des courses
├── 📋 templates/       # Modèles Notion
│   ├── semaine-template.md
│   ├── vues-optimisees.md
│   └── formules-utiles.md
└── 📖 docs/           # Documentation
    ├── installation.md
    └── utilisation.md
```

## 🎯 Prochaines Actions

1. **Ajoutez vos recettes** dans la base Notion "Recettes"
2. **Configurez les vues** avec les templates fournis
3. **Personnalisez** les couleurs et catégories selon vos goûts
4. **Partagez** avec votre famille pour une utilisation collaborative

## 💡 Astuces Pour Bien Commencer

- **Commencez simple** : 5-10 recettes suffisent pour débuter
- **Utilisez les filtres** : "Rapides" pour les midis, "Plats" pour les soirs
- **Dupliquez les semaines** : Réutilisez vos plannings favoris
- **Mobile-friendly** : Utilisez Notion mobile pour cocher vos courses

---

**🎉 Félicitations ! Vous avez maintenant un système complet de planification de repas intégré à Notion.**

*Besoin d'aide ? Consultez la documentation complète dans le dossier `docs/`*
