#!/bin/bash

# Pulp Kitchen - Heroku Deployment Script
# This script automates the deployment process to Heroku

set -e  # Exit on any error

echo "🍳 Pulp Kitchen - Heroku Deployment Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    print_error "Heroku CLI not found. Please install it first:"
    echo "  brew tap heroku/brew && brew install heroku"
    echo "  Or visit: https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

print_success "Heroku CLI found"

# Step 1: Build React frontend
echo ""
echo "📦 Step 1: Building React frontend..."
cd frontend
if [ -d "node_modules" ]; then
    print_success "Dependencies already installed"
else
    print_warning "Installing dependencies..."
    npm install
fi

print_warning "Building React app..."
npm run build

if [ -d "build" ]; then
    print_success "React build completed"
else
    print_error "React build failed"
    exit 1
fi

cd ..

# Step 2: Check if git is initialized and clean
echo ""
echo "🔍 Step 2: Checking git status..."
if [ -d ".git" ]; then
    print_success "Git repository found"
    
    if [[ -n $(git status -s) ]]; then
        print_warning "You have uncommitted changes. Commit them first!"
        git status -s
        echo ""
        read -p "Do you want to commit changes now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            read -p "Enter commit message: " commit_msg
            git commit -m "$commit_msg"
            print_success "Changes committed"
        else
            print_error "Please commit changes before deploying"
            exit 1
        fi
    else
        print_success "Working directory clean"
    fi
else
    print_error "Not a git repository"
    exit 1
fi

# Step 3: Check Heroku login
echo ""
echo "🔐 Step 3: Checking Heroku login..."
if heroku auth:whoami &> /dev/null; then
    HEROKU_USER=$(heroku auth:whoami)
    print_success "Logged in as: $HEROKU_USER"
else
    print_warning "Not logged in. Logging in to Heroku..."
    heroku login
fi

# Step 4: Check if Heroku app exists or create new one
echo ""
echo "🚀 Step 4: Checking Heroku app..."

if git remote | grep -q "^heroku$"; then
    HEROKU_APP=$(heroku apps:info -r heroku | grep "^=== " | sed 's/=== //')
    print_success "Heroku app found: $HEROKU_APP"
    
    read -p "Deploy to this app? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
else
    print_warning "No Heroku app found"
    read -p "Enter app name (or press Enter for random name): " app_name
    
    if [ -z "$app_name" ]; then
        heroku create
    else
        heroku create "$app_name"
    fi
    
    HEROKU_APP=$(heroku apps:info | grep "^=== " | sed 's/=== //')
    print_success "Created Heroku app: $HEROKU_APP"
fi

# Step 5: Check for PostgreSQL addon
echo ""
echo "🗄️  Step 5: Checking database..."
if heroku addons -a "$HEROKU_APP" | grep -q "heroku-postgresql"; then
    print_success "PostgreSQL addon already exists"
else
    print_warning "Adding PostgreSQL addon..."
    heroku addons:create heroku-postgresql:essential-0 -a "$HEROKU_APP"
    print_success "PostgreSQL added"
fi

# Step 6: Configure environment variables
echo ""
echo "⚙️  Step 6: Configuring environment variables..."

# Check if SECRET_KEY exists
if heroku config:get SECRET_KEY -a "$HEROKU_APP" | grep -q "."; then
    print_success "SECRET_KEY already set"
else
    print_warning "Generating SECRET_KEY..."
    SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
    heroku config:set SECRET_KEY="$SECRET_KEY" -a "$HEROKU_APP"
    print_success "SECRET_KEY set"
fi

# Set ON_HEROKU flag
heroku config:set ON_HEROKU=1 -a "$HEROKU_APP"
print_success "ON_HEROKU=1"

# Set CORS_ALLOWED_ORIGINS
heroku config:set CORS_ALLOWED_ORIGINS="https://$HEROKU_APP.herokuapp.com" -a "$HEROKU_APP"
print_success "CORS_ALLOWED_ORIGINS set"

print_warning "Note: DEBUG, ALLOWED_HOSTS, and DATABASE config are automatically set via ON_HEROKU"

# Step 7: Deploy to Heroku
echo ""
echo "🚢 Step 7: Deploying to Heroku..."
echo "This may take a few minutes..."
echo ""

git push heroku main

print_success "Deployment successful!"

# Step 8: Post-deployment setup
echo ""
echo "🔧 Step 8: Running post-deployment setup..."

echo "Running migrations..."
heroku run python backend/manage.py migrate -a "$HEROKU_APP"
print_success "Migrations completed"

echo "Collecting static files..."
heroku run python backend/manage.py collectstatic --noinput -a "$HEROKU_APP"
print_success "Static files collected"

echo "Populating ingredients..."
heroku run python backend/manage.py populate_ingredients -a "$HEROKU_APP"
print_success "Ingredients populated"

echo ""
read -p "Seed sample data (8 users, 40 recipes)? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    heroku run python backend/manage.py seed_data -a "$HEROKU_APP"
    print_success "Sample data seeded"
fi

echo ""
read -p "Create superuser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    heroku run python backend/manage.py create_superuser -a "$HEROKU_APP"
    print_success "Superuser created"
fi

# Step 9: Success!
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Your app is live at:"
echo "  🌐 https://$HEROKU_APP.herokuapp.com"
echo "  🔐 https://$HEROKU_APP.herokuapp.com/admin"
echo ""
echo "Useful commands:"
echo "  View logs:        heroku logs --tail -a $HEROKU_APP"
echo "  Open app:         heroku open -a $HEROKU_APP"
echo "  Run command:      heroku run <command> -a $HEROKU_APP"
echo "  View config:      heroku config -a $HEROKU_APP"
echo ""

read -p "Open app in browser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    heroku open -a "$HEROKU_APP"
fi

print_success "All done! 🍕"

