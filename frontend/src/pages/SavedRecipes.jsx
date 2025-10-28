import React from 'react';
import { useQuery } from 'react-query';
import { recipesAPI } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import { BookOpen } from 'lucide-react';

const SavedRecipes = () => {
  const { data: savedRecipes, isLoading, error } = useQuery(
    'saved-recipes',
    () => recipesAPI.getSavedRecipes(),
    {
      select: (response) => response.data.results || response.data,
    }
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-gray-900">Saved Recipes</h1>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-gray-900">Saved Recipes</h1>
        </div>
        
        <div className="text-center py-12">
          <p className="text-red-600">Error loading saved recipes. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BookOpen className="h-8 w-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-900">Saved Recipes</h1>
      </div>
      
      {savedRecipes?.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved recipes yet</h3>
          <p className="text-gray-600 mb-6">
            Start exploring recipes and save your favorites to see them here.
          </p>
          <a href="/recipes" className="btn-primary">
            Browse Recipes
          </a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRecipes?.map((savedRecipe) => (
            <RecipeCard key={savedRecipe.id} recipe={savedRecipe.recipe} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedRecipes;
