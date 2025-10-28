from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class IngredientCategory(models.Model):
    """Model for categorizing ingredients."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta options for IngredientCategory."""
        ordering = ['name']
        verbose_name_plural = 'Ingredient Categories'

    def __str__(self):
        return str(self.name)


class IngredientItem(models.Model):
    """Model for individual ingredient items."""
    name = models.CharField(max_length=100, unique=True)
    category = models.ForeignKey(
        IngredientCategory, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='ingredients'
    )
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta options for IngredientItem."""
        ordering = ['name']

    def __str__(self):
        return str(self.name)


class Recipe(models.Model):
    """Model for storing recipe information."""
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recipes')
    image = models.ImageField(upload_to='recipe_images/', blank=True, null=True)
    prep_time = models.PositiveIntegerField(
        help_text="Preparation time in minutes", blank=True, null=True
    )
    cook_time = models.PositiveIntegerField(
        help_text="Cooking time in minutes", blank=True, null=True
    )
    servings = models.PositiveIntegerField(blank=True, null=True)
    difficulty = models.CharField(
        max_length=10,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
        ],
        default='easy'
    )
    food_type = models.CharField(
        max_length=20,
        choices=[
            ('appetizer', 'Appetizer'),
            ('main_course', 'Main Course'),
            ('dessert', 'Dessert'),
            ('side_dish', 'Side Dish'),
            ('soup', 'Soup'),
            ('salad', 'Salad'),
            ('beverage', 'Beverage'),
            ('snack', 'Snack'),
            ('breakfast', 'Breakfast'),
            ('lunch', 'Lunch'),
            ('dinner', 'Dinner'),
            ('other', 'Other'),
        ],
        default='main_course'
    )
    cuisine = models.CharField(
        max_length=30,
        choices=[
            ('american', 'American'),
            ('italian', 'Italian'),
            ('mexican', 'Mexican'),
            ('chinese', 'Chinese'),
            ('japanese', 'Japanese'),
            ('thai', 'Thai'),
            ('indian', 'Indian'),
            ('french', 'French'),
            ('greek', 'Greek'),
            ('spanish', 'Spanish'),
            ('middle_eastern', 'Middle Eastern'),
            ('korean', 'Korean'),
            ('vietnamese', 'Vietnamese'),
            ('mediterranean', 'Mediterranean'),
            ('caribbean', 'Caribbean'),
            ('african', 'African'),
            ('other', 'Other'),
        ],
        blank=True,
        null=True,
        help_text="Cuisine type of the recipe"
    )
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Meta options for Recipe."""
        ordering = ['-created_at']

    def __str__(self):
        return str(self.title)

    @property
    def average_rating(self):
        """Calculate average rating for this recipe."""
        ratings = self.ratings.all()
        if ratings:
            return sum(rating.rating for rating in ratings) / len(ratings)
        return 0

    @property
    def total_ratings(self):
        """Get total number of ratings for this recipe."""
        return self.ratings.count()


class RecipeIngredient(models.Model):
    """Model for linking recipes with ingredients and their quantities."""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    ingredient = models.ForeignKey(
        IngredientItem, on_delete=models.CASCADE,
        related_name='recipe_ingredients'
    )
    amount = models.CharField(max_length=50, blank=True, null=True)
    unit = models.CharField(max_length=20, blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    notes = models.TextField(
        blank=True, null=True,
        help_text="Additional notes for this ingredient"
    )

    class Meta:
        """Meta options for RecipeIngredient."""
        ordering = ['order', 'ingredient__name']
        unique_together = ['recipe', 'ingredient']

    def __str__(self):
        if self.amount and self.unit:
            return f"{self.amount} {self.unit} {self.ingredient.name}"
        if self.amount:
            return f"{self.amount} {self.ingredient.name}"
        return str(self.ingredient.name)


class Instruction(models.Model):
    """Model for storing recipe cooking instructions."""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='instructions')
    step = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        """Meta options for Instruction."""
        ordering = ['order']

    def __str__(self):
        return f"Step {self.order}: {str(self.step)[:50]}..."


class Rating(models.Model):
    """Model for storing user ratings of recipes."""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[MinValueValidator(0.5), MaxValueValidator(5.0)]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta options for Rating."""
        unique_together = ['recipe', 'user']

    def __str__(self):
        return f"{self.user.username} rated {self.recipe.title} {self.rating}/5"


class SavedRecipe(models.Model):
    """Model for storing user's saved recipes."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_recipes')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='saved_by')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta options for SavedRecipe."""
        unique_together = ['user', 'recipe']

    def __str__(self):
        return f"{self.user.username} saved {self.recipe.title}"


class Comment(models.Model):
    """Model for storing recipe comments."""
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        """Meta options for Comment."""
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} commented on {self.recipe.title}"
