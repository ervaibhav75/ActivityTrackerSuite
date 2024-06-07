import '../styles/FactorLogsModal.css';
import { Bar } from 'react-chartjs-2';
import React, { forwardRef, useRef, useState, useContext } from 'react';
import { Chart as ChartJS, Legend, Tooltip, BarElement, LinearScale, CategoryScale, Title, ArcElement } from 'chart.js';
import { useNavigate } from "react-router-dom";
import CommonContext from '../context/CommonContext';
// Register required Chart.js components for Bar charts
ChartJS.register(BarElement, Tooltip, Legend, LinearScale, CategoryScale, ArcElement, Title);

const FactorLogsModal = forwardRef(function FactorLogsModal({ onCloseModal, m_title, data_obj, factors }, ref) {
    const [factorSolution, setFactorSolution] = useState("");
    const {addSignal, commonSignals} = useContext(CommonContext);

    const navigate = useNavigate();

    const chartRef = useRef(null); // Reference to chart instance

    console.log(`fetched factor is ${JSON.stringify(factors)})`);

    function capitalizeFirstLetter(word) {
        if (!word) return ''; // Handle empty or undefined input
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Use the passed options or provide default options if not passed
    const barOptions = {
        scales: {
            x: {
                type: 'category',
                ticks: {
                    font: {
                        size: 15,
                        weight: 'bold'
                    }
                }
            },
        },
        onClick: function (event, chartElements) {
            const clickedElements = chartElements[0];
            if (clickedElements) {
                const clickedLabel = data_obj.labels[clickedElements.index]; // Get the label
                console.log(`clicked label is ${JSON.stringify(clickedLabel)}`);
                const f_obj = factors.find(item => capitalizeFirstLetter(item.title) === clickedLabel);
                console.log(`solution is ${f_obj.solution}`);
                setFactorSolution(f_obj.solution);
            }
        }
    };

    // Conditional rendering of the chart
    function renderChart() {
        if (!data_obj || !data_obj.labels || data_obj.labels.length === 0) {
            return <p>No data available to display</p>;
        }

        return <Bar data={data_obj} options={barOptions} ref={chartRef} />;
    }

    function handleClose() {
        setFactorSolution("Please Click On The Factor");
        onCloseModal(); // Call the passed in onClose function to close the modal
    }

    function handleAddHabit(tag){
        const message = "Hello, this is a message!";
        const state = { signal: "add_habit_active", value: tag }
        addSignal(state.signal, true);
        navigate('/habit_tracker', { state });
        
    }

    return (
        <dialog ref={ref} className="result-modal-child">
            <div className='title-flex'>
                <h3>Insights & Actionable For : {m_title}!</h3>
                <button type="button" className='close-button' onClick={handleClose}>
                    &times;
                </button>
            </div>
            <div className="main-content-child">
                <div className="item-child">
                    {renderChart()}
                </div>
            </div>
            <div className='solution-insights-child'>
                <h2>Your Actionable:</h2>
                <p>{factorSolution || "Please Click On The Factor"}</p>
                <div className='solution-flex'>
                    <button type="button" className="action-button" >
                        Set Reminder
                    </button>
                    <button type="button" className="action-button" onClick={(e)=>{
                        e.preventDefault()
                        handleAddHabit(factorSolution)
                    }} >
                        Habituate
                    </button>
                </div>
            </div>
        </dialog>
    );
});

export default FactorLogsModal;
