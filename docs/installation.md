# 🚀 Guide d'Installation - Planificateur de Repas Notion

Ce guide vous accompagne pas à pas pour installer et configurer votre solution de planification de repas.

## 📋 Prérequis

### ✅ Ce que vous devez avoir
- [x] Compte Notion (gratuit ou payant)
- [x] Bases de données créées avec votre script Python
- [x] Clé API Notion fonctionnelle
- [x] Navigateur web moderne

### 📊 Vos bases de données existantes
Vous avez déjà créé ces bases avec votre script Python :
- **Ingrédients** : Gestion de tous vos ingrédients
- **Recettes** : Collection de vos recettes favorites
- **Semaines** : Planning hebdomadaire
- **Repas hebdomadaires** : Détail des repas par jour
- **Liste de courses** : Génération automatique des courses

---

## 🎯 Installation Rapide (5 minutes)

### Étape 1 : Configuration des IDs de Bases
1. **Récupérez les IDs** retournés par votre script Python
2. **Ouvrez le fichier** `scripts/notion-api.js`
3. **Remplacez les valeurs** dans `DATABASE_IDS` :

```javascript
static DATABASE_IDS = {
    ingredients: 'VOTRE_ID_INGREDIENTS',
    recettes: 'VOTRE_ID_RECETTES', 
    semaines: 'VOTRE_ID_SEMAINES',
    repas: 'VOTRE_ID_REPAS',
    courses: 'VOTRE_ID_COURSES'
};
```

### Étape 2 : Configuration de l'API
1. **Ouvrez** `widget/script.js`
2. **Remplacez votre clé API** :

```javascript
const NOTION_CONFIG = {
    apiKey: 'VOTRE_CLE_API_NOTION',
    // ... rest of config
};
```

### Étape 3 : Déploiement du Widget
**Option A - Hébergement local simple** :
1. Ouvrez `widget/index.html` dans votre navigateur
2. Copiez l'URL complète (file://...)
3. Dans Notion, ajoutez un bloc "Embed" avec cette URL

**Option B - Hébergement en ligne** :
1. Uploadez le dossier `widget/` sur GitHub Pages, Netlify, ou Vercel
2. Utilisez l'URL publique dans un bloc Embed Notion

---

## 🔧 Installation Complète

### Configuration Avancée

#### 1. Optimisation des Bases de Données
Ajoutez ces propriétés optionnelles pour une meilleure expérience :

**Base "Recettes"** :
```
- Note (Nombre 1-5) : Pour noter vos recettes
- Temps de préparation (Nombre) : En minutes
- Difficulté (Sélection) : Facile/Moyen/Difficile
- Portions par défaut (Nombre) : Nombre de personnes
- Tags (Multi-sélection) : Végétarien, Sans gluten, etc.
```

**Base "Ingrédients"** :
```
- Prix unitaire (Nombre) : Pour estimer les budgets
- Stock disponible (Nombre) : Gestion des stocks maison
- Date d'expiration (Date) : Éviter le gaspillage
- Magasin préféré (Sélection) : Où acheter habituellement
```

**Base "Semaines"** :
```
- Budget réalisé (Nombre) : Coût réel des courses
- Satisfaction (Nombre 1-5) : Évaluation de la semaine
- Notes (Texte riche) : Commentaires et ajustements
```

#### 2. Formules Automatiques
Copiez ces formules depuis `templates/formules-utiles.md` :

**Statut automatique de semaine** :
```notion
if(prop("Dates").start > now(), "Planifiée", 
   if(prop("Dates").end < now(), "Terminée", "En cours"))
```

**Progression des courses** :
```notion
format(length(filter(prop("Liste de courses"), 
current.Statut == true)) / length(prop("Liste de courses")) * 100) + "%"
```

#### 3. Vues Optimisées
Créez ces vues essentielles selon `templates/vues-optimisees.md` :

1. **"Planning Semaine"** (Repas hebdomadaires)
   - Filtre : Semaine = Cette semaine
   - Groupement : Par jour
   - Affichage : Kanban

2. **"Courses Actives"** (Liste de courses)
   - Filtre : Semaine actuelle + Non coché
   - Groupement : Par catégorie
   - Affichage : Liste

3. **"Recettes Favorites"** (Recettes)
   - Filtre : Note ≥ 4 OU Catégorie = Rapide
   - Tri : Par fréquence d'utilisation
   - Affichage : Galerie

---

## 🎨 Personnalisation

### Modification du Widget
**Couleurs et Thème** :
Éditez `widget/styles.css` pour adapter les couleurs :
```css
:root {
  --primary-color: #4facfe;  /* Votre couleur principale */
  --secondary-color: #00f2fe; /* Couleur secondaire */
  --success-color: #38ef7d;   /* Couleur de succès */
}
```

**Ajout de Fonctionnalités** :
Dans `widget/script.js`, vous pouvez ajouter :
- Nouvelles catégories de recettes
- Filtres personnalisés
- Intégrations avec d'autres services

### Templates Notion
1. **Dupliquez** `templates/semaine-template.md` dans Notion
2. **Adaptez** les sections selon vos besoins
3. **Créez un template de page** pour automatiser

---

## 🔗 Intégrations Avancées

### Synchronisation Bidirectionnelle
Pour synchroniser widget ↔ Notion en temps réel :

1. **Configurez les webhooks** Notion (version payante)
2. **Modifiez** `scripts/notion-api.js` pour écouter les changements
3. **Ajoutez** la logique de mise à jour automatique

### Applications Mobiles
**Pour utiliser sur mobile** :
1. Créez un raccourci vers votre widget
2. Utilisez Notion mobile pour les vues natives
3. Synchronisation automatique entre les deux

### Automatisations Zapier/Make
Connectez avec :
- Google Calendar (rappels de préparation)
- Applications de courses (Bring!, AnyList)
- Réseaux sociaux (partage de recettes)

---

## 🛠️ Dépannage

### Problèmes Courants

**❌ Le widget ne charge pas les recettes**
```
Solution :
1. Vérifiez votre clé API Notion
2. Confirmez les IDs de bases de données
3. Vérifiez les permissions (lecture/écriture)
```

**❌ Erreur CORS dans le navigateur**
```
Solution :
1. Hébergez le widget en ligne (GitHub Pages)
2. Ou utilisez un serveur local (Live Server VS Code)
3. Ne pas ouvrir directement le fichier HTML
```

**❌ Les formules Notion ne fonctionnent pas**
```
Solution :
1. Vérifiez la syntaxe exacte
2. Assurez-vous que les propriétés existent
3. Testez sur une petite base d'abord
```

**❌ Synchronisation lente**
```
Solution :
1. Limitez le nombre d'appels API
2. Utilisez le cache local du widget
3. Optimisez les filtres de vues
```

### Logs de Debug
Activez les logs dans `widget/script.js` :
```javascript
const DEBUG = true; // Mettre à true pour debug
```

---

## 📞 Support

### Ressources Utiles
- 📖 [Documentation Notion API](https://developers.notion.com/)
- 🎥 [Tutoriels vidéo Notion](https://www.notion.so/help)
- 💬 [Communauté Notion](https://www.notion.so/community)

### Fichiers de Configuration
Gardez une sauvegarde de :
- Vos IDs de bases de données
- Vos formules personnalisées
- Vos vues configurées
- Votre clé API (sécurisée)

---

## 🎉 Prochaines Étapes

Une fois installé, vous pourrez :

1. **Planifier une semaine** en quelques clics
2. **Générer votre liste de courses** automatiquement  
3. **Suivre vos habitudes alimentaires** avec les statistiques
4. **Optimiser votre budget** avec les estimations de coût
5. **Partager vos menus** avec votre famille

---

*Installation terminée ! Vous êtes prêt à transformer votre façon de planifier vos repas* 🍽️✨
