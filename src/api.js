import axios from "axios";
import { ACCESS_TOKEN } from "./constants";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle global errors here
        console.log("in the epicenter");
        console.error("Axios error:", error);

        return Promise.reject(error);
        
    }
);

export default api;
