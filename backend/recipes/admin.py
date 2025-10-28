from django.contrib import admin
from .models import (
    IngredientCategory, IngredientItem, Recipe, RecipeIngredient, 
    Instruction, Rating, SavedRecipe
)


class IngredientItemInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1
    autocomplete_fields = ['ingredient']


class InstructionInline(admin.TabularInline):
    model = Instruction
    extra = 1


@admin.register(IngredientCategory)
class IngredientCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(IngredientItem)
class IngredientItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'category__name')
    ordering = ('name',)
    list_editable = ('is_active',)


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'difficulty', 'is_public', 'created_at', 'average_rating')
    list_filter = ('difficulty', 'is_public', 'created_at')
    search_fields = ('title', 'author__username', 'author__email')
    readonly_fields = ('created_at', 'updated_at', 'average_rating', 'total_ratings')
    inlines = [IngredientItemInline, InstructionInline]
    autocomplete_fields = ['author']
    
    def average_rating(self, obj):
        return f"{obj.average_rating:.1f}/5"
    average_rating.short_description = 'Average Rating'


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('recipe', 'user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('recipe__title', 'user__username', 'user__email')


@admin.register(SavedRecipe)
class SavedRecipeAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe', 'saved_at')
    list_filter = ('saved_at',)
    search_fields = ('user__username', 'user__email', 'recipe__title')
