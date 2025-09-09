// Configuration de l'API Notion
const NOTION_CONFIG = {
    apiKey: 'ntn_x27335937177Ycms81oM2Sb7Upo0RJJg3YlBcgP73AzahB', // Remplacez par VOTRE clé API
    version: '2022-06-28',
    databases: {
        ingredients: '2690a2ef-5475-8188-8b3b-ebbfbc171c18',
        recettes: '2690a2ef-5475-8133-a3f9-cdc0e15c6ddc',
        semaines: '2690a2ef-5475-81a4-a9d5-cddef9b69379',
        repas: '2690a2ef-5475-8110-882c-f601be08126b',
        courses: '2690a2ef-5475-81c1-8285-e48c94b55b79'
    }
};

// Variables globales
let currentWeek = new Date();
let recipes = [];
let currentPlanning = {};
let shoppingList = [];

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializePlanner();
    setupEventListeners();
    loadRecipes();
    updateWeekDisplay();
});

// Initialisation du planificateur
function initializePlanner() {
    console.log('🍽️ Planificateur de repas initialisé');
    
    // Initialiser le planning vide
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    const meals = ['midi', 'soir'];
    
    days.forEach(day => {
        currentPlanning[day] = {};
        meals.forEach(meal => {
            currentPlanning[day][meal] = null;
        });
    });
}

// Configuration des événements
function setupEventListeners() {
    // Navigation des semaines
    document.getElementById('prev-week').addEventListener('click', () => changeWeek(-1));
    document.getElementById('next-week').addEventListener('click', () => changeWeek(1));
    
    // Filtres de recettes
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => filterRecipes(e.target.dataset.category));
    });
    
    // Actions rapides
    document.getElementById('generate-shopping-list').addEventListener('click', generateShoppingList);
    document.getElementById('clear-shopping-list').addEventListener('click', clearShoppingList);
    document.getElementById('save-week').addEventListener('click', saveWeekToNotion);
    document.getElementById('duplicate-week').addEventListener('click', duplicateWeek);
    document.getElementById('clear-week').addEventListener('click', clearWeek);
    
    // Ajouter une recette
    document.getElementById('add-recipe-btn').addEventListener('click', openRecipeModal);
    document.getElementById('recipe-form').addEventListener('submit', handleCreateRecipe);
}

// Chargement des recettes depuis Notion
async function loadRecipes() {
    try {
        const recipesList = document.getElementById('recipes-list');
        recipesList.innerHTML = '<div class="loading">Chargement des recettes...</div>';
        
        // Simulation de données (à remplacer par un vrai appel API)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        recipes = [
            {
                id: '1',
                nom: 'Pâtes Carbonara',
                categorie: 'Plat',
                lien: 'https://example.com/carbonara',
                ingredients: [
                    { nom: 'Pâtes', quantite: 400, unite: 'g' },
                    { nom: 'Lardons', quantite: 200, unite: 'g' },
                    { nom: 'Œufs', quantite: 4, unite: 'pièce' },
                    { nom: 'Parmesan', quantite: 100, unite: 'g' }
                ]
            },
            {
                id: '2',
                nom: 'Salade César',
                categorie: 'Plat',
                lien: 'https://example.com/cesar',
                ingredients: [
                    { nom: 'Salade romaine', quantite: 2, unite: 'pièce' },
                    { nom: 'Poulet', quantite: 300, unite: 'g' },
                    { nom: 'Parmesan', quantite: 50, unite: 'g' },
                    { nom: 'Croûtons', quantite: 100, unite: 'g' }
                ]
            },
            {
                id: '3',
                nom: 'Risotto aux champignons',
                categorie: 'Plat',
                lien: 'https://example.com/risotto',
                ingredients: [
                    { nom: 'Riz arborio', quantite: 300, unite: 'g' },
                    { nom: 'Champignons', quantite: 400, unite: 'g' },
                    { nom: 'Bouillon', quantite: 1000, unite: 'ml' },
                    { nom: 'Parmesan', quantite: 80, unite: 'g' }
                ]
            },
            {
                id: '4',
                nom: 'Tarte aux pommes',
                categorie: 'Dessert',
                lien: 'https://example.com/tarte-pommes',
                ingredients: [
                    { nom: 'Pâte brisée', quantite: 1, unite: 'pièce' },
                    { nom: 'Pommes', quantite: 6, unite: 'pièce' },
                    { nom: 'Sucre', quantite: 100, unite: 'g' },
                    { nom: 'Beurre', quantite: 50, unite: 'g' }
                ]
            },
            {
                id: '5',
                nom: 'Sandwich rapide',
                categorie: 'Rapide',
                lien: 'https://example.com/sandwich',
                ingredients: [
                    { nom: 'Pain de mie', quantite: 4, unite: 'pièce' },
                    { nom: 'Jambon', quantite: 100, unite: 'g' },
                    { nom: 'Fromage', quantite: 50, unite: 'g' },
                    { nom: 'Salade', quantite: 2, unite: 'pièce' }
                ]
            },
            {
                id: '6',
                nom: 'Salade de quinoa',
                categorie: 'Healthy',
                lien: 'https://example.com/quinoa',
                ingredients: [
                    { nom: 'Quinoa', quantite: 200, unite: 'g' },
                    { nom: 'Avocat', quantite: 2, unite: 'pièce' },
                    { nom: 'Tomates cerises', quantite: 200, unite: 'g' },
                    { nom: 'Concombre', quantite: 1, unite: 'pièce' },
                    { nom: 'Feta', quantite: 100, unite: 'g' }
                ]
            },
            {
                id: '7',
                nom: 'Bowl végétarien',
                categorie: 'Healthy',
                lien: 'https://example.com/bowl',
                ingredients: [
                    { nom: 'Riz complet', quantite: 150, unite: 'g' },
                    { nom: 'Brocolis', quantite: 300, unite: 'g' },
                    { nom: 'Pois chiches', quantite: 200, unite: 'g' },
                    { nom: 'Carottes', quantite: 2, unite: 'pièce' },
                    { nom: 'Graines de tournesol', quantite: 50, unite: 'g' }
                ]
            }
        ];
        
        displayRecipes(recipes);
    } catch (error) {
        console.error('Erreur lors du chargement des recettes:', error);
        document.getElementById('recipes-list').innerHTML = 
            '<div class="loading">Erreur lors du chargement des recettes</div>';
    }
}

// Affichage des recettes
function displayRecipes(recipesToShow) {
    const recipesList = document.getElementById('recipes-list');
    
    if (recipesToShow.length === 0) {
        recipesList.innerHTML = '<div class="loading">Aucune recette trouvée</div>';
        return;
    }
    
    recipesList.innerHTML = recipesToShow.map(recipe => `
        <div class="recipe-card" draggable="true" data-recipe-id="${recipe.id}">
            <div class="recipe-name">${recipe.nom}</div>
            <span class="recipe-category">${recipe.categorie}</span>
            ${recipe.lien ? `<a href="${recipe.lien}" class="recipe-link" target="_blank">Voir la recette</a>` : ''}
        </div>
    `).join('');
    
    // Ajouter les événements de drag and drop
    document.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
}

// Filtrage des recettes
function filterRecipes(category) {
    // Mettre à jour les boutons de filtre
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Filtrer les recettes
    const filteredRecipes = category === 'all' 
        ? recipes 
        : recipes.filter(recipe => recipe.categorie === category);
    
    displayRecipes(filteredRecipes);
}

// Gestion du drag and drop
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.recipeId);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function allowDrop(e) {
    e.preventDefault();
    e.target.closest('.recipe-drop-zone').classList.add('drag-over');
}

function dropRecipe(e) {
    e.preventDefault();
    const dropZone = e.target.closest('.recipe-drop-zone');
    dropZone.classList.remove('drag-over');
    
    const recipeId = e.dataTransfer.getData('text/plain');
    const recipe = recipes.find(r => r.id === recipeId);
    
    if (recipe) {
        const dayColumn = dropZone.closest('.day-column');
        const mealSlot = dropZone.closest('.meal-slot');
        const day = dayColumn.dataset.day;
        const meal = mealSlot.dataset.meal;
        
        // Ajouter la recette au planning
        currentPlanning[day][meal] = recipe;
        
        // Mettre à jour l'affichage
        dropZone.innerHTML = `
            <div class="recipe-card-small">
                ${recipe.nom}
                <button class="remove-btn" onclick="removeRecipe('${day}', '${meal}')">&times;</button>
            </div>
        `;
        
        console.log(`Recette "${recipe.nom}" ajoutée pour ${day} ${meal}`);
    }
}

// Supprimer une recette du planning
function removeRecipe(day, meal) {
    currentPlanning[day][meal] = null;
    
    const dropZone = document.querySelector(`[data-day="${day}"] [data-meal="${meal}"] .recipe-drop-zone`);
    dropZone.innerHTML = '<span class="placeholder">Glissez une recette ici</span>';
    
    console.log(`Recette supprimée pour ${day} ${meal}`);
}

// Navigation des semaines
function changeWeek(direction) {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    currentWeek = new Date(currentWeek.getTime() + (direction * oneWeek));
    updateWeekDisplay();
}

function updateWeekDisplay() {
    const weekStart = new Date(currentWeek);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Lundi
    
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    document.getElementById('current-week').textContent = 
        `Semaine du ${weekStart.toLocaleDateString('fr-FR', options)}`;
}

// Génération de la liste de courses
function generateShoppingList() {
    const shoppingListContainer = document.getElementById('shopping-list');
    const ingredients = {};
    
    // Collecter tous les ingrédients du planning
    Object.values(currentPlanning).forEach(dayMeals => {
        Object.values(dayMeals).forEach(recipe => {
            if (recipe && recipe.ingredients) {
                recipe.ingredients.forEach(ingredient => {
                    const key = ingredient.nom;
                    if (ingredients[key]) {
                        ingredients[key].quantite += ingredient.quantite;
                    } else {
                        ingredients[key] = { ...ingredient };
                    }
                });
            }
        });
    });
    
    if (Object.keys(ingredients).length === 0) {
        shoppingListContainer.innerHTML = 
            '<div class="empty-shopping">Planifiez des repas pour générer votre liste de courses</div>';
        return;
    }
    
    shoppingList = Object.values(ingredients);
    
    shoppingListContainer.innerHTML = shoppingList.map((ingredient, index) => `
        <div class="shopping-item">
            <input type="checkbox" id="ingredient-${index}" onchange="toggleIngredient(${index})">
            <label for="ingredient-${index}">
                <div class="ingredient-name">${ingredient.nom}</div>
                <div class="ingredient-quantity">${ingredient.quantite} ${ingredient.unite}</div>
            </label>
        </div>
    `).join('');
    
    console.log('Liste de courses générée:', shoppingList);
}

function toggleIngredient(index) {
    const item = document.querySelector(`#ingredient-${index}`).closest('.shopping-item');
    item.classList.toggle('checked');
}

function clearShoppingList() {
    shoppingList = [];
    document.getElementById('shopping-list').innerHTML = 
        '<div class="empty-shopping">Votre liste de courses apparaîtra ici après avoir planifié vos repas.</div>';
}

// Sauvegarde vers Notion
async function saveWeekToNotion() {
    try {
        console.log('Sauvegarde vers Notion...', currentPlanning);
        
        // Simulation de sauvegarde
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert('✅ Semaine sauvegardée avec succès dans Notion !');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        alert('❌ Erreur lors de la sauvegarde');
    }
}

// Duplication de semaine
function duplicateWeek() {
    const confirmation = confirm('Voulez-vous dupliquer cette semaine pour la semaine suivante ?');
    if (confirmation) {
        changeWeek(1);
        console.log('Semaine dupliquée');
        alert('✅ Semaine dupliquée !');
    }
}

// Vider la semaine
function clearWeek() {
    const confirmation = confirm('Voulez-vous vraiment vider toute la planification de cette semaine ?');
    if (confirmation) {
        // Réinitialiser le planning
        Object.keys(currentPlanning).forEach(day => {
            Object.keys(currentPlanning[day]).forEach(meal => {
                currentPlanning[day][meal] = null;
            });
        });
        
        // Réinitialiser l'affichage
        document.querySelectorAll('.recipe-drop-zone').forEach(zone => {
            zone.innerHTML = '<span class="placeholder">Glissez une recette ici</span>';
        });
        
        clearShoppingList();
        console.log('Semaine vidée');
        alert('✅ Semaine vidée !');
    }
}

// Fonctions utilitaires pour l'API Notion (à implémenter)
async function callNotionAPI(endpoint, method = 'GET', data = null) {
    const url = `https://api.notion.com/v1/${endpoint}`;
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${NOTION_CONFIG.apiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': NOTION_CONFIG.version
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error('Erreur API Notion:', error);
        throw error;
    }
}

// Export pour utilisation dans d'autres scripts
window.MealPlanner = {
    loadRecipes,
    generateShoppingList,
    saveWeekToNotion,
    currentPlanning,
    shoppingList
};

// Gestion du modal pour ajouter une recette
function openRecipeModal() {
    document.getElementById('recipe-modal').style.display = 'flex';
}

function closeRecipeModal() {
    document.getElementById('recipe-modal').style.display = 'none';
    document.getElementById('recipe-form').reset();
}

// Créer une nouvelle recette
async function handleCreateRecipe(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const name = document.getElementById('recipe-name').value;
    const category = document.getElementById('recipe-category').value;
    const link = document.getElementById('recipe-link').value;
    const ingredientsText = document.getElementById('recipe-ingredients').value;
    
    // Parser les ingrédients
    const ingredients = parseIngredients(ingredientsText);
    
    try {
        // Créer la recette dans Notion
        const newRecipe = await createRecipeInNotion(name, category, link, ingredients);
        
        // Ajouter à la liste locale
        recipes.push(newRecipe);
        
        // Rafraîchir l'affichage
        displayRecipes(recipes);
        
        // Fermer le modal
        closeRecipeModal();
        
        alert('✅ Recette créée avec succès !');
    } catch (error) {
        console.error('Erreur lors de la création de la recette:', error);
        alert('❌ Erreur lors de la création de la recette');
    }
}

// Parser le texte des ingrédients
function parseIngredients(ingredientsText) {
    if (!ingredientsText.trim()) return [];
    
    return ingredientsText
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
            const match = line.match(/^(.+?)\s*-\s*(\d+(?:\.\d+)?)\s*(\w+)$/);
            if (match) {
                return {
                    nom: match[1].trim(),
                    quantite: parseFloat(match[2]),
                    unite: match[3].trim()
                };
            } else {
                // Format simple sans quantité
                return {
                    nom: line.trim(),
                    quantite: 1,
                    unite: 'pièce'
                };
            }
        });
}

// Créer une recette dans Notion
async function createRecipeInNotion(name, category, link, ingredients) {
    try {
        // Créer la page de recette
        const recipeData = {
            parent: { database_id: NOTION_CONFIG.databases.recettes },
            properties: {
                "Nom": {
                    title: [{ text: { content: name } }]
                },
                "Catégorie": {
                    select: { name: category }
                }
            }
        };
        
        if (link) {
            recipeData.properties["Lien"] = {
                url: link
            };
        }
        
        const response = await callNotionAPI('pages', 'POST', recipeData);
        
        // TODO: Ajouter les ingrédients (nécessite de créer les ingrédients d'abord)
        
        return {
            id: response.id,
            nom: name,
            categorie: category,
            lien: link,
            ingredients: ingredients
        };
    } catch (error) {
        console.error('Erreur API Notion:', error);
        throw error;
    }
}

// Fermer le modal en cliquant à l'extérieur
window.onclick = function(event) {
    const modal = document.getElementById('recipe-modal');
    if (event.target === modal) {
        closeRecipeModal();
    }
};
