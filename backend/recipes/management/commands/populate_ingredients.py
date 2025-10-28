from django.core.management.base import BaseCommand
from recipes.models import IngredientCategory, IngredientItem

class Command(BaseCommand):
    help = 'Populate the database with sample ingredients and categories'

    def handle(self, *args, **options):
        # Create categories
        categories_data = [
            {'name': 'Vegetables', 'description': 'Fresh and frozen vegetables'},
            {'name': 'Fruits', 'description': 'Fresh and dried fruits'},
            {'name': 'Proteins', 'description': 'Meat, poultry, fish, and plant proteins'},
            {'name': 'Dairy', 'description': 'Milk, cheese, yogurt, and dairy products'},
            {'name': 'Grains', 'description': 'Rice, pasta, bread, and other grains'},
            {'name': 'Spices & Herbs', 'description': 'Seasonings, spices, and fresh herbs'},
            {'name': 'Pantry Staples', 'description': 'Oils, vinegars, canned goods, and basic ingredients'},
            {'name': 'Baking', 'description': 'Flour, sugar, baking powder, and baking ingredients'},
        ]

        for cat_data in categories_data:
            category, created = IngredientCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            if created:
                self.stdout.write(f'Created category: {category.name}')

        # Get categories for ingredient assignment
        vegetables = IngredientCategory.objects.get(name='Vegetables')
        fruits = IngredientCategory.objects.get(name='Fruits')
        proteins = IngredientCategory.objects.get(name='Proteins')
        dairy = IngredientCategory.objects.get(name='Dairy')
        grains = IngredientCategory.objects.get(name='Grains')
        spices = IngredientCategory.objects.get(name='Spices & Herbs')
        pantry = IngredientCategory.objects.get(name='Pantry Staples')
        baking = IngredientCategory.objects.get(name='Baking')

        # Create ingredients
        ingredients_data = [
            # Vegetables
            {'name': 'Onion', 'category': vegetables},
            {'name': 'Garlic', 'category': vegetables},
            {'name': 'Tomato', 'category': vegetables},
            {'name': 'Carrot', 'category': vegetables},
            {'name': 'Celery', 'category': vegetables},
            {'name': 'Bell Pepper', 'category': vegetables},
            {'name': 'Potato', 'category': vegetables},
            {'name': 'Spinach', 'category': vegetables},
            {'name': 'Broccoli', 'category': vegetables},
            {'name': 'Mushroom', 'category': vegetables},
            {'name': 'Zucchini', 'category': vegetables},
            {'name': 'Eggplant', 'category': vegetables},
            {'name': 'Cucumber', 'category': vegetables},
            {'name': 'Lettuce', 'category': vegetables},
            {'name': 'Cabbage', 'category': vegetables},

            # Fruits
            {'name': 'Lemon', 'category': fruits},
            {'name': 'Lime', 'category': fruits},
            {'name': 'Apple', 'category': fruits},
            {'name': 'Banana', 'category': fruits},
            {'name': 'Orange', 'category': fruits},
            {'name': 'Strawberry', 'category': fruits},
            {'name': 'Blueberry', 'category': fruits},
            {'name': 'Avocado', 'category': fruits},

            # Proteins
            {'name': 'Chicken Breast', 'category': proteins},
            {'name': 'Ground Beef', 'category': proteins},
            {'name': 'Salmon', 'category': proteins},
            {'name': 'Eggs', 'category': proteins},
            {'name': 'Tofu', 'category': proteins},
            {'name': 'Chickpeas', 'category': proteins},
            {'name': 'Black Beans', 'category': proteins},
            {'name': 'Lentils', 'category': proteins},
            {'name': 'Bacon', 'category': proteins},
            {'name': 'Ground Turkey', 'category': proteins},

            # Dairy
            {'name': 'Milk', 'category': dairy},
            {'name': 'Butter', 'category': dairy},
            {'name': 'Cheese', 'category': dairy},
            {'name': 'Yogurt', 'category': dairy},
            {'name': 'Heavy Cream', 'category': dairy},
            {'name': 'Sour Cream', 'category': dairy},
            {'name': 'Parmesan Cheese', 'category': dairy},
            {'name': 'Cheddar Cheese', 'category': dairy},

            # Grains
            {'name': 'Rice', 'category': grains},
            {'name': 'Pasta', 'category': grains},
            {'name': 'Bread', 'category': grains},
            {'name': 'Quinoa', 'category': grains},
            {'name': 'Oats', 'category': grains},
            {'name': 'Barley', 'category': grains},
            {'name': 'Couscous', 'category': grains},

            # Spices & Herbs
            {'name': 'Salt', 'category': spices},
            {'name': 'Black Pepper', 'category': spices},
            {'name': 'Basil', 'category': spices},
            {'name': 'Oregano', 'category': spices},
            {'name': 'Thyme', 'category': spices},
            {'name': 'Rosemary', 'category': spices},
            {'name': 'Parsley', 'category': spices},
            {'name': 'Cilantro', 'category': spices},
            {'name': 'Cumin', 'category': spices},
            {'name': 'Paprika', 'category': spices},
            {'name': 'Cinnamon', 'category': spices},
            {'name': 'Ginger', 'category': spices},
            {'name': 'Bay Leaves', 'category': spices},

            # Pantry Staples
            {'name': 'Olive Oil', 'category': pantry},
            {'name': 'Vegetable Oil', 'category': pantry},
            {'name': 'Balsamic Vinegar', 'category': pantry},
            {'name': 'Soy Sauce', 'category': pantry},
            {'name': 'Worcestershire Sauce', 'category': pantry},
            {'name': 'Tomato Paste', 'category': pantry},
            {'name': 'Coconut Milk', 'category': pantry},
            {'name': 'Chicken Broth', 'category': pantry},
            {'name': 'Vegetable Broth', 'category': pantry},

            # Baking
            {'name': 'All-Purpose Flour', 'category': baking},
            {'name': 'Sugar', 'category': baking},
            {'name': 'Brown Sugar', 'category': baking},
            {'name': 'Baking Powder', 'category': baking},
            {'name': 'Baking Soda', 'category': baking},
            {'name': 'Vanilla Extract', 'category': baking},
            {'name': 'Chocolate Chips', 'category': baking},
            {'name': 'Cocoa Powder', 'category': baking},
        ]

        for ing_data in ingredients_data:
            ingredient, created = IngredientItem.objects.get_or_create(
                name=ing_data['name'],
                defaults={'category': ing_data['category']}
            )
            if created:
                self.stdout.write(f'Created ingredient: {ingredient.name}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated ingredients and categories!')
        )
