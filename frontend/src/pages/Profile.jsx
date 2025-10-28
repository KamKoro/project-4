import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { recipesAPI } from '../services/api';
import toast from 'react-hot-toast';
import { User, Edit, Save, X } from 'lucide-react';
import RecipeCard from '../components/RecipeCard';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      bio: user?.bio || ''
    }
  });

  const { data: userRecipes, isLoading } = useQuery(
    'user-recipes',
    () => recipesAPI.getUserRecipes(),
    {
      select: (response) => response.data.results || response.data,
    }
  );

  const onSubmit = async (data) => {
    const result = await updateProfile(data);
    
    if (result.success) {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } else {
      toast.error(result.error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-primary-600" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user.first_name 
                  ? user.first_name
                  : user.username
                }
              </h1>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(user.date_joined).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary flex items-center space-x-2 mt-4 md:mt-0"
          >
            {isEditing ? (
              <>
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Bio Section */}
        <div className="mt-6">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  {...register('first_name', { required: 'First name is required' })}
                  className="input-field"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  {...register('last_name', { required: 'Last name is required' })}
                  className="input-field"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  rows={3}
                  className="input-field"
                  placeholder="Tell us about yourself..."
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-700">
                {user.bio || 'No bio available. Click "Edit Profile" to add one.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User's Recipes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Recipes</h2>
        
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
        ) : userRecipes?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You haven't created any recipes yet.</p>
            <a href="/recipes/create" className="btn-primary">
              Create Your First Recipe
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRecipes?.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
