// Script de logique de planification de repas
// Ce script contient toute la logique métier pour la planification

class MealPlanner {
    constructor() {
        this.recipes = [];
        this.ingredients = [];
        this.currentPlanning = this.initializeEmptyPlanning();
        this.savedPlannings = [];
        this.preferences = {
            defaultPortions: 2,
            dietaryRestrictions: [],
            favoriteCategories: ['Healthy', 'Rapide']
        };
    }

    // Initialiser un planning vide
    initializeEmptyPlanning() {
        const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        const meals = ['midi', 'soir'];
        const planning = {};

        days.forEach(day => {
            planning[day] = {};
            meals.forEach(meal => {
                planning[day][meal] = null;
            });
        });

        return planning;
    }

    // Définir les recettes disponibles
    setRecipes(recipes) {
        this.recipes = recipes;
    }

    // Définir les ingrédients disponibles
    setIngredients(ingredients) {
        this.ingredients = ingredients;
    }

    // Ajouter une recette à un créneau
    addRecipeToSlot(day, meal, recipe) {
        if (this.isValidDay(day) && this.isValidMeal(meal)) {
            this.currentPlanning[day][meal] = recipe;
            return true;
        }
        return false;
    }

    // Supprimer une recette d'un créneau
    removeRecipeFromSlot(day, meal) {
        if (this.isValidDay(day) && this.isValidMeal(meal)) {
            this.currentPlanning[day][meal] = null;
            return true;
        }
        return false;
    }

    // Vérifier si un jour est valide
    isValidDay(day) {
        const validDays = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        return validDays.includes(day.toLowerCase());
    }

    // Vérifier si un repas est valide
    isValidMeal(meal) {
        const validMeals = ['midi', 'soir'];
        return validMeals.includes(meal.toLowerCase());
    }

    // Obtenir le planning actuel
    getCurrentPlanning() {
        return { ...this.currentPlanning };
    }

    // Vider le planning
    clearPlanning() {
        this.currentPlanning = this.initializeEmptyPlanning();
    }

    // Générer une liste de courses à partir du planning
    generateShoppingList(planning = null) {
        const planningToUse = planning || this.currentPlanning;
        const ingredientMap = new Map();

        // Parcourir tous les repas planifiés
        Object.values(planningToUse).forEach(dayMeals => {
            Object.values(dayMeals).forEach(recipe => {
                if (recipe && recipe.ingredients) {
                    recipe.ingredients.forEach(ingredient => {
                        const key = `${ingredient.nom}_${ingredient.unite}`;
                        
                        if (ingredientMap.has(key)) {
                            const existing = ingredientMap.get(key);
                            existing.quantite += ingredient.quantite;
                        } else {
                            ingredientMap.set(key, {
                                nom: ingredient.nom,
                                quantite: ingredient.quantite,
                                unite: ingredient.unite,
                                checked: false
                            });
                        }
                    });
                }
            });
        });

        return Array.from(ingredientMap.values());
    }

    // Suggestion automatique de recettes
    suggestRecipes(preferences = {}) {
        const {
            category = null,
            excludeIngredients = [],
            maxPrepTime = null,
            difficulty = null
        } = preferences;

        let filteredRecipes = [...this.recipes];

        // Filtrer par catégorie
        if (category) {
            filteredRecipes = filteredRecipes.filter(recipe => 
                recipe.categorie === category
            );
        }

        // Exclure les ingrédients indésirables
        if (excludeIngredients.length > 0) {
            filteredRecipes = filteredRecipes.filter(recipe => {
                if (!recipe.ingredients) return true;
                return !recipe.ingredients.some(ingredient =>
                    excludeIngredients.includes(ingredient.nom.toLowerCase())
                );
            });
        }

        // Mélanger et retourner les suggestions
        return this.shuffleArray(filteredRecipes).slice(0, 5);
    }

    // Génération automatique de planning
    generateWeekPlanning(preferences = {}) {
        const {
            preferredCategories = ['Plat'],
            maxRepeats = 2,
            balanceCategories = true
        } = preferences;

        const newPlanning = this.initializeEmptyPlanning();
        const usedRecipes = [];
        const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        const meals = ['midi', 'soir'];

        days.forEach(day => {
            meals.forEach(meal => {
                // Filtrer les recettes disponibles
                let availableRecipes = this.recipes.filter(recipe => {
                    // Vérifier si la recette n'a pas été trop utilisée
                    const useCount = usedRecipes.filter(used => used.id === recipe.id).length;
                    return useCount < maxRepeats;
                });

                // Filtrer par catégories préférées pour certains repas
                if (meal === 'midi' && balanceCategories) {
                    availableRecipes = availableRecipes.filter(recipe =>
                        preferredCategories.includes(recipe.categorie)
                    );
                }

                // Sélectionner une recette aléatoire
                if (availableRecipes.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableRecipes.length);
                    const selectedRecipe = availableRecipes[randomIndex];
                    
                    newPlanning[day][meal] = selectedRecipe;
                    usedRecipes.push(selectedRecipe);
                }
            });
        });

        return newPlanning;
    }

    // Calculer les statistiques nutritionnelles (si données disponibles)
    calculateNutritionalStats(planning = null) {
        const planningToUse = planning || this.currentPlanning;
        const stats = {
            totalMeals: 0,
            categoriesCount: {},
            mostUsedIngredients: [],
            varietyScore: 0
        };

        const ingredientCount = {};
        const recipeCategories = {};

        Object.values(planningToUse).forEach(dayMeals => {
            Object.values(dayMeals).forEach(recipe => {
                if (recipe) {
                    stats.totalMeals++;
                    
                    // Compter les catégories
                    recipeCategories[recipe.categorie] = (recipeCategories[recipe.categorie] || 0) + 1;
                    
                    // Compter les ingrédients
                    if (recipe.ingredients) {
                        recipe.ingredients.forEach(ingredient => {
                            ingredientCount[ingredient.nom] = (ingredientCount[ingredient.nom] || 0) + 1;
                        });
                    }
                }
            });
        });

        stats.categoriesCount = recipeCategories;
        
        // Top 5 des ingrédients les plus utilisés
        stats.mostUsedIngredients = Object.entries(ingredientCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([ingredient, count]) => ({ ingredient, count }));

        // Score de variété (nombre de recettes différentes / total des repas)
        const uniqueRecipes = new Set();
        Object.values(planningToUse).forEach(dayMeals => {
            Object.values(dayMeals).forEach(recipe => {
                if (recipe) uniqueRecipes.add(recipe.id);
            });
        });
        stats.varietyScore = Math.round((uniqueRecipes.size / stats.totalMeals) * 100);

        return stats;
    }

    // Vérifier les conflits d'ingrédients (allergies, etc.)
    checkConflicts(planning = null) {
        const planningToUse = planning || this.currentPlanning;
        const conflicts = [];

        // Vérifier les restrictions alimentaires
        if (this.preferences.dietaryRestrictions.length > 0) {
            Object.entries(planningToUse).forEach(([day, dayMeals]) => {
                Object.entries(dayMeals).forEach(([meal, recipe]) => {
                    if (recipe && recipe.ingredients) {
                        recipe.ingredients.forEach(ingredient => {
                            if (this.preferences.dietaryRestrictions.includes(ingredient.nom.toLowerCase())) {
                                conflicts.push({
                                    type: 'dietary_restriction',
                                    day,
                                    meal,
                                    recipe: recipe.nom,
                                    ingredient: ingredient.nom
                                });
                            }
                        });
                    }
                });
            });
        }

        return conflicts;
    }

    // Optimiser le planning pour réduire le gaspillage
    optimizePlanning(planning = null) {
        const planningToUse = planning || this.currentPlanning;
        const suggestions = [];
        const ingredientUsage = {};

        // Analyser l'utilisation des ingrédients
        Object.values(planningToUse).forEach(dayMeals => {
            Object.values(dayMeals).forEach(recipe => {
                if (recipe && recipe.ingredients) {
                    recipe.ingredients.forEach(ingredient => {
                        const key = ingredient.nom;
                        if (!ingredientUsage[key]) {
                            ingredientUsage[key] = [];
                        }
                        ingredientUsage[key].push({
                            recipe: recipe.nom,
                            quantite: ingredient.quantite,
                            unite: ingredient.unite
                        });
                    });
                }
            });
        });

        // Identifier les ingrédients peu utilisés
        Object.entries(ingredientUsage).forEach(([ingredient, usages]) => {
            if (usages.length === 1) {
                // Chercher d'autres recettes qui utilisent cet ingrédient
                const alternativeRecipes = this.recipes.filter(recipe =>
                    recipe.ingredients && recipe.ingredients.some(ing => ing.nom === ingredient)
                );

                if (alternativeRecipes.length > 1) {
                    suggestions.push({
                        type: 'reduce_waste',
                        ingredient,
                        message: `L'ingrédient "${ingredient}" n'est utilisé que dans une recette.`,
                        alternatives: alternativeRecipes.slice(0, 3).map(r => r.nom)
                    });
                }
            }
        });

        return suggestions;
    }

    // Sauvegarder un planning comme modèle
    saveAsTemplate(name, planning = null) {
        const planningToSave = planning || this.currentPlanning;
        const template = {
            id: Date.now().toString(),
            name,
            planning: JSON.parse(JSON.stringify(planningToSave)),
            createdAt: new Date().toISOString(),
            stats: this.calculateNutritionalStats(planningToSave)
        };

        this.savedPlannings.push(template);
        return template.id;
    }

    // Charger un planning depuis un modèle
    loadFromTemplate(templateId) {
        const template = this.savedPlannings.find(t => t.id === templateId);
        if (template) {
            this.currentPlanning = JSON.parse(JSON.stringify(template.planning));
            return true;
        }
        return false;
    }

    // Obtenir tous les modèles sauvegardés
    getSavedTemplates() {
        return [...this.savedPlannings];
    }

    // Fonction utilitaire pour mélanger un tableau
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Exporter le planning en différents formats
    exportPlanning(format = 'json', planning = null) {
        const planningToExport = planning || this.currentPlanning;

        switch (format) {
            case 'json':
                return JSON.stringify(planningToExport, null, 2);
            
            case 'text':
                let text = 'PLANNING DE LA SEMAINE\n\n';
                Object.entries(planningToExport).forEach(([day, meals]) => {
                    text += `${day.toUpperCase()}\n`;
                    Object.entries(meals).forEach(([meal, recipe]) => {
                        text += `  ${meal}: ${recipe ? recipe.nom : 'Pas de repas planifié'}\n`;
                    });
                    text += '\n';
                });
                return text;
            
            case 'markdown':
                let md = '# Planning de la semaine\n\n';
                Object.entries(planningToExport).forEach(([day, meals]) => {
                    md += `## ${day.charAt(0).toUpperCase() + day.slice(1)}\n\n`;
                    Object.entries(meals).forEach(([meal, recipe]) => {
                        md += `- **${meal}**: ${recipe ? recipe.nom : 'Pas de repas planifié'}\n`;
                    });
                    md += '\n';
                });
                return md;
            
            default:
                return planningToExport;
        }
    }
}

// Export pour utilisation dans d'autres modules
if (typeof window !== 'undefined') {
    window.MealPlanner = MealPlanner;
} else {
    module.exports = MealPlanner;
}
