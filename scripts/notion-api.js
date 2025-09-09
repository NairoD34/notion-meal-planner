// Script d'automatisation pour l'API Notion
// Ce script permet d'interagir directement avec vos bases de données Notion

class NotionAPI {
    constructor(apiKey, version = '2022-06-28') {
        this.apiKey = apiKey;
        this.version = version;
        this.baseURL = 'https://api.notion.com/v1';
    }

    // Configuration avec vos IDs de bases de données
    static DATABASE_IDS = {
        ingredients: '2690a2ef-5475-8188-8b3b-ebbfbc171c18',
        recettes: '2690a2ef-5475-8133-a3f9-cdc0e15c6ddc',
        semaines: '2690a2ef-5475-81a4-a9d5-cddef9b69379',
        repas: '2690a2ef-5475-8110-882c-f601be08126b',
        courses: '2690a2ef-5475-81c1-8285-e48c94b55b79'
    };

    // Headers pour les requêtes
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Notion-Version': this.version
        };
    }

    // Requête générique
    async request(endpoint, method = 'GET', data = null) {
        const url = `${this.baseURL}/${endpoint}`;
        const options = {
            method,
            headers: this.getHeaders()
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(`Erreur API Notion: ${result.message}`);
            }
            
            return result;
        } catch (error) {
            console.error('Erreur lors de la requête Notion:', error);
            throw error;
        }
    }

    // Récupérer toutes les recettes
    async getRecipes() {
        try {
            const response = await this.request(`databases/${NotionAPI.DATABASE_IDS.recettes}/query`, 'POST');
            
            return response.results.map(page => ({
                id: page.id,
                nom: page.properties.Nom?.title?.[0]?.text?.content || 'Sans nom',
                categorie: page.properties.Catégorie?.select?.name || 'Non défini',
                lien: page.properties.Lien?.url || null,
                // Note: les ingrédients seront récupérés via la relation
                ingredients: []
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des recettes:', error);
            return [];
        }
    }

    // Récupérer tous les ingrédients
    async getIngredients() {
        try {
            const response = await this.request(`databases/${NotionAPI.DATABASE_IDS.ingredients}/query`, 'POST');
            
            return response.results.map(page => ({
                id: page.id,
                nom: page.properties.Nom?.title?.[0]?.text?.content || 'Sans nom',
                unite: page.properties.Unité?.select?.name || 'pièce',
                note: page.properties.Note?.rich_text?.[0]?.text?.content || ''
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des ingrédients:', error);
            return [];
        }
    }

    // Créer une nouvelle semaine
    async createWeek(nom, dateDebut, datefin) {
        try {
            const data = {
                parent: { database_id: NotionAPI.DATABASE_IDS.semaines },
                properties: {
                    "Nom": {
                        title: [{ text: { content: nom } }]
                    },
                    "Dates": {
                        date: {
                            start: dateDebut,
                            end: dateDebut !== dateDebut ? dateDebut : undefined
                        }
                    },
                    "Statut": {
                        select: { name: "Planifiée" }
                    }
                }
            };

            const response = await this.request('pages', 'POST', data);
            return response.id;
        } catch (error) {
            console.error('Erreur lors de la création de la semaine:', error);
            throw error;
        }
    }

    // Créer un repas hebdomadaire
    async createMeal(nom, jour, moment, recetteId, semaineId) {
        try {
            const data = {
                parent: { database_id: NotionAPI.DATABASE_IDS.repas },
                properties: {
                    "Nom": {
                        title: [{ text: { content: nom } }]
                    },
                    "Jour": {
                        select: { name: jour }
                    },
                    "Moment": {
                        select: { name: moment }
                    }
                }
            };

            // Ajouter les relations si les IDs sont fournis
            if (recetteId) {
                data.properties["Recette"] = {
                    relation: [{ id: recetteId }]
                };
            }

            if (semaineId) {
                data.properties["Semaine"] = {
                    relation: [{ id: semaineId }]
                };
            }

            const response = await this.request('pages', 'POST', data);
            return response.id;
        } catch (error) {
            console.error('Erreur lors de la création du repas:', error);
            throw error;
        }
    }

    // Créer un élément de liste de courses
    async createShoppingItem(nom, quantite, ingredientId, semaineId) {
        try {
            const data = {
                parent: { database_id: NotionAPI.DATABASE_IDS.courses },
                properties: {
                    "Nom": {
                        title: [{ text: { content: nom } }]
                    },
                    "Quantité": {
                        number: quantite
                    },
                    "Statut": {
                        checkbox: false
                    }
                }
            };

            // Ajouter les relations
            if (ingredientId) {
                data.properties["Ingrédient"] = {
                    relation: [{ id: ingredientId }]
                };
            }

            if (semaineId) {
                data.properties["Semaine"] = {
                    relation: [{ id: semaineId }]
                };
            }

            const response = await this.request('pages', 'POST', data);
            return response.id;
        } catch (error) {
            console.error('Erreur lors de la création de l\'élément de courses:', error);
            throw error;
        }
    }

    // Mettre à jour le statut d'un élément de courses
    async updateShoppingItemStatus(pageId, isChecked) {
        try {
            const data = {
                properties: {
                    "Statut": {
                        checkbox: isChecked
                    }
                }
            };

            await this.request(`pages/${pageId}`, 'PATCH', data);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            throw error;
        }
    }

    // Supprimer tous les éléments d'une semaine
    async clearWeekItems(semaineId) {
        try {
            // Récupérer tous les repas de la semaine
            const mealsQuery = await this.request(`databases/${NotionAPI.DATABASE_IDS.repas}/query`, 'POST', {
                filter: {
                    property: "Semaine",
                    relation: {
                        contains: semaineId
                    }
                }
            });

            // Récupérer tous les éléments de courses de la semaine
            const shoppingQuery = await this.request(`databases/${NotionAPI.DATABASE_IDS.courses}/query`, 'POST', {
                filter: {
                    property: "Semaine",
                    relation: {
                        contains: semaineId
                    }
                }
            });

            // Archiver tous les éléments (Notion ne permet pas la suppression directe)
            const allItems = [...mealsQuery.results, ...shoppingQuery.results];
            
            for (const item of allItems) {
                await this.request(`pages/${item.id}`, 'PATCH', {
                    archived: true
                });
            }

            console.log(`${allItems.length} éléments archivés pour la semaine ${semaineId}`);
        } catch (error) {
            console.error('Erreur lors du nettoyage de la semaine:', error);
            throw error;
        }
    }

    // Dupliquer une semaine
    async duplicateWeek(sourceSemaineId, newWeekName, newStartDate) {
        try {
            // Créer la nouvelle semaine
            const newWeekId = await this.createWeek(newWeekName, newStartDate, newStartDate);

            // Récupérer tous les repas de la semaine source
            const mealsQuery = await this.request(`databases/${NotionAPI.DATABASE_IDS.repas}/query`, 'POST', {
                filter: {
                    property: "Semaine",
                    relation: {
                        contains: sourceSemaineId
                    }
                }
            });

            // Dupliquer chaque repas
            for (const meal of mealsQuery.results) {
                const nom = meal.properties.Nom?.title?.[0]?.text?.content || 'Repas sans nom';
                const jour = meal.properties.Jour?.select?.name || 'Lundi';
                const moment = meal.properties.Moment?.select?.name || 'Midi';
                const recetteId = meal.properties.Recette?.relation?.[0]?.id || null;

                await this.createMeal(nom, jour, moment, recetteId, newWeekId);
            }

            return newWeekId;
        } catch (error) {
            console.error('Erreur lors de la duplication de la semaine:', error);
            throw error;
        }
    }
}

// Fonctions utilitaires pour faciliter l'utilisation
class MealPlannerNotionIntegration {
    constructor(apiKey) {
        this.notion = new NotionAPI(apiKey);
    }

    // Configurer les IDs des bases de données
    static configureDatabaseIds(ids) {
        NotionAPI.DATABASE_IDS = { ...NotionAPI.DATABASE_IDS, ...ids };
    }

    // Sauvegarder un planning complet vers Notion
    async savePlanningToNotion(planning, weekName, startDate) {
        try {
            // 1. Créer la semaine
            const weekId = await this.notion.createWeek(weekName, startDate, startDate);

            // 2. Créer tous les repas
            const mealPromises = [];
            Object.entries(planning).forEach(([day, meals]) => {
                Object.entries(meals).forEach(([moment, recipe]) => {
                    if (recipe) {
                        const mealName = `${recipe.nom} - ${day} ${moment}`;
                        mealPromises.push(
                            this.notion.createMeal(mealName, day, moment, recipe.id, weekId)
                        );
                    }
                });
            });

            await Promise.all(mealPromises);

            // 3. Générer et sauvegarder la liste de courses
            await this.generateAndSaveShoppingList(planning, weekId);

            return weekId;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du planning:', error);
            throw error;
        }
    }

    // Générer et sauvegarder la liste de courses
    async generateAndSaveShoppingList(planning, weekId) {
        try {
            const ingredients = {};

            // Collecter tous les ingrédients
            Object.values(planning).forEach(dayMeals => {
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

            // Créer les éléments de liste de courses
            const shoppingPromises = Object.values(ingredients).map(ingredient =>
                this.notion.createShoppingItem(
                    `${ingredient.nom} (${ingredient.quantite} ${ingredient.unite})`,
                    ingredient.quantite,
                    null, // ingredientId - à mapper avec vos ingrédients Notion
                    weekId
                )
            );

            await Promise.all(shoppingPromises);
            console.log(`${shoppingPromises.length} éléments ajoutés à la liste de courses`);
        } catch (error) {
            console.error('Erreur lors de la génération de la liste de courses:', error);
            throw error;
        }
    }

    // Charger un planning depuis Notion
    async loadPlanningFromNotion(weekId) {
        try {
            const mealsQuery = await this.notion.request(`databases/${NotionAPI.DATABASE_IDS.repas}/query`, 'POST', {
                filter: {
                    property: "Semaine",
                    relation: {
                        contains: weekId
                    }
                }
            });

            const planning = {
                lundi: { midi: null, soir: null },
                mardi: { midi: null, soir: null },
                mercredi: { midi: null, soir: null },
                jeudi: { midi: null, soir: null },
                vendredi: { midi: null, soir: null },
                samedi: { midi: null, soir: null },
                dimanche: { midi: null, soir: null }
            };

            for (const meal of mealsQuery.results) {
                const jour = meal.properties.Jour?.select?.name?.toLowerCase();
                const moment = meal.properties.Moment?.select?.name?.toLowerCase();
                const recetteId = meal.properties.Recette?.relation?.[0]?.id;

                if (jour && moment && recetteId) {
                    // Récupérer les détails de la recette
                    const recetteDetails = await this.notion.request(`pages/${recetteId}`);
                    planning[jour][moment] = {
                        id: recetteId,
                        nom: recetteDetails.properties.Nom?.title?.[0]?.text?.content || 'Recette sans nom'
                    };
                }
            }

            return planning;
        } catch (error) {
            console.error('Erreur lors du chargement du planning:', error);
            throw error;
        }
    }
}

// Export pour utilisation dans le widget
if (typeof window !== 'undefined') {
    window.NotionAPI = NotionAPI;
    window.MealPlannerNotionIntegration = MealPlannerNotionIntegration;
} else {
    module.exports = { NotionAPI, MealPlannerNotionIntegration };
}
