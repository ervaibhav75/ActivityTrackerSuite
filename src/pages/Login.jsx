import Form from "../components/SignInForm"
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { jwtDecode } from "jwt-decode";
import api from "../api";



export default function Login() {
    const navigateTo = useNavigate();



    useEffect(() => {
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
                navigateTo('/')
            } else {
                
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
            localStorage.removeItem(ACCESS_TOKEN);
            localStorage.removeItem(REFRESH_TOKEN);
            console.error("Error:", error);
        }
    };


    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            return
        } else {
            var tokenExpiration;
            try {
                const decodedToken = jwtDecode(token);
                tokenExpiration = decodedToken.exp;
                console.log(decodedToken);
            } catch (error) {
                console.error("Error decoding JWT token:", error);
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
                return;
            }
            const now = Date.now() / 1000;
            if (tokenExpiration < now) {
                await refreshToken();
            } else {
                navigateTo('/')
            }
        }
    };


    return (<>
        <Form method="login" route="/api/token/" />
        <div style={{ textAlign: "center" }}> {/* Parent container with text-align: center */}
            <p style={{
                margin: '2rem',
                display: "inline-block",
                marginTop: "10px",
                cursor: "pointer",
                color: "darkslateblue",
                textDecoration: "underline",
                fontSize: "25px",
                fontWeight: "lighter",
                fontFamily: "sans-serif"
            }} onClick={() => {
                navigateTo("/register");
            }}>Not registered yet? Signup!</p>
        </div>
    </>)
}