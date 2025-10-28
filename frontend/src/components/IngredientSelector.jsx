/**
 * Ingredient Selector Component
 * 
 * Searchable dropdown for selecting ingredients when creating/editing recipes.
 * Features:
 * - Search by ingredient name
 * - Filter by category (Vegetables, Proteins, Dairy, etc.)
 * - Auto-complete suggestions
 * - Clear selection option
 */
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { recipesAPI } from '../services/api';
import { Search, X, ChevronDown } from 'lucide-react';

/**
 * @param {Function} onSelect - Callback when ingredient is selected
 * @param {Object} selectedIngredient - Currently selected ingredient object
 * @param {Function} onClear - Callback when selection is cleared
 */
const IngredientSelector = ({ onSelect, selectedIngredient, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Fetch ingredient categories for filtering
  const { data: categories } = useQuery(
    'ingredient-categories',
    () => recipesAPI.getIngredientCategories(),
    {
      select: (response) => response.data,
    }
  );

  // Fetch ingredients based on search and category filter
  // Only fetches when dropdown is open (enabled: isOpen)
  const { data: ingredients, isLoading, error } = useQuery(
    ['ingredients', searchTerm, selectedCategory],
    () => recipesAPI.getIngredients({
      search: searchTerm,
      category: selectedCategory
    }),
    {
      select: (response) => response.data,
      enabled: isOpen,  // Only fetch when dropdown is open
      staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
    }
  );

  // Handle ingredient selection
  const handleSelect = (ingredient) => {
    onSelect(ingredient);
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle clear selection
  const handleClear = () => {
    onClear();
    setIsOpen(false);
    setSearchTerm('');
  };

  // Reset search and category when dropdown is opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedCategory('');
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <div className="flex">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 input-field text-left flex items-center justify-between"
        >
          <span className={selectedIngredient ? 'text-gray-900' : 'text-gray-500'}>
            {selectedIngredient ? selectedIngredient.name : 'Select an ingredient...'}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        
        {selectedIngredient && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 p-2 text-gray-400 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search and Filter */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {categories && categories.results && categories.results.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.results.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ingredients List */}
          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-2">Loading ingredients...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">
                <p>Error loading ingredients</p>
                <p className="text-sm mt-1">{error.message}</p>
              </div>
            ) : ingredients && ingredients.results && ingredients.results.length > 0 ? (
              <div className="py-1">
                {ingredients.results.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    type="button"
                    onClick={() => handleSelect(ingredient)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{ingredient.name}</span>
                      {ingredient.category && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {ingredient.category.name}
                        </span>
                      )}
                    </div>
                    {ingredient.description && (
                      <p className="text-xs text-gray-500 mt-1">{ingredient.description}</p>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No ingredients found</p>
                {searchTerm && (
                  <p className="text-sm mt-1">Try a different search term</p>
                )}
                {!searchTerm && !selectedCategory && (
                  <p className="text-sm mt-1">Start typing to search ingredients</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientSelector;
