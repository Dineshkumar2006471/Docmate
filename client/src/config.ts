const getApiUrl = () => {
    // If VITE_API_URL is set (e.g. in .env or Netlify environment variables), use it
    if (import.meta.env.VITE_API_URL) {
        console.log("Using API URL from environment:", import.meta.env.VITE_API_URL);
        return import.meta.env.VITE_API_URL;
    }

    // If in production (Netlify), use the deployed backend URL
    if (import.meta.env.PROD) {
        // TODO: Ensure this URL is correct for your backend deployment (Render or Netlify Functions)
        // If using Render, set VITE_API_URL in Netlify to your Render URL (e.g., https://docmate-backend.onrender.com)
        const prodUrl = 'https://docmate-server.netlify.app';
        console.log("Using default production API URL:", prodUrl);
        return prodUrl;
    }

    // Default to local development
    return 'http://localhost:3000';
};

export const API_URL = getApiUrl();
