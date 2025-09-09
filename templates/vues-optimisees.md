# 👁️ Vues Optimisées pour Notion

Ce guide vous aide à créer des vues parfaitement adaptées à votre planification de repas dans Notion.

## 🎯 Vues Essentielles

### 1. 📅 Vue "Planning de la Semaine"
**Base**: Repas hebdomadaires  
**Objectif**: Vue d'ensemble claire de tous vos repas

**Configuration**:
```
Filtre: 
- Semaine → Contient → [Semaine actuelle]

Groupement: 
- Jour (Lundi → Dimanche)

Tri:
1. Jour (croissant)
2. Moment (Midi avant Soir)

Affichage: Tableau ou Kanban

Propriétés visibles:
- Nom (titre)
- Recette (relation)
- Portions (nombre)
- Préparé (case à cocher)
```

### 2. 🛒 Vue "Liste de Courses Active"
**Base**: Liste de courses  
**Objectif**: Voir uniquement ce qu'il reste à acheter

**Configuration**:
```
Filtre:
- Semaine → Contient → [Semaine actuelle]
- Statut → Ne coche pas → true

Groupement:
- Par catégorie d'ingrédient (si disponible)
- Ou par magasin recommandé

Tri:
- Nom (alphabétique)

Affichage: Liste

Propriétés visibles:
- Nom (titre)
- Quantité (nombre)
- Ingrédient (relation)
- Statut (case à cocher)
```

### 3. 📚 Vue "Mes Recettes Favorites"
**Base**: Recettes  
**Objectif**: Accès rapide aux recettes les plus utilisées

**Configuration**:
```
Filtre:
- Catégorie → Est → Rapide
- OU Note → Supérieur à → 4

Tri:
- Fréquence d'utilisation (décroissant)
- Nom (alphabétique)

Affichage: Galerie ou Cartes

Propriétés visibles:
- Nom (titre)
- Catégorie (sélection)
- Lien (URL)
- Note (nombre)
```

---

## 🔧 Vues Avancées

### 4. 📊 Vue "Statistiques Nutritionnelles"
**Base**: Repas hebdomadaires  
**Objectif**: Analyser l'équilibre de vos repas

**Configuration**:
```
Filtre:
- Semaine → Dans les 4 dernières semaines

Groupement:
- Catégorie de recette

Affichage: Graphique (si disponible)

Propriétés calculées:
- Nombre de repas par catégorie
- Variété des ingrédients
- Récurrence des recettes
```

### 5. 🥕 Vue "Gestion des Stocks"
**Base**: Ingrédients  
**Objectif**: Suivre ce qui est disponible à la maison

**Configuration**:
```
Filtre:
- Stock disponible → Supérieur à → 0
- OU Dernière utilisation → Dans les 30 derniers jours

Tri:
- Date d'expiration (croissant)
- Quantité disponible (croissant)

Affichage: Tableau

Propriétés visibles:
- Nom (titre)
- Quantité disponible (nombre)
- Unité (sélection)
- Date d'expiration (date)
- Dernière utilisation (formule)
```

### 6. 🔄 Vue "Historique des Semaines"
**Base**: Semaines  
**Objectif**: Voir l'évolution de vos habitudes alimentaires

**Configuration**:
```
Filtre:
- Statut → Est → Terminée

Tri:
- Dates (décroissant - plus récent en premier)

Affichage: Chronologie

Propriétés visibles:
- Nom (titre)
- Dates (période)
- Nombre de repas (rollup)
- Variété (formule)
- Notes (texte)
```

---

## 🎨 Formules Avancées

### Calcul de la Variété Alimentaire
```notion
// Pour une semaine : compter les catégories uniques
length(
  unique(
    map(
      prop("Repas").prop("Recette").prop("Catégorie"),
      current
    )
  )
)
```

### Pourcentage de Courses Effectuées
```notion
// Dans la base Semaines
format(
  length(
    filter(
      prop("Liste de courses"),
      current.prop("Statut") == true
    )
  ) / length(prop("Liste de courses")) * 100
) + "%"
```

### Détection de Recettes Répétitives
```notion
// Dans la base Recettes
if(
  length(
    filter(
      prop("Repas hebdomadaires"),
      current.prop("Semaine").prop("Dates").start > dateSubtract(now(), 30, "days")
    )
  ) > 3,
  "⚠️ Souvent utilisée",
  "✅ Équilibrée"
)
```

### Score de Préparation de la Semaine
```notion
// Dans la base Semaines
format(
  length(
    filter(
      prop("Repas"),
      current.prop("Préparé") == true
    )
  ) / length(prop("Repas")) * 100
) + "% préparés"
```

---

## 🚀 Configurations de Propriétés Recommandées

### Pour optimiser les vues, ajoutez ces propriétés :

#### Base "Recettes"
```
- Fréquence d'utilisation (Rollup depuis Repas hebdomadaires)
- Dernière utilisation (Rollup - MAX des dates de repas)
- Note moyenne (Nombre - pour noter vos recettes)
- Temps de préparation (Nombre en minutes)
- Difficulté (Sélection: Facile/Moyen/Difficile)
- Saison recommandée (Multi-sélection)
```

#### Base "Semaines" 
```
- Progression des courses (Formule de pourcentage)
- Variété nutritionnelle (Formule de comptage)
- Budget estimé (Rollup depuis ingrédients)
- Satisfaction (Nombre - note de 1 à 5)
```

#### Base "Ingrédients"
```
- Stock disponible (Nombre)
- Date d'expiration (Date)
- Prix moyen (Nombre)
- Fréquence d'achat (Rollup)
- Magasin habituel (Sélection)
```

---

## 🎯 Templates de Vues par Contexte

### Vue "Course Express" (Mobile)
- **Affichage**: Liste simple
- **Propriétés minimales**: Nom, Quantité, Case à cocher
- **Groupement**: Par magasin
- **Filtres**: Semaine actuelle + Non coché

### Vue "Planification Familiale"
- **Affichage**: Calendrier si possible, sinon Kanban
- **Groupement**: Par jour de la semaine
- **Propriétés**: Recette, Portions, Notes spéciales
- **Filtres**: Semaines futures

### Vue "Analyse Nutritionnelle"
- **Affichage**: Graphiques et tableaux
- **Groupement**: Par catégorie de recettes
- **Propriétés**: Tous les rollups nutritionnels
- **Filtres**: Période sélectionnable

---

## 💡 Conseils d'Optimisation

1. **Utilisez les templates de vue** pour standardiser vos filtres
2. **Créez des raccourcis** vers vos vues les plus utilisées
3. **Configurez des notifications** pour les listes de courses
4. **Utilisez les sous-pages** pour détailler les recettes complexes
5. **Synchronisez avec votre calendrier** pour les rappels de préparation

---

## 🔗 Intégrations Possibles

### Avec le Widget HTML
- Exportez vos vues au format JSON
- Importez les données dans le widget
- Synchronisez les modifications bidirectionnelles

### Avec l'API Notion
- Automatisez la création de nouvelles semaines
- Générez automatiquement les listes de courses
- Envoyez des notifications de rappel

### Avec vos autres outils
- Synchronisez avec votre calendrier Google
- Intégrez avec vos apps de courses
- Exportez vers vos réseaux sociaux culinaires

---

*Guide des vues optimisées pour une expérience fluide dans Notion* ✨
