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

    const factorTitle = useRef();
    const factorSolution = useRef();

    return (
        <dialog ref={ref} className="factor-modal">
            <div className="factor-modal-content">
                <h1>Add Custom Factor</h1>

                <input ref={factorTitle} type="text" placeholder="Enter Mistake Factor" />
                <textarea ref={factorSolution} type="text" placeholder="Enter Possible Solutions" />

                <button
                    type="button"
                    className="factor-modal-close"
                    onClick={(e) => {
                        if (!factorTitle.current.value || !factorSolution.current.value) {
                            alert("Please add a solution/Factor");
                            return;
                        }

                        handleAnotherFactor({
                            title: factorTitle.current.value.trim().toLowerCase(),
                            solution: factorSolution.current.value.trim().toLowerCase(),
                            is_custom: true,
                            factor_id: null
                        });
                        e.preventDefault();
                    }}
                >
                    Add More
                </button>

                <button
                    type="button"
                    className="factor-modal-close"
                    onClick={(e) => {
                        e.preventDefault();
                        if (!factorTitle.current.value || !factorSolution.current.value) {
                            alert("Please select a solution/Factor");
                            return;
                        }

                        handleAnotherFactor({
                            title: factorTitle.current.value.trim().toLowerCase(),
                            solution: factorSolution.current.value.trim().toLowerCase(),
                            is_custom: true,
                            factor_id: null
                        });
                        onClose();
                    }}
                >
                    Done
                </button>

                <button
                    type="button"
                    className="factor-modal-close"
                    onClick={() => onClose()}
                >
                    &times;
                </button>
            </div>
        </dialog>
    );
});

export default FactorModal;
