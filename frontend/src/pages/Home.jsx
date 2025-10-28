import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { recipesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/RecipeCard';
import { ChefHat, Star, Users } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  
  const { data: recipes, isLoading } = useQuery(
    'featured-recipes',
    () => recipesAPI.getRecipes({ page_size: 6, min_rating: 4 }),
    {
      select: (response) => response.data.results || response.data,
    }
  );

  const { data: recentRecipes, isLoading: isLoadingRecent } = useQuery(
    'recent-recipes',
    () => recipesAPI.getRecipes({ page_size: 6, ordering: '-created_at' }),
    {
      select: (response) => response.data.results || response.data,
    }
  );

  // Recommended recipes - temporarily disabled
  // const { data: recommendedRecipes, isLoading: isLoadingRecommended } = useQuery(
  //   'recommended-recipes',
  //   () => recipesAPI.getRecommendedRecipes(),
  //   {
  //     enabled: !!user, // Only fetch if user is logged in
  //     select: (response) => response.data,
  //   }
  // );

  return (
    <div className="space-y-12">
      {/* Hero Section - Only show for guests (non-logged-in users) */}
      {!user && (
        <section className="text-center py-16 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl">
          <div className="max-w-4xl mx-auto px-4">
            <ChefHat className="h-16 w-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Share Your Culinary
              <span className="block text-yellow-300">Masterpieces</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Create, discover, and share amazing recipes with a community of food lovers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/recipes" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                Browse Recipes
              </Link>
              <Link to="/register" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                Join Community
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Only show for guests (non-logged-in users) */}
      {!user && (
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Pulp Kitchen?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to create, organize, and share your favorite recipes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Recipes</h3>
              <p className="text-gray-600">
                Build detailed recipes with ingredients, instructions, and photos
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rate & Review</h3>
              <p className="text-gray-600">
                Share your feedback and discover the best recipes from the community
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Favorites</h3>
              <p className="text-gray-600">
                Keep track of your favorite recipes and build your personal collection
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Recommended For You - Temporarily disabled */}
      {/* {user && recommendedRecipes && recommendedRecipes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Recommended For You</h2>
              <p className="text-sm text-gray-600 mt-1">Based on your saved recipes</p>
            </div>
            <Link to="/recipes" className="text-primary-500 hover:text-primary-600 font-medium">
              View All →
            </Link>
          </div>
          
          {isLoadingRecommended ? (
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedRecipes?.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </section>
      )} */}

      {/* Featured Recipes */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Recipes</h2>
            <p className="text-sm text-gray-600 mt-1">Highly rated recipes (4+ stars)</p>
          </div>
          <Link to="/recipes" className="text-primary-500 hover:text-primary-600 font-medium">
            View All →
          </Link>
        </div>
        
        {isLoading ? (
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
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes?.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>

      {/* Recently Created Recipes */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Recently Created</h2>
            <p className="text-sm text-gray-600 mt-1">Newest recipes from our community</p>
          </div>
          <Link to="/recipes" className="text-primary-500 hover:text-primary-600 font-medium">
            View All →
          </Link>
        </div>
        
        {isLoadingRecent ? (
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
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentRecipes?.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
