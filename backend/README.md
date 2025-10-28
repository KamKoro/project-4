# 🍳 Pulp Kitchen - Backend API

Django REST API for the Pulp Kitchen recipe sharing platform.

## 🛠 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Django** | 4.2.7 | Web framework |
| **Django REST Framework** | 3.14.0 | API framework |
| **Simple JWT** | 5.3.0 | JWT authentication |
| **SQLite** | - | Database (development) |
| **Pillow** | 10.1.0 | Image handling |
| **CORS Headers** | 4.3.1 | Cross-origin requests |
| **Python Decouple** | 3.8 | Environment variables |

## 📁 Project Structure

```
backend/
├── recipe_app/              # Django project settings
│   ├── settings.py          # Project configuration
│   ├── urls.py              # Main URL routing
│   └── wsgi.py              # WSGI application
├── recipes/                 # Recipe management app
│   ├── models.py            # Recipe, Ingredient, Rating models
│   ├── serializers.py       # DRF serializers
│   ├── views.py             # API viewsets
│   ├── urls.py              # Recipe endpoints
│   ├── admin.py             # Django admin config
│   └── management/
│       └── commands/
│           ├── seed_data.py              # Seed users & recipes
│           └── populate_ingredients.py   # Seed ingredients
├── users/                   # User authentication app
│   ├── models.py            # Custom User model
│   ├── serializers.py       # User serializers
│   ├── views.py             # Auth views
│   ├── urls.py              # Auth endpoints
│   └── management/
│       └── commands/
│           ├── create_superuser.py
│           └── delete_all_users_except_admin.py
├── manage.py                # Django management script
├── requirements.txt         # Python dependencies
└── db.sqlite3              # SQLite database (dev)
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment tool (venv)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment**
   ```bash
   # macOS/Linux
   source venv/bin/activate
   
   # Windows
   venv\Scripts\activate
   ```

4. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Populate ingredient database** (500+ ingredients)
   ```bash
   python manage.py populate_ingredients
   ```

7. **Seed sample data** (8 users, 19 recipes)
   ```bash
   python manage.py seed_data
   ```

8. **Create admin superuser** (optional)
   ```bash
   python manage.py create_superuser
   ```

9. **Start development server**
   ```bash
   python manage.py runserver
   ```

✅ **API available at:** `http://localhost:8000`  
✅ **Admin panel at:** `http://localhost:8000/admin`

### Test Credentials

**Seeded Users:**
- Usernames: `john_doe`, `jane_smith`, `mike_wilson`, `sarah_jones`, `david_brown`, `emily_chen`, `carlos_garcia`, `lisa_anderson`
- Password: `Password1!` (all users)

**Measurement Systems:**
- **Metric users** (g, kg, ml, l): `jane_smith`, `sarah_jones`, `emily_chen`, `lisa_anderson`
- **Imperial users** (cups, oz, lb): `john_doe`, `mike_wilson`, `david_brown`, `carlos_garcia`

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/register/` | Register new user | ❌ |
| POST | `/api/users/login/` | Login (get JWT tokens) | ❌ |
| POST | `/api/users/token/refresh/` | Refresh access token | ✅ |
| GET | `/api/users/profile/` | Get current user | ✅ |
| PUT | `/api/users/profile/` | Update profile | ✅ |

### Recipes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/recipes/` | List public recipes | ❌ |
| POST | `/api/recipes/` | Create recipe | ✅ |
| GET | `/api/recipes/{id}/` | Get recipe detail | ❌ |
| PUT | `/api/recipes/{id}/` | Update recipe | ✅ Owner |
| DELETE | `/api/recipes/{id}/` | Delete recipe | ✅ Owner |
| GET | `/api/recipes/my-recipes/` | Get user's recipes | ✅ |
| GET | `/api/recipes/saved/` | Get saved recipes | ✅ |

### Ratings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/recipes/{id}/rate/` | Rate recipe (1-5) | ✅ |
| PUT | `/api/recipes/{id}/rate/` | Update rating | ✅ |
| DELETE | `/api/recipes/{id}/rate/` | Delete rating | ✅ |

### Saved Recipes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/recipes/{id}/save/` | Save recipe | ✅ |
| DELETE | `/api/recipes/{id}/unsave/` | Unsave recipe | ✅ |

### Ingredients
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/ingredients/` | List ingredients | ❌ |
| GET | `/api/ingredients/categories/` | List categories | ❌ |

## 🗄 Database Models

### User
- Custom user model extending `AbstractUser`
- Fields: `username`, `email`, `first_name`, `last_name`, `bio`, `profile_picture`
- Email is unique and required

### Recipe
- Fields: `title`, `description`, `author`, `image`, `prep_time`, `cook_time`, `servings`, `difficulty`, `food_type`, `is_public`
- Relationships: ForeignKey to User (author), OneToMany to RecipeIngredient, Instruction
- Choices: difficulty (easy/medium/hard), food_type (8 cuisines)

### IngredientCategory
- Fields: `name`
- Examples: Vegetables, Fruits, Proteins, Dairy, etc.

### IngredientItem
- Fields: `name`, `category`, `is_active`
- 500+ pre-populated ingredients

### RecipeIngredient
- Fields: `recipe`, `ingredient`, `amount`, `unit`, `order`
- Junction table linking recipes to ingredients
- Units: cup, tbsp, tsp, oz, lb, g, ml, piece, pinch

### Instruction
- Fields: `recipe`, `step`, `order`
- Ordered step-by-step instructions

### Rating
- Fields: `recipe`, `user`, `rating`, `created_at`
- Unique constraint: one rating per user per recipe
- Rating range: 1-5 stars

### SavedRecipe
- Fields: `user`, `recipe`, `saved_at`
- Unique constraint: user can save recipe once
- Bookmarking system

## ⚙️ Management Commands

```bash
# Populate 500+ ingredients across 10 categories
python manage.py populate_ingredients

# Seed 8 users and 19 recipes with ratings
# Half the users use metric measurements, half use imperial
python manage.py seed_data

# Create admin superuser (interactive)
python manage.py create_superuser

# Delete all users except superusers
python manage.py delete_all_users_except_admin

# Standard Django commands
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic
python manage.py test
```

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file for production:

```env
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,localhost
DATABASE_URL=your-database-url
```

### CORS Settings

Currently configured to allow `http://localhost:3000` for development.

Update `recipe_app/settings.py` for production:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]
```

## 🧪 Testing

```bash
# Run all tests
python manage.py test

# Run specific app tests
python manage.py test recipes
python manage.py test users

# Run with coverage (if installed)
coverage run --source='.' manage.py test
coverage report
```

## 🐛 Troubleshooting

### Virtual environment not activated
```bash
# Ensure you see (venv) in your terminal prompt
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

### Migration errors
```bash
# Delete database and restart
rm db.sqlite3
python manage.py migrate
python manage.py populate_ingredients
python manage.py seed_data
```

### Port already in use
```bash
# Run on different port
python manage.py runserver 8001

# Or find and kill process on port 8000
lsof -ti:8000 | xargs kill -9  # macOS/Linux
```

### Missing dependencies
```bash
pip install -r requirements.txt --upgrade
```

## 📦 Deployment

### Production Checklist

- [ ] Set `DEBUG = False` in settings.py
- [ ] Configure production database (PostgreSQL recommended)
- [ ] Set up environment variables
- [ ] Configure static file serving
- [ ] Set up media file storage
- [ ] Configure CORS for production domain
- [ ] Set up SSL/HTTPS
- [ ] Configure allowed hosts
- [ ] Run `collectstatic`
- [ ] Set up proper logging

### Recommended Hosting

- **Heroku** - Easy deployment with PostgreSQL
- **AWS Elastic Beanstalk** - Scalable cloud hosting
- **DigitalOcean App Platform** - Simple container deployment
- **Railway** - Modern deployment platform

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Simple JWT](https://django-rest-framework-simplejwt.readthedocs.io/)

---

**[⬆ Back to Main README](../README.md)**

