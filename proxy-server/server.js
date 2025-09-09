const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

// Charger le fichier .env depuis le bon répertoire
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS
app.use(cors({
    origin: [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'https://nairod34.github.io',
        'https://nairod34.github.io/notion-meal-planner'
    ],
    credentials: true
}));

app.use(express.json());

// Configuration Notion API
const notionConfig = {
    apiKey: process.env.NOTION_API_KEY,
    version: process.env.NOTION_VERSION,
    baseURL: 'https://api.notion.com/v1',
    databases: {
        ingredients: process.env.DB_INGREDIENTS,
        recettes: process.env.DB_RECETTES,
        semaines: process.env.DB_SEMAINES,
        repas: process.env.DB_REPAS,
        courses: process.env.DB_COURSES
    }
};

// Fonction helper pour appeler l'API Notion
async function callNotionAPI(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            url: `${notionConfig.baseURL}/${endpoint}`,
            headers: {
                'Authorization': `Bearer ${notionConfig.apiKey}`,
                'Notion-Version': notionConfig.version,
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('Erreur API Notion:', error.response?.data || error.message);
        throw error;
    }
}

// ===== ROUTES API =====

// Route racine
app.get('/', (req, res) => {
    res.json({ 
        message: '🍽️ Meal Planner - Proxy Notion API', 
        status: 'active',
        timestamp: new Date().toISOString(),
        endpoints: {
            recipes: {
                'GET /recipes': 'Récupérer toutes les recettes',
                'POST /recipes': 'Créer une nouvelle recette',  
                'DELETE /recipes/:id': 'Supprimer une recette'
            },
            test: {
                'GET /api/test': 'Test de connexion'
            }
        }
    });
});

// Route de test
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '🚀 Proxy Notion actif !', 
        timestamp: new Date().toISOString(),
        databases: Object.keys(notionConfig.databases)
    });
});

// ===== GESTION DES RECETTES =====

// Récupérer toutes les recettes
app.get('/recipes', async (req, res) => {
    try {
        console.log('📚 Récupération des recettes...');
        
        const response = await callNotionAPI(`databases/${notionConfig.databases.recettes}/query`, 'POST', {
            sorts: [
                {
                    property: "Nom",
                    direction: "ascending"
                }
            ]
        });
        
        // Transformer les données Notion en format utilisable
        const recipes = response.results.map(page => ({
            id: page.id,
            nom: page.properties.Nom?.title?.[0]?.text?.content || 'Sans nom',
            categorie: page.properties.Catégorie?.select?.name || 'Non définie',
            lien: page.properties.Lien?.url || '',
            created: page.created_time,
            ingredients: [] // TODO: Récupérer les ingrédients liés
        }));
        
        console.log(`✅ ${recipes.length} recettes récupérées`);
        res.json(recipes);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des recettes:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des recettes',
            details: error.response?.data || error.message 
        });
    }
});

// Créer une nouvelle recette
app.post('/recipes', async (req, res) => {
    try {
        const { nom, categorie, lien, ingredients } = req.body;
        
        console.log('✨ Création d\'une nouvelle recette:', nom);
        
        // Créer la page de recette dans Notion
        const recipeData = {
            parent: { database_id: notionConfig.databases.recettes },
            properties: {
                "Nom": {
                    title: [{ text: { content: nom } }]
                },
                "Catégorie": {
                    select: { name: categorie }
                }
            }
        };
        
        if (lien) {
            recipeData.properties["Lien"] = {
                url: lien
            };
        }
        
        const response = await callNotionAPI('pages', 'POST', recipeData);
        
        // TODO: Ajouter les ingrédients dans la base dédiée
        
        const newRecipe = {
            id: response.id,
            nom,
            categorie,
            lien,
            ingredients,
            created: response.created_time
        };
        
        console.log('✅ Recette créée avec succès:', response.id);
        res.json(newRecipe);
    } catch (error) {
        console.error('❌ Erreur lors de la création de la recette:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la création de la recette',
            details: error.response?.data || error.message 
        });
    }
});

// Supprimer une recette (archiver dans Notion)
app.delete('/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Suppression de la recette:', id);
        
        // Archiver la page dans Notion
        const response = await callNotionAPI(`pages/${id}`, 'PATCH', {
            archived: true
        });
        
        console.log('✅ Recette supprimée avec succès');
        res.json({ success: true, id });
    } catch (error) {
        console.error('❌ Erreur lors de la suppression de la recette:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la suppression de la recette',
            details: error.response?.data || error.message 
        });
    }
});

// ===== GESTION DU PLANNING =====

// Sauvegarder un planning de semaine
app.post('/planning', async (req, res) => {
    try {
        const { week, planning, timestamp } = req.body;
        
        console.log('📅 Sauvegarde du planning pour la semaine:', week);
        
        // Créer ou mettre à jour une page de planning dans Notion
        const planningData = {
            parent: { database_id: notionConfig.databases.semaines },
            properties: {
                'Semaine': {
                    title: [{ text: { content: week } }]
                },
                'Planning': {
                    rich_text: [{ text: { content: JSON.stringify(planning) } }]
                },
                'Date de mise à jour': {
                    date: { start: timestamp.split('T')[0] }
                }
            }
        };
        
        // Vérifier si une page existe déjà pour cette semaine
        const existingPage = await callNotionAPI(`databases/${notionConfig.databases.semaines}/query`, 'POST', {
            filter: {
                property: 'Semaine',
                title: { equals: week }
            }
        });
        
        let response;
        if (existingPage.results.length > 0) {
            // Mettre à jour la page existante
            const pageId = existingPage.results[0].id;
            response = await callNotionAPI(`pages/${pageId}`, 'PATCH', {
                properties: planningData.properties
            });
            console.log('✅ Planning mis à jour');
        } else {
            // Créer une nouvelle page
            response = await callNotionAPI('pages', 'POST', planningData);
            console.log('✅ Nouveau planning créé');
        }
        
        res.json({ success: true, week, pageId: response.id });
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde du planning:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la sauvegarde du planning',
            details: error.response?.data || error.message 
        });
    }
});

// Récupérer un planning de semaine
app.get('/planning/:week', async (req, res) => {
    try {
        const { week } = req.params;
        
        console.log('📅 Récupération du planning pour la semaine:', week);
        
        const response = await callNotionAPI(`databases/${notionConfig.databases.semaines}/query`, 'POST', {
            filter: {
                property: 'Semaine',
                title: { equals: week }
            }
        });
        
        if (response.results.length > 0) {
            const page = response.results[0];
            const planningText = page.properties.Planning?.rich_text?.[0]?.text?.content;
            
            let planning = {};
            if (planningText) {
                try {
                    planning = JSON.parse(planningText);
                } catch (parseError) {
                    console.warn('⚠️ Erreur de parsing du planning, retour d\'un planning vide');
                }
            }
            
            console.log('✅ Planning récupéré');
            res.json({ week, planning, pageId: page.id });
        } else {
            console.log('ℹ️ Aucun planning trouvé pour cette semaine');
            res.status(404).json({ message: 'Aucun planning trouvé pour cette semaine' });
        }
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du planning:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération du planning',
            details: error.response?.data || error.message 
        });
    }
});

// ===== GESTION DES INGRÉDIENTS =====

// Récupérer tous les ingrédients
app.get('/api/ingredients', async (req, res) => {
    try {
        console.log('🥕 Récupération des ingrédients...');
        
        const response = await callNotionAPI(`databases/${notionConfig.databases.ingredients}/query`, 'POST');
        
        const ingredients = response.results.map(page => ({
            id: page.id,
            nom: page.properties.Nom?.title?.[0]?.text?.content || 'Sans nom',
            unite: page.properties.Unité?.select?.name || 'pièce'
        }));
        
        console.log(`✅ ${ingredients.length} ingrédients récupérés`);
        res.json(ingredients);
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des ingrédients:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des ingrédients',
            details: error.response?.data || error.message 
        });
    }
});

// ===== GESTION DU PLANNING =====

// Sauvegarder le planning de la semaine
app.post('/api/planning', async (req, res) => {
    try {
        const { semaine, planning } = req.body;
        
        console.log('📅 Sauvegarde du planning pour la semaine:', semaine);
        
        // TODO: Implémenter la sauvegarde du planning dans Notion
        
        res.json({ success: true, message: 'Planning sauvegardé' });
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde du planning:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la sauvegarde du planning',
            details: error.response?.data || error.message 
        });
    }
});

// ===== DÉMARRAGE DU SERVEUR =====

app.listen(PORT, () => {
    console.log('🚀 ===== SERVEUR PROXY NOTION DÉMARRÉ =====');
    console.log(`📡 Serveur en écoute sur http://localhost:${PORT}`);
    console.log('🔑 API Key Notion:', notionConfig.apiKey ? '✅ Configurée' : '❌ Manquante');
    console.log('🗃️ Bases de données configurées:');
    Object.entries(notionConfig.databases).forEach(([name, id]) => {
        console.log(`   • ${name}: ${id}`);
    });
    console.log('🌐 CORS activé pour:', ['http://localhost:8000', 'https://nairod34.github.io']);
    console.log('==========================================');
    console.log('🔄 Version mise à jour - Sept 2025'); // Force redéploiement
});

// Gestion des erreurs globales
process.on('uncaughtException', (error) => {
    console.error('❌ Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
});
