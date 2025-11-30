const getApiUrl = () => {
    // If VITE_API_URL is set (e.g. in .env), use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // If in production (Netlify), use the deployed backend URL
    if (import.meta.env.PROD) {
        return 'https://docmate-server.netlify.app';
    }

    // Default to local development
    return 'http://localhost:3000';
};

export const API_URL = getApiUrl();
