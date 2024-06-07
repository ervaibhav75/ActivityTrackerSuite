import React, { useState } from "react";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
import { useNavigate } from "react-router-dom";

export default function Form({ route, method }) {
    // State variables to hold form input values
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false); // State to manage loading state
    const navigate = useNavigate(); // Navigation hook

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setLoading(true); // Set loading state to true

        try {
            // Prepare request data based on the method (login or register)
            let requestData = { username, password, password2, email };
            if (method === "register") {
                requestData.password2 = password2;
                requestData.email = email;
            }

            // Make API request
            const res = await api.post(route, requestData);

            // Handle response for login
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/"); // Redirect to home page
            } else if (method === "register") {
                navigate("/login"); // Redirect to login page
            }
        } catch (error) {
            // Show error message if there's an error
            alert(error.response?.data?.error || "An error occurred");
        } finally {
            setLoading(false); // Set loading state to false
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="form-container">
                <h1 className="title">{method === 'register' ? 'SignUp' : 'Login'}</h1>
                <input
                    className="form-input"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
                <input
                    className="form-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                {method === "register" && (
                    <>
                        <input
                            className="form-input"
                            type="password"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            placeholder="Type password again!"
                        />
                        <input
                            className="form-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                        />
                    </>
                )}
                <button className="form-button" type="submit">
                    {method === 'register' ? 'Submit' : 'Submit'}
                </button>
            </form>
        </>
    );
}
