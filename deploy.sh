#!/bin/bash

# Passagr Deployment Script
# This script helps you deploy to various platforms quickly

echo "🚀 Passagr Deployment Helper"
echo "=============================="
echo ""
echo "Select your deployment platform:"
echo "1) Netlify (Recommended - Free, Easy)"
echo "2) Vercel"
echo "3) GitHub Pages"
echo "4) Cloudflare Pages"
echo "5) Just open locally"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "📦 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        netlify deploy --prod --dir=.
        ;;
    2)
        echo "📦 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        vercel --prod
        ;;
    3)
        echo "📦 Setting up for GitHub Pages..."
        echo ""
        echo "Steps:"
        echo "1. Create a new repository on GitHub"
        echo "2. Run these commands:"
        echo ""
        echo "   git init"
        echo "   git add index.html README.md"
        echo "   git commit -m 'Initial commit'"
        echo "   git branch -M main"
        echo "   git remote add origin YOUR_REPO_URL"
        echo "   git push -u origin main"
        echo ""
        echo "3. Go to repo Settings > Pages"
        echo "4. Select 'Deploy from branch' > main > root"
        ;;
    4)
        echo "📦 Deploying to Cloudflare Pages..."
        if ! command -v wrangler &> /dev/null; then
            echo "Installing Wrangler CLI..."
            npm install -g wrangler
        fi
        wrangler pages deploy . --project-name=passagr
        ;;
    5)
        echo "🌐 Opening locally..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            open index.html
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            xdg-open index.html
        else
            echo "Please open index.html in your browser"
        fi
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        ;;
esac

echo ""
echo "✨ Deployment complete! Your Passagr dashboard should be live soon."
echo "📖 Check README.md for more deployment options and customization tips."
