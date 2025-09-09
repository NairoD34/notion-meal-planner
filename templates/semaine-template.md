# 📋 Template de Semaine - Notion

Ce template vous permet de créer rapidement une nouvelle semaine de planning dans vos bases de données Notion.

## 🎯 Utilisation

1. **Dupliquez cette page** dans votre espace Notion
2. **Remplacez les valeurs** par celles de votre semaine
3. **Utilisez les vues pré-configurées** pour naviguer facilement

---

## 📅 Semaine du [DATE] au [DATE]

### ✅ Actions rapides

- [ ] Planifier les repas de la semaine
- [ ] Générer la liste de courses
- [ ] Faire les courses
- [ ] Marquer la semaine comme "En cours"

---

## 🍽️ Planning Hebdomadaire

### Lundi
**Midi**: *[Glissez une recette depuis votre base "Recettes"]*
**Soir**: *[Glissez une recette depuis votre base "Recettes"]*

### Mardi
**Midi**: *[Glissez une recette depuis votre base "Recettes"]*
**Soir**: *[Glissez une recette depuis votre base "Recettes"]*

### Mercredi
**Midi**: *[Glissez une recette depuis votre base "Recettes"]*
**Soir**: *[Glissez une recette depuis votre base "Recettes"]*

### Jeudi
**Midi**: *[Glissez une recette depuis votre base "Recettes"]*
**Soir**: *[Glissez une recette depuis votre base "Recettes"]*

### Vendredi
**Midi**: *[Glissez une recette depuis votre base "Recettes"]*
**Soir**: *[Glissez une recette depuis votre base "Recettes"]*

### Samedi
**Midi**: *[Glissez une recette depuis votre base "Recettes"]*
**Soir**: *[Glissez une recette depuis votre base "Recettes"]*

### Dimanche
**Midi**: *[Glissez une recette depuis votre base "Recettes"]*
**Soir**: *[Glissez une recette depuis votre base "Recettes"]*

---

## 🛒 Vues Intégrées Recommandées

### Vue "Repas de cette semaine"
```
Base: Repas hebdomadaires
Filtre: Semaine = Cette semaine
Groupement: Par Jour
Tri: Jour (croissant), puis Moment (Midi avant Soir)
```

### Vue "Liste de courses automatique"
```
Base: Liste de courses
Filtre: Semaine = Cette semaine ET Statut = Non coché
Groupement: Par Catégorie (si disponible)
Tri: Nom (croissant)
```

### Vue "Recettes favorites"
```
Base: Recettes
Filtre: Catégorie = "Rapide" OU Note > 4 étoiles
Tri: Nom (croissant)
```

---

## 🔧 Formules Utiles

### Statut automatique de la semaine
```notion
if(
  prop("Dates").start > now(),
  "Planifiée",
  if(
    prop("Dates").end < now(),
    "Terminée",
    "En cours"
  )
)
```

### Calcul du nombre de repas planifiés
```notion
length(prop("Repas")) + " repas planifiés"
```

### Progression des courses
```notion
format(
  length(filter(prop("Liste de courses"), current.Statut == true)) / 
  length(prop("Liste de courses")) * 100
) + "% des courses effectuées"
```

---

## 🎨 Propriétés Recommandées

### Pour la base "Semaines"
- **Nom** (Titre) : "Semaine du [date]"
- **Dates** (Date) : Période de la semaine
- **Statut** (Sélection) : Planifiée / En cours / Terminée
- **Repas** (Relation vers "Repas hebdomadaires")
- **Liste de courses** (Relation vers "Liste de courses")
- **Notes** (Texte riche) : Commentaires, ajustements

### Pour la base "Repas hebdomadaires"
- **Nom** (Titre) : "[Recette] - [Jour] [Moment]"
- **Jour** (Sélection) : Lundi à Dimanche
- **Moment** (Sélection) : Midi / Soir
- **Recette** (Relation vers "Recettes")
- **Semaine** (Relation vers "Semaines")
- **Ingrédients supplémentaires** (Relation vers "Ingrédients")
- **Portions** (Nombre) : Nombre de personnes
- **Préparé** (Case à cocher) : Marquage quand c'est fait

---

## 🚀 Boutons d'Action Rapide

### Bouton "Nouvelle Semaine"
```notion
// Action: Créer une nouvelle page dans "Semaines"
// Pré-remplir avec la semaine suivante
```

### Bouton "Dupliquer la Semaine"
```notion
// Action: Copier tous les repas de cette semaine
// Les créer pour la semaine suivante
```

### Bouton "Générer Liste de Courses"
```notion
// Action: Créer automatiquement les éléments de courses
// Basés sur les ingrédients des recettes planifiées
```

---

## 📊 Dashboard de Suivi

### Métriques de la Semaine
- **Nombre de repas planifiés** : X/14
- **Recettes différentes** : X recettes uniques
- **Variété des catégories** : Plats, Desserts, Rapides
- **Ingrédients total** : X ingrédients différents
- **Progression des courses** : X% effectuées

### Vue Calendrier
Intégrez une vue calendrier de vos repas pour une visualisation claire de la semaine.

---

## 💡 Conseils d'Optimisation

1. **Utilisez les templates de page** pour créer rapidement de nouvelles semaines
2. **Configurez des automatisations** avec Notion API pour synchroniser les listes
3. **Créez des vues filtrées** pour chaque membre de la famille
4. **Utilisez les rollups** pour calculer automatiquement les quantités d'ingrédients
5. **Ajoutez des propriétés de notation** pour suivre vos recettes préférées

---

## 🔗 Liens Rapides

- 📚 [Base Recettes] → *(lien vers votre base de recettes)*
- 🥕 [Base Ingrédients] → *(lien vers votre base d'ingrédients)*
- 🛒 [Liste de Courses Actuelle] → *(lien vers votre liste en cours)*
- 📋 [Planning Global] → *(vue d'ensemble de toutes vos semaines)*

---

*Template créé pour optimiser votre planification de repas dans Notion* ✨
