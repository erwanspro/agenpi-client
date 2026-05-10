import axios from 'axios';

// plus besoin de répéter le lien api partout
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// intercepteur de requete
api.interceptors.request.use(
    (config) => {
        // on cherche le token
        const token = localStorage.getItem('token');

        // on l'attache automatiquement
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // ajout du format pour API Platform
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/ld+json';
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;