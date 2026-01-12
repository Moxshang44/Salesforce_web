# Netlify Deployment Guide - API Configuration

## Overview

Your Angular application has been configured to use environment-based API URLs. This allows you to use different API endpoints for development and production.

## What Was Changed

1. **Environment Files Created:**
   - `src/environments/environment.ts` - Development environment (uses HTTP)
   - `src/environments/environment.prod.ts` - Production environment (uses HTTPS)

2. **API Service Created:**
   - `src/app/core/services/api.service.ts` - Centralized API URL management

3. **Routes Component Updated:**
   - Updated to use `ApiService` instead of hardcoded API URLs

4. **Netlify Configuration:**
   - `public/_redirects` - Ensures SPA routing works correctly on Netlify

## Important: HTTPS and CORS Issues

**⚠️ Critical Issue:** Your API URL uses `http://` (non-secure), but Netlify serves your site over `https://` (secure). Modern browsers **block HTTP requests from HTTPS pages** for security reasons.

### Solutions

You have three options:

#### Option 1: Use HTTPS API (Recommended)
If your API server supports HTTPS, update the production environment file:

**File:** `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://ec2-13-203-193-170.ap-south-1.compute.amazonaws.com/api/v1'
  // Changed from http:// to https://
};
```

**Note:** Make sure your API server supports HTTPS. If it doesn't, you'll need to set up SSL/TLS certificates on your server.

#### Option 2: Use Netlify Functions as Proxy (Recommended if API doesn't support HTTPS)
Create a Netlify function to proxy your API requests. This allows HTTPS requests from your Netlify site to go through Netlify's servers.

1. Create `netlify/functions/api-proxy.ts`:
```typescript
import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const apiUrl = 'http://ec2-13-203-193-170.ap-south-1.compute.amazonaws.com/api/v1';
  const path = event.path.replace('/.netlify/functions/api-proxy', '');
  const url = `${apiUrl}${path}${event.rawQuery ? '?' + event.rawQuery : ''}`;

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        ...event.headers,
        host: undefined, // Remove host header
      },
      body: event.body,
    });

    const data = await response.text();
    
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
      body: data,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Proxy error' }),
    };
  }
};
```

2. Update `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: '/.netlify/functions/api-proxy/api/v1'
};
```

#### Option 3: Configure CORS on Your Backend (If you control the API)
If you control the backend API, configure it to:
1. Accept requests from your Netlify domain
2. Include proper CORS headers
3. Optionally set up HTTPS

Example CORS headers needed:
```
Access-Control-Allow-Origin: https://your-netlify-domain.netlify.app
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Deployment Steps

### 1. Build for Production

```bash
cd admin-website
npm run build
```

This will use `environment.prod.ts` automatically.

### 2. Deploy to Netlify

#### Option A: Via Netlify CLI
```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

#### Option B: Via Git Integration (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Netlify will automatically build and deploy

**Build Settings for Netlify:**
- **Build command:** `cd admin-website && npm run build`
- **Publish directory:** `admin-website/dist/admin-website/browser`

### 3. Verify Deployment

1. Visit your Netlify site URL
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try to load routes or make an API call
5. Check if requests are successful

## Environment Variables (Optional)

If you want to use environment variables instead of hardcoding, you can:

1. **Set in Netlify Dashboard:**
   - Go to Site settings > Environment variables
   - Add `VITE_API_URL` or `NG_APP_API_URL`

2. **Update environment files to use variables:**
   ```typescript
   export const environment = {
     production: true,
     apiUrl: (window as any).__env?.apiUrl || 'https://your-api-url.com/api/v1'
   };
   ```

Note: Angular doesn't natively support runtime environment variables. You may need a custom build script or use a different approach.

## Testing Locally

To test the production build locally:

```bash
# Build for production
npm run build

# Serve the production build
npx http-server dist/admin-website/browser -p 8080
```

Or use Angular's production server:
```bash
npm run build
ng serve --configuration production
```

## Troubleshooting

### Issue: API calls fail with CORS error
**Solution:** Use Option 2 (Netlify Functions) or configure CORS on your backend.

### Issue: API calls fail with mixed content error
**Solution:** Change API URL to HTTPS (Option 1) or use Netlify Functions (Option 2).

### Issue: Routes don't work (404 errors)
**Solution:** Ensure `public/_redirects` file exists with:
```
/*    /index.html   200
```

### Issue: Build fails
**Solution:** 
- Check that all dependencies are installed: `npm install`
- Check TypeScript errors: `npm run build`
- Ensure environment files are correctly formatted

## Next Steps

1. **Choose your solution** (HTTPS API, Netlify Functions, or CORS configuration)
2. **Update `environment.prod.ts`** with the correct API URL
3. **Build and deploy** to Netlify
4. **Test** your deployed application
5. **Monitor** the Network tab for any API errors

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Angular Deployment Guide](https://angular.io/guide/deployment)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

