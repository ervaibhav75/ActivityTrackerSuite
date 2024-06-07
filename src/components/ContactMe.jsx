import { useState } from "react";
import api from "../api";
import "../styles/ContactMe.css";
import ResponsiveAppBar from './common/ResponsiveAppBar';
import { useNavigate } from "react-router-dom";

export default function ContactMe() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    function getStringAfterFirstSpace(str) {
        // Find the index of the first space
        const firstSpaceIndex = str.indexOf(" ");
        // Check if a space was found
        if (firstSpaceIndex !== -1) {   
            // Return the rest of the string from the first space onward, trimmed
            console.log(` trimmed data is : ${str.substring(firstSpaceIndex + 1).trim()}`)

            return str.substring(firstSpaceIndex + 1).trim();
        } else {
            console.log("no space found!");
            // If no space found, return an empty string
            return "";
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const formData = {
            title: getStringAfterFirstSpace(title),
            description: getStringAfterFirstSpace(description),
            contact_number: getStringAfterFirstSpace(contact),
            email: getStringAfterFirstSpace(email)
        };

        try {
            const response = await api.post('/contactme/', formData);
            console.log("Form data sent successfully:", response);
            alert("Form submitted successfully!");
            navigate('/activity_logs');
        } catch (error) {
            console.error("Error sending form data:", error);
            alert("There was an error submitting the form. Please try again.");
        }
    }

    return (
        <>
            <ResponsiveAppBar />
            <form onSubmit={handleSubmit} className="contact-form-container">
                <div className="contact-form-wrapper">
                    <h1 className="contact-form-heading">Contact Me</h1>
                    <input
                        value={title}
                        onChange={(e) => {
                            if (title === '') {
                                setTitle("Subject: " + e.target.value)
                            }
                            else {
                                setTitle(e.target.value)
                            }

                        }}
                        type="text"
                        placeholder="Enter Subject"
                        required // Marked as required
                        className="contact-form-input"
                    />

                    <textarea
                        value={description}
                        onChange={(e) => {
                            if (description === '') {
                                setDescription("Query: " + e.target.value)
                            }
                            else {
                                setDescription(e.target.value)
                            }

                        }} required
                        placeholder="Enter Your query"
                        className="contact-form-textarea"
                    ></textarea>

                    <input
                        value={contact}
                        onChange={(e) => {
                            if (contact === '') {
                                setContact("Contact_No: " + e.target.value)
                            }
                            else {
                                setContact(e.target.value)
                            }

                        }} type="text"
                        placeholder="Enter Contact Number"
                        className="contact-form-input"
                    />

                    <input
                        value={email}
                        onChange={(e) => {
                            if (email === '') {
                                setEmail("Email: " + e.target.value)
                            }
                            else {
                                setEmail(e.target.value)
                            }

                        }} type="text"
                        placeholder="Enter Email ID"
                        className="contact-form-input"
                    />

                    <div className="contact-form-buttons">
                        <button onClick={() => navigate('/activity_logs')} type="button" className="contact-form-button">
                            Cancel
                        </button>
                        <button type="submit" className="contact-form-button">
                            Submit
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
}
