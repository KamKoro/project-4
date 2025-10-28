/**
 * Authentication Context
 * 
 * Provides global authentication state and methods for login, register, logout, and profile updates.
 * Uses JWT tokens stored in localStorage for persistence.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

/**
 * Custom hook to access auth context
 * @throws Error if used outside of AuthProvider
 * @returns {Object} Auth context with user state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Authentication Provider Component
 * Wraps the app to provide authentication state globally
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);  // Current authenticated user
  const [loading, setLoading] = useState(true);  // Loading state for initial auth check

  /**
   * On mount, check if user is already authenticated
   * Fetches user profile if access token exists in localStorage
   */
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authAPI.getProfile()
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          // Token invalid or expired - clear storage
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * Login function
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      const { user: userData, tokens } = response.data;
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  /**
   * Register new user function
   * @param {Object} userData - User registration data (username, email, password, first_name, last_name)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, tokens } = response.data;
      
      // Store tokens and set user state
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  /**
   * Logout function
   * Clears tokens from localStorage and resets user state to null
   */
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  /**
   * Update user profile function
   * @param {Object} profileData - Profile data to update (bio, profile_picture, etc.)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Profile update failed' 
      };
    }
  };

  // Context value provided to all children components
  const value = {
    user,           // Current authenticated user or null
    login,          // Login function
    register,       // Register function
    logout,         // Logout function
    updateProfile,  // Update profile function
    loading         // Loading state for initial auth check
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
