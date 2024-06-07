import { useState, useRef, useEffect } from "react";
import api from "../api";
import "../styles/MistakeFact.css";
import RelatedFactorModal from "./RelatedfactorModal";
import FactorModal from "./common/FactorModal";
import { jwtDecode } from "jwt-decode"; // Corrected import
import iconImage from '../assets/check_icon.png';
import { json } from "react-router-dom";
import { useLocation } from "react-router-dom";
import ResponsiveAppBar from './common/ResponsiveAppBar';

import { useNavigate } from "react-router-dom";


export default function CreateMistakefact() {
    const location = useLocation();

    const navigateTo = useNavigate();
    const [redirectLogin, setRedirectLogin] = useState(false);
    const [generatedMistake, setGeneratedMistake] = useState([]);
    const [selectedMistake, setSelectedMistake] = useState("");
    const [relatedFactor, setRelatedFactor] = useState([]);
    const [generatedFactor, setGeneratedFactor] = useState([]);
    const [mistakeLogger, setMistakeLogger] = useState([]);
    const [factorLogger, setFactorLogger] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [relatedFactorModalOpen, setRelatedFactorModalOpen] = useState(false);
    const dialog = useRef();
    const relatedFactorDialog = useRef();


    const mistakeTitleRef = useRef(null);
    const mistakeDescRef = useRef(null);
    const factorRef = useRef(null);
    const [formSubmitted, setFormSubmitted] = useState(false);

    const showMistakeUl = generatedMistake.length > 0 ? true : false;
    const showFactorUl = generatedFactor.length > 0 ? true : false;

    function capitalizeFirstLetterOfEachWord(str) {
        if (typeof str !== 'string' || str.length === 0) {
            return '';
        }
        return str.split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }

    useEffect(() => {
        const checkAuthorisation = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (token) {
                    const decodedToken = jwtDecode(token);
                    if (decodedToken.exp * 1000 < Date.now()) {
                        setRedirectLogin(true);
                    }
                }
                else {
                    setRedirectLogin(true);
                }
            }
            catch (error) {

            }
        }
    }, []);

    useEffect(() => {
        if (redirectLogin) {
            // Redirect to the login page
            navigateTo('/login', { message: "Your session has been expired please log in again" })
        }
    }, [redirectLogin]);


    useEffect(() => {
        console.log("Factor Logger Is  :", factorLogger);
    }, [factorLogger]);

    const updateFactorLogger = (factor_obj) => {
        console.log(`factor_obj_is: ${JSON.stringify(factor_obj)}`);

        setFactorLogger(prevFactors => {
            return [
                ...prevFactors,
                {
                    title: capitalizeFirstLetterOfEachWord(factor_obj.title.trim().toLowerCase())
                    ,
                    solution: factor_obj.solution.trim().toLowerCase(),
                    is_custom: factor_obj.is_custom,
                    factor_id: factor_obj.factor_id
                }
            ];

        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("clicked submit button");
        if (factorLogger.length === 0) {
            console.log("no factor available");
            alert("Please add at least one factor");
            return;
        }


        // Update the mistakeLogger state
        if (mistakeLogger.length == 0) {
            setMistakeLogger(prevMistakes => ([
                //changed  a null and void line
                {
                    title: mistakeTitleRef.current.value.trim().toLowerCase()
                    ,
                    mistake_id: null,
                    description: mistakeDescRef.current.value.trim().toLowerCase()
                    ,
                    is_custom: true
                }
            ]));
        }
        // Set the formSubmitted flag to true
        setFormSubmitted(true);
    };

    useEffect(() => {
        if (formSubmitted) {
            const sendPostRequest = async () => {
                try {
                    // Send the POST request with the updated mistakeLogger state
                    const res = await api.post("/api/create/newMisfact/", {
                        "mistake": JSON.stringify(mistakeLogger),
                        "factor": JSON.stringify(factorLogger)
                    });
                    console.log(`res.status = ${JSON.stringify(res.status)}`);



                    // Handle response if needed
                } catch (error) {
                    // Redirect to login page if authentication error
                    if (error.response && error.response.status === 401) {
                        navigateTo('/login')
                    }
                    // Handle other errors
                    console.error("Error:", error);
                }
            };
            // Call the function to send the POST request
            sendPostRequest();
            navigateTo('/')
        }
    }, [formSubmitted, mistakeLogger, factorLogger, history]);



    const toggleModal = (e) => {

        setIsModalOpen(!isModalOpen)
        if (dialog.current) {
            if (!isModalOpen) {
                dialog.current.showModal();
            } else {
                console.log("model closed");
                dialog.current.close();
            }
        }
    }

    const toggleRelatedFactorModal = () => {

        setRelatedFactorModalOpen(!relatedFactorModalOpen)
        if (relatedFactorDialog.current) {
            if (!relatedFactorModalOpen) {
                relatedFactorDialog.current.showModal();
            } else {
                console.log("rf model closed");
                relatedFactorDialog.current.close();
                setRelatedFactor([]);
            }
        }
    }



    async function fetchFields(parameter, value) {
        try {
            let res;
            if (parameter === "title") {
                res = await api.post("/api/regex/mistake/", { query: value });
            }
            if (parameter === "factor") {
                res = await api.post("/api/regex/factor/", { query: value });
            }

            if (res && res.data && res.data.length > 0) {
                console.log(`Generated data: ${JSON.stringify(res.data)}`);
                if (parameter === "title") {
                    setGeneratedMistake(res.data);
                } else if (parameter === "factor") {
                    setGeneratedFactor(res.data);
                }
            } else {
                console.log("No data found");
                setGeneratedMistake([])
                setGeneratedFactor([])
                // Handle the case where no data is found
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log("Unauthorized");
                navigateTo('/login', { message: "Your Session Has Been Expired" })
            } else {
                console.error("Error in fetchFields function:", error);
            }
        }
    }


    function handleBackspacePress(e, parameter) {
        if (parameter === "mistake" && e.key === "Backspace") {
            console.log("backspacePress");
            fetchFields("title", mistakeTitleRef.current.value.trim().toLowerCase());
        }
        if (parameter === "factor" && e.key === "Backspace") {
            console.log("backspacePress");
            fetchFields("factor", factorRef.current.valuetrim().toLowerCase());
        }
    }

    async function fetchRelatedfactors(title) {

    }

    async function handleMistakeSelection(title) {

        setFactorLogger(()=>[])
        console.log("done");
        mistakeTitleRef.current.value = title
        const selected_obj = generatedMistake.find(item => item.title === title);
        if (selected_obj) {
            console.log(`selected_obj.id: ${selected_obj.id}`)
            setMistakeLogger([{
                title: null,
                mistake_id: selected_obj.id,
                description: null,
                is_custom: false
            }]);
            setGeneratedMistake([]);
            setSelectedMistake(title)
            const result = await api.post("/searchRelatedFactor/", { "title": title })
            console.log(`res: ${JSON.stringify(result.data)}`);
            console.log("------------------------------------------------------");
            setRelatedFactor(prevData => {
                // Ensure result.data is not null or undefined
                if (!result.data) {
                    return prevData; // If result.data is null or undefined, return the previous state
                }
                // Concatenate the previous data with the new data
                return [...prevData, ...result.data];
            });



            console.log(`related factor  length is  : ${relatedFactor.length}`)
            toggleRelatedFactorModal()



        } else {
            console.log("im in else");
            setGeneratedMistake([]);
            setSelectedMistake(title)
            return
        }
    }

    function handleFactorSelection(fTitle) {
        console.log(`generated_title: ${fTitle}`);
        const selected_obj = generatedFactor.find(item => item.title === fTitle);
        if (selected_obj) {
            console.log(`selected_obj.id: ${selected_obj.id}`);
            setFactorLogger(prevFactors => {
                const isUnique = !prevFactors.some(factor => factor.factor_id === selected_obj.id);
                if (isUnique) {
                    return [
                        ...prevFactors,
                        {
                            title: selected_obj.title,
                            factor_id: selected_obj.id,
                            solution: selected_obj.solution,
                            is_custom: false
                        }
                    ];
                } else {
                    return prevFactors;
                }
            });
            setGeneratedFactor([]);
            factorRef.current.value = "";
        } else {
            console.log("No matching factor found for title:", fTitle);
        }
    }

    const handleDescriptionEdit = () => {
        setGeneratedMistake([]);
    };


    return (
        <>
            <ResponsiveAppBar></ResponsiveAppBar>
            <form onSubmit={handleSubmit} className="default-container">
                <div className="everything">
                <h1>Activity Logger</h1>
                <input

                    ref={mistakeTitleRef}
                    onChange={() => {
                        if (mistakeTitleRef.current.value.endsWith(" ")) {
                            console.log(`titleRef.current.value = ${mistakeTitleRef.current.value}`);
                            fetchFields("title", mistakeTitleRef.current.value.trim().toLowerCase());
                        }
                    }}
                    onKeyDown={(e) => handleBackspacePress(e, "mistake")}

                    type="text"
                    placeholder="Enter Mistake Title"
                    required // Marked as required
                    list="titleOptions"

                />

                {showMistakeUl && <div className="suggestion-container">
                    <ul>
                        {generatedMistake.map((instance, index) => (
                            <li key={index} onClick={() => handleMistakeSelection(instance.title.trim().toLowerCase())}>
                                {capitalizeFirstLetterOfEachWord(instance.title)}
                            </li>
                        ))}
                    </ul>
                </div>}

                {/* //modal to select related factor when selected a mistake */}
                <RelatedFactorModal relatedFactor={relatedFactor}
                    updateFactorLogger={updateFactorLogger} selectedMistakeId={selectedMistake}
                    ref={relatedFactorDialog} onClose={toggleRelatedFactorModal} />

                {mistakeLogger.length === 0 && <textarea
                    onChange={handleDescriptionEdit}
                    ref={mistakeDescRef}
                    placeholder="Enter Mistake Description"
                ></textarea>}

                <div className="special-input">
                    <input
                        ref={factorRef}
                        type="text"
                        onChange={() => {
                            if (factorRef.current.value.endsWith(" ")) {
                                console.log(`factorRef.current.value = ${factorRef.current.value.trim().toLowerCase()}`);
                                fetchFields("factor", factorRef.current.value.trim().toLowerCase());
                            }
                        }}
                        onKeyDown={(e) => handleBackspacePress(e, "factor")}
                        placeholder="Search Mistake Factor"
                        list="factorOptions"
                    />
                    <button type="button" onClick={(e) => toggleModal(e)}>Custom</button>
                    <FactorModal updateFactorLogger={updateFactorLogger} ref={dialog} onClose={toggleModal} />
                </div>
                {generatedFactor.length !== 0 && <div className="suggestion-container">
                    <ul>
                        {generatedFactor.map((instance, index) => (
                            <li key={index} onClick={() => handleFactorSelection(instance.title)}>
                                {instance.title}
                            </li>
                        ))}
                    </ul>
                </div>}
                {factorLogger.length >= 1 &&
                    <div className="selection-container">
                        <ul>
                            {factorLogger.map((instance, index) =>
                                <li key={index}>
                                    <img src={iconImage} alt="Icon" className="icon" />
                                    {instance.title}
                                </li>
                            )}
                        </ul>
                    </div>
                }
                <div className="submit-b">

                    <button onClick={()=>navigateTo('/activity_logs')}type="button">
                        Cancel
                    </button>
                    <button type="submit">
                        Submit
                    </button>
                </div>
                </div>
            </form>
        </>
    );
}
