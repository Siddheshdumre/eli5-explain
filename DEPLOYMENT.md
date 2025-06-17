# ELI5 Application Deployment Guide

## Deploying to Render

This guide will help you deploy your ELI5 application to Render with both frontend and backend services.

### Prerequisites

1. A Render account (free tier available)
2. Your GitHub repository connected to Render
3. Together AI API key

### Step 1: Prepare Your Repository

The following files have been created/updated for deployment:

- `render.yaml` - Render deployment configuration
- `backend/Procfile` - Backend service configuration
- `backend/requirements.txt` - Updated with production dependencies
- `vite.config.ts` - Updated for production builds
- `src/components/ELI5Question.tsx` - Updated to use environment variables

### Step 2: Deploy to Render

#### Option A: Using render.yaml (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [render.com](https://render.com)
   - Sign up/Login with your GitHub account
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables**:
   - In the Render dashboard, go to your backend service
   - Navigate to "Environment" tab
   - Add the following environment variables:
     - `TOGETHER_API_KEY`: Your Together AI API key
     - `FRONTEND_URL`: Your frontend URL (will be provided after deployment)

#### Option B: Manual Deployment

If you prefer to deploy services manually:

##### Backend Service
1. Create a new "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `eli5-backend`
   - **Environment**: `Python`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/health`

##### Frontend Service
1. Create a new "Static Site"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `eli5-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variable**: `VITE_API_URL` = your backend URL

### Step 3: Update URLs

After deployment, update the URLs in your configuration:

1. **Update `render.yaml`**:
   - Replace `https://eli5-frontend.onrender.com` with your actual frontend URL
   - Replace `https://eli5-backend.onrender.com` with your actual backend URL

2. **Update environment variables**:
   - Set `FRONTEND_URL` in backend service to your frontend URL
   - Set `VITE_API_URL` in frontend service to your backend URL

### Step 4: Test Your Deployment

1. **Test Backend Health**: Visit `https://your-backend-url.onrender.com/api/health`
2. **Test Frontend**: Visit your frontend URL and try asking a question
3. **Check Logs**: Monitor both services in the Render dashboard

### Common Issues and Solutions

#### 1. CORS Errors
- Ensure `FRONTEND_URL` is set correctly in backend environment variables
- Check that your frontend URL is in the `allowed_origins` list in `backend/main.py`

#### 2. API Key Issues
- Verify `TOGETHER_API_KEY` is set in backend environment variables
- Check that the API key is valid and has sufficient credits

#### 3. Build Failures
- Check that all dependencies are in `requirements.txt`
- Ensure Node.js version is compatible (Render uses Node 18+)

#### 4. Frontend Not Loading
- Verify `VITE_API_URL` is set correctly
- Check that the build completed successfully
- Ensure the `dist` folder is being served correctly

### Environment Variables Reference

#### Backend Variables
- `TOGETHER_API_KEY`: Your Together AI API key
- `FRONTEND_URL`: Your frontend application URL
- `PORT`: Automatically set by Render

#### Frontend Variables
- `VITE_API_URL`: Your backend API URL

### Monitoring and Maintenance

1. **Health Checks**: Both services have health check endpoints
2. **Logs**: Monitor logs in the Render dashboard
3. **Scaling**: Upgrade to paid plans for better performance
4. **Custom Domains**: Add custom domains in the Render dashboard

### Security Considerations

1. **API Keys**: Never commit API keys to your repository
2. **CORS**: Configure CORS properly for production
3. **Environment Variables**: Use Render's environment variable system
4. **HTTPS**: Render provides SSL certificates automatically

### Cost Optimization

- Free tier includes:
  - 750 hours/month per service
  - Services sleep after 15 minutes of inactivity
  - Limited bandwidth and build minutes
- Consider upgrading for:
  - Always-on services
  - Better performance
  - More resources

### Support

If you encounter issues:
1. Check Render's documentation
2. Review service logs in the dashboard
3. Verify environment variables are set correctly
4. Test locally before deploying 