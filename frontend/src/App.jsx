import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import RecipeList from './pages/RecipeList';
import RecipeDetail from './pages/RecipeDetail';
import RecipeCreate from './pages/RecipeCreate';
import RecipeEdit from './pages/RecipeEdit';
import SavedRecipes from './pages/SavedRecipes';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/recipes" element={<RecipeList />} />
                <Route path="/recipes/:id" element={<RecipeDetail />} />
                <Route 
                  path="/recipes/create" 
                  element={
                    <ProtectedRoute>
                      <RecipeCreate />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/recipes/:id/edit" 
                  element={
                    <ProtectedRoute>
                      <RecipeEdit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/saved-recipes" 
                  element={
                    <ProtectedRoute>
                      <SavedRecipes />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Toaster position="top-right" />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
