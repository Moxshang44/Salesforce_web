export const environment = {
  production: true,
  // Using HTTP for now (backend only supports HTTP)
  // Note: This may cause mixed content errors since Netlify serves over HTTPS
  // If you encounter issues, consider using Netlify Functions as a proxy
  apiUrl: 'http://ec2-13-203-193-170.ap-south-1.compute.amazonaws.com/api/v1'
};

