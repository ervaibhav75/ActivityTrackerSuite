import './RelatedFactorModal.css';
import { forwardRef, useRef, useState, useEffect } from 'react';

// Define the RelatedFactorModal component and use forwardRef to pass down the ref
const RelatedFactorModal = forwardRef(function RelatedFactorModal({ relatedFactor, onClose, updateFactorLogger }, ref) {

    // useRef hooks for input fields
    const factorTitle = useRef(null);
    const factorSolution = useRef(null);

    // State variables to manage selected items and unique factors
    const [selectedItems, setSelectedItem] = useState(new Set());
    const [uniqueFactors, setUniqueFactors] = useState([]);

    // useEffect to log when selectedItems change
    useEffect(() => {
        console.log("Selected items updated");
    }, [selectedItems]);

    // Handle selection and deselection of mistakes
    const handleMistakeSelection = (instance) => {
        if (selectedItems.has(instance.id.toString())) {
            // Deselect item if it's already selected
            setSelectedItem((prevSet) => {
                prevSet.delete(instance.id.toString());
                return new Set([...prevSet]);
            });

            setUniqueFactors((prevArray) => {
                return prevArray.filter(item => item.factor_id !== instance.id.toString());
            });

            return;
        }

        // Select item if it's not already selected
        setSelectedItem((prevArray) => new Set([...prevArray, instance.id.toString()]));

        const factor_obj = {
            factor_id: instance.id.toString(),
            title: instance.title,
            solution: "",
            is_custom: false,
        };

        setUniqueFactors((prevArr) => {
            if (!prevArr.some(factor => factor.title === factor_obj.title)) {
                return [...prevArr, factor_obj];
            } else {
                return prevArr;
            }
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        uniqueFactors.forEach((factor) => updateFactorLogger(factor));
        onClose();
    };

    return (
        <>
            <dialog ref={ref} className="result-modal">
                <div className="modal-content">
                    <h1>Choose Some Possible Factors</h1>
                    <div className="modal-options">
                        <ul>
                            {relatedFactor.map((instance, index) => (
                                <li
                                    className={selectedItems.has(instance.id.toString()) ? "modal-options-selected-li" : "modal-options-unselected-li"}
                                    key={index}
                                    onClick={() => handleMistakeSelection(instance)}
                                >
                                    {instance.title}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button type="button" className="close" onClick={handleSubmit}>
                        &times;
                    </button>
                </div>
            </dialog>
        </>
    );
});

export default RelatedFactorModal;
