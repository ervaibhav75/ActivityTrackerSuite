// useAxios.js
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ACCESS_TOKEN } from "../../constants";

const useAxios = () => {
    const navigateTo = useNavigate();

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL
    });

    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            }else{
                console.log("token not found!");
                navigateTo('/login')
            }
            
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
            console.error("Axios error:", error);
           

            return Promise.reject(error);
        }
    );

    return api;
};

export default useAxios;