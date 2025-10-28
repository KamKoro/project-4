# 🍳 Pulp Kitchen - Frontend

React frontend application for the Pulp Kitchen recipe sharing platform.

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library |
| **React Router v6** | Client-side routing |
| **React Query** | Server state management & caching |
| **React Hook Form** | Form validation & management |
| **Axios** | HTTP client for API calls |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Icon library |
| **Context API** | Authentication state |

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx             # Navigation bar
│   │   ├── RecipeCard.jsx         # Recipe card component
│   │   ├── IngredientSelector.jsx # Ingredient picker
│   │   ├── UnitsSelector.jsx      # Unit of measurement picker
│   │   ├── CommentSection.jsx     # Recipe comments
│   │   ├── StarRating.jsx         # Star rating component
│   │   └── ProtectedRoute.jsx     # Auth route wrapper
│   ├── pages/               # Page components
│   │   ├── Home.jsx               # Landing page
│   │   ├── Login.jsx              # Login form
│   │   ├── Register.jsx           # Registration form
│   │   ├── RecipeList.jsx         # Browse all recipes
│   │   ├── RecipeDetail.jsx       # Single recipe view
│   │   ├── RecipeCreate.jsx       # Create new recipe
│   │   ├── RecipeEdit.jsx         # Edit recipe form
│   │   ├── Profile.jsx            # User profile page
│   │   └── SavedRecipes.jsx       # Bookmarked recipes
│   ├── contexts/
│   │   └── AuthContext.jsx        # Authentication context
│   ├── services/
│   │   └── api.js                 # API service layer
│   ├── utils/
│   │   ├── cn.js                  # Class name utility
│   │   └── unitConversion.js      # Unit conversion helpers
│   ├── App.jsx              # Main app component
│   ├── index.js             # App entry point (required .js for CRA)
│   └── index.css            # Global styles & Tailwind
├── package.json             # Dependencies & scripts
├── tailwind.config.js       # Tailwind configuration
└── postcss.config.js        # PostCSS configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

The app will automatically reload when you make changes.

### Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Eject from Create React App (irreversible)
npm run eject
```

## 🎨 Key Features

### User Authentication
- Registration with validation
- JWT-based login/logout
- Protected routes
- Persistent authentication with localStorage
- Auto token refresh

### Recipe Management
- Browse public recipes with pagination
- Search and filter by name, cuisine, difficulty, cook time
- Sort by newest, oldest, or alphabetical
- Create recipes with dynamic ingredient forms
- Edit/delete own recipes
- Upload recipe images
- Multiple difficulty levels (easy, medium, hard)
- 12 food type categories
- 17 cuisine options
- Automatic unit conversion between metric/imperial

### Social Features
- Rate recipes with half-star precision (0.5-5.0 stars)
- Save/bookmark favorite recipes
- Comment on recipes with discussions
- View user profiles
- See recipe authors by username

### UI/UX
- Responsive design (mobile, tablet, desktop)
- Loading states and skeleton screens
- Error handling with user feedback
- Toast notifications
- Clean, modern interface
- Intuitive navigation
- Compact filter bar

## 🔌 API Integration

The frontend communicates with the Django backend through the API service layer.

### API Service (`src/services/api.js`)

```javascript
// Axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Automatic token attachment
// Request/response interceptors
// Error handling
```

### Key API Functions

```javascript
// Authentication
registerUser(userData)
loginUser(credentials)
fetchUserProfile()
updateUserProfile(data)

// Recipes
fetchRecipes()
fetchRecipe(id)
createRecipe(data)
updateRecipe(id, data)
deleteRecipe(id)
fetchMyRecipes()
fetchSavedRecipes()

// Ratings & Saves
rateRecipe(id, rating)
deleteRating(id)
saveRecipe(id)
unsaveRecipe(id)

// Ingredients
fetchIngredients()
fetchIngredientCategories()

// Comments
getComments(recipeId)
addComment(recipeId, text)
deleteComment(commentId)
```

## 🎯 Component Overview

### Page Components

**Home** - Landing page with hero section and featured content  
**Login/Register** - Authentication forms with validation  
**RecipeList** - Grid view of all public recipes  
**RecipeDetail** - Full recipe view with ingredients, instructions, ratings  
**RecipeCreate/Edit** - Form with dynamic ingredient management  
**Profile** - User information and their created recipes  
**SavedRecipes** - User's bookmarked recipes  

### Reusable Components

**Navbar** - Responsive navigation with auth state  
**RecipeCard** - Recipe preview card with image, title, rating  
**IngredientSelector** - Searchable dropdown for ingredient selection  
**UnitsSelector** - Dropdown for measurement units  
**CommentSection** - Recipe comments with add/delete functionality  
**StarRating** - Interactive star rating component with half-star support  
**ProtectedRoute** - Route wrapper requiring authentication  

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS for styling with custom configuration:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // Custom colors, fonts, spacing, etc.
    },
  },
  plugins: [],
}
```

### Global Styles

Custom styles and Tailwind directives in `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utility classes */
```

## 🔐 Authentication Flow

1. User logs in via `/login`
2. Backend returns JWT access & refresh tokens
3. Tokens stored in localStorage
4. Access token sent with each API request
5. AuthContext provides auth state globally
6. ProtectedRoute guards authenticated pages
7. Auto redirect to login if unauthorized

## 🧪 Testing

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in CI mode
CI=true npm test
```

## 📦 Building for Production

```bash
# Create optimized production build
npm run build
```

This creates a `build/` directory with:
- Minified JavaScript bundles
- Optimized CSS
- Compressed assets
- Source maps

### Deployment

The build folder can be deployed to:

- **Netlify** - Drag & drop or GitHub integration
- **Vercel** - Automatic deployments from Git
- **AWS S3 + CloudFront** - Static site hosting
- **GitHub Pages** - Free hosting for public repos
- **Render** - Simple static site deployment

### Environment Variables

For production, create `.env.production`:

```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

Access in code:
```javascript
const API_URL = process.env.REACT_APP_API_URL;
```

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# Run on different port
PORT=3001 npm start
```

### API connection errors
- Ensure backend is running on `http://localhost:8000`
- Check CORS settings in Django backend
- Verify API base URL in `src/services/api.js`

### Dependencies issues
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

### Build errors
```bash
# Check for unused imports/variables
# Review console errors
# Update dependencies if needed
npm update
```

### Styling not applied
```bash
# Rebuild Tailwind
npm run build:css  # if you have this script
# Or restart dev server
```

## 🚀 Performance Optimization

### Implemented
- React Query for caching and reducing API calls
- Lazy loading of routes (code splitting)
- Image optimization
- Debounced search inputs
- Memoization of expensive computations

### Additional Ideas
- Add React.memo() to components
- Implement virtual scrolling for long lists
- Use Web Workers for heavy computations
- Add service worker for offline support
- Compress images before upload

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [React Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Hook Form](https://react-hook-form.com/)

## 🔮 Future Enhancements

- [ ] Recipe tags and categories
- [ ] Social features (follow users, feed)
- [ ] Recipe collections/meal plans
- [ ] Print recipe functionality
- [ ] Share recipes on social media
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Recipe import from URL
- [ ] Advanced filtering options (dietary restrictions, allergens)


---

**[⬆ Back to Main README](../README.md)**

