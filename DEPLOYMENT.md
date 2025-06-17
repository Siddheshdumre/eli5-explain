# ELI5 Application Deployment Guide

## Overview
This guide will help you deploy the ELI5 application to Render.com, which includes both a FastAPI backend and a React frontend.

## Prerequisites
- A Render.com account
- Your code pushed to a Git repository (GitHub, GitLab, etc.)
- Together AI API key (already configured)

## Deployment Steps

### 1. Prepare Your Repository
Ensure your repository contains:
- `render.yaml` - Deployment configuration
- `backend/` - FastAPI application
- `src/` - React frontend
- `package.json` - Frontend dependencies
- `backend/requirements.txt` - Backend dependencies

### 2. Deploy to Render

#### Option A: Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Blueprint"
3. Connect your Git repository
4. Render will automatically detect the `render.yaml` file
5. Click "Apply" to deploy both services

#### Option B: Manual Deployment
If you prefer to deploy services individually:

**Backend Service:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" and select "Web Service"
3. Connect your Git repository
4. Configure:
   - **Name**: `eli5-backend`
   - **Environment**: `Python`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1`
   - **Plan**: Free

**Frontend Service:**
1. Click "New +" and select "Static Site"
2. Connect your Git repository
3. Configure:
   - **Name**: `eli5-frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

### 3. Environment Variables

#### Backend Environment Variables:
- `TOGETHER_API_KEY`: Your Together AI API key (already configured)
- `FRONTEND_URL`: `https://eli5-frontend.onrender.com`
- `CORS_ORIGINS`: `https://eli5-frontend.onrender.com,http://localhost:3000,http://localhost:8080`

#### Frontend Environment Variables:
- `VITE_API_URL`: `https://eli5-backend.onrender.com`

### 4. Post-Deployment

1. **Test the Backend**: Visit `https://eli5-backend.onrender.com/api/health`
2. **Test the Frontend**: Visit `https://eli5-frontend.onrender.com`
3. **Verify CORS**: Ensure the frontend can communicate with the backend

### 5. Custom Domain (Optional)
1. In your Render dashboard, go to your service
2. Click "Settings" → "Custom Domains"
3. Add your domain and configure DNS

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check the build logs in Render dashboard
   - Ensure all dependencies are in `requirements.txt` and `package.json`

2. **CORS Errors**:
   - Verify the `CORS_ORIGINS` environment variable includes your frontend URL
   - Check that the frontend URL in `VITE_API_URL` matches your backend URL

3. **API Key Issues**:
   - Ensure the `TOGETHER_API_KEY` is set correctly
   - Test the API key locally first

4. **Service Not Starting**:
   - Check the start command in render.yaml
   - Verify the port configuration uses `$PORT`

### Health Check Endpoints:
- Backend: `https://eli5-backend.onrender.com/api/health`
- Should return: `{"status": "healthy", "together_api": true}`

## Monitoring

1. **Logs**: View real-time logs in the Render dashboard
2. **Metrics**: Monitor performance and usage
3. **Alerts**: Set up notifications for service issues

## Updates

To update your deployment:
1. Push changes to your Git repository
2. Render will automatically redeploy (if auto-deploy is enabled)
3. Or manually trigger a deploy from the dashboard

## Cost Optimization

- Both services are configured for the free plan
- Monitor usage to avoid exceeding free tier limits
- Consider upgrading if you need more resources

## Security Notes

- API keys are stored as environment variables
- CORS is properly configured for production
- No sensitive data is exposed in the frontend

## Support

If you encounter issues:
1. Check the Render documentation
2. Review the build and runtime logs
3. Test locally to isolate issues
4. Contact Render support if needed 