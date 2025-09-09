# 🧮 Formules Utiles pour Notion

Collection de formules prêtes à utiliser pour optimiser votre planification de repas dans Notion.

## 🎯 Formules de Base

### 1. Statut Automatique de Semaine
**Utilisation**: Propriété "Statut" dans la base "Semaines"
```notion
if(
  prop("Dates").start > now(),
  "📅 Planifiée",
  if(
    prop("Dates").end < now(),
    "✅ Terminée",
    "🔄 En cours"
  )
)
```

### 2. Progression des Courses
**Utilisation**: Propriété calculée dans "Semaines"
```notion
if(
  empty(prop("Liste de courses")),
  "Aucune course",
  format(round(
    length(filter(prop("Liste de courses"), current.prop("Statut") == true)) / 
    length(prop("Liste de courses")) * 100
  )) + "% effectuées (" + 
  format(length(filter(prop("Liste de courses"), current.prop("Statut") == true))) + 
  "/" + format(length(prop("Liste de courses"))) + ")"
)
```

### 3. Nombre de Repas Planifiés
**Utilisation**: Propriété dans "Semaines"
```notion
if(
  empty(prop("Repas")),
  "Aucun repas planifié",
  format(length(prop("Repas"))) + " repas planifiés"
)
```

---

## 📊 Formules d'Analyse

### 4. Variété Nutritionnelle
**Utilisation**: Score de diversité des catégories de repas
```notion
if(
  empty(prop("Repas")),
  "Non calculable",
  format(length(unique(
    map(prop("Repas"), current.prop("Recette").prop("Catégorie"))
  ))) + " catégories différentes"
)
```

### 5. Récurrence de Recette
**Utilisation**: Dans la base "Recettes" pour identifier les favorites
```notion
if(
  empty(prop("Repas hebdomadaires")),
  "Jamais utilisée",
  if(
    length(prop("Repas hebdomadaires")) == 1,
    "Utilisée 1 fois",
    if(
      length(prop("Repas hebdomadaires")) > 5,
      "⭐ Recette favorite (" + format(length(prop("Repas hebdomadaires"))) + " fois)",
      "Utilisée " + format(length(prop("Repas hebdomadaires"))) + " fois"
    )
  )
)
```

### 6. Dernière Utilisation
**Utilisation**: Dans "Recettes" pour voir quand une recette a été utilisée
```notion
if(
  empty(prop("Repas hebdomadaires")),
  "Jamais utilisée",
  if(
    dateBetween(
      max(map(prop("Repas hebdomadaires"), current.prop("Semaine").prop("Dates").start)),
      now(),
      "days"
    ) == 0,
    "Utilisée aujourd'hui",
    if(
      dateBetween(
        max(map(prop("Repas hebdomadaires"), current.prop("Semaine").prop("Dates").start)),
        now(),
        "days"
      ) <= 7,
      "Utilisée cette semaine",
      "Il y a " + format(dateBetween(
        max(map(prop("Repas hebdomadaires"), current.prop("Semaine").prop("Dates").start)),
        now(),
        "days"
      )) + " jours"
    )
  )
)
```

---

## 🛒 Formules pour Liste de Courses

### 7. Statut de Course avec Emoji
**Utilisation**: Affichage visuel du statut
```notion
if(
  prop("Statut"),
  "✅ Acheté",
  "🛒 À acheter"
)
```

### 8. Quantité Optimisée
**Utilisation**: Arrondir les quantités pour faciliter les courses
```notion
if(
  prop("Unité") == "g",
  if(
    prop("Quantité") < 100,
    format(ceil(prop("Quantité") / 10) * 10) + "g",
    format(ceil(prop("Quantité") / 50) * 50) + "g"
  ),
  if(
    prop("Unité") == "ml",
    if(
      prop("Quantité") < 500,
      format(ceil(prop("Quantité") / 50) * 50) + "ml",
      format(ceil(prop("Quantité") / 250) * 250) + "ml"
    ),
    format(prop("Quantité")) + " " + prop("Unité")
  )
)
```

### 9. Priorité d'Achat
**Utilisation**: Classer les courses par importance
```notion
if(
  contains(prop("Nom"), "Pain") or contains(prop("Nom"), "Lait"),
  "🔴 Essentiel",
  if(
    prop("Ingrédient").prop("Unité") == "pièce",
    "🟡 Normal",
    "🟢 Optionnel"
  )
)
```

---

## 🍽️ Formules pour Repas

### 10. Nom Automatique de Repas
**Utilisation**: Générer automatiquement le nom dans "Repas hebdomadaires"
```notion
if(
  empty(prop("Recette")),
  prop("Jour") + " " + prop("Moment") + " - Non défini",
  prop("Recette").prop("Nom") + " - " + prop("Jour") + " " + prop("Moment")
)
```

### 11. Temps de Préparation Total
**Utilisation**: Calculer le temps nécessaire pour préparer un repas
```notion
if(
  empty(prop("Recette").prop("Temps de préparation")),
  "Temps non défini",
  if(
    prop("Recette").prop("Temps de préparation") <= 15,
    "⚡ Rapide (" + format(prop("Recette").prop("Temps de préparation")) + " min)",
    if(
      prop("Recette").prop("Temps de préparation") <= 45,
      "🕐 Normal (" + format(prop("Recette").prop("Temps de préparation")) + " min)",
      "⏰ Long (" + format(prop("Recette").prop("Temps de préparation")) + " min)"
    )
  )
)
```

### 12. Difficulté Adaptée
**Utilisation**: Ajuster la difficulté selon le moment
```notion
if(
  prop("Moment") == "Midi",
  if(
    prop("Recette").prop("Difficulté") == "Difficile",
    "⚠️ Complexe pour le midi",
    "✅ Adapté"
  ),
  if(
    prop("Recette").prop("Difficulté") == "Facile",
    "👍 Parfait pour le soir",
    "✅ Adapté"
  )
)
```

---

## 📈 Formules d'Optimisation

### 13. Score d'Équilibre Hebdomadaire
**Utilisation**: Évaluer l'équilibre nutritionnel d'une semaine
```notion
if(
  empty(prop("Repas")),
  "Non calculable",
  if(
    length(unique(map(prop("Repas"), current.prop("Recette").prop("Catégorie")))) >= 3,
    "🌟 Bien équilibré",
    if(
      length(unique(map(prop("Repas"), current.prop("Recette").prop("Catégorie")))) == 2,
      "⚖️ Équilibré",
      "⚠️ Peu varié"
    )
  )
)
```

### 14. Détection de Gaspillage
**Utilisation**: Identifier les ingrédients peu utilisés
```notion
if(
  length(prop("Repas hebdomadaires")) == 1,
  "⚠️ Risque de gaspillage",
  if(
    length(prop("Repas hebdomadaires")) <= 3,
    "🟡 Utilisation faible",
    "✅ Bien utilisé"
  )
)
```

### 15. Suggestion de Réutilisation
**Utilisation**: Dans "Ingrédients" pour suggérer d'autres recettes
```notion
if(
  length(prop("Recettes")) > 1,
  "✨ " + format(length(prop("Recettes")) - 1) + " autres recettes possibles",
  "💡 Ajoutez d'autres recettes avec cet ingrédient"
)
```

---

## 🎯 Formules Conditionnelles Avancées

### 16. Alerte Stock Faible
**Utilisation**: Dans "Ingrédients" pour la gestion des stocks
```notion
if(
  prop("Stock disponible") <= 0,
  "🔴 Stock épuisé",
  if(
    prop("Stock disponible") <= prop("Seuil minimum"),
    "🟡 Stock faible (" + format(prop("Stock disponible")) + " " + prop("Unité") + ")",
    "✅ Stock suffisant"
  )
)
```

### 17. Calcul de Budget Estimé
**Utilisation**: Estimer le coût d'une semaine
```notion
if(
  empty(prop("Liste de courses")),
  "Budget non calculable",
  format(sum(map(prop("Liste de courses"), 
    current.prop("Quantité") * current.prop("Ingrédient").prop("Prix unitaire")
  ))) + " €"
)
```

### 18. Recommandation Saisonnière
**Utilisation**: Adapter les suggestions selon la saison
```notion
if(
  month(now()) >= 3 and month(now()) <= 5,
  if(contains(prop("Catégorie"), "Printemps"), "🌸 Parfait pour la saison", ""),
  if(
    month(now()) >= 6 and month(now()) <= 8,
    if(contains(prop("Catégorie"), "Été"), "☀️ Idéal pour l'été", ""),
    if(
      month(now()) >= 9 and month(now()) <= 11,
      if(contains(prop("Catégorie"), "Automne"), "🍂 Saveurs d'automne", ""),
      if(contains(prop("Catégorie"), "Hiver"), "❄️ Réconfortant pour l'hiver", "")
    )
  )
)
```

---

## 🔄 Formules de Synchronisation

### 19. Mise à Jour Auto du Statut Repas
**Utilisation**: Marquer automatiquement les repas passés
```notion
if(
  prop("Semaine").prop("Dates").end < now(),
  true,
  prop("Préparé")
)
```

### 20. Génération d'ID Unique
**Utilisation**: Créer des identifiants uniques pour la synchronisation
```notion
format(year(prop("Dates").start)) + 
format(month(prop("Dates").start)) + 
format(date(prop("Dates").start)) + 
"-S" + format(floor(dateBetween(prop("Dates").start, dateSubtract(prop("Dates").start, day(prop("Dates").start) - 1, "days"), "weeks")))
```

---

## 💡 Conseils d'Utilisation

1. **Testez progressivement** : Commencez par les formules simples
2. **Adaptez à vos besoins** : Modifiez les textes et conditions selon vos préférences
3. **Documentez vos modifications** : Gardez une trace des formules personnalisées
4. **Optimisez les performances** : Évitez les formules trop complexes dans les grandes bases
5. **Utilisez des propriétés cachées** : Pour les calculs intermédiaires

---

*Collection de formules pour automatiser votre planification dans Notion* ✨
