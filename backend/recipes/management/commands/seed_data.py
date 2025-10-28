from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from recipes.models import (
    Recipe, RecipeIngredient, Instruction, Rating, SavedRecipe,
    IngredientItem, IngredientCategory, Comment
)
from django.utils import timezone
from datetime import timedelta
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Seeds the database with sample users and recipes'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')
        
        # Clear existing data (optional)
        self.stdout.write('Clearing existing recipes and users...')
        Recipe.objects.all().delete()
        User.objects.filter(is_superuser=False).delete()
        
        # Create users
        self.stdout.write('Creating users...')
        users = []
        user_data = [
            {'username': 'john_doe', 'email': 'john@example.com', 'first_name': 'John', 'last_name': 'Doe', 'bio': 'Food enthusiast and home cook', 'use_metric': False},
            {'username': 'jane_smith', 'email': 'jane@example.com', 'first_name': 'Jane', 'last_name': 'Smith', 'bio': 'Professional chef with 10 years experience', 'use_metric': True},
            {'username': 'mike_wilson', 'email': 'mike@example.com', 'first_name': 'Mike', 'last_name': 'Wilson', 'bio': 'Baker and pastry lover', 'use_metric': False},
            {'username': 'sarah_jones', 'email': 'sarah@example.com', 'first_name': 'Sarah', 'last_name': 'Jones', 'bio': 'Vegan cooking specialist', 'use_metric': True},
            {'username': 'david_brown', 'email': 'david@example.com', 'first_name': 'David', 'last_name': 'Brown', 'bio': 'BBQ master and grill expert', 'use_metric': False},
            {'username': 'emily_chen', 'email': 'emily@example.com', 'first_name': 'Emily', 'last_name': 'Chen', 'bio': 'Asian cuisine expert and food blogger', 'use_metric': True},
            {'username': 'carlos_garcia', 'email': 'carlos@example.com', 'first_name': 'Carlos', 'last_name': 'Garcia', 'bio': 'Mexican food enthusiast and taco connoisseur', 'use_metric': False},
            {'username': 'lisa_anderson', 'email': 'lisa@example.com', 'first_name': 'Lisa', 'last_name': 'Anderson', 'bio': 'French cuisine lover and wine enthusiast', 'use_metric': True},
        ]
        
        # Dictionary to track metric preference per user
        user_metric_preference = {}
        
        for user_info in user_data:
            user = User.objects.create_user(
                username=user_info['username'],
                email=user_info['email'],
                password='Password1!',
                first_name=user_info['first_name'],
                last_name=user_info['last_name'],
                bio=user_info['bio']
            )
            users.append(user)
            user_metric_preference[user.id] = user_info['use_metric']
            self.stdout.write(f'  Created user: {user.username} ({"metric" if user_info["use_metric"] else "imperial"})')
        
        # Get ingredient categories and items
        categories = list(IngredientCategory.objects.all())
        if not categories:
            self.stdout.write(self.style.WARNING('No ingredient categories found. Run populate_ingredients first.'))
            return
        
        ingredients = list(IngredientItem.objects.filter(is_active=True))
        if not ingredients:
            self.stdout.write(self.style.WARNING('No ingredients found. Run populate_ingredients first.'))
            return
        
        # Create recipes
        self.stdout.write('Creating recipes...')
        recipes_data = [
            {
                'title': 'Classic Spaghetti Carbonara',
                'description': 'A traditional Italian pasta dish made with eggs, cheese, pancetta, and pepper.',
                'prep_time': 10,
                'cook_time': 20,
                'servings': 4,
                'difficulty': 'easy',
                'food_type': 'main_course',
                'cuisine': 'italian',
                'is_public': True,
                'ingredients_count': 6,
                'instructions': [
                    'Bring a large pot of salted water to boil and cook spaghetti according to package directions.',
                    'While pasta cooks, fry pancetta in a large skillet until crispy.',
                    'In a bowl, whisk together eggs, parmesan cheese, salt, and pepper.',
                    'Drain pasta, reserving 1 cup of pasta water.',
                    'Add hot pasta to the skillet with pancetta, remove from heat.',
                    'Quickly stir in egg mixture, adding pasta water as needed to create a creamy sauce.',
                    'Serve immediately with extra parmesan and black pepper.'
                ]
            },
            {
                'title': 'Chicken Tikka Masala',
                'description': 'Tender chicken pieces in a creamy, spiced tomato sauce. A beloved Indian dish.',
                'prep_time': 30,
                'cook_time': 40,
                'servings': 6,
                'difficulty': 'medium',
                'food_type': 'main_course',
                'cuisine': 'indian',
                'is_public': True,
                'ingredients_count': 8,
                'instructions': [
                    'Marinate chicken pieces in yogurt, lemon juice, and spices for at least 30 minutes.',
                    'Heat oil in a large pan and cook marinated chicken until golden brown.',
                    'Remove chicken and set aside.',
                    'In the same pan, sauté onions, garlic, and ginger until softened.',
                    'Add tomato sauce, cream, and spices. Simmer for 10 minutes.',
                    'Return chicken to the pan and cook for another 15 minutes.',
                    'Garnish with fresh cilantro and serve with rice or naan.'
                ]
            },
            {
                'title': 'Homemade Margherita Pizza',
                'description': 'Simple yet delicious pizza with tomato sauce, mozzarella, and fresh basil.',
                'prep_time': 90,
                'cook_time': 15,
                'servings': 2,
                'difficulty': 'medium',
                'food_type': 'main_course',
                'cuisine': 'italian',
                'is_public': True,
                'ingredients_count': 7,
                'instructions': [
                    'Prepare pizza dough and let it rise for 1 hour.',
                    'Preheat oven to 475°F (245°C) with a pizza stone if available.',
                    'Roll out dough into a 12-inch circle.',
                    'Spread tomato sauce evenly over dough, leaving a border.',
                    'Add torn mozzarella pieces and drizzle with olive oil.',
                    'Bake for 12-15 minutes until crust is golden and cheese is bubbly.',
                    'Top with fresh basil leaves and serve immediately.'
                ]
            },
            {
                'title': 'Thai Green Curry',
                'description': 'Aromatic and spicy Thai curry with coconut milk and fresh vegetables.',
                'prep_time': 20,
                'cook_time': 25,
                'servings': 4,
                'difficulty': 'easy',
                'food_type': 'main_course',
                'cuisine': 'thai',
                'is_public': True,
                'ingredients_count': 9,
                'instructions': [
                    'Heat oil in a large pot and add green curry paste, cook for 1 minute.',
                    'Add coconut milk and bring to a simmer.',
                    'Add chicken or tofu and cook until almost done.',
                    'Add vegetables like bell peppers, bamboo shoots, and eggplant.',
                    'Simmer until vegetables are tender, about 10 minutes.',
                    'Add fish sauce, sugar, and lime juice to taste.',
                    'Garnish with Thai basil and serve with jasmine rice.'
                ]
            },
            {
                'title': 'Classic Beef Burger',
                'description': 'Juicy homemade beef burger with all the fixings.',
                'prep_time': 15,
                'cook_time': 10,
                'servings': 4,
                'difficulty': 'easy',
                'food_type': 'main_course',
                'cuisine': 'american',
                'is_public': True,
                'ingredients_count': 8,
                'instructions': [
                    'Mix ground beef with salt, pepper, and your favorite seasonings.',
                    'Form into 4 equal patties, making a small indent in the center.',
                    'Preheat grill or skillet to medium-high heat.',
                    'Cook burgers for 4-5 minutes per side for medium doneness.',
                    'Add cheese in the last minute if desired.',
                    'Toast burger buns on the grill.',
                    'Assemble burgers with lettuce, tomato, onion, and condiments.'
                ]
            },
            {
                'title': 'Caesar Salad',
                'description': 'Crisp romaine lettuce with creamy Caesar dressing and croutons.',
                'prep_time': 15,
                'cook_time': 5,
                'servings': 4,
                'difficulty': 'easy',
                'food_type': 'salad',
                'cuisine': 'american',
                'is_public': True,
                'ingredients_count': 7,
                'instructions': [
                    'Make croutons by toasting bread cubes with olive oil and garlic.',
                    'Prepare Caesar dressing by mixing mayo, lemon juice, garlic, and anchovies.',
                    'Add parmesan cheese and black pepper to dressing.',
                    'Wash and chop romaine lettuce.',
                    'Toss lettuce with dressing until well coated.',
                    'Top with croutons and extra parmesan.',
                    'Serve immediately for best texture.'
                ]
            },
            {
                'title': 'Pad Thai',
                'description': 'Popular Thai stir-fried noodles with tamarind sauce, peanuts, and lime.',
                'prep_time': 20,
                'cook_time': 15,
                'servings': 4,
                'difficulty': 'medium',
                'food_type': 'main_course',
                'cuisine': 'thai',
                'is_public': True,
                'ingredients_count': 10,
                'instructions': [
                    'Soak rice noodles in warm water until soft, about 20 minutes.',
                    'Prepare pad thai sauce by mixing tamarind paste, fish sauce, and sugar.',
                    'Heat wok over high heat and add oil.',
                    'Stir-fry shrimp or chicken until cooked, remove from wok.',
                    'Add eggs and scramble, then add drained noodles.',
                    'Pour in sauce and toss everything together.',
                    'Add bean sprouts, peanuts, and lime juice. Serve with lime wedges.'
                ]
            },
            {
                'title': 'Chocolate Chip Cookies',
                'description': 'Classic chewy chocolate chip cookies that everyone loves.',
                'prep_time': 15,
                'cook_time': 12,
                'servings': 24,
                'difficulty': 'easy',
                'food_type': 'dessert',
                'cuisine': 'american',
                'is_public': True,
                'ingredients_count': 8,
                'instructions': [
                    'Preheat oven to 350°F (175°C).',
                    'Cream together butter and sugars until fluffy.',
                    'Beat in eggs and vanilla extract.',
                    'In a separate bowl, mix flour, baking soda, and salt.',
                    'Gradually blend dry ingredients into wet mixture.',
                    'Fold in chocolate chips.',
                    'Drop spoonfuls of dough onto baking sheets.',
                    'Bake for 10-12 minutes until edges are golden.',
                    'Cool on baking sheet for 2 minutes before transferring to a wire rack.'
                ]
            },
            {
                'title': 'Greek Moussaka',
                'description': 'Layered eggplant casserole with meat sauce and béchamel topping.',
                'prep_time': 45,
                'cook_time': 60,
                'servings': 8,
                'difficulty': 'hard',
                'food_type': 'main_course',
                'cuisine': 'greek',
                'is_public': True,
                'ingredients_count': 12,
                'instructions': [
                    'Slice eggplant and salt them, let sit for 30 minutes to remove bitterness.',
                    'Rinse and pat dry eggplant, then brush with oil and bake until golden.',
                    'Brown ground lamb or beef with onions and garlic.',
                    'Add tomatoes, cinnamon, and herbs to meat, simmer for 20 minutes.',
                    'Make béchamel sauce with butter, flour, milk, and nutmeg.',
                    'Layer eggplant, meat sauce, and béchamel in a baking dish.',
                    'Bake at 350°F for 45 minutes until golden and bubbly.',
                    'Let rest for 15 minutes before serving.'
                ]
            },
            {
                'title': 'Vegetable Stir Fry',
                'description': 'Quick and healthy stir-fried vegetables with a savory sauce.',
                'prep_time': 15,
                'cook_time': 10,
                'servings': 4,
                'difficulty': 'easy',
                'food_type': 'main_course',
                'cuisine': 'chinese',
                'is_public': True,
                'ingredients_count': 8,
                'instructions': [
                    'Prepare all vegetables by washing and cutting into uniform pieces.',
                    'Mix sauce ingredients: soy sauce, garlic, ginger, and sesame oil.',
                    'Heat wok or large skillet over high heat.',
                    'Add oil and stir-fry harder vegetables first (carrots, broccoli).',
                    'Add softer vegetables (peppers, mushrooms) and continue cooking.',
                    'Pour in sauce and toss everything together.',
                    'Serve immediately over rice or noodles.'
                ]
            },
            {
                'title': 'Beef Tacos',
                'description': 'Authentic Mexican beef tacos with fresh toppings and homemade salsa.',
                'prep_time': 20,
                'cook_time': 15,
                'servings': 6,
                'difficulty': 'easy',
                'food_type': 'main_course',
                'cuisine': 'mexican',
                'is_public': True,
                'ingredients_count': 10,
                'instructions': [
                    'Season ground beef with chili powder, cumin, paprika, and garlic.',
                    'Brown the beef in a large skillet over medium-high heat.',
                    'Dice tomatoes, onions, and cilantro for fresh pico de gallo.',
                    'Warm corn tortillas on a dry skillet or over an open flame.',
                    'Shred lettuce and prepare desired toppings.',
                    'Assemble tacos with beef, lettuce, pico de gallo, cheese, and sour cream.',
                    'Serve with lime wedges and hot sauce on the side.'
                ]
            },
            {
                'title': 'Chicken Enchiladas',
                'description': 'Rolled tortillas filled with chicken and topped with enchilada sauce and cheese.',
                'prep_time': 30,
                'cook_time': 25,
                'servings': 8,
                'difficulty': 'medium',
                'food_type': 'main_course',
                'cuisine': 'mexican',
                'is_public': True,
                'ingredients_count': 9,
                'instructions': [
                    'Cook and shred chicken breast, season with cumin and garlic.',
                    'Prepare enchilada sauce or use store-bought.',
                    'Warm tortillas to make them pliable.',
                    'Fill each tortilla with chicken and cheese, then roll tightly.',
                    'Place rolled enchiladas seam-side down in a baking dish.',
                    'Pour enchilada sauce over the top and sprinkle with cheese.',
                    'Bake at 350°F for 20-25 minutes until bubbly and golden.',
                    'Garnish with sour cream, cilantro, and sliced jalapeños.'
                ]
            },
            {
                'title': 'Churros with Chocolate Sauce',
                'description': 'Crispy fried dough coated in cinnamon sugar served with rich chocolate dipping sauce.',
                'prep_time': 15,
                'cook_time': 20,
                'servings': 6,
                'difficulty': 'medium',
                'food_type': 'dessert',
                'cuisine': 'spanish',
                'is_public': True,
                'ingredients_count': 8,
                'instructions': [
                    'Bring water, butter, sugar, and salt to a boil.',
                    'Remove from heat and stir in flour until mixture forms a ball.',
                    'Let cool slightly, then beat in eggs one at a time.',
                    'Transfer dough to a piping bag with a star tip.',
                    'Heat oil to 375°F in a deep pot or fryer.',
                    'Pipe 4-inch strips of dough into hot oil and fry until golden.',
                    'Drain on paper towels and roll in cinnamon sugar while still warm.',
                    'Serve with warm chocolate sauce for dipping.'
                ]
            },
            {
                'title': 'Japanese Ramen',
                'description': 'Rich and flavorful noodle soup with pork, soft-boiled eggs, and vegetables.',
                'prep_time': 30,
                'cook_time': 45,
                'servings': 4,
                'difficulty': 'hard',
                'food_type': 'soup',
                'cuisine': 'japanese',
                'is_public': True,
                'ingredients_count': 12,
                'instructions': [
                    'Prepare broth by simmering pork bones, ginger, and garlic for several hours.',
                    'Alternatively, use chicken or vegetable broth for a quicker version.',
                    'Marinate pork belly in soy sauce, mirin, and sake.',
                    'Roast pork belly until caramelized and tender.',
                    'Soft-boil eggs for exactly 6.5 minutes for jammy yolks.',
                    'Cook ramen noodles according to package instructions.',
                    'Prepare toppings: sliced scallions, nori, bamboo shoots, and corn.',
                    'Assemble bowls with noodles, hot broth, sliced pork, eggs, and toppings.'
                ]
            },
            {
                'title': 'Sushi Rolls',
                'description': 'Fresh homemade sushi rolls with various fillings and perfect sushi rice.',
                'prep_time': 40,
                'cook_time': 20,
                'servings': 6,
                'difficulty': 'hard',
                'food_type': 'main_course',
                'cuisine': 'japanese',
                'is_public': True,
                'ingredients_count': 10,
                'instructions': [
                    'Cook sushi rice and season with rice vinegar, sugar, and salt.',
                    'Let rice cool to room temperature.',
                    'Prepare fillings: slice fish, cucumber, avocado, and crab.',
                    'Place nori sheet on bamboo mat, shiny side down.',
                    'Spread thin layer of rice over nori, leaving 1-inch border.',
                    'Arrange fillings in a line across the center.',
                    'Roll tightly using the bamboo mat, applying gentle pressure.',
                    'Slice into 8 pieces with a sharp, wet knife.',
                    'Serve with soy sauce, wasabi, and pickled ginger.'
                ]
            },
            {
                'title': 'Miso Soup',
                'description': 'Traditional Japanese soup with miso paste, tofu, and seaweed.',
                'prep_time': 10,
                'cook_time': 10,
                'servings': 4,
                'difficulty': 'easy',
                'food_type': 'soup',
                'cuisine': 'japanese',
                'is_public': True,
                'ingredients_count': 6,
                'instructions': [
                    'Prepare dashi broth using kombu and bonito flakes.',
                    'Bring dashi to a gentle simmer.',
                    'Cut tofu into small cubes.',
                    'Rehydrate wakame seaweed in warm water.',
                    'Remove from heat and dissolve miso paste in the broth.',
                    'Add tofu and wakame to the soup.',
                    'Garnish with sliced scallions and serve immediately.'
                ]
            },
            {
                'title': 'French Onion Soup',
                'description': 'Classic French soup with caramelized onions, rich beef broth, and melted Gruyère cheese.',
                'prep_time': 20,
                'cook_time': 60,
                'servings': 6,
                'difficulty': 'medium',
                'food_type': 'soup',
                'cuisine': 'french',
                'is_public': True,
                'ingredients_count': 8,
                'instructions': [
                    'Thinly slice onions and cook slowly in butter until deeply caramelized, about 40 minutes.',
                    'Add a pinch of sugar to help caramelization.',
                    'Deglaze with white wine or sherry.',
                    'Add beef stock and fresh thyme, simmer for 20 minutes.',
                    'Toast thick slices of French bread.',
                    'Ladle soup into oven-safe bowls.',
                    'Top with toasted bread and generous amounts of Gruyère cheese.',
                    'Broil until cheese is bubbly and golden brown.'
                ]
            },
            {
                'title': 'Coq au Vin',
                'description': 'Traditional French braised chicken in red wine with mushrooms, onions, and bacon.',
                'prep_time': 30,
                'cook_time': 90,
                'servings': 6,
                'difficulty': 'hard',
                'food_type': 'main_course',
                'cuisine': 'french',
                'is_public': True,
                'ingredients_count': 12,
                'instructions': [
                    'Season chicken pieces with salt and pepper.',
                    'Cook bacon lardons until crispy, remove and set aside.',
                    'Brown chicken pieces in bacon fat until golden on all sides.',
                    'Remove chicken and sauté pearl onions and mushrooms.',
                    'Add garlic, tomato paste, and flour to create a roux.',
                    'Pour in red wine (preferably Burgundy) and chicken stock.',
                    'Add bouquet garni (thyme, bay leaf, parsley) and return chicken to pot.',
                    'Braise in oven at 325°F for 1.5 hours until tender.',
                    'Remove bouquet garni, garnish with bacon and fresh parsley.'
                ]
            },
            {
                'title': 'Crème Brûlée',
                'description': 'Elegant French dessert with silky vanilla custard and crispy caramelized sugar topping.',
                'prep_time': 20,
                'cook_time': 45,
                'servings': 6,
                'difficulty': 'medium',
                'food_type': 'dessert',
                'cuisine': 'french',
                'is_public': True,
                'ingredients_count': 5,
                'instructions': [
                    'Preheat oven to 325°F.',
                    'Heat heavy cream with vanilla bean until steaming.',
                    'Whisk egg yolks with sugar until pale and thick.',
                    'Slowly temper hot cream into egg mixture while whisking.',
                    'Strain custard through fine-mesh sieve.',
                    'Pour into ramekins and place in water bath.',
                    'Bake for 40-45 minutes until set but still jiggly in center.',
                    'Chill for at least 4 hours or overnight.',
                    'Before serving, sprinkle sugar on top and caramelize with torch or broiler.'
                ]
            },
            {
                'title': 'Tiramisu',
                'description': 'Classic Italian coffee-flavored dessert with layers of mascarpone and ladyfingers.',
                'prep_time': 30,
                'cook_time': 0,
                'servings': 8,
                'difficulty': 'medium',
                'food_type': 'dessert',
                'cuisine': 'italian',
                'is_public': True,
                'ingredients_count': 7,
                'instructions': [
                    'Brew strong espresso and let it cool.',
                    'Whisk egg yolks with sugar until pale and fluffy.',
                    'Fold in mascarpone cheese until smooth.',
                    'Dip ladyfinger cookies in espresso and layer in dish.',
                    'Spread half the mascarpone mixture over cookies.',
                    'Repeat layers and dust with cocoa powder.',
                    'Refrigerate for at least 4 hours before serving.'
                ]
            },
            {
                'title': 'Bibimbap',
                'description': 'Korean rice bowl with assorted vegetables, meat, and spicy gochujang sauce.',
                'prep_time': 25,
                'cook_time': 15,
                'servings': 4,
                'difficulty': 'medium',
                'food_type': 'main_course',
                'cuisine': 'korean',
                'is_public': True,
                'ingredients_count': 12,
                'instructions': [
                    'Cook rice and keep warm.',
                    'Marinate beef in soy sauce, sesame oil, and garlic.',
                    'Sauté vegetables separately to maintain colors.',
                    'Fry eggs sunny-side up.',
                    'Arrange vegetables and beef over rice in bowls.',
                    'Top with fried egg and drizzle with gochujang.',
                    'Serve with sesame oil and seeds on the side.'
                ]
            },
            {
                'title': 'Pho Bo',
                'description': 'Vietnamese beef noodle soup with aromatic broth and fresh herbs.',
                'prep_time': 30,
                'cook_time': 120,
                'servings': 6,
                'difficulty': 'hard',
                'food_type': 'soup',
                'cuisine': 'vietnamese',
                'is_public': True,
                'ingredients_count': 14,
                'instructions': [
                    'Char onions and ginger over open flame.',
                    'Simmer beef bones with charred aromatics for 2-3 hours.',
                    'Add star anise, cinnamon, and coriander for flavor.',
                    'Strain broth and season with fish sauce and sugar.',
                    'Cook rice noodles according to package directions.',
                    'Slice beef very thin for quick cooking.',
                    'Assemble bowls with noodles, raw beef, and hot broth.',
                    'Serve with bean sprouts, basil, lime, and chili.'
                ]
            },
            {
                'title': 'Falafel',
                'description': 'Crispy Middle Eastern chickpea fritters served with tahini sauce.',
                'prep_time': 20,
                'cook_time': 15,
                'servings': 6,
                'difficulty': 'easy',
                'food_type': 'appetizer',
                'cuisine': 'middle_eastern',
                'is_public': True,
                'ingredients_count': 10,
                'instructions': [
                    'Soak dried chickpeas overnight (do not use canned).',
                    'Process chickpeas with herbs, garlic, and spices.',
                    'Form mixture into balls and refrigerate for 30 minutes.',
                    'Heat oil to 350°F for frying.',
                    'Fry falafel until golden brown and crispy.',
                    'Drain on paper towels.',
                    'Serve in pita with tahini sauce, tomatoes, and cucumbers.'
                ]
            },
            {
                'title': 'Baklava',
                'description': 'Sweet Greek pastry with layers of phyllo, nuts, and honey syrup.',
                'prep_time': 45,
                'cook_time': 50,
                'servings': 24,
                'difficulty': 'medium',
                'food_type': 'dessert',
                'cuisine': 'greek',
                'is_public': True,
                'ingredients_count': 7,
                'instructions': [
                    'Mix chopped walnuts with cinnamon and sugar.',
                    'Brush phyllo sheets with melted butter.',
                    'Layer 8 sheets, add nut mixture, repeat.',
                    'Cut into diamond shapes before baking.',
                    'Bake at 350°F until golden and crispy.',
                    'Make honey syrup with sugar, water, and lemon.',
                    'Pour cool syrup over hot baklava and let soak.'
                ]
            },
            {
                'title': 'Paella',
                'description': 'Spanish seafood and rice dish cooked in a wide pan with saffron.',
                'prep_time': 20,
                'cook_time': 40,
                'servings': 6,
                'difficulty': 'medium',
                'food_type': 'main_course',
                'cuisine': 'spanish',
                'is_public': True,
                'ingredients_count': 12,
                'instructions': [
                    'Heat olive oil in large paella pan.',
                    'Sauté chicken pieces until golden, remove.',
                    'Cook onions, garlic, and bell peppers.',
                    'Add rice and coat with oil.',
                    'Pour in chicken stock with saffron.',
                    'Arrange seafood and chicken on top.',
                    'Cook without stirring until rice is tender.',
                    'Let rest 5 minutes before serving.'
                ]
            },
            {
                'title': 'Beef Wellington',
                'description': 'Elegant British dish with beef tenderloin wrapped in puff pastry.',
                'prep_time': 45,
                'cook_time': 35,
                'servings': 6,
                'difficulty': 'hard',
                'food_type': 'main_course',
                'cuisine': 'french',
                'is_public': True,
                'ingredients_count': 10,
                'instructions': [
                    'Sear beef tenderloin on all sides until browned.',
                    'Brush with mustard and let cool.',
                    'Sauté mushrooms until all moisture evaporates.',
                    'Wrap beef in prosciutto and mushroom duxelles.',
                    'Enclose in puff pastry and seal edges.',
                    'Brush with egg wash for golden color.',
                    'Bake at 425°F until pastry is golden.',
                    'Rest 10 minutes before slicing.'
                ]
            },
            {
                'title': 'Dim Sum Dumplings',
                'description': 'Chinese steamed dumplings with pork and vegetable filling.',
                'prep_time': 60,
                'cook_time': 15,
                'servings': 24,
                'difficulty': 'medium',
                'food_type': 'appetizer',
                'cuisine': 'chinese',
                'is_public': True,
                'ingredients_count': 10,
                'instructions': [
                    'Mix ground pork with ginger, garlic, and soy sauce.',
                    'Add chopped cabbage and scallions to filling.',
                    'Place small amount of filling in center of wrapper.',
                    'Pleat edges and seal with water.',
                    'Steam dumplings for 12-15 minutes.',
                    'Serve hot with soy-vinegar dipping sauce.'
                ]
            },
            {
                'title': 'Apple Pie',
                'description': 'Classic American dessert with spiced apple filling and flaky crust.',
                'prep_time': 30,
                'cook_time': 50,
                'servings': 8,
                'difficulty': 'medium',
                'food_type': 'dessert',
                'cuisine': 'american',
                'is_public': True,
                'ingredients_count': 8,
                'instructions': [
                    'Make pie dough and refrigerate for 30 minutes.',
                    'Peel and slice apples, toss with sugar and cinnamon.',
                    'Roll out bottom crust and fit into pie pan.',
                    'Add apple filling and dot with butter.',
                    'Cover with top crust and cut vents.',
                    'Brush with egg wash and sprinkle with sugar.',
                    'Bake at 425°F for 15 minutes, then 350°F for 35 minutes.',
                    'Cool completely before slicing.'
                ]
            },
            {
                'title': 'Tom Yum Soup',
                'description': 'Spicy and sour Thai soup with shrimp, lemongrass, and lime.',
                'prep_time': 15,
                'cook_time': 20,
                'servings': 4,
                'difficulty': 'easy',
                'food_type': 'soup',
                'cuisine': 'thai',
                'is_public': True,
                'ingredients_count': 12,
                'instructions': [
                    'Bring chicken broth to boil with lemongrass and galangal.',
                    'Add kaffir lime leaves and Thai chilies.',
                    'Simmer mushrooms until tender.',
                    'Add shrimp and cook until pink.',
                    'Season with fish sauce and lime juice.',
                    'Garnish with cilantro and serve hot.'
                ]
            },
            {
                'title': 'Butter Chicken',
                'description': 'Creamy Indian curry with tender chicken in tomato-butter sauce.',
                'prep_time': 30,
                'cook_time': 30,
                'servings': 6,
                'difficulty': 'medium',
                'food_type': 'main_course',
                'cuisine': 'indian',
                'is_public': True,
                'ingredients_count': 15,
                'instructions': [
                    'Marinate chicken in yogurt and spices.',
                    'Grill or bake chicken until cooked through.',
                    'Make sauce with tomatoes, cream, and butter.',
                    'Add garam masala, cumin, and coriander.',
                    'Simmer chicken in sauce for 15 minutes.',
                    'Finish with cream and kasuri methi.',
                    'Serve with naan or basmati rice.'
                ]
            },
            {
                'title': 'Brownies',
                'description': 'Fudgy chocolate brownies with a crackly top.',
                'prep_time': 15,
                'cook_time': 25,
                'servings': 16,
                'difficulty': 'easy',
                'food_type': 'dessert',
                'cuisine': 'american',
                'is_public': True,
                'ingredients_count': 7,
                'instructions': [
                    'Melt butter and chocolate together.',
                    'Whisk in sugar until well combined.',
                    'Beat in eggs one at a time.',
                    'Fold in flour and cocoa powder.',
                    'Pour into greased 9x13 pan.',
                    'Bake at 350°F for 25 minutes.',
                    'Cool completely before cutting into squares.'
                ]
            },
            {
                'title': 'Pad See Ew',
                'description': 'Thai stir-fried wide noodles with soy sauce and Chinese broccoli.',
                'prep_time': 15,
                'cook_time': 10,
                'servings': 4,
                'difficulty': 'easy',
                'food_type': 'main_course',
                'cuisine': 'thai',
                'is_public': True,
                'ingredients_count': 8,
                'instructions': [
                    'Soak wide rice noodles until pliable.',
                    'Heat wok over high heat with oil.',
                    'Stir-fry chicken or pork until cooked.',
                    'Push meat aside and scramble eggs.',
                    'Add noodles and dark soy sauce.',
                    'Add Chinese broccoli and toss together.',
                    'Serve immediately with chili vinegar.'
                ]
            },
            {
                'title': 'Hummus',
                'description': 'Creamy Middle Eastern chickpea dip with tahini and lemon.',
                'prep_time': 10,
                'cook_time': 0,
                'servings': 8,
                'difficulty': 'easy',
                'food_type': 'appetizer',
                'cuisine': 'middle_eastern',
                'is_public': True,
                'ingredients_count': 7,
                'instructions': [
                    'Drain and rinse canned chickpeas.',
                    'Blend chickpeas with tahini until smooth.',
                    'Add lemon juice, garlic, and cumin.',
                    'Drizzle in olive oil while blending.',
                    'Add ice water for creamy consistency.',
                    'Season with salt to taste.',
                    'Serve with olive oil drizzle and paprika.'
                ]
            },
            {
                'title': 'Chicken Parmesan',
                'description': 'Breaded chicken cutlets topped with marinara and melted cheese.',
                'prep_time': 20,
                'cook_time': 25,
                'servings': 4,
                'difficulty': 'easy',
                'food_type': 'main_course',
                'cuisine': 'italian',
                'is_public': True,
                'ingredients_count': 9,
                'instructions': [
                    'Pound chicken breasts to even thickness.',
                    'Bread with flour, egg, and seasoned breadcrumbs.',
                    'Pan-fry in olive oil until golden.',
                    'Place in baking dish and top with marinara.',
                    'Add mozzarella and parmesan cheese.',
                    'Bake at 400°F until cheese is bubbly.',
                    'Serve over spaghetti with fresh basil.'
                ]
            },
            {
                'title': 'Jerk Chicken',
                'description': 'Spicy Caribbean grilled chicken with bold jerk seasoning.',
                'prep_time': 20,
                'cook_time': 30,
                'servings': 6,
                'difficulty': 'easy',
                'food_type': 'main_course',
                'cuisine': 'caribbean',
                'is_public': True,
                'ingredients_count': 12,
                'instructions': [
                    'Blend scotch bonnet peppers, allspice, and thyme.',
                    'Add garlic, ginger, and scallions to marinade.',
                    'Marinate chicken for at least 4 hours.',
                    'Grill over medium-high heat.',
                    'Turn frequently and brush with marinade.',
                    'Cook until internal temperature reaches 165°F.',
                    'Serve with rice and beans.'
                ]
            },
            {
                'title': 'Panna Cotta',
                'description': 'Silky Italian cream dessert with berry compote.',
                'prep_time': 15,
                'cook_time': 5,
                'servings': 6,
                'difficulty': 'easy',
                'food_type': 'dessert',
                'cuisine': 'italian',
                'is_public': True,
                'ingredients_count': 5,
                'instructions': [
                    'Bloom gelatin in cold water.',
                    'Heat cream with sugar and vanilla.',
                    'Stir in gelatin until dissolved.',
                    'Pour into ramekins and refrigerate 4 hours.',
                    'Make berry compote with fresh berries and sugar.',
                    'Unmold panna cotta and serve with compote.'
                ]
            },
            {
                'title': 'Samosas',
                'description': 'Crispy Indian pastries filled with spiced potatoes and peas.',
                'prep_time': 40,
                'cook_time': 20,
                'servings': 12,
                'difficulty': 'medium',
                'food_type': 'appetizer',
                'cuisine': 'indian',
                'is_public': True,
                'ingredients_count': 12,
                'instructions': [
                    'Make dough with flour, oil, and water.',
                    'Cook potatoes and peas with curry spices.',
                    'Roll dough into circles and cut in half.',
                    'Form cones and fill with potato mixture.',
                    'Seal edges with water.',
                    'Deep fry until golden and crispy.',
                    'Serve with mint chutney.'
                ]
            },
            {
                'title': 'Gumbo',
                'description': 'Hearty Louisiana stew with seafood, sausage, and okra over rice.',
                'prep_time': 30,
                'cook_time': 90,
                'servings': 8,
                'difficulty': 'medium',
                'food_type': 'main_course',
                'cuisine': 'american',
                'is_public': True,
                'ingredients_count': 15,
                'instructions': [
                    'Make dark roux with flour and oil, stirring constantly.',
                    'Add holy trinity: onions, celery, and bell peppers.',
                    'Pour in seafood stock and bring to simmer.',
                    'Add andouille sausage and cook for 30 minutes.',
                    'Stir in okra and tomatoes.',
                    'Add shrimp and crab in last 10 minutes.',
                    'Season with Cajun spices and file powder.',
                    'Serve over white rice with hot sauce.'
                ]
            },
            {
                'title': 'Peking Duck',
                'description': 'Crispy Chinese roasted duck with thin pancakes and hoisin sauce.',
                'prep_time': 60,
                'cook_time': 90,
                'servings': 6,
                'difficulty': 'hard',
                'food_type': 'main_course',
                'cuisine': 'chinese',
                'is_public': True,
                'ingredients_count': 10,
                'instructions': [
                    'Inflate duck skin by blowing air between skin and meat.',
                    'Blanch duck in boiling water, then dry thoroughly.',
                    'Brush with maltose syrup and hang to dry overnight.',
                    'Roast at high temperature until skin is crispy.',
                    'Carve duck into thin slices.',
                    'Serve with thin pancakes, scallions, and hoisin sauce.',
                    'Guests wrap duck in pancakes with condiments.'
                ]
            },
            {
                'title': 'Tres Leches Cake',
                'description': 'Moist Latin American sponge cake soaked in three types of milk.',
                'prep_time': 30,
                'cook_time': 30,
                'servings': 12,
                'difficulty': 'medium',
                'food_type': 'dessert',
                'cuisine': 'mexican',
                'is_public': True,
                'ingredients_count': 10,
                'instructions': [
                    'Bake light sponge cake in 9x13 pan.',
                    'Poke holes all over the cooled cake.',
                    'Mix evaporated milk, condensed milk, and heavy cream.',
                    'Pour milk mixture over cake slowly.',
                    'Refrigerate for at least 4 hours to soak.',
                    'Top with whipped cream before serving.',
                    'Garnish with cinnamon and fresh fruit.'
                ]
            }
        ]
        
        # Assign recipes evenly to users (5 recipes per user)
        recipes_per_user = 5
        for i, recipe_data in enumerate(recipes_data):
            # Assign recipe to users in round-robin fashion
            user_index = i % len(users)
            author = users[user_index]
            
            # Calculate a random creation time within the last 7 days
            days_ago = random.uniform(0, 7)  # Random number between 0 and 7 days
            hours_ago = days_ago * 24  # Convert to hours
            created_at = timezone.now() - timedelta(hours=hours_ago)
            
            # Create recipe
            recipe = Recipe.objects.create(
                title=recipe_data['title'],
                description=recipe_data['description'],
                author=author,
                prep_time=recipe_data['prep_time'],
                cook_time=recipe_data['cook_time'],
                servings=recipe_data['servings'],
                difficulty=recipe_data['difficulty'],
                food_type=recipe_data['food_type'],
                cuisine=recipe_data.get('cuisine'),
                is_public=recipe_data['is_public']
            )
            
            # Update the created_at timestamp
            recipe.created_at = created_at
            recipe.save(update_fields=['created_at'])
            
            # Add random ingredients
            selected_ingredients = random.sample(ingredients, min(recipe_data['ingredients_count'], len(ingredients)))
            
            # Choose units based on author's preference
            if user_metric_preference.get(author.id, False):
                # Metric units for half the users
                units = ['g', 'kg', 'ml', 'l', 'piece', 'pinch']
            else:
                # Imperial units for the other half
                units = ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'piece', 'pinch']
            
            for j, ingredient in enumerate(selected_ingredients):
                unit = random.choice(units)
                
                # Generate sensible amounts based on unit type
                if unit in ['pinch', 'dash']:
                    amount = random.choice([1, 2, 3])  # Whole numbers only
                elif unit in ['piece', 'whole', 'slice', 'clove']:
                    amount = random.choice([1, 2, 3, 4, 5])  # Whole numbers only
                elif unit in ['tsp', 'tbsp']:
                    amount = round(random.uniform(0.5, 3), 1)  # 0.5, 1.0, 1.5, etc.
                elif unit in ['cup', 'oz', 'ml', 'g']:
                    amount = round(random.uniform(0.25, 2), 2)  # More precise
                elif unit in ['lb', 'kg', 'l']:
                    amount = round(random.uniform(0.5, 3), 1)  # Larger amounts
                else:
                    amount = round(random.uniform(0.25, 3), 2)  # Default
                
                RecipeIngredient.objects.create(
                    recipe=recipe,
                    ingredient=ingredient,
                    amount=amount,
                    unit=unit,
                    order=j + 1
                )
            
            # Add instructions
            for k, instruction_text in enumerate(recipe_data['instructions']):
                Instruction.objects.create(
                    recipe=recipe,
                    step=instruction_text,
                    order=k + 1
                )
            
            # Add some random ratings (including half-stars)
            num_ratings = random.randint(2, 5)
            rating_users = random.sample(users, min(num_ratings, len(users)))
            for rating_user in rating_users:
                if rating_user != author:  # Don't let authors rate their own recipes
                    # Generate ratings in 0.5 increments from 2.5 to 5.0
                    possible_ratings = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0]
                    Rating.objects.create(
                        recipe=recipe,
                        user=rating_user,
                        rating=random.choice(possible_ratings)
                    )
            
            self.stdout.write(f'  Created recipe: {recipe.title} by {author.username}')
        
        # Create some saved recipes
        self.stdout.write('Creating saved recipes...')
        for user in users:
            # Each user saves 2-4 random recipes
            num_saves = random.randint(2, 4)
            recipes_to_save = random.sample(list(Recipe.objects.exclude(author=user)), min(num_saves, Recipe.objects.count()))
            for recipe in recipes_to_save:
                SavedRecipe.objects.create(user=user, recipe=recipe)
        
        # Create some comments
        self.stdout.write('Creating comments...')
        comment_templates = [
            "This recipe is amazing! Made it for dinner and everyone loved it.",
            "Great recipe! I added a bit more garlic and it turned out perfect.",
            "Easy to follow instructions. Will definitely make this again!",
            "Delicious! This has become a family favorite.",
            "Love this recipe! The flavors are incredible.",
            "Made this last night and it was a huge hit!",
            "Perfect! Exactly what I was looking for.",
            "So good! I've made this three times already.",
            "Simple and delicious. Highly recommend!",
            "The best version of this recipe I've tried.",
            "Absolutely delicious! Thank you for sharing.",
            "This turned out great! My kids loved it.",
            "Wonderful recipe! Clear instructions and great results.",
            "Made this for a dinner party and got so many compliments!",
            "Easy to make and tastes fantastic.",
        ]
        
        all_recipes = list(Recipe.objects.all())
        for recipe in all_recipes:
            # Add 2-5 random comments per recipe
            num_comments = random.randint(2, 5)
            comment_users = random.sample(users, min(num_comments, len(users)))
            for comment_user in comment_users:
                # Calculate random time within the recipe's creation window
                hours_offset = random.uniform(0, 72)  # Comments within 3 days after recipe creation
                comment_time = recipe.created_at + timedelta(hours=hours_offset)
                
                comment = Comment.objects.create(
                    recipe=recipe,
                    user=comment_user,
                    text=random.choice(comment_templates)
                )
                comment.created_at = comment_time
                comment.save(update_fields=['created_at'])
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully seeded database!'))
        self.stdout.write(self.style.SUCCESS(f'Created {len(users)} users (4 metric, 4 imperial)'))
        self.stdout.write(self.style.SUCCESS(f'Created {Recipe.objects.count()} recipes'))
        self.stdout.write(self.style.SUCCESS(f'Created {Comment.objects.count()} comments'))
        self.stdout.write(self.style.SUCCESS(f'All user passwords: Password1!'))
        self.stdout.write(self.style.SUCCESS(f'Metric users: jane_smith, sarah_jones, emily_chen, lisa_anderson'))
        self.stdout.write(self.style.SUCCESS(f'Imperial users: john_doe, mike_wilson, david_brown, carlos_garcia'))

