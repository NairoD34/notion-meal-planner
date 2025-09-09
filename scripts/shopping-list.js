// Script spécialisé pour la gestion des listes de courses
// Ce script optimise la génération et la gestion des listes de courses

class ShoppingListManager {
    constructor() {
        this.shoppingList = [];
        this.categories = {
            'Légumes': ['tomate', 'salade', 'carotte', 'oignon', 'ail', 'pomme de terre', 'courgette'],
            'Fruits': ['pomme', 'banane', 'orange', 'citron', 'fraise', 'kiwi'],
            'Viandes': ['poulet', 'bœuf', 'porc', 'jambon', 'lardons', 'saucisse'],
            'Poissons': ['saumon', 'thon', 'cabillaud', 'crevette', 'moule'],
            'Produits laitiers': ['lait', 'beurre', 'fromage', 'yaourt', 'crème', 'parmesan'],
            'Épicerie': ['pâtes', 'riz', 'farine', 'sucre', 'huile', 'vinaigre', 'sel', 'poivre'],
            'Boulangerie': ['pain', 'pain de mie', 'baguette', 'croissant'],
            'Surgelés': ['petits pois', 'épinards', 'glace'],
            'Autres': []
        };
        this.stores = {
            'Supermarché': {
                sections: ['Légumes', 'Fruits', 'Viandes', 'Poissons', 'Produits laitiers', 'Épicerie', 'Boulangerie', 'Surgelés'],
                priority: 1
            },
            'Boucherie': {
                sections: ['Viandes'],
                priority: 2
            },
            'Poissonnerie': {
                sections: ['Poissons'],
                priority: 2
            },
            'Boulangerie': {
                sections: ['Boulangerie'],
                priority: 3
            }
        };
    }

    // Générer une liste de courses à partir d'un planning
    generateFromPlanning(planning, options = {}) {
        const {
            portions = 4,
            adjustQuantities = true,
            mergeSimilar = true,
            addExtras = false
        } = options;

        const ingredientMap = new Map();

        // Collecter tous les ingrédients
        Object.values(planning).forEach(dayMeals => {
            Object.values(dayMeals).forEach(recipe => {
                if (recipe && recipe.ingredients) {
                    recipe.ingredients.forEach(ingredient => {
                        const baseQuantity = adjustQuantities ? 
                            this.adjustQuantityForPortions(ingredient.quantite, portions) : 
                            ingredient.quantite;

                        const key = mergeSimilar ? 
                            this.normalizeIngredientName(ingredient.nom) : 
                            ingredient.nom;

                        if (ingredientMap.has(key)) {
                            const existing = ingredientMap.get(key);
                            if (existing.unite === ingredient.unite) {
                                existing.quantite += baseQuantity;
                            } else {
                                // Créer une entrée séparée si les unités diffèrent
                                const newKey = `${key}_${ingredient.unite}`;
                                ingredientMap.set(newKey, {
                                    nom: ingredient.nom,
                                    quantite: baseQuantity,
                                    unite: ingredient.unite,
                                    category: this.categorizeIngredient(ingredient.nom),
                                    checked: false,
                                    store: this.suggestStore(ingredient.nom)
                                });
                            }
                        } else {
                            ingredientMap.set(key, {
                                nom: ingredient.nom,
                                quantite: baseQuantity,
                                unite: ingredient.unite,
                                category: this.categorizeIngredient(ingredient.nom),
                                checked: false,
                                store: this.suggestStore(ingredient.nom)
                            });
                        }
                    });
                }
            });
        });

        // Ajouter des extras si demandé
        if (addExtras) {
            this.addBasicExtras(ingredientMap);
        }

        // Convertir en array et optimiser les quantités
        this.shoppingList = Array.from(ingredientMap.values()).map(item => ({
            ...item,
            quantite: this.optimizeQuantity(item.quantite, item.unite),
            id: this.generateItemId()
        }));

        return this.getShoppingList();
    }

    // Ajuster les quantités selon le nombre de portions
    adjustQuantityForPortions(baseQuantity, targetPortions, basePortions = 4) {
        return Math.ceil((baseQuantity * targetPortions) / basePortions);
    }

    // Normaliser le nom d'un ingrédient pour fusionner les similaires
    normalizeIngredientName(name) {
        return name.toLowerCase()
            .replace(/s$/, '') // Enlever le pluriel
            .replace(/^(de |du |des |la |le |les )/, '') // Enlever les articles
            .trim();
    }

    // Catégoriser un ingrédient
    categorizeIngredient(ingredientName) {
        const normalized = this.normalizeIngredientName(ingredientName);
        
        for (const [category, items] of Object.entries(this.categories)) {
            if (items.some(item => normalized.includes(item) || item.includes(normalized))) {
                return category;
            }
        }
        
        return 'Autres';
    }

    // Suggérer un magasin pour un ingrédient
    suggestStore(ingredientName) {
        const category = this.categorizeIngredient(ingredientName);
        
        // Magasins spécialisés en priorité
        if (category === 'Viandes') return 'Boucherie';
        if (category === 'Poissons') return 'Poissonnerie';
        if (category === 'Boulangerie') return 'Boulangerie';
        
        return 'Supermarché';
    }

    // Optimiser les quantités (arrondir, convertir les unités)
    optimizeQuantity(quantity, unit) {
        switch (unit) {
            case 'g':
                if (quantity < 50) return Math.ceil(quantity / 10) * 10;
                if (quantity < 500) return Math.ceil(quantity / 50) * 50;
                return Math.ceil(quantity / 100) * 100;
            
            case 'ml':
                if (quantity < 100) return Math.ceil(quantity / 25) * 25;
                if (quantity < 1000) return Math.ceil(quantity / 100) * 100;
                return Math.ceil(quantity / 250) * 250;
            
            case 'pièce':
                return Math.ceil(quantity);
            
            default:
                return quantity;
        }
    }

    // Ajouter des produits de base
    addBasicExtras(ingredientMap) {
        const basics = [
            { nom: 'Pain', quantite: 1, unite: 'pièce' },
            { nom: 'Lait', quantite: 1000, unite: 'ml' },
            { nom: 'Œufs', quantite: 6, unite: 'pièce' },
            { nom: 'Beurre', quantite: 250, unite: 'g' }
        ];

        basics.forEach(basic => {
            const key = this.normalizeIngredientName(basic.nom);
            if (!ingredientMap.has(key)) {
                ingredientMap.set(key, {
                    ...basic,
                    category: this.categorizeIngredient(basic.nom),
                    checked: false,
                    store: this.suggestStore(basic.nom),
                    isExtra: true
                });
            }
        });
    }

    // Organiser la liste par catégories
    organizeByCategory() {
        const organized = {};
        
        this.shoppingList.forEach(item => {
            const category = item.category;
            if (!organized[category]) {
                organized[category] = [];
            }
            organized[category].push(item);
        });

        // Trier chaque catégorie par nom
        Object.keys(organized).forEach(category => {
            organized[category].sort((a, b) => a.nom.localeCompare(b.nom));
        });

        return organized;
    }

    // Organiser la liste par magasins
    organizeByStore() {
        const organized = {};
        
        this.shoppingList.forEach(item => {
            const store = item.store;
            if (!organized[store]) {
                organized[store] = [];
            }
            organized[store].push(item);
        });

        // Trier par priorité de magasin
        const sortedStores = Object.keys(organized).sort((a, b) => {
            const priorityA = this.stores[a]?.priority || 999;
            const priorityB = this.stores[b]?.priority || 999;
            return priorityA - priorityB;
        });

        const result = {};
        sortedStores.forEach(store => {
            result[store] = organized[store].sort((a, b) => a.nom.localeCompare(b.nom));
        });

        return result;
    }

    // Marquer un élément comme acheté
    checkItem(itemId) {
        const item = this.shoppingList.find(item => item.id === itemId);
        if (item) {
            item.checked = true;
            return true;
        }
        return false;
    }

    // Démarquer un élément
    uncheckItem(itemId) {
        const item = this.shoppingList.find(item => item.id === itemId);
        if (item) {
            item.checked = false;
            return true;
        }
        return false;
    }

    // Supprimer un élément de la liste
    removeItem(itemId) {
        const index = this.shoppingList.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.shoppingList.splice(index, 1);
            return true;
        }
        return false;
    }

    // Ajouter un élément manuellement
    addItem(nom, quantite, unite, category = null) {
        const item = {
            id: this.generateItemId(),
            nom,
            quantite: this.optimizeQuantity(quantite, unite),
            unite,
            category: category || this.categorizeIngredient(nom),
            checked: false,
            store: this.suggestStore(nom),
            isManual: true
        };

        this.shoppingList.push(item);
        return item;
    }

    // Modifier un élément existant
    updateItem(itemId, updates) {
        const item = this.shoppingList.find(item => item.id === itemId);
        if (item) {
            Object.assign(item, updates);
            return item;
        }
        return null;
    }

    // Obtenir la liste complète
    getShoppingList() {
        return [...this.shoppingList];
    }

    // Obtenir les statistiques de la liste
    getStatistics() {
        const total = this.shoppingList.length;
        const checked = this.shoppingList.filter(item => item.checked).length;
        const byCategory = {};
        const byStore = {};

        this.shoppingList.forEach(item => {
            byCategory[item.category] = (byCategory[item.category] || 0) + 1;
            byStore[item.store] = (byStore[item.store] || 0) + 1;
        });

        return {
            total,
            checked,
            remaining: total - checked,
            progress: total > 0 ? Math.round((checked / total) * 100) : 0,
            byCategory,
            byStore
        };
    }

    // Exporter la liste en différents formats
    export(format = 'text') {
        switch (format) {
            case 'text':
                return this.exportAsText();
            case 'markdown':
                return this.exportAsMarkdown();
            case 'json':
                return JSON.stringify(this.shoppingList, null, 2);
            case 'csv':
                return this.exportAsCSV();
            default:
                return this.shoppingList;
        }
    }

    // Export au format texte
    exportAsText() {
        const organized = this.organizeByCategory();
        let text = 'LISTE DE COURSES\n\n';

        Object.entries(organized).forEach(([category, items]) => {
            text += `${category.toUpperCase()}\n`;
            items.forEach(item => {
                const checkbox = item.checked ? '☑' : '☐';
                text += `${checkbox} ${item.nom} - ${item.quantite} ${item.unite}\n`;
            });
            text += '\n';
        });

        return text;
    }

    // Export au format Markdown
    exportAsMarkdown() {
        const organized = this.organizeByCategory();
        let md = '# Liste de Courses\n\n';

        Object.entries(organized).forEach(([category, items]) => {
            md += `## ${category}\n\n`;
            items.forEach(item => {
                const checkbox = item.checked ? '[x]' : '[ ]';
                md += `- ${checkbox} **${item.nom}** - ${item.quantite} ${item.unite}\n`;
            });
            md += '\n';
        });

        return md;
    }

    // Export au format CSV
    exportAsCSV() {
        const headers = ['Nom', 'Quantité', 'Unité', 'Catégorie', 'Magasin', 'Acheté'];
        const rows = this.shoppingList.map(item => [
            item.nom,
            item.quantite,
            item.unite,
            item.category,
            item.store,
            item.checked ? 'Oui' : 'Non'
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    // Générer un ID unique pour un élément
    generateItemId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Vider la liste
    clear() {
        this.shoppingList = [];
    }

    // Dupliquer la liste actuelle
    duplicate() {
        return this.shoppingList.map(item => ({
            ...item,
            id: this.generateItemId(),
            checked: false
        }));
    }

    // Suggestions intelligentes basées sur l'historique
    getSuggestions(historyLists = []) {
        const frequencyMap = {};
        
        historyLists.forEach(list => {
            list.forEach(item => {
                const key = this.normalizeIngredientName(item.nom);
                frequencyMap[key] = (frequencyMap[key] || 0) + 1;
            });
        });

        return Object.entries(frequencyMap)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([name, frequency]) => ({ name, frequency }));
    }
}

// Export pour utilisation dans d'autres modules
if (typeof window !== 'undefined') {
    window.ShoppingListManager = ShoppingListManager;
} else {
    module.exports = ShoppingListManager;
}
