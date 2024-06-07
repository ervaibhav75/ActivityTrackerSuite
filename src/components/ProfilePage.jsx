import React, { useState, useEffect } from 'react';
import api from '../api'; // Make sure to import your api configuration
import './ProfilePage.css'; // Import the CSS file for styling
import ResponsiveAppBar from './common/ResponsiveAppBar';

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await api.post('/getUserData/', {});
                setUserData(res.data);
            } catch (e) {
                console.error("Error fetching user data:", e.message);
            }
        };

        fetchUserInfo();
    }, []);

    if (!userData) {
        return <p>Loading user data...</p>;
    }

    return (
        <>
        <ResponsiveAppBar></ResponsiveAppBar>
        <div className="profile-container">
            <div className="profile-card">
            <div className='head'>My Profile</div>

                <p><strong>Username:</strong> {userData.username}</p>
                <p><strong>First Name:</strong> {userData.first_name}</p>
                <p><strong>Last Name:</strong> {userData.last_name}</p>
                <p><strong>Email:</strong> {userData.email}</p>
            </div>
        </div>
        </>
    );
};

export default ProfilePage;
