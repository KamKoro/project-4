import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { recipesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Clock, Users, ChefHat, Edit, Trash2, 
  Heart, Share2, ArrowLeft
} from 'lucide-react';
import StarRating from '../components/StarRating';
import CommentSection from '../components/CommentSection';
import { convertIngredient, detectMeasurementSystem } from '../utils/unitConversion';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [measurementSystem, setMeasurementSystem] = useState('original');
  const [originalSystem, setOriginalSystem] = useState('imperial');

  const { data: recipe, isLoading, error } = useQuery(
    ['recipe', id],
    () => recipesAPI.getRecipe(id),
    {
      select: (response) => response.data,
      onSuccess: (data) => {
        setRating(data.user_rating || 0);
        // Detect original measurement system
        if (data.ingredients && data.ingredients.length > 0) {
          const detected = detectMeasurementSystem(data.ingredients);
          setOriginalSystem(detected);
        }
      }
    }
  );

  // Get converted ingredients based on selected system
  const getDisplayedIngredients = () => {
    if (!recipe || !recipe.ingredients) return [];
    
    if (measurementSystem === 'original') {
      return recipe.ingredients;
    }
    
    return recipe.ingredients.map(ingredient => {
      if (!ingredient.amount || !ingredient.unit) {
        return ingredient;
      }
      
      const converted = convertIngredient(ingredient, measurementSystem);
      return {
        ...ingredient,
        amount: converted.amount,
        unit: converted.unit
      };
    });
  };

  const toggleMeasurementSystem = () => {
    if (measurementSystem === 'original') {
      // Switch to opposite of original system
      setMeasurementSystem(originalSystem === 'imperial' ? 'metric' : 'imperial');
    } else {
      // Switch back to original
      setMeasurementSystem('original');
    }
  };

  const rateMutation = useMutation(
    (ratingValue) => recipesAPI.rateRecipe(id, ratingValue),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recipe', id]);
        toast.success('Rating saved!');
      },
      onError: () => {
        toast.error('Failed to save rating');
      }
    }
  );

  const deleteRatingMutation = useMutation(
    () => recipesAPI.deleteRating(id),
    {
      onSuccess: () => {
        setRating(0);
        queryClient.invalidateQueries(['recipe', id]);
        toast.success('Rating removed!');
      },
      onError: () => {
        toast.error('Failed to remove rating');
      }
    }
  );

  const saveMutation = useMutation(
    () => recipesAPI.saveRecipe(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recipe', id]);
        toast.success('Recipe saved!');
      },
      onError: () => {
        toast.error('Failed to save recipe');
      }
    }
  );

  const unsaveMutation = useMutation(
    () => recipesAPI.unsaveRecipe(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recipe', id]);
        toast.success('Recipe removed from saved');
      },
      onError: () => {
        toast.error('Failed to unsave recipe');
      }
    }
  );

  const deleteMutation = useMutation(
    () => recipesAPI.deleteRecipe(id),
    {
      onSuccess: () => {
        toast.success('Recipe deleted');
        navigate('/recipes');
      },
      onError: () => {
        toast.error('Failed to delete recipe');
      }
    }
  );

  const handleRating = (ratingValue) => {
    if (user) {
      setRating(ratingValue);
      rateMutation.mutate(ratingValue);
    } else {
      toast.error('Please log in to rate recipes');
    }
  };

  const handleRemoveRating = () => {
    if (user) {
      deleteRatingMutation.mutate();
    }
  };

  const handleSave = () => {
    if (user) {
      if (recipe.is_saved) {
        unsaveMutation.mutate();
      } else {
        saveMutation.mutate();
      }
    } else {
      toast.error('Please log in to save recipes');
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      deleteMutation.mutate();
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Recipe not found or error loading recipe.</p>
        <button onClick={() => navigate('/recipes')} className="btn-primary mt-4">
          Back to Recipes
        </button>
      </div>
    );
  }

  const isAuthor = user && user.id === recipe.author.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        
        {isAuthor && (
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/recipes/${id}/edit`)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="btn-secondary text-red-600 hover:text-red-700 flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Recipe Image */}
      {recipe.image && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Recipe Info */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
            {recipe.description && (
              <p className="text-lg text-gray-600 mb-4">{recipe.description}</p>
            )}
            
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <ChefHat className="h-4 w-4" />
                <span>
                  {recipe.author.username}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(recipe.prep_time + recipe.cook_time)}</span>
              </div>
              {recipe.servings && (
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} servings</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                {recipe.difficulty}
              </span>
              
              {recipe.average_rating > 0 && (
                <div className="flex items-center space-x-2">
                  <StarRating rating={recipe.average_rating} size="md" showNumber />
                  <span className="text-gray-500">({recipe.total_ratings} ratings)</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4 lg:mt-0">
            <button
              onClick={handleSave}
              className={`flex items-center space-x-2 ${
                recipe.is_saved ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart className={`h-5 w-5 ${recipe.is_saved ? 'fill-current' : ''}`} />
              <span>{recipe.is_saved ? 'Saved' : 'Save'}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <Share2 className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Rating Section */}
        {user && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Rate this recipe</h3>
            <div className="flex items-center space-x-4">
              <StarRating 
                rating={rating} 
                onRatingChange={handleRating}
                interactive={true}
                size="lg"
              />
              {rating > 0 && (
                <>
                  <span className="text-sm text-gray-600">
                    Your rating: {rating.toFixed(1)} stars
                  </span>
                  <button
                    onClick={handleRemoveRating}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove Rating
                  </button>
                </>
              )}
            </div>
            {rating === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Click on a star to rate (you can use half stars!)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Ingredients and Instructions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ingredients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Ingredients</h2>
            
            {/* Toggle Switch for Measurement System */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 font-medium">
                {measurementSystem === 'original' 
                  ? (originalSystem === 'imperial' ? 'Imperial' : 'Metric')
                  : (measurementSystem === 'metric' ? 'Imperial' : 'Metric')
                }
              </span>
              <button
                onClick={toggleMeasurementSystem}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                  measurementSystem === 'original' 
                    ? 'bg-gray-300' 
                    : 'bg-primary-500'
                }`}
                title={`Toggle to ${measurementSystem === 'original' ? (originalSystem === 'imperial' ? 'metric' : 'imperial') : (originalSystem === 'imperial' ? 'imperial' : 'metric')} measurements`}
              >
                <span
                  className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    measurementSystem === 'original' ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600 font-medium">
                {measurementSystem === 'original' 
                  ? (originalSystem === 'imperial' ? 'Metric' : 'Imperial')
                  : (measurementSystem === 'metric' ? 'Metric' : 'Imperial')
                }
              </span>
            </div>
          </div>
          
          {measurementSystem !== 'original' && (
            <div className="mb-3 text-xs text-gray-500 bg-blue-50 p-2 rounded">
              <span className="font-medium">Note:</span> Measurements converted to {measurementSystem}. Original recipe uses {originalSystem}.
            </div>
          )}
          
          <ul className="space-y-2">
            {getDisplayedIngredients().map((ingredient, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5"></span>
                <div className="flex-1">
                  <span className="font-medium">{ingredient.ingredient?.name || ingredient.name}</span>
                  {ingredient.amount && (
                    <span className="text-gray-600 ml-2">
                      {ingredient.amount} {ingredient.unit || ''}
                    </span>
                  )}
                  {ingredient.notes && (
                    <span className="text-gray-500 text-sm ml-2">({ingredient.notes})</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-gray-700">{instruction.step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection recipeId={id} />
    </div>
  );
};

export default RecipeDetail;
