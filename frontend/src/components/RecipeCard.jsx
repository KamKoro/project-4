/**
 * Recipe Card Component
 * 
 * Displays a preview card for a recipe with key information:
 * - Recipe image, title, and description
 * - Author, difficulty, cook time, servings
 * - Average rating and number of reviews
 * - Clickable link to full recipe details
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ChefHat } from 'lucide-react';
import StarRating from './StarRating';

/**
 * @param {Object} recipe - Recipe object with all details
 */
const RecipeCard = ({ recipe }) => {
  /**
   * Format cooking time in human-readable format
   * @param {number} minutes - Time in minutes
   * @returns {string} Formatted time (e.g., "1h 30m", "45m")
   */
  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  /**
   * Get Tailwind classes for difficulty badge
   * @param {string} difficulty - Recipe difficulty level
   * @returns {string} Tailwind CSS classes
   */
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Link 
      to={`/recipes/${recipe.id}`}
      className="block card hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
    >
      {recipe.image && (
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {recipe.title}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
        </div>
        
        {recipe.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {recipe.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(recipe.prep_time + recipe.cook_time)}</span>
            </div>
            {recipe.servings && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings}</span>
              </div>
            )}
          </div>
          
          {recipe.average_rating > 0 && (
            <div className="flex items-center space-x-1">
              <StarRating rating={recipe.average_rating} size="sm" showNumber />
              <span className="text-gray-400">({recipe.total_ratings})</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <ChefHat className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {recipe.author.username}
            </span>
          </div>
          
          <span className="text-primary-500 hover:text-primary-600 text-sm font-medium">
            View Recipe →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
