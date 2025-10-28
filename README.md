<div align="center">

# 🍳 Pulp Kitchen

### Social Recipe Building Application

*Create, Share, and Discover Amazing Recipes*

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=white)
![Django](https://img.shields.io/badge/Django-4.2.7-092E20?style=flat&logo=django&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

[Features](#features) • [Tech Stack](#tech-stack) • [Getting Started](#getting-started) • [API Documentation](#api-endpoints) • [Screenshots](#screenshots)

</div>

---

## 📖 About

Pulp Kitchen is a full-stack social recipe platform where food enthusiasts can create, share, and discover delicious recipes. Built with modern web technologies, it offers an intuitive interface for managing recipes, rating dishes, and connecting with other cooking enthusiasts.

## ✨ Features

### Core Features
- 🔐 **User Authentication** - Secure registration and JWT-based login
- 📝 **Recipe Management** - Create, edit, and delete your own recipes
- 🌍 **Public Recipe Feed** - Discover recipes from the community
- ⭐ **Rating System** - Rate recipes from 1-5 stars
- 💾 **Save Recipes** - Bookmark your favorite recipes for later
- 👤 **User Profiles** - Personalized profiles with bio and stats
- 🥗 **Ingredient Database** - 500+ pre-populated ingredients with categories
- 📊 **Difficulty Levels** - Easy, Medium, Hard recipe classifications
- 🍕 **Food Types** - Italian, Mexican, Chinese, Thai, Japanese, Greek, Indian, American cuisines

### Stretch Features (Coming Soon)
- 💬 Recipe comments and discussions
- 🔍 Advanced search and filtering
- 🏷️ Recipe categories and tags
- 👥 Social features (follow users, activity feed)

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Django 4.2.7** | Web framework & REST API |
| **Django REST Framework** | API serialization & views |
| **Simple JWT** | Token-based authentication |
| **SQLite** | Database (development) |
| **Pillow** | Image handling |
| **CORS Headers** | Cross-origin resource sharing |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library |
| **React Router v6** | Client-side routing |
| **React Query** | Data fetching & caching |
| **React Hook Form** | Form validation |
| **Tailwind CSS** | Utility-first styling |
| **Axios** | HTTP requests |
| **Lucide React** | Icon library |

## 📁 Project Structure

```
project-4/
├── backend/                    # Django REST API
│   ├── recipe_app/            # Project settings
│   ├── recipes/               # Recipe management app
│   ├── users/                 # Authentication app
│   ├── manage.py
│   ├── requirements.txt
│   └── README.md             ⭐ Backend documentation
├── frontend/                   # React application
│   ├── src/                   # Source code
│   │   ├── components/       # UI components
│   │   ├── pages/            # Route pages
│   │   ├── contexts/         # React contexts
│   │   ├── services/         # API layer
│   │   └── utils/            # Helpers
│   ├── package.json
│   └── README.md             ⭐ Frontend documentation
├── ERD/                        # Database diagrams
├── Wireframes/                 # UI mockups
└── README.md                   # This file (main overview)
```

> 📚 **For detailed setup and documentation:**
> - **Backend:** See [backend/README.md](backend/README.md)
> - **Frontend:** See [frontend/README.md](frontend/README.md)

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Git**

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/pulp-kitchen.git
cd pulp-kitchen
```

#### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Populate ingredient database (500+ ingredients)
python manage.py populate_ingredients

# Seed sample data (8 users with 19 recipes)
python manage.py seed_data

# (Optional) Create admin superuser
python manage.py create_superuser

# Start the development server
python manage.py runserver
```

✅ Backend will be available at `http://localhost:8000`  
✅ Admin panel at `http://localhost:8000/admin`

**Seed User Credentials:**
- Usernames: `john_doe`, `jane_smith`, `mike_wilson`, `sarah_jones`, `david_brown`, `emily_chen`, `carlos_garcia`, `lisa_anderson`
- Password: `Password1!` (for all users)
- **Note:** Half the users use metric measurements (g, kg, ml, l), half use imperial (cups, oz, lb)

#### 3️⃣ Frontend Setup

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
```

✅ Frontend will be available at `http://localhost:3000`

### Quick Start Commands

```bash
# Terminal 1: Start backend
cd backend && source venv/bin/activate && python manage.py runserver

# Terminal 2: Start frontend
cd frontend && npm start
```

🎉 **Open `http://localhost:3000` in your browser!**

---

## 📚 Detailed Documentation

For complete setup instructions, API documentation, and troubleshooting:

- 📘 **[Backend Documentation](backend/README.md)** - API endpoints, database models, Django setup
- 📗 **[Frontend Documentation](frontend/README.md)** - Components, routing, React setup

## 📸 Screenshots

> 📁 See the `Wireframes/` directory for UI design mockups

- **Home Page** - Landing page with featured recipes
- **Recipe List** - Browse all public recipes
- **Recipe Detail** - View recipe instructions and ingredients
- **Recipe Builder** - Create and edit recipes with ingredient selector
- **User Profile** - View user stats and their recipes
- **Saved Recipes** - Collection of bookmarked recipes

## 🛠 Development

### Useful Commands

```bash
# Backend - Seed database with sample data
python manage.py populate_ingredients  # 500+ ingredients
python manage.py seed_data             # 7 users, 16 recipes

# Run tests
python manage.py test      # Backend tests
npm test                   # Frontend tests

# Build for production
npm run build             # Frontend build
python manage.py collectstatic  # Django static files
```

See individual READMEs for complete command references.

## 🐛 Troubleshooting

### Quick Fixes

**Backend not working?**
```bash
source venv/bin/activate              # Activate virtual environment
python manage.py migrate              # Run migrations
pip install -r requirements.txt       # Install dependencies
```

**Frontend not working?**
```bash
rm -rf node_modules && npm install   # Reinstall dependencies
```

**Database issues?**
```bash
rm db.sqlite3                        # Delete database
python manage.py migrate             # Recreate
python manage.py seed_data           # Add sample data
```

For detailed troubleshooting, see [Backend README](backend/README.md) and [Frontend README](frontend/README.md).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

## 📖 Project Documentation

This project is organized with separate documentation for each major component:

- 📘 **[Backend README](backend/README.md)** - Complete Django/DRF documentation
  - API endpoints reference
  - Database models & schema
  - Management commands
  - Deployment guide
  
- 📗 **[Frontend README](frontend/README.md)** - Complete React documentation
  - Component structure
  - State management
  - API integration
  - Styling guide

## 🙏 Acknowledgments

- Recipe data and inspiration from various cooking communities
- Icons by [Lucide](https://lucide.dev)
- UI components inspired by modern design patterns
- Built as part of General Assembly's Software Engineering Bootcamp

---

<div align="center">

**Made with ❤️ and 🍕**

[⬆ Back to Top](#-pulp-kitchen)

</div>