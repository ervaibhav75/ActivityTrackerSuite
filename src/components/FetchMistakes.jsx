import { useState, useEffect } from "react"
import api from "../api"
import { Navigate } from "react-router-dom";


export default function FetchMistakes() {

    const [mistakes, setMistakes] = useState([{title:"sample", id:1}])

    const getList = async ()=>{
        try{
            const res = await api.get("/api/list/mistake/")
            setMistakes(res.data)
            console.log(mistakes)

        }catch(err){    
            // Redirect to login page if authentication error
            if (err.response && err.response.status === 401) {
                return <Navigate to="/login" />;
            }
            // Handle other errors
            console.error("Error:", err);
           

        }

    }
    useEffect(()=>{
        getList().catch((err)=> console.log(err))
    }, [])

    return  (<>
    <h1>Ur recent mistakes ...</h1>
    {mistakes.map((mistake)=> <h1 key={mistake.id}> {mistake.title}</h1>)}
    </>)

}