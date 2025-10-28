"""
Recipe application views.
Handles API endpoints for recipes, ratings, saved recipes, ingredients, and comments.
"""
# pylint: disable=no-member
# Django models have dynamically added 'objects' manager and 'DoesNotExist' exception
from datetime import timedelta

from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from django.db.models import Q, Avg
from django.utils import timezone
from .models import Recipe, Rating, SavedRecipe, IngredientItem, IngredientCategory, Comment
from .serializers import (
    RecipeListSerializer, RecipeDetailSerializer, RecipeCreateUpdateSerializer,
    RatingSerializer, SavedRecipeSerializer, IngredientItemSerializer,
    IngredientCategorySerializer, CommentSerializer
)


class RecipeListCreateView(generics.ListCreateAPIView):
    """
    API view for listing and creating recipes.

    GET: Returns paginated list of public recipes with filtering and sorting.
    POST: Creates a new recipe (requires authentication).

    Query Parameters:
        - search: Search in title and description
        - food_type: Filter by food type (appetizer, main_course, dessert, etc.)
        - cuisine: Filter by cuisine (italian, mexican, chinese, etc.)
        - difficulty: Filter by difficulty (easy, medium, hard)
        - max_cook_time: Filter by maximum cook time in minutes
        - min_rating: Filter by minimum average rating
        - ordering: Sort results (created_at, -created_at, title, -title)
        - page_size: Number of results per page
    """
    queryset = Recipe.objects.filter(is_public=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    def get_serializer_class(self):
        """Return appropriate serializer based on request method."""
        if self.request.method == 'POST':
            return RecipeCreateUpdateSerializer
        return RecipeListSerializer

    def get_queryset(self):
        """
        Get filtered and sorted queryset of recipes.
        Supports multiple filters and ordering options via query parameters.
        """
        queryset = Recipe.objects.filter(is_public=True)

        # Extract query parameters
        food_type = self.request.query_params.get('food_type', None)
        cuisine = self.request.query_params.get('cuisine', None)
        search = self.request.query_params.get('search', None)
        min_rating = self.request.query_params.get('min_rating', None)
        hours_ago = self.request.query_params.get('hours_ago', None)
        difficulty = self.request.query_params.get('difficulty', None)
        max_cook_time = self.request.query_params.get('max_cook_time', None)
        ordering = self.request.query_params.get('ordering', '-created_at')

        # Filter by food type (appetizer, main_course, dessert, etc.)
        if food_type:
            queryset = queryset.filter(food_type=food_type)

        # Filter by cuisine (italian, mexican, chinese, etc.)
        if cuisine:
            queryset = queryset.filter(cuisine=cuisine)

        # Search in title and description
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search)
            )

        # Filter by difficulty
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)

        # Filter by maximum cook time
        if max_cook_time:
            try:
                max_time = int(max_cook_time)
                queryset = queryset.filter(cook_time__lte=max_time)
            except (ValueError, TypeError):
                pass  # Invalid max_cook_time parameter, ignore it

        # Filter by minimum rating (4+ stars for featured recipes)
        if min_rating:
            try:
                min_rating_float = float(min_rating)
                # Use aggregation to filter by average rating
                queryset = queryset.annotate(
                    avg_rating=Avg('ratings__rating')
                ).filter(avg_rating__gte=min_rating_float)
            except (ValueError, TypeError):
                pass  # Invalid min_rating parameter, ignore it

        # Filter by time (e.g., last 24 hours for recent recipes)
        if hours_ago:
            try:
                hours = int(hours_ago)
                cutoff_time = timezone.now() - timedelta(hours=hours)
                queryset = queryset.filter(created_at__gte=cutoff_time)
            except (ValueError, TypeError):
                pass  # Invalid hours_ago parameter, ignore it

        # Apply ordering - default to newest first
        # Allowed ordering fields for security
        allowed_orderings = ['created_at', '-created_at', 'title', '-title']
        if ordering in allowed_orderings:
            return queryset.order_by(ordering)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        """Automatically set the recipe author to the current user."""
        serializer.save(author=self.request.user)


class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API view for retrieving, updating, and deleting a single recipe.

    GET: Returns recipe details (public recipes or own recipes)
    PUT/PATCH: Updates recipe (requires authentication and ownership)
    DELETE: Deletes recipe (requires authentication and ownership)
    """
    queryset = Recipe.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        """Return appropriate serializer based on request method."""
        if self.request.method in ['PUT', 'PATCH']:
            return RecipeCreateUpdateSerializer
        return RecipeDetailSerializer

    def get_queryset(self):
        """
        Return recipes based on user authentication.
        Authenticated users can see their own private recipes and all public recipes.
        Anonymous users can only see public recipes.
        """
        if self.request.user.is_authenticated:
            return Recipe.objects.filter(
                models.Q(is_public=True) | models.Q(author=self.request.user)
            )
        return Recipe.objects.filter(is_public=True)


class UserRecipeListView(generics.ListAPIView):
    """
    API view for listing recipes created by the authenticated user.
    Returns all recipes (public and private) owned by the current user.
    """
    serializer_class = RecipeListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return all recipes authored by the current user."""
        return Recipe.objects.filter(author=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_recipe(request, recipe_id):
    """
    Rate a recipe with half-star precision (0.5-5.0 stars).
    Creates a new rating or updates existing rating for the current user.
    """
    recipe = get_object_or_404(Recipe, id=recipe_id)
    rating_value = request.data.get('rating')

    try:
        rating_float = float(rating_value)
        # Check if rating is in valid range and in 0.5 increments
        if not 0.5 <= rating_float <= 5.0:
            return Response(
                {'error': 'Rating must be between 0.5 and 5.0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        # Check if rating is in 0.5 increments (0.5, 1.0, 1.5, 2.0, etc.)
        if (rating_float * 2) % 1 != 0:
            return Response(
                {'error': 'Rating must be in 0.5 increments (e.g., 1.5, 2.0, 4.5)'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except (ValueError, TypeError):
        return Response(
            {'error': 'Invalid rating value'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get or create rating for this user and recipe
    rating, created = Rating.objects.get_or_create(
        user=request.user,
        recipe=recipe,
        defaults={'rating': rating_value}
    )

    # Update existing rating if already exists
    if not created:
        rating.rating = rating_value
        rating.save()

    serializer = RatingSerializer(rating)
    return Response(serializer.data, status=status.HTTP_201_CREATED
        if created else status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_rating(request, recipe_id):
    """
    Delete the current user's rating for a recipe.
    Returns 404 if no rating exists.
    """
    recipe = get_object_or_404(Recipe, id=recipe_id)
    try:
        rating = Rating.objects.get(user=request.user, recipe=recipe)
        rating.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Rating.DoesNotExist:
        return Response(
            {'error': 'Rating not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_recipe(request, recipe_id):
    """
    Save/bookmark a recipe for the current user.
    Returns 200 if recipe is already saved.
    """
    recipe = get_object_or_404(Recipe, id=recipe_id)
    saved_recipe, created = SavedRecipe.objects.get_or_create(
        user=request.user,
        recipe=recipe
    )

    if created:
        serializer = SavedRecipeSerializer(saved_recipe)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(
            {'message': 'Recipe already saved'},
            status=status.HTTP_200_OK
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unsave_recipe(request, recipe_id):
    """
    Remove a recipe from the current user's saved recipes.
    Returns 404 if recipe wasn't saved.
    """
    recipe = get_object_or_404(Recipe, id=recipe_id)
    try:
        saved_recipe = SavedRecipe.objects.get(user=request.user, recipe=recipe)
        saved_recipe.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except SavedRecipe.DoesNotExist:
        return Response(
            {'error': 'Saved recipe not found'},
            status=status.HTTP_404_NOT_FOUND
        )


class SavedRecipeListView(generics.ListAPIView):
    """
    API view for listing all recipes saved by the authenticated user.
    Returns recipes in the order they were saved.
    """
    serializer_class = SavedRecipeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Return all recipes saved by the current user."""
        return SavedRecipe.objects.filter(user=self.request.user)


class IngredientCategoryListView(generics.ListAPIView):
    """
    API view for listing all ingredient categories.
    Returns categories like Vegetables, Fruits, Proteins, etc.
    """
    queryset = IngredientCategory.objects.all()
    serializer_class = IngredientCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class IngredientItemListView(generics.ListAPIView):
    """
    API view for listing and searching ingredient items.
    Supports filtering by category and search by name.

    Query Parameters:
        - category: Filter by category name
        - search: Search in ingredient name
    """
    serializer_class = IngredientItemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """Return filtered and sorted ingredients."""
        queryset = IngredientItem.objects.filter(is_active=True)
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)

        # Filter by category name
        if category:
            queryset = queryset.filter(category__name__icontains=category)

        # Search by ingredient name
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset.order_by('name')


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def recipe_comments(request, recipe_id):
    """
    List comments or create a new comment for a recipe.

    GET: Returns all comments for the specified recipe (no auth required)
    POST: Create a new comment (requires authentication)
    """
    recipe = get_object_or_404(Recipe, id=recipe_id)

    if request.method == 'GET':
        # Return all comments for this recipe, ordered by newest first
        comments = Comment.objects.filter(recipe=recipe)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Ensure user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Validate comment text
        text = request.data.get('text', '').strip()
        if not text:
            return Response(
                {'error': 'Comment text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create the comment
        comment = Comment.objects.create(
            recipe=recipe,
            user=request.user,
            text=text
        )
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_comment(request, comment_id):
    """
    Delete a comment.
    Only the comment author can delete their own comments.
    """
    try:
        comment = Comment.objects.get(id=comment_id)
        # Check ownership - users can only delete their own comments
        if comment.user != request.user:
            return Response(
                {'error': 'You can only delete your own comments'},
                status=status.HTTP_403_FORBIDDEN
            )

        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Comment.DoesNotExist:
        return Response(
            {'error': 'Comment not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_recipes(request):
    """
    Get personalized recipe recommendations for the current user.

    Algorithm:
    1. If user has saved recipes: Find similar recipes based on food_type and difficulty
    2. If no saved recipes: Return highly-rated recipes (4+ stars)
    3. Exclude recipes user has already saved or authored
    4. Return top 6 recommendations ordered by rating
    """
    # Get IDs of recipes the user has saved
    saved_recipes = SavedRecipe.objects.filter(user=request.user).values_list('recipe', flat=True)

    if not saved_recipes:
        # No saved recipes yet - recommend highly rated recipes
        recommended = Recipe.objects.filter(is_public=True).annotate(
            avg_rating=Avg('ratings__rating')
        ).filter(avg_rating__gte=4.0).order_by('-avg_rating')[:6]
    else:
        # User has saved recipes - find similar ones
        saved_recipe_objs = Recipe.objects.filter(id__in=saved_recipes)

        # Extract characteristics from saved recipes
        food_types = saved_recipe_objs.values_list('food_type', flat=True).distinct()
        difficulties = saved_recipe_objs.values_list('difficulty', flat=True).distinct()

        # Find similar recipes that user hasn't saved and didn't create
        recommended = Recipe.objects.filter(
            Q(food_type__in=food_types) | Q(difficulty__in=difficulties),
            is_public=True
        ).exclude(
            id__in=saved_recipes  # Exclude already saved recipes
        ).exclude(
            author=request.user  # Exclude user's own recipes
        ).annotate(
            avg_rating=Avg('ratings__rating')
        ).order_by('-avg_rating', '-created_at')[:6]

    serializer = RecipeListSerializer(recommended, many=True, context={'request': request})
    return Response(serializer.data)
