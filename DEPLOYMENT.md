# 🚀 Heroku Deployment Guide for Pulp Kitchen

This guide will walk you through deploying your Pulp Kitchen application to Heroku.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ A [Heroku account](https://signup.heroku.com/) (free tier available)
- ✅ [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- ✅ [Git](https://git-scm.com/) installed
- ✅ All changes committed to your repository

## 🔧 Pre-Deployment Setup

### 1. Verify Configuration Files

Ensure these files exist in your project (they should be created already):

```
project-4/
├── backend/
│   ├── Procfile              # ✅ Heroku process configuration
│   ├── runtime.txt           # ✅ Python version
│   └── requirements.txt      # ✅ Updated with production dependencies
├── .env.example              # ✅ Environment variables template
└── DEPLOYMENT.md             # ✅ This file
```

### 2. Build React Frontend

Before deploying, build the React application:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Create production build
npm run build

# Navigate back to project root
cd ..
```

This creates an optimized production build in `frontend/build/` that Django will serve.

### 3. Install Heroku CLI

If you haven't already:

```bash
# macOS (using Homebrew)
brew tap heroku/brew && brew install heroku

# Or download from: https://devcenter.heroku.com/articles/heroku-cli
```

Verify installation:
```bash
heroku --version
```

## 🌐 Deployment Steps

### Step 1: Login to Heroku

```bash
heroku login
```

This will open your browser for authentication.

### Step 2: Create Heroku Application

```bash
# Create a new Heroku app (use a unique name or let Heroku generate one)
heroku create your-pulp-kitchen-app

# Or let Heroku generate a random name:
heroku create
```

**Note the app URL** - it will be something like: `https://your-pulp-kitchen-app.herokuapp.com`

### Step 3: Add PostgreSQL Database

Heroku requires PostgreSQL for production:

```bash
# Add Heroku Postgres (free tier)
heroku addons:create heroku-postgresql:essential-0

# Verify it was added
heroku addons
```

### Step 4: Configure Environment Variables

Set up your environment variables on Heroku:

```bash
# Generate a strong SECRET_KEY
python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Set environment variables
heroku config:set SECRET_KEY="your-generated-secret-key-here"
heroku config:set ON_HEROKU=1
heroku config:set CORS_ALLOWED_ORIGINS="https://your-pulp-kitchen-app.herokuapp.com"

# Verify configuration
heroku config
```

**Important:** 
- Replace `your-pulp-kitchen-app` with your actual Heroku app name!
- The `ON_HEROKU` environment variable tells Django to use production settings
- `DEBUG`, `ALLOWED_HOSTS`, and database config are automatically set based on `ON_HEROKU`

### Step 5: Commit All Changes

Ensure everything is committed:

```bash
# Check status
git status

# Add any uncommitted files
git add .

# Commit
git commit -m "Prepare for Heroku deployment"
```

### Step 6: Deploy to Heroku

```bash
# Push to Heroku (this triggers the deployment)
git push heroku main

# If you're on a different branch (e.g., master):
# git push heroku master:main
```

**What happens during deployment:**
1. Heroku detects Python app
2. Installs dependencies from `requirements.txt`
3. Runs database migrations automatically (via `release` command in Procfile)
4. Starts the web server with gunicorn

### Step 7: Verify Deployment

```bash
# Open your app in browser
heroku open

# Check logs if there are issues
heroku logs --tail
```

### Step 8: Populate Database

Since this is a fresh database, you need to populate it:

```bash
# Run migrations (should already be done, but verify)
heroku run python backend/manage.py migrate

# Create superuser for admin access
heroku run python backend/manage.py create_superuser

# Populate ingredients database
heroku run python backend/manage.py populate_ingredients

# Seed sample data (8 users, 40 recipes)
heroku run python backend/manage.py seed_data
```

### Step 9: Collect Static Files

```bash
# Collect Django admin static files
heroku run python backend/manage.py collectstatic --noinput
```

## ✅ Post-Deployment Verification

### 1. Test the Application

Visit your app URL: `https://your-pulp-kitchen-app.herokuapp.com`

✅ **Check:**
- [ ] Homepage loads correctly
- [ ] Can register a new user
- [ ] Can login
- [ ] Can view recipes
- [ ] Can create a recipe
- [ ] Can rate recipes
- [ ] Can save recipes
- [ ] Images upload correctly

### 2. Access Admin Panel

Visit: `https://your-pulp-kitchen-app.herokuapp.com/admin`

Login with the superuser credentials you created.

### 3. Check API Endpoints

Test API health: `https://your-pulp-kitchen-app.herokuapp.com/api-root/`

## 🔍 Troubleshooting

### View Logs

```bash
# Tail logs in real-time
heroku logs --tail

# View last 200 lines
heroku logs -n 200

# View specific dyno logs
heroku logs --source app --tail
```

### Common Issues

#### 1. **Application Error / 500**

```bash
# Check logs
heroku logs --tail

# Ensure DEBUG is False
heroku config:set DEBUG=False

# Verify SECRET_KEY is set
heroku config:get SECRET_KEY
```

#### 2. **Static Files Not Loading**

```bash
# Recollect static files
heroku run python backend/manage.py collectstatic --noinput

# Verify STATIC_ROOT in settings
```

#### 3. **Database Connection Errors**

```bash
# Verify DATABASE_URL is set
heroku config:get DATABASE_URL

# Run migrations
heroku run python backend/manage.py migrate
```

#### 4. **CORS Errors**

```bash
# Update CORS settings with your Heroku URL
heroku config:set CORS_ALLOWED_ORIGINS="https://your-app-name.herokuapp.com"

# Restart the app
heroku restart
```

#### 5. **Media Files Not Saving**

**Note:** Heroku's filesystem is ephemeral! Uploaded images will be deleted on dyno restart.

**Solution:** Use a cloud storage service like AWS S3 or Cloudinary.

Quick setup for Cloudinary:
```bash
# Add Cloudinary addon
heroku addons:create cloudinary:starter

# Install django-cloudinary-storage
# Add to requirements.txt: django-cloudinary-storage==0.3.0
```

### Reset Database

If you need to start fresh:

```bash
# Reset database
heroku pg:reset DATABASE_URL --confirm your-app-name

# Run migrations
heroku run python backend/manage.py migrate

# Re-populate data
heroku run python backend/manage.py populate_ingredients
heroku run python backend/manage.py seed_data
```

## 🔄 Updating Your Deployment

After making changes to your code:

```bash
# 1. Rebuild frontend (if frontend changes were made)
cd frontend && npm run build && cd ..

# 2. Commit changes
git add .
git commit -m "Your commit message"

# 3. Deploy
git push heroku main

# 4. Check logs
heroku logs --tail
```

## 📊 Monitoring & Maintenance

### Check App Status

```bash
# View app info
heroku apps:info

# View dyno status
heroku ps

# View database info
heroku pg:info
```

### Database Backup

```bash
# Create backup
heroku pg:backups:capture

# List backups
heroku pg:backups

# Download backup
heroku pg:backups:download
```

### Scale Dynos

```bash
# Check current scaling
heroku ps

# Scale web dynos (free tier: max 1)
heroku ps:scale web=1
```

## 💰 Cost Considerations

### Free Tier Limitations

- ⚠️ **Dynos sleep after 30 mins of inactivity** (first request after sleep is slower)
- ⚠️ **550-1000 dyno hours/month** (plenty for a personal project)
- ⚠️ **PostgreSQL row limit** on free tier (10,000 rows)
- ⚠️ **No custom domain SSL** on free tier

### Upgrade Options

If you need more:

```bash
# Upgrade to Hobby dyno ($7/month - no sleeping)
heroku ps:type hobby

# Upgrade database to paid tier
heroku addons:create heroku-postgresql:mini
```

## 🔐 Security Best Practices

1. **Never commit sensitive data**
   - Always use environment variables
   - Keep `.env` in `.gitignore`

2. **Use strong SECRET_KEY**
   ```bash
   python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
   ```

3. **Keep dependencies updated**
   ```bash
   pip list --outdated
   ```

4. **Enable 2FA on Heroku account**

5. **Regularly backup database**

## 📚 Additional Resources

- [Heroku Python Support](https://devcenter.heroku.com/articles/python-support)
- [Heroku Django Deployment](https://devcenter.heroku.com/articles/django-app-configuration)
- [Heroku Postgres](https://devcenter.heroku.com/articles/heroku-postgresql)
- [Django Production Checklist](https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/)

## 🆘 Getting Help

If you encounter issues:

1. Check Heroku logs: `heroku logs --tail`
2. Review Django deployment checklist: `python manage.py check --deploy`
3. Search [Heroku Dev Center](https://devcenter.heroku.com/)
4. Ask on [Stack Overflow](https://stackoverflow.com/questions/tagged/heroku)

## 🎉 Success!

Your Pulp Kitchen app should now be live on Heroku! 🍳

**Share your app:**
- Production URL: `https://your-pulp-kitchen-app.herokuapp.com`
- Admin Panel: `https://your-pulp-kitchen-app.herokuapp.com/admin`
- API Docs: `https://your-pulp-kitchen-app.herokuapp.com/api-root/`

---

**Note:** Remember to update the GitHub README with your production URL!

## Quick Command Reference

```bash
# Deployment
heroku login
heroku create app-name
heroku addons:create heroku-postgresql:essential-0
git push heroku main

# Configuration
heroku config:set KEY=VALUE
heroku config

# Logs & Debugging
heroku logs --tail
heroku run bash

# Database
heroku pg:info
heroku run python backend/manage.py migrate
heroku run python backend/manage.py createsuperuser

# Maintenance
heroku restart
heroku ps
heroku releases
```

Good luck with your deployment! 🚀

