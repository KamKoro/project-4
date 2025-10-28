"""Initial migration for recipes app."""
from django.conf import settings
from django.db import migrations, models
import django.core.validators
import django.db.models.deletion


class Migration(migrations.Migration):
    """Initial migration for recipes app."""

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Recipe',
            fields=[
                ('id', models.BigAutoField(
                    auto_created=True, primary_key=True,
                    serialize=False, verbose_name='ID'
                )),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True, null=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='recipe_images/')),
                ('prep_time', models.PositiveIntegerField(
                    blank=True, help_text='Preparation time in minutes', null=True
                )),
                ('cook_time', models.PositiveIntegerField(
                    blank=True, help_text='Cooking time in minutes', null=True
                )),
                ('servings', models.PositiveIntegerField(blank=True, null=True)),
                ('difficulty', models.CharField(
                    choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
                    default='easy', max_length=10
                )),
                ('is_public', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('author', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='recipes', to=settings.AUTH_USER_MODEL
                )),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Instruction',
            fields=[
                ('id', models.BigAutoField(
                    auto_created=True, primary_key=True,
                    serialize=False, verbose_name='ID'
                )),
                ('step', models.TextField()),
                ('order', models.PositiveIntegerField(default=0)),
                ('recipe', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='instructions', to='recipes.recipe'
                )),
            ],
            options={
                'ordering': ['order'],
            },
        ),
        migrations.CreateModel(
            name='Ingredient',
            fields=[
                ('id', models.BigAutoField(
                    auto_created=True, primary_key=True,
                    serialize=False, verbose_name='ID'
                )),
                ('name', models.CharField(max_length=100)),
                ('amount', models.CharField(blank=True, max_length=50, null=True)),
                ('unit', models.CharField(blank=True, max_length=20, null=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('recipe', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='ingredients', to='recipes.recipe'
                )),
            ],
            options={
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='SavedRecipe',
            fields=[
                ('id', models.BigAutoField(
                    auto_created=True, primary_key=True,
                    serialize=False, verbose_name='ID'
                )),
                ('saved_at', models.DateTimeField(auto_now_add=True)),
                ('recipe', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='saved_by', to='recipes.recipe'
                )),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='saved_recipes', to=settings.AUTH_USER_MODEL
                )),
            ],
            options={
                'unique_together': {('user', 'recipe')},
            },
        ),
        migrations.CreateModel(
            name='Rating',
            fields=[
                ('id', models.BigAutoField(
                    auto_created=True, primary_key=True,
                    serialize=False, verbose_name='ID'
                )),
                ('rating', models.PositiveIntegerField(validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(5)
                ])),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('recipe', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='ratings', to='recipes.recipe'
                )),
                ('user', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='ratings', to=settings.AUTH_USER_MODEL
                )),
            ],
            options={
                'unique_together': {('recipe', 'user')},
            },
        ),
    ]
