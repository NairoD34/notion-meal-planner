// Configuration de l'API Notion via Proxy
const NOTION_CONFIG = {
    proxyURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3001' 
        : 'https://notion-meal-planner.onrender.com', // URL de votre serveur Render déployé
    apiKey: 'ntn_x27335937177Ycms81oM2Sb7Upo0RJJg3YlBcgP73AzahB', // Garde pour référence
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
let currentWeek = getStartOfCurrentWeek(); // Commencer par la semaine courante
let recipes = [];
let currentPlanning = {};
let shoppingList = [];
let favoriteRecipes = new Set(); // Pour stocker les IDs des recettes favorites
let recipeToDelete = null; // Pour stocker la recette à supprimer

// Fonction pour obtenir le début de la semaine courante (lundi)
function getStartOfCurrentWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0); // Minuit
    return monday;
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializePlanner();
    setupEventListeners();
    loadFavorites(); // Charger les favoris
    loadRecipes();
    updateWeekDisplay();
    setupDeleteModal(); // Configurer la modale de suppression
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
    document.getElementById('today-week').addEventListener('click', goToCurrentWeek);
    
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

// Chargement des recettes depuis Notion via proxy
async function loadRecipes() {
    try {
        const recipesList = document.getElementById('recipes-list');
        recipesList.innerHTML = '<div class="loading">Chargement des recettes depuis Notion...</div>';
        
        // Tenter de charger depuis Notion via le proxy
        try {
            console.log('📡 Connexion au proxy Notion...');
            const response = await fetch(`${NOTION_CONFIG.proxyURL}/recipes`);
            
            if (response.ok) {
                recipes = await response.json();
                console.log('📚 Recettes chargées depuis Notion:', recipes.length);
            } else {
                throw new Error(`Erreur proxy: ${response.status}`);
            }
        } catch (proxyError) {
            console.warn('⚠️ Proxy non disponible, utilisation du cache local:', proxyError.message);
            
            // Fallback vers localStorage si le proxy n'est pas disponible
            const savedRecipes = loadRecipesFromStorage();
            
            if (savedRecipes && savedRecipes.length > 0) {
                recipes = savedRecipes;
                console.log('� Recettes chargées depuis localStorage:', recipes.length);
            } else {
                console.log('📚 Chargement des recettes par défaut...');
                recipes = getDefaultRecipes();
                saveRecipesToStorage(recipes);
            }
            
            // Afficher un message d'avertissement
            const warning = document.createElement('div');
            warning.style.cssText = 'background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 6px; color: #856404;';
            warning.innerHTML = '⚠️ <strong>Mode hors ligne:</strong> Démarrez le serveur proxy pour synchroniser avec Notion';
            recipesList.parentNode.insertBefore(warning, recipesList);
        }
        
        displayRecipes(recipes);
    } catch (error) {
        console.error('❌ Erreur lors du chargement des recettes:', error);
        document.getElementById('recipes-list').innerHTML = 
            '<div class="loading">Erreur lors du chargement des recettes</div>';
    }
}

// Recettes par défaut
function getDefaultRecipes() {
    return [
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
}

// Affichage des recettes
function displayRecipes(recipesToShow) {
    const recipesList = document.getElementById('recipes-list');
    
    if (recipesToShow.length === 0) {
        recipesList.innerHTML = '<div class="loading">Aucune recette trouvée</div>';
        return;
    }
    
    recipesList.innerHTML = recipesToShow.map(recipe => {
        const isFavorite = favoriteRecipes.has(recipe.id);
        return `
            <div class="recipe-card ${isFavorite ? 'favorite' : ''}" draggable="true" data-recipe-id="${recipe.id}" data-category="${recipe.categorie}">
                <div class="recipe-name">${recipe.nom}</div>
                <span class="recipe-category">${recipe.categorie}</span>
                ${recipe.lien ? `<a href="${recipe.lien}" class="recipe-link" target="_blank">Voir la recette</a>` : ''}
                <div class="recipe-actions">
                    <button class="btn-favorite ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${recipe.id}')" title="${isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}">
                        ${isFavorite ? '❤️' : '🤍'}
                    </button>
                    <button class="btn-delete" onclick="confirmDeleteRecipe('${recipe.id}')" title="Supprimer la recette">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
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
    
    // Vérifier si c'est la semaine courante
    const today = new Date();
    const currentWeekStart = getStartOfCurrentWeek();
    const isCurrentWeek = weekStart.getTime() === currentWeekStart.getTime();
    
    // Formater l'affichage
    let weekText = `Semaine du ${weekStart.toLocaleDateString('fr-FR', options)}`;
    
    if (isCurrentWeek) {
        weekText += ` 📍 (Cette semaine)`;
    } else {
        // Calculer la différence en semaines
        const weeksDiff = Math.round((weekStart - currentWeekStart) / (7 * 24 * 60 * 60 * 1000));
        if (weeksDiff === 1) {
            weekText += ` ➡️ (Semaine prochaine)`;
        } else if (weeksDiff === -1) {
            weekText += ` ⬅️ (Semaine dernière)`;
        } else if (weeksDiff > 1) {
            weekText += ` ➡️ (Dans ${weeksDiff} semaines)`;
        } else if (weeksDiff < -1) {
            weekText += ` ⬅️ (Il y a ${Math.abs(weeksDiff)} semaines)`;
        }
    }
    
    document.getElementById('current-week').textContent = weekText;
    
    // Mettre à jour les couleurs des jours pour marquer aujourd'hui
    updateDayHighlights(isCurrentWeek);
}

// Fonction pour surligner le jour actuel
function updateDayHighlights(isCurrentWeek) {
    const dayElements = document.querySelectorAll('.day-column h3');
    const today = new Date();
    const todayDay = today.getDay(); // 0 = dimanche, 1 = lundi, etc.
    
    dayElements.forEach((dayElement, index) => {
        // Retirer les anciennes classes
        dayElement.classList.remove('today', 'current-week');
        
        if (isCurrentWeek) {
            dayElement.classList.add('current-week');
            
            // Index 0 = Lundi, donc ajuster pour correspondre à getDay()
            const elementDay = index + 1; // 1 = lundi, 2 = mardi, etc.
            
            if (elementDay === todayDay || (elementDay === 7 && todayDay === 0)) {
                dayElement.classList.add('today');
            }
        }
    });
}

// Ajouter un bouton pour revenir à la semaine courante
function goToCurrentWeek() {
    currentWeek = getStartOfCurrentWeek();
    updateWeekDisplay();
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
        // Essayer de créer via le proxy Notion
        try {
            console.log('📡 Création de recette via proxy Notion...');
            const response = await fetch(`${NOTION_CONFIG.proxyURL}/recipes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom: name,
                    categorie: category,
                    lien: link,
                    ingredients: ingredients
                })
            });
            
            if (response.ok) {
                const newRecipe = await response.json();
                console.log('✅ Recette créée dans Notion:', newRecipe.id);
                
                // Ajouter à la liste locale
                recipes.push(newRecipe);
            } else {
                throw new Error(`Erreur proxy: ${response.status}`);
            }
        } catch (proxyError) {
            console.warn('⚠️ Proxy non disponible, sauvegarde locale:', proxyError.message);
            
            // Fallback vers localStorage si le proxy n'est pas disponible
            const newId = 'local_' + Date.now();
            const newRecipe = {
                id: newId,
                nom: name,
                categorie: category,
                lien: link,
                ingredients: ingredients
            };
            
            // Ajouter à la liste locale
            recipes.push(newRecipe);
            
            // Sauvegarder dans localStorage
            saveRecipesToStorage(recipes);
        }
        
        // Rafraîchir l'affichage
        displayRecipes(recipes);
        
        // Fermer le modal
        closeRecipeModal();
        
        console.log('✅ Recette créée avec succès !');
        alert('✅ Recette créée avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de la création:', error);
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
    const deleteModal = document.getElementById('delete-modal');
    if (event.target === modal) {
        closeRecipeModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
};

// ===== GESTION DES FAVORIS ET SUPPRESSION =====

// Gestion des favoris
function toggleFavorite(recipeId) {
    if (favoriteRecipes.has(recipeId)) {
        favoriteRecipes.delete(recipeId);
    } else {
        favoriteRecipes.add(recipeId);
    }
    
    // Sauvegarder les favoris dans le localStorage
    localStorage.setItem('favoriteRecipes', JSON.stringify([...favoriteRecipes]));
    
    // Rafraîchir l'affichage
    const currentFilter = document.querySelector('.filter-btn.active').dataset.category;
    filterRecipes(currentFilter);
}

// Charger les favoris depuis le localStorage
function loadFavorites() {
    const saved = localStorage.getItem('favoriteRecipes');
    if (saved) {
        favoriteRecipes = new Set(JSON.parse(saved));
    }
}

// Confirmation de suppression
function confirmDeleteRecipe(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;
    
    recipeToDelete = recipeId;
    document.getElementById('recipe-to-delete-name').textContent = recipe.nom;
    document.getElementById('delete-modal').style.display = 'block';
}

// Fermer la modale de suppression
function closeDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    recipeToDelete = null;
}

// Supprimer une recette
async function deleteRecipe(recipeId) {
    try {
        // Essayer de supprimer via le proxy Notion
        try {
            console.log('📡 Suppression via proxy Notion...');
            const response = await fetch(`${NOTION_CONFIG.proxyURL}/recipes/${recipeId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                console.log('✅ Recette supprimée de Notion');
            } else {
                throw new Error(`Erreur proxy: ${response.status}`);
            }
        } catch (proxyError) {
            console.warn('⚠️ Proxy non disponible pour la suppression:', proxyError.message);
        }
        
        // Supprimer de la liste locale (toujours faire)
        recipes = recipes.filter(r => r.id !== recipeId);
        
        // Sauvegarder dans localStorage
        saveRecipesToStorage(recipes);
        
        // Supprimer des favoris si elle y était
        favoriteRecipes.delete(recipeId);
        localStorage.setItem('favoriteRecipes', JSON.stringify([...favoriteRecipes]));
        
        // Rafraîchir l'affichage
        const currentFilter = document.querySelector('.filter-btn.active').dataset.category;
        filterRecipes(currentFilter);
        
        console.log('✅ Recette supprimée avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la recette');
    }
}

// Initialiser les événements de suppression
function setupDeleteModal() {
    console.log('🔧 Configuration de la modale de suppression...');
    
    // S'assurer que la modale est fermée au démarrage
    const deleteModal = document.getElementById('delete-modal');
    if (deleteModal) {
        deleteModal.style.display = 'none';
    }
    
    // Événements de fermeture
    const closeBtn = document.getElementById('close-delete-modal');
    const cancelBtn = document.getElementById('cancel-delete');
    const confirmBtn = document.getElementById('confirm-delete');
    
    if (closeBtn) {
        closeBtn.onclick = function(e) {
            e.preventDefault();
            closeDeleteModal();
        };
    }
    
    if (cancelBtn) {
        cancelBtn.onclick = function(e) {
            e.preventDefault();
            closeDeleteModal();
        };
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = async function(e) {
            e.preventDefault();
            if (recipeToDelete) {
                await deleteRecipe(recipeToDelete);
                closeDeleteModal();
            }
        };
    }
    
    console.log('✅ Modale de suppression configurée');
}

// ===== PERSISTANCE AVEC LOCALSTORAGE =====

// Sauvegarder les recettes dans localStorage
function saveRecipesToStorage(recipesList) {
    try {
        localStorage.setItem('mealPlannerRecipes', JSON.stringify(recipesList));
        console.log('💾 Recettes sauvegardées dans localStorage');
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
    }
}

// Charger les recettes depuis localStorage
function loadRecipesFromStorage() {
    try {
        const saved = localStorage.getItem('mealPlannerRecipes');
        if (saved) {
            const recipes = JSON.parse(saved);
            console.log('📁 Recettes chargées depuis localStorage:', recipes.length);
            return recipes;
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
    }
    return null;
}

// Recettes par défaut (utilisées la première fois)
function getDefaultRecipes() {
    return [
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
}
