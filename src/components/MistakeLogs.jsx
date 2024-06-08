import React, { useState, useEffect, useRef, useContext } from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import "../styles/MistakeLogs.css";
// import api from '../api';
import useAxios from './common/UseAxios';

import ResponsiveAppBar from './common/ResponsiveAppBar';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from "react-router-dom";
import CommonContext from '../context/CommonContext';
import CommonContextProvider from '../context/CommonContext';



import { Chart as ChartJS, Legend, Tooltip, BarElement, LinearScale, CategoryScale, Title, ArcElement } from 'chart.js';
import FactorLogsModal from './FactorLogsModal';
ChartJS.register(BarElement, Tooltip, Legend, LinearScale, CategoryScale, ArcElement, Title);


export default function MistakeLogs() {
    const api = useAxios();
    const { addSignal, commonSignals } = useContext(CommonContext);
    const [selectedDuration, setSelectedDuration] = useState(14);
    const navigateTo = useNavigate();
    const [chartData, setChartData] = useState(null);
    const [chartType, setChartType] = useState('pie');
    const chartRef = useRef(null); // Reference to chart instance
    const [factorModalOpen, setFactorModalOpen] = useState(false);
    const [selectedMistake, setSelectedMistake] = useState(null);
    const [incomingData, setIncomingData] = useState(null);
    const [mistakeData, setMistakeData] = useState([]);
    const [mistakeLables, setMistakeLables] = useState([]);
    const modalFactorDialog = useRef();
    const [mistakeIds, setMistakeIds] = useState([]);
    const [mistakeTitles, setMistakeTitles] = useState([]);
    const [fecthedFactors, setFetchedFactors] = useState(null);
    const [factData, setFactData] = useState([]);
    var dataToSet = {}

    function capitalizeFirstLetter(word) {
        if (!word) return ''; // Handle empty or undefined input
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    async function fetchData() {
        if (selectedDuration === undefined) {
            console.log("returning!")
            return
        }
        console.log("fetch data was called");
        try {

            const res = await api.post("/api/fetch/mistakestats/", {
                "days": selectedDuration
            });
            console.log(`fetch data was complete: ${JSON.stringify(res.data)}`);
            setIncomingData(res.data)
            console.log(`icoming data now is : ${JSON.stringify(res.data)}`);



        } catch (err) {
            console.error("Error:", err);
        }
    }


    useEffect(() => {
        fetchData();
    }, [selectedDuration, chartType]);

    useEffect(() => {

        if (incomingData === null) {
            return;
        }
        else {
            console.log("incoming data is not null!");
        }
        const updateData = () => {
            const newMistakeIds = [];
            const newMistakeTitles = [];

            for (const key in incomingData.result.data) {
                newMistakeIds.push(incomingData.result.data[Number(key)]);
                newMistakeTitles.push(capitalizeFirstLetter(incomingData.result.info[key].title));
            }

            setMistakeIds(newMistakeIds);
            setMistakeTitles(newMistakeTitles);
        };

        updateData(); // Call the update function on component mount

    }, [incomingData]);

    useEffect(() => {
        if (mistakeIds.length === 0 && mistakeData === 0) {
            console.log("chart data insufficient wont be able to render");
        }
        dataToSet = {
            labels: mistakeTitles
            ,

            datasets: [{
                label: '# of times repeated',
                data: mistakeIds, // Data points
                backgroundColor: [
                    /* Bright Blue */
                    'rgb(132, 201, 245)',

                    /* Bright Yellow */
                    'rgb(249, 211, 30)',

                    /* Bright Green */
                    'rgb(78, 196, 117)',

                    /* Bright Purple */
                    'rgb(233, 127, 233)',

                    /* Bright Orange */
                    'rgb(249, 67, 0)',

                    /* Bright Turquoise */
                    'rgb(22, 158, 180)',

                    /* Bright Red */
                    'rgb(204, 0, 0)',

                    /* Bright Pink */
                    'rgb(255, 54, 156)',

                    /* Bright Gray */
                    'rgb(169, 169, 169)',

                    /* Bright Teal */
                    'rgb(18, 181, 158)'

                ],



                borderColor: [
                    /* Light Blue */
                    'rgb(255, 255, 255)',

                    /* Light Yellow */
                    'rgb(255, 255, 255)',

                    /* Light Green */
                    'rgb(255, 255, 255)',

                    /* Light Purple */
                    'rgb(255, 255, 255)',

                    /* Light Orange */
                    'rgb(255, 255, 255)',

                    /* White */
                    'rgb(255, 255, 255)',

                    /* Light Gray */
                    'rgb(255, 255, 255)',
                    /* Snow */

                    'rgb(255, 255, 255)',

                    /* Mint Cream */
                    'rgb(255, 255, 255)',

                    /* White */
                    'rgb(255, 255, 255)',

                    /* White */
                    'rgb(255, 255, 255)',

                    /* White */
                    'rgb(255, 255, 255)',

                    /* White */
                    'rgb(255, 255, 255)',

                    /* White */
                    'rgb(255, 255, 255)',

                    /* White */
                    'rgb(255, 255, 255)',

                    /* White */
                    'rgb(255, 255, 255)',

                    /* White */
                    'rgb(255, 255, 255)',

                    /* White */
                    'rgb(255, 255, 255)',

                    /* White */
                    'rgb(255, 255, 255)'

                ],
                borderWidth: 2
            }]
        };
        console.log(`Now mistake titles are: ${dataToSet.labels}`)
        setChartData(dataToSet);
    }, [mistakeIds, mistakeLables])

    const toggleFactorModal = () => {
        console.log("iam here");
        setFactorModalOpen(!factorModalOpen)
        if (modalFactorDialog.current) {
            if (!factorModalOpen) {
                modalFactorDialog.current.showModal();
            } else {
                console.log("rf model closed");
                modalFactorDialog.current.close();
                setSelectedMistake(null)
            }
        } else {
            console.log("im here again!");
        }
    }


    async function fetchClickedMisFactor(id) {
        console.log("code was here")
        console.log(`id iss ${id}`);
        try {

            const fetchedFactors = await api.post("/api/fetch/mistakestats/facts/", {
                "mId": id
            });

            console.log(`ic: ${JSON.stringify(fetchedFactors.data)}`);
            const labels = fetchedFactors.data.map(item => capitalizeFirstLetter(item.title));
            const avarages = fetchedFactors.data.map(item => item.count);
            setFetchedFactors(() => fetchedFactors.data)

            const generatedFactData = {
                labels: labels
                ,

                datasets: [{
                    label: '# of times repeated',
                    data: avarages, // Data points
                    backgroundColor: [
                        'rgb(54, 162, 235)',    // Light Blue
                        'rgb(173,255,47)',    // Light Yellow
                        'rgb(165, 42, 42)',    // Light brown
                        'rgb(153, 102, 255)',   // Light Purple
                        'rgb(255, 159, 64)',    // Light Orange
                        'rgb(101, 198, 187)',   // Light Turquoise
                        'rgb(202, 102, 255)',   // Light Lavender
                        'rgb(0,191,255)',       // cornflowerblue
                        'rgb(0,255,127)',   // Light Green
                        'rgb(255, 99, 71)',     // Light Salmon (Additional color)
                    ],

                    borderColor: [
                        'rgb(54, 162, 235)',    // Light Blue
                        'rgb(173,255,47)',    // Light Yellow
                        'rgb(165, 42, 42)',    // Light brown
                        'rgb(153, 102, 255)',   // Light Purple
                        'rgb(255, 159, 64)',    // Light Orange
                        'rgb(101, 198, 187)',   // Light Turquoise
                        'rgb(202, 102, 255)',   // Light Lavender
                        'rgb(0,191,255)',       // cornflowerblue
                        'rgb(0,255,127)',   // Light Green
                        'rgb(255, 99, 71)',     // Light Salmon (Additional color)
                    ],
                    borderWidth: 4
                }]
            };

            setFactData(() => generatedFactData)

        }
        catch (e) { }
    }

    function handleDurationChange(event) {
        setSelectedDuration(event.target.value);
    }

    function handleChartTypeChange(event) {
        setChartType(event.target.value);
    }

    // Destroy existing chart instance
    function destroyChart() {
        setMistakeData([])
        setMistakeLables([])
        if (chartRef.current !== null && chartRef.current.chartInstance !== null) {
            chartRef.current.chartInstance.destroy();
        }
    }
    const doughnutOptions = {
        aspectRatio: 2,
        layout: {
            padding: {
                right: 90, // Increase right padding to make space for legend
                left: 5,
                top: 50,
                bottom: 50,
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'right',
                align: 'center',
                labels: {
                    font: {
                        size: 20,
                        family: 'Pacifico, cursive',
                        weight: 'bold'
                    },
                    boxWidth: 30, // Width of the colored box
                    padding: 30 // Padding around the legend item
                }
            },
            tooltip: {
                enabled: true
            }
        }
   
    };


    const pieOptions = {
        aspectRatio: 2, // Aspect ratio for the chart,
        layout: {
            padding: {
                right: 90, // Increase right padding to make space for legend
                left: 5,
                top: 50,
                bottom: 50,
            }
        },
        plugins: {

            legend: {
                display: true,
                position: 'right',
                align: 'center',
                labels: {
                    font: {
                        size: 20,
                        family: 'Pacifico, cursive',
                        weight: 'bold'
                    },
                    boxWidth: 30, // Width of the colored box
                    padding: 30 // Padding around the legend item
                }
            },
            tooltip: {
                enabled: true
            }
        },
        onClick: function (event, chartElements) {
            const clickedElements = chartElements[0]
            if (clickedElements) {
                console.log(`dataToSet.labels: ${chartData.labels}`)
                const clickedLabel = chartData.labels[clickedElements.index]; // Get the label
                console.log(`clicked label is ${JSON.stringify(incomingData.result['info'])}`);
                const search_area = incomingData.result['info']
                let key;
                for (const k in search_area) {

                    if (capitalizeFirstLetter(search_area[k].title) === clickedLabel) {
                        console.log(`"Discrete id"    ${search_area[k].id}`);
                        setSelectedMistake(search_area[k].title)
                        fetchClickedMisFactor(search_area[k].id)

                    }
                }

                toggleFactorModal();


            }
            else {
                console.log("outside");
            }

        }
    };

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
            }
        },
        onClick: function (event, chartElements) {


            if (chartElements && chartElements.length > 0) {
                const barData = chartElements[0]._chart.config.dataToSet.labels[chartElements[0]._index];
                console.log(barData);
                console.log("================================");
                toggleFactorModal()
            }
        }
    };


    // Render chart based on selected chart type
    function renderChart() {
        console.log("Tried to render chart!");
        console.log(`chartData is ${JSON.stringify(chartData)}`)
        switch (chartType) {
            case 'bar':
                return <Bar data={chartData} options={barOptions} ref={chartRef} />;
            case 'pie':
                return <Pie data={chartData} options={pieOptions} ref={chartRef} />;
            case 'doughnut':
                return <Doughnut data={chartData}  options={doughnutOptions}ref={chartRef} />;
            default:
                return null;
        }
    }

    return (
        <>  <ResponsiveAppBar></ResponsiveAppBar>
            <div className='title-bar' >
                <h1 className='heading'>Welcome To Analytics!</h1>
                <IconButton
                    onClick={() => navigateTo('/CreateLogs')}
                    color="primary"
                    sx={{
                        color:'black',
                        marginLeft:'10rem',
                        backgroundColor: '#8DECB4',
                        width: '10%', // Adjust the width to your desired size
                        height: '10%', // Make sure the height matches the width for a square shape
                        borderRadius: 0, // Remove border radius to ensure square shape
                        fontSize: '25px',

                    }}
                >   Create Logs

                </IconButton>
            </div>
                <div className="container">
                    <div className="side-panel">
                        <h2>Options</h2>
                        <div className="filter-options">
                            <label htmlFor="selectDuration">Choose Duration:</label>
                            <select id="selectDuration" value={selectedDuration} onChange={handleDurationChange}>
                                <option value="">...</option>
                                <option value="7">Last 7 days</option>
                                <option value="14">Last 14 days</option>
                                <option value="21">Last 21 days</option>
                            </select>
                        </div>
                        <div className="filter-options">
                            <label htmlFor="selectChart">Choose Chart Type:</label>
                            <select id="selectChart" value={chartType} onChange={handleChartTypeChange}>
                                <option value="">...</option>
                                <option value="bar">Bar Chart</option>
                                <option value="pie">Pie Chart</option>
                                <option value="doughnut">Doughnut Chart</option>
                            </select>
                        </div>

                    </div>
                    {mistakeTitles.length !== 0 ? <div className="main-content">
                        <div className="item">

                            <FactorLogsModal
                                factors={fecthedFactors}
                                data_obj={factData}
                                ref={modalFactorDialog} onCloseModal={toggleFactorModal}
                                m_title={selectedMistake} />
                            {renderChart()}
                        </div>
                    </div> : <div className='no-data-found'>
                        <h2>Press Create Logs To Record Your Activity</h2>
                        <img src="/noDataFound.png" />
                    </div>}
                </div>
        </>
    );
}
