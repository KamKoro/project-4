import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChefHat, User, LogOut, Plus, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <ChefHat className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold text-gray-800">Pulp Kitchen</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/recipes" className="text-gray-600 hover:text-primary-500 transition-colors">
              Browse Recipes
            </Link>
            
            {user ? (
              <>
                <Link to="/recipes/create" className="flex items-center space-x-1 text-gray-600 hover:text-primary-500 transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Create Recipe</span>
                </Link>
                <Link to="/saved-recipes" className="flex items-center space-x-1 text-gray-600 hover:text-primary-500 transition-colors">
                  <BookOpen className="h-4 w-4" />
                  <span>Saved</span>
                </Link>
                <Link to="/profile" className="flex items-center space-x-1 text-gray-600 hover:text-primary-500 transition-colors">
                  <User className="h-4 w-4" />
                  <span>{user.first_name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary-500 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
