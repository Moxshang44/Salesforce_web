export const environment = {
  production: true,
  // Use HTTPS for production (Netlify uses HTTPS)
  // If your API supports HTTPS, change http:// to https://
  apiUrl: 'https://ec2-13-203-193-170.ap-south-1.compute.amazonaws.com/api/v1'
  // If your API doesn't support HTTPS, you may need to:
  // 1. Set up a proxy/reverse proxy with HTTPS
  // 2. Use Netlify Functions as a proxy
  // 3. Configure CORS on your backend to allow your Netlify domain
};

