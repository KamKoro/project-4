import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { recipesAPI } from '../services/api';
import { Search, Plus, Heart, Bookmark, Share2, Clock, Users, Star, ChefHat } from 'lucide-react';

const SocialRecipeCard = ({ recipe }) => {
  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Link 
      to={`/recipes/${recipe.id}`}
      className="block bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
    >
      {/* Header with user info */}
      <div className="p-4 pb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {recipe.author.first_name 
                ? recipe.author.first_name[0].toUpperCase()
                : recipe.author.username[0].toUpperCase()
              }
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">
                {recipe.author.first_name 
                  ? recipe.author.first_name
                  : recipe.author.username
                }
              </h3>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-500 text-sm">{formatDate(recipe.created_at)}</span>
            </div>
            <p className="text-sm text-gray-600 capitalize">{recipe.food_type.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Recipe Image */}
      <div className="relative">
        {recipe.image ? (
          <img 
            src={recipe.image} 
            alt={recipe.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <ChefHat className="h-16 w-16 text-primary-400" />
          </div>
        )}
        
        {/* Difficulty badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            recipe.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            recipe.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {recipe.difficulty}
          </span>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {recipe.title}
        </h2>
        {recipe.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {recipe.description}
          </p>
        )}

        {/* Recipe Stats */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(recipe.prep_time + recipe.cook_time)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
          {recipe.average_rating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span>{recipe.average_rating.toFixed(1)} ({recipe.total_ratings})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

const RecipeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foodType, setFoodType] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [maxCookTime, setMaxCookTime] = useState('');
  const [sortOrder, setSortOrder] = useState('-created_at'); // Default: newest first
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(
    ['recipes', searchTerm, foodType, cuisine, difficulty, maxCookTime, sortOrder, page],
    () => {
      const params = {
        page: page,
        page_size: 12,
        ordering: sortOrder,
      };
      
      // Only add non-empty filters
      if (searchTerm) params.search = searchTerm;
      if (foodType) params.food_type = foodType;
      if (cuisine) params.cuisine = cuisine;
      if (difficulty) params.difficulty = difficulty;
      if (maxCookTime) params.max_cook_time = maxCookTime;
      
      return recipesAPI.getRecipes(params);
    },
    {
      select: (response) => response.data,
    }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFoodType('');
    setCuisine('');
    setDifficulty('');
    setMaxCookTime('');
    setSortOrder('-created_at');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Discover Recipes</h1>
            <Link to="/recipes/create" className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Create</span>
            </Link>
          </div>
          
          {/* Search and Filters */}
          <form onSubmit={handleSearch} className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="appetizer">Appetizer</option>
                <option value="main_course">Main Course</option>
                <option value="dessert">Dessert</option>
                <option value="side_dish">Side Dish</option>
                <option value="soup">Soup</option>
                <option value="salad">Salad</option>
                <option value="beverage">Beverage</option>
                <option value="snack">Snack</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="other">Other</option>
              </select>
              
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Cuisines</option>
                <option value="american">American</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="chinese">Chinese</option>
                <option value="japanese">Japanese</option>
                <option value="thai">Thai</option>
                <option value="indian">Indian</option>
                <option value="french">French</option>
                <option value="greek">Greek</option>
                <option value="spanish">Spanish</option>
                <option value="middle_eastern">Middle Eastern</option>
                <option value="korean">Korean</option>
                <option value="vietnamese">Vietnamese</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="caribbean">Caribbean</option>
                <option value="african">African</option>
                <option value="other">Other</option>
              </select>
              
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              
              <select
                value={maxCookTime}
                onChange={(e) => setMaxCookTime(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Cook Times</option>
                <option value="15">Under 15 min</option>
                <option value="30">Under 30 min</option>
                <option value="45">Under 45 min</option>
                <option value="60">Under 1 hour</option>
                <option value="90">Under 1.5 hours</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
              </select>
              
              {(searchTerm || foodType || cuisine || difficulty || maxCookTime || sortOrder !== '-created_at') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Social Media Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
                <div className="h-64 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                      <div className="h-6 bg-gray-200 rounded w-12"></div>
                      <div className="h-6 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading recipes. Please try again.</p>
          </div>
        ) : data?.results?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No recipes found. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {data?.results?.map((recipe) => (
                <SocialRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
            
            {/* Load More Button */}
            {data?.next && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage(page + 1)}
                  className="btn-primary px-8 py-2"
                >
                  Load More Recipes
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeList;
