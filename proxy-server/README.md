# Notion Meal Planner - Proxy Server

Serveur proxy Node.js pour l'intégration avec Notion API, évitant les problèmes CORS côté client.

## Déploiement

### Déploiement sur Render

1. Créer un compte sur [Render.com](https://render.com)
2. Connecter votre dépôt GitHub
3. Créer un nouveau Web Service
4. Configurer les variables d'environnement :
   - `NOTION_API_KEY`: Votre clé API Notion
   - `NOTION_DATABASE_INGREDIENTS`: ID de votre base ingredients
   - `NOTION_DATABASE_RECETTES`: ID de votre base recettes
   - `NOTION_DATABASE_SEMAINES`: ID de votre base semaines
   - `NOTION_DATABASE_REPAS`: ID de votre base repas
   - `NOTION_DATABASE_COURSES`: ID de votre base courses

### Variables d'environnement requises

```env
NOTION_API_KEY=ntn_votre_cle_api
NOTION_DATABASE_INGREDIENTS=id_base_ingredients
NOTION_DATABASE_RECETTES=id_base_recettes
NOTION_DATABASE_SEMAINES=id_base_semaines
NOTION_DATABASE_REPAS=id_base_repas
NOTION_DATABASE_COURSES=id_base_courses
```

## API Endpoints

- `GET /recipes` - Récupérer toutes les recettes
- `POST /recipes` - Créer une nouvelle recette
- `DELETE /recipes/:id` - Supprimer une recette

## Installation locale

```bash
npm install
npm start
```

Le serveur sera disponible sur `http://localhost:3001`
