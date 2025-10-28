/**
 * API Service Layer
 * 
 * Centralized API configuration and endpoint definitions.
 * Handles authentication, token refresh, and error handling.
 */
import axios from 'axios';

// Base URL for API requests - uses environment variable or defaults to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Automatically adds JWT token to requests
 * Retrieves access token from localStorage and attaches to Authorization header
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handles token refresh on 401 errors
 * Automatically refreshes expired access tokens using refresh token
 * Redirects to login page if refresh fails
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 error and haven't retried yet, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry original request with new access token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Authentication API endpoints
 */
export const authAPI = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  register: (userData) => api.post('/auth/register/', userData),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (profileData) => api.put('/auth/profile/update/', profileData),
};

/**
 * Recipes API endpoints
 */
export const recipesAPI = {
  // Recipe CRUD operations
  getRecipes: (params = {}) => api.get('/recipes/', { params }),  // Supports search, filters, sorting, pagination
  getRecipe: (id) => api.get(`/recipes/${id}/`),
  createRecipe: (recipeData) => api.post('/recipes/', recipeData),
  updateRecipe: (id, recipeData) => api.put(`/recipes/${id}/`, recipeData),
  deleteRecipe: (id) => api.delete(`/recipes/${id}/`),
  
  // User-specific recipe lists
  getUserRecipes: () => api.get('/recipes/my-recipes/'),  // Get current user's recipes
  getRecommendedRecipes: () => api.get('/recipes/recommended/'),  // Get personalized recommendations
  getSavedRecipes: () => api.get('/saved-recipes/'),  // Get bookmarked recipes
  
  // Rating operations (0.5-5.0 stars)
  rateRecipe: (id, rating) => api.post(`/recipes/${id}/rate/`, { rating }),
  deleteRating: (id) => api.delete(`/recipes/${id}/rate/delete/`),
  
  // Save/bookmark operations
  saveRecipe: (id) => api.post(`/recipes/${id}/save/`),
  unsaveRecipe: (id) => api.delete(`/recipes/${id}/unsave/`),
  
  // Ingredient operations
  getIngredientCategories: () => api.get('/ingredients/categories/'),
  getIngredients: (params = {}) => api.get('/ingredients/', { params }),  // Supports category filter and search
  
  // Comment operations
  getComments: (recipeId) => api.get(`/recipes/${recipeId}/comments/`),
  addComment: (recipeId, text) => api.post(`/recipes/${recipeId}/comments/`, { text }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}/`),
};

export default api;
