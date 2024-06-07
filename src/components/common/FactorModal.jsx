import './Modal.css';
import { forwardRef, useRef } from 'react';

const FactorModal = forwardRef(function FactorModal({ onClose, updateFactorLogger }, ref) {

    function handleAnotherFactor(factor_obj) {

        updateFactorLogger(factor_obj)
        factorTitle.current.value = ""
        factorSolution.current.value = ""
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

    }

    const factorTitle = useRef()
    const factorSolution = useRef()
    return (<>
        <dialog ref={ref} className="result-modal">


            <div className="modal-content">
                <h1>Add Custom factor</h1>


                <input ref={factorTitle} type="text" placeholder="Enter Mistake Factor" />
                <textarea ref={factorSolution} type="text" placeholder="Enter Possible Solutions" />

                <button
                    type="button"
                    className="close"
                    onClick={(e) => {

                        if (!factorTitle.current.value || !factorSolution.current.value) {
                            console.log("im cool!");
                            alert("Please add a solution/Factor");
                            return;
                        }

                        handleAnotherFactor({
                            title: factorTitle.current.value.trim().toLowerCase(),
                            solution: factorSolution.current.value.trim().toLowerCase(),
                            is_custom: true,
                            factor_id: null
                        });
                        e.preventDefault()
                        // Call onClose() method here
                    }}
                >
                    Add More
                </button>


                <button type="button" className="close" onClick={(e) => {
                    e.preventDefault()
                    console.log(`fv : ${factorTitle.current.value}`);
                    if (!factorTitle.current.value || !factorSolution.current.value) {
                        console.log("im cool!");
                        alert("Please select a solution/Factor");
                        return;
                    }
                    
                    handleAnotherFactor({
                        title: factorTitle.current.value.trim().toLowerCase(),
                        solution: factorSolution.current.value.trim().toLowerCase(),
                        is_custom: true,
                        factor_id: null
                    });
                    onClose(); // Call onClose() method here

                }}>Done</button>

                <button type="button" className="close" onClick={() => onClose()}>&times;</button>

            </div>

        </dialog>
    </>)
})

export default FactorModal