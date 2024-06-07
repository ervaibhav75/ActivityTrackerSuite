import Mistake from "../components/FetchMistakes"
import { useState, useRef, useEffect } from "react";

import CreateMistakefact from "../components/CreateMistakefact"
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute"
import { Navigate
 } from "react-router-dom"
export default function  Home(){
    const { message } = location.state || { message: null };
    const [redirectMessage, setRedirectMessage] = useState("")

    useEffect(() => {
        const { message } = location.state || { message: null };
        if (message !== null) {
            setRedirectMessage(message);
        }
      }, [location.state]);

      useEffect(() => {
        if (redirectMessage !== '') {
          // Show alert or handle the message in any other way
          alert(redirectMessage);
        }
      }, [redirectMessage]);

    return(<>
        <div>Home</div>
                
                
          
    </>)
}