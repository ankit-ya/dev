import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8150', // Updated to match backend port
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // You can add auth tokens or other headers here
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle errors globally
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default api; 