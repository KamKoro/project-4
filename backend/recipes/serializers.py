from rest_framework import serializers
from users.serializers import UserSerializer
from .models import (
    Recipe, RecipeIngredient, Instruction, Rating, SavedRecipe,
    IngredientItem, IngredientCategory, Comment
)


class IngredientCategorySerializer(serializers.ModelSerializer):
    """Serializer for ingredient categories."""
    class Meta:
        """Meta options for IngredientCategorySerializer."""
        model = IngredientCategory
        fields = ['id', 'name', 'description']


class IngredientItemSerializer(serializers.ModelSerializer):
    """Serializer for ingredient items."""
    category = IngredientCategorySerializer(read_only=True)

    class Meta:
        """Meta options for IngredientItemSerializer."""
        model = IngredientItem
        fields = ['id', 'name', 'category', 'description', 'is_active']


class RecipeIngredientSerializer(serializers.ModelSerializer):
    """Serializer for recipe ingredients."""
    ingredient = IngredientItemSerializer(read_only=True)
    ingredient_id = serializers.IntegerField(write_only=True)

    class Meta:
        """Meta options for RecipeIngredientSerializer."""
        model = RecipeIngredient
        fields = [
            'id', 'ingredient', 'ingredient_id', 'amount', 
            'unit', 'order', 'notes'
        ]


class InstructionSerializer(serializers.ModelSerializer):
    """Serializer for recipe instructions."""
    class Meta:
        """Meta options for InstructionSerializer."""
        model = Instruction
        fields = ['id', 'step', 'order']


class RatingSerializer(serializers.ModelSerializer):
    """Serializer for recipe ratings."""
    user = UserSerializer(read_only=True)

    class Meta:
        """Meta options for RatingSerializer."""
        model = Rating
        fields = ['id', 'user', 'rating', 'created_at']
        read_only_fields = ['user', 'created_at']


class RecipeListSerializer(serializers.ModelSerializer):
    """Serializer for recipe list view."""
    author = UserSerializer(read_only=True)
    average_rating = serializers.ReadOnlyField()
    total_ratings = serializers.ReadOnlyField()

    class Meta:
        """Meta options for RecipeListSerializer."""
        model = Recipe
        fields = [
            'id', 'title', 'description', 'author', 'image', 'prep_time',
            'cook_time', 'servings', 'difficulty', 'food_type', 'is_public',
            'created_at', 'updated_at', 'average_rating', 'total_ratings'
        ]


class RecipeDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed recipe view."""
    author = UserSerializer(read_only=True)
    ingredients = RecipeIngredientSerializer(many=True, read_only=True)
    instructions = InstructionSerializer(many=True, read_only=True)
    ratings = RatingSerializer(many=True, read_only=True)
    average_rating = serializers.ReadOnlyField()
    total_ratings = serializers.ReadOnlyField()
    is_saved = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()

    class Meta:
        """Meta options for RecipeDetailSerializer."""
        model = Recipe
        fields = [
            'id', 'title', 'description', 'author', 'image', 'prep_time',
            'cook_time', 'servings', 'difficulty', 'food_type', 'is_public',
            'created_at', 'updated_at', 'ingredients', 'instructions', 'ratings',
            'average_rating', 'total_ratings', 'is_saved', 'user_rating'
        ]

    def get_is_saved(self, obj):
        """Check if recipe is saved by current user."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedRecipe.objects.filter(
                user=request.user, recipe=obj
            ).exists()
        return False

    def get_user_rating(self, obj):
        """Get current user's rating for this recipe."""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                rating = Rating.objects.get(user=request.user, recipe=obj)
                return rating.rating
            except Rating.DoesNotExist:
                return None
        return None


class RecipeCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating recipes."""
    ingredients = RecipeIngredientSerializer(many=True)
    instructions = InstructionSerializer(many=True)

    class Meta:
        """Meta options for RecipeCreateUpdateSerializer."""
        model = Recipe
        fields = [
            'title', 'description', 'image', 'prep_time', 'cook_time',
            'servings', 'difficulty', 'food_type', 'is_public', 
            'ingredients', 'instructions'
        ]

    def create(self, validated_data):
        """Create a new recipe with ingredients and instructions."""
        ingredients_data = validated_data.pop('ingredients')
        instructions_data = validated_data.pop('instructions')

        recipe = Recipe.objects.create(**validated_data)

        for ingredient_data in ingredients_data:
            RecipeIngredient.objects.create(recipe=recipe, **ingredient_data)

        for instruction_data in instructions_data:
            Instruction.objects.create(recipe=recipe, **instruction_data)

        return recipe

    def update(self, instance, validated_data):
        """Update recipe with new ingredients and instructions."""
        ingredients_data = validated_data.pop('ingredients', [])
        instructions_data = validated_data.pop('instructions', [])

        # Update recipe fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update ingredients
        instance.ingredients.all().delete()
        for ingredient_data in ingredients_data:
            RecipeIngredient.objects.create(recipe=instance, **ingredient_data)

        # Update instructions
        instance.instructions.all().delete()
        for instruction_data in instructions_data:
            Instruction.objects.create(recipe=instance, **instruction_data)

        return instance


class SavedRecipeSerializer(serializers.ModelSerializer):
    """Serializer for saved recipes."""
    recipe = RecipeListSerializer(read_only=True)

    class Meta:
        """Meta options for SavedRecipeSerializer."""
        model = SavedRecipe
        fields = ['id', 'recipe', 'saved_at']


class CommentSerializer(serializers.ModelSerializer):
    """Serializer for recipe comments."""
    user = UserSerializer(read_only=True)

    class Meta:
        """Meta options for CommentSerializer."""
        model = Comment
        fields = ['id', 'user', 'text', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
