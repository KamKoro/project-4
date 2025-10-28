from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .models import Recipe, Rating, SavedRecipe, IngredientItem, IngredientCategory, Comment
from .serializers import (
    RecipeListSerializer, RecipeDetailSerializer, RecipeCreateUpdateSerializer,
    RatingSerializer, SavedRecipeSerializer, IngredientItemSerializer, 
    IngredientCategorySerializer, CommentSerializer
)


class RecipeListCreateView(generics.ListCreateAPIView):
    queryset = Recipe.objects.filter(is_public=True)
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return RecipeCreateUpdateSerializer
        return RecipeListSerializer
    
    def get_queryset(self):
        queryset = Recipe.objects.filter(is_public=True)
        food_type = self.request.query_params.get('food_type', None)
        cuisine = self.request.query_params.get('cuisine', None)
        search = self.request.query_params.get('search', None)
        min_rating = self.request.query_params.get('min_rating', None)
        hours_ago = self.request.query_params.get('hours_ago', None)
        difficulty = self.request.query_params.get('difficulty', None)
        max_cook_time = self.request.query_params.get('max_cook_time', None)
        ordering = self.request.query_params.get('ordering', '-created_at')
        
        if food_type:
            queryset = queryset.filter(food_type=food_type)
        
        if cuisine:
            queryset = queryset.filter(cuisine=cuisine)
        
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
                # Use subquery to filter by average rating
                from django.db.models import Avg, OuterRef, Subquery
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
        serializer.save(author=self.request.user)


class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return RecipeCreateUpdateSerializer
        return RecipeDetailSerializer
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Recipe.objects.filter(
                models.Q(is_public=True) | models.Q(author=self.request.user)
            )
        return Recipe.objects.filter(is_public=True)


class UserRecipeListView(generics.ListAPIView):
    serializer_class = RecipeListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Recipe.objects.filter(author=self.request.user)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rate_recipe(request, recipe_id):
    recipe = get_object_or_404(Recipe, id=recipe_id)
    rating_value = request.data.get('rating')
    
    try:
        rating_float = float(rating_value)
        # Check if rating is in valid range and in 0.5 increments
        if not (0.5 <= rating_float <= 5.0):
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
    
    rating, created = Rating.objects.get_or_create(
        user=request.user,
        recipe=recipe,
        defaults={'rating': rating_value}
    )
    
    if not created:
        rating.rating = rating_value
        rating.save()
    
    serializer = RatingSerializer(rating)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_rating(request, recipe_id):
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
    serializer_class = SavedRecipeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SavedRecipe.objects.filter(user=self.request.user)


class IngredientCategoryListView(generics.ListAPIView):
    queryset = IngredientCategory.objects.all()
    serializer_class = IngredientCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class IngredientItemListView(generics.ListAPIView):
    serializer_class = IngredientItemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = IngredientItem.objects.filter(is_active=True)
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        
        if category:
            queryset = queryset.filter(category__name__icontains=category)
        
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset.order_by('name')


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def recipe_comments(request, recipe_id):
    """List comments or create a new comment for a recipe."""
    recipe = get_object_or_404(Recipe, id=recipe_id)
    
    if request.method == 'GET':
        comments = Comment.objects.filter(recipe=recipe)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        text = request.data.get('text', '').strip()
        if not text:
            return Response(
                {'error': 'Comment text is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
    """Delete a comment (only by the comment author)."""
    try:
        comment = Comment.objects.get(id=comment_id)
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
    """Get personalized recipe recommendations based on user's saved recipes."""
    from django.db.models import Count, Q, Avg
    
    # Get user's saved recipes
    saved_recipes = SavedRecipe.objects.filter(user=request.user).values_list('recipe', flat=True)
    
    if not saved_recipes:
        # If no saved recipes, return highly rated recipes
        recommended = Recipe.objects.filter(is_public=True).annotate(
            avg_rating=Avg('ratings__rating')
        ).filter(avg_rating__gte=4.0).order_by('-avg_rating')[:6]
    else:
        # Get food types and difficulties from saved recipes
        saved_recipe_objs = Recipe.objects.filter(id__in=saved_recipes)
        food_types = saved_recipe_objs.values_list('food_type', flat=True).distinct()
        difficulties = saved_recipe_objs.values_list('difficulty', flat=True).distinct()
        
        # Find recipes with similar food types or difficulties that user hasn't saved
        # and aren't authored by the user
        recommended = Recipe.objects.filter(
            Q(food_type__in=food_types) | Q(difficulty__in=difficulties),
            is_public=True
        ).exclude(
            id__in=saved_recipes
        ).exclude(
            author=request.user
        ).annotate(
            avg_rating=Avg('ratings__rating')
        ).order_by('-avg_rating', '-created_at')[:6]
    
    serializer = RecipeListSerializer(recommended, many=True, context={'request': request})
    return Response(serializer.data)
