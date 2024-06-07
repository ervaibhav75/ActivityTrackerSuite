import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Login from "../pages/Login";

import { jwtDecode } from "jwt-decode";

function ProtectedRoute({ children }) {
    const [isAuthorised, setIsAuthorised] = useState(null);
    const navigateTo = useNavigate();


    useEffect(() => {
        console.log("going through protected route!");
        auth();
    }, []);

    const refreshToken = async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post("api/token/refresh/", {
                refresh: refreshToken,
            });

            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorised(true);
            } else {
                setIsAuthorised(false);
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
            setIsAuthorised(false);
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
             // Redirect to login page if authentication error
             if (error.response && error.response.status === 401) {
                navigateTo("/login");
            }
            // Handle other errors
            console.error("Error:", error);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            console.log("not token!");
            setIsAuthorised(false);
            console.log(`isAuthorised: ${isAuthorised}`); 
            navigateTo('/login');
        } else {
            var tokenExpiration;
            try {
                const decodedToken = jwtDecode(token);
                tokenExpiration = decodedToken.exp;
                console.log(decodedToken);
            } catch (error) {
                console.error("Error decoding JWT token:", error);
                setIsAuthorised(false);
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
                return;
            }
            const now = Date.now() / 1000;
            if (tokenExpiration < now) {
                await refreshToken();
            } else {
                setIsAuthorised(true);
                // navigateTo('/')
            }
        }
    };

    if (isAuthorised === null) {
        return <h1>Loading...</h1>;
    }

    return isAuthorised ? children : <Login/>;
}

export default ProtectedRoute;
