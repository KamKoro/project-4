import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
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
          
          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  register: (userData) => api.post('/auth/register/', userData),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (profileData) => api.put('/auth/profile/update/', profileData),
};

// Recipes API
export const recipesAPI = {
  getRecipes: (params = {}) => api.get('/recipes/', { params }),
  getRecipe: (id) => api.get(`/recipes/${id}/`),
  createRecipe: (recipeData) => api.post('/recipes/', recipeData),
  updateRecipe: (id, recipeData) => api.put(`/recipes/${id}/`, recipeData),
  deleteRecipe: (id) => api.delete(`/recipes/${id}/`),
  getUserRecipes: () => api.get('/recipes/my-recipes/'),
  getRecommendedRecipes: () => api.get('/recipes/recommended/'),
  rateRecipe: (id, rating) => api.post(`/recipes/${id}/rate/`, { rating }),
  deleteRating: (id) => api.delete(`/recipes/${id}/rate/delete/`),
  saveRecipe: (id) => api.post(`/recipes/${id}/save/`),
  unsaveRecipe: (id) => api.delete(`/recipes/${id}/unsave/`),
  getSavedRecipes: () => api.get('/saved-recipes/'),
  getIngredientCategories: () => api.get('/ingredients/categories/'),
  getIngredients: (params = {}) => api.get('/ingredients/', { params }),
  getComments: (recipeId) => api.get(`/recipes/${recipeId}/comments/`),
  addComment: (recipeId, text) => api.post(`/recipes/${recipeId}/comments/`, { text }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}/`),
};

export default api;
