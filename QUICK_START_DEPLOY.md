# 🚀 Quick Start: Deploy to Heroku in 5 Minutes

## Option 1: Automated Deployment (Recommended)

Run the automated deployment script:

```bash
./deploy.sh
```

This script will:
- ✅ Build your React frontend
- ✅ Check git status and commit changes if needed
- ✅ Create/configure Heroku app
- ✅ Add PostgreSQL database
- ✅ Set environment variables
- ✅ Deploy your app
- ✅ Run migrations and seed data
- ✅ Open your live app

**That's it!** Your app will be live in minutes.

---

## Option 2: Manual Deployment

If you prefer to deploy manually, follow these steps:

### 1. Build Frontend
```bash
cd frontend && npm run build && cd ..
```

### 2. Create Heroku App
```bash
heroku login
heroku create your-app-name
heroku addons:create heroku-postgresql:essential-0
```

### 3. Set Environment Variables
```bash
# Generate SECRET_KEY
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Set config vars
heroku config:set SECRET_KEY="<your-generated-key>"
heroku config:set ON_HEROKU=1
heroku config:set CORS_ALLOWED_ORIGINS="https://your-app-name.herokuapp.com"

# Note: DEBUG=False and ALLOWED_HOSTS are auto-set via ON_HEROKU
```

### 4. Deploy
```bash
git add .
git commit -m "Prepare for deployment"
git push heroku main
```

### 5. Setup Database
```bash
heroku run python backend/manage.py migrate
heroku run python backend/manage.py populate_ingredients
heroku run python backend/manage.py seed_data
heroku run python backend/manage.py create_superuser
```

### 6. Visit Your App
```bash
heroku open
```

---

## 📚 Documentation

- **Full Guide**: See `DEPLOYMENT.md` for detailed instructions
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md` for pre-deployment verification
- **Troubleshooting**: Check logs with `heroku logs --tail`

---

## ⚡ Quick Commands

```bash
# View logs
heroku logs --tail

# Open app
heroku open

# View database info
heroku pg:info

# Run Django command
heroku run python backend/manage.py <command>

# Restart app
heroku restart

# View configuration
heroku config
```

---

## ⚠️ Important Notes

1. **Build frontend first**: Always run `npm run build` in the frontend directory before deploying
2. **Commit changes**: Ensure all changes are committed to git
3. **Environment variables**: Set all required config vars on Heroku
4. **Database**: Heroku uses PostgreSQL (not SQLite)
5. **Media files**: Uploaded images are ephemeral on Heroku's free tier

---

## 🆘 Need Help?

1. Check the detailed guide: `DEPLOYMENT.md`
2. View logs: `heroku logs --tail`
3. Check Heroku status: https://status.heroku.com

**Good luck! 🍕**

