from django.urls import path
from . import views

urlpatterns = [
    path('recipes/', views.RecipeListCreateView.as_view(), name='recipe-list-create'),
    path('recipes/<int:pk>/', views.RecipeDetailView.as_view(), name='recipe-detail'),
    path('recipes/my-recipes/', views.UserRecipeListView.as_view(), name='user-recipes'),
    path('recipes/recommended/', views.recommended_recipes, name='recommended-recipes'),
    path('recipes/<int:recipe_id>/rate/', views.rate_recipe, name='rate-recipe'),
    path('recipes/<int:recipe_id>/rate/delete/', views.delete_rating, name='delete-rating'),
    path('recipes/<int:recipe_id>/save/', views.save_recipe, name='save-recipe'),
    path('recipes/<int:recipe_id>/unsave/', views.unsave_recipe, name='unsave-recipe'),
    path('recipes/<int:recipe_id>/comments/', views.recipe_comments, name='recipe-comments'),
    path('comments/<int:comment_id>/', views.delete_comment, name='delete-comment'),
    path('saved-recipes/', views.SavedRecipeListView.as_view(), name='saved-recipes'),
    path('ingredients/categories/', views.IngredientCategoryListView.as_view(), name='ingredient-categories'),
    path('ingredients/', views.IngredientItemListView.as_view(), name='ingredient-items'),
]
