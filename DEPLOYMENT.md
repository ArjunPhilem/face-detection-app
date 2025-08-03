# GitHub Pages Deployment Guide

This guide will help you deploy your Face Detection and Recognition app to GitHub Pages for free hosting.

## Prerequisites

1. **GitHub Account**: You need a free GitHub account
2. **Git**: Install Git on your computer from [https://git-scm.com/](https://git-scm.com/)
3. **Modern Browser**: Chrome, Firefox, Safari, or Edge

## Step-by-Step Deployment

### 1. Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Repository name: `face-detection-app` (or any name you prefer)
5. Make it **Public** (required for free GitHub Pages)
6. Don't initialize with README (we'll add our own)
7. Click "Create repository"

### 2. Upload Your Project Files

#### Option A: Using GitHub Web Interface (Easiest)

1. In your new repository, click "uploading an existing file"
2. Drag and drop all your project files:
   - `index.html`
   - `script.js`
   - `styles.css`
   - `README.md`
   - `models/` folder (entire folder)
3. Add a commit message: "Initial commit: Face detection app"
4. Click "Commit changes"

#### Option B: Using Git Command Line

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/face-detection-app.git
cd face-detection-app

# Copy all your project files to this directory
# (index.html, script.js, styles.css, README.md, models/ folder)

# Add all files
git add .

# Commit
git commit -m "Initial commit: Face detection app"

# Push to GitHub
git push origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click the "Settings" tab
3. Scroll down to "Pages" section (in the left sidebar)
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch
6. Click "Save"
7. Wait a few minutes for deployment

### 4. Access Your Live App

Your app will be available at:
```
https://YOUR_USERNAME.github.io/face-detection-app
```

Replace `YOUR_USERNAME` with your actual GitHub username and `face-detection-app` with your repository name.

## Important Notes

### HTTPS Requirement
- GitHub Pages provides HTTPS by default
- This is required for camera access in modern browsers
- Your app will work perfectly on GitHub Pages

### Model Loading
- The app loads face detection models from the local `models/` folder
- These models are included in your repository
- No external dependencies required

### Performance
- GitHub Pages provides fast CDN hosting
- Models will load quickly from the CDN
- Real-time face detection will work smoothly

## Troubleshooting

### If Models Don't Load
1. Check that the `models/` folder is uploaded correctly
2. Verify all model files are present
3. Check browser console for errors
4. Ensure you're using HTTPS (GitHub Pages provides this)

### If Camera Doesn't Work
1. Make sure you're accessing via HTTPS
2. Allow camera permissions when prompted
3. Try refreshing the page
4. Check browser console for errors

### If Page Doesn't Load
1. Wait a few minutes after enabling GitHub Pages
2. Check the repository settings
3. Verify all files are uploaded correctly
4. Check the Actions tab for deployment status

## Custom Domain (Optional)

If you want to use a custom domain:
1. Go to repository Settings > Pages
2. Enter your custom domain
3. Add a CNAME file to your repository
4. Configure DNS with your domain provider

## Updating Your App

To update your live app:
1. Make changes to your local files
2. Upload the updated files to GitHub
3. GitHub Pages will automatically redeploy
4. Changes will be live within a few minutes

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all files are uploaded correctly
3. Ensure the repository is public
4. Check GitHub Pages settings

Your face detection app will be live and accessible to anyone with the URL! 