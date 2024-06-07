import * as React from 'react';
import { useState, useEffect, useRef, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../api'; // Ensure this path is correct
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import '../../styles/habit_landing.css';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';
import ResponsiveAppBar from '../common/ResponsiveAppBar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import AddHabitModel from './AddHabitModel';
import CommonContext from '../../context/CommonContext';



export default function Landing() {
    const { commonSignals } = useContext(CommonContext);
    const [idsToDelete, setIdsToDelete] = useState([])
    const label = { inputProps: { 'aria-label': 'Checkbox demo' } };
    const [newHabitName, setNewHabitName] = useState('');
    const habitNameRef = useRef(null)
    const [habitData, setHabitData] = useState({});
    var location = useLocation();
    const [dates, setDates] = useState([]);
    const [seedDate, setSeedDate] = useState(new Date());
    const [editMode, setEditMode] = useState(false);
    const [checkboxStates, setCheckboxStates] = useState({});
    const [showCustomDialog, setShowCustomDialog] = useState(false);
    const [showAddHabitDialog, setShowAddHabitDialog] = useState(false);
    const [signal, setSignal] = useState('');
    const [content, setContent] = useState('');

    function openCustomModel() {
        setShowCustomDialog(true);
    }

    function closeCustomModel() {
        setShowCustomDialog(() => false);
        fetchHabitData(seedDate)

    }
    function openAddHabitModel() {
        setShowAddHabitDialog(true);
    }
    function closeAddHabitModel() {
        setShowAddHabitDialog(() => false);
        fetchHabitData(seedDate)

    }
           
    useEffect(() => {
        const state = location?.state;
        // console.log(`state.sig is ${JSON.stringify(state.signal)}`);

        // console.log(`CommonStates Are is ${JSON.stringify(commonSignals[state])}`);
        // console.log(`location state is is ${JSON.stringify(location.state)}`);

        if (state && state.signal && commonSignals[location.state.signal] === true) {
            console.log("Very dangerous line its setting the state after this rerender!")
            setSignal(location.state.signal);
            setContent(() => location.state.value);
        } else {
            console.log("signal nt found!")

        }

    }, [location]);

    useEffect(() => {
        if (signal === "add_habit_active") {

            openAddHabitModel()

        }
    }, [signal, content])

    // Define the fetchHabitData function
    const fetchHabitData = async (date) => {
        try {
            console.log("getch data was called!")
            const res = await api.post('/habit/last7days/', { "start_date": date.toISOString().slice(0, 10) });
            setHabitData(res.data);
            const obj = res.data;
            for (const key in obj) {
                fetchDates(obj[key]);
                break;
            }
        } catch (e) {
            console.error(e); // Always good to log errors
        }
    };

    useEffect(() => {
        // Check if habitData is undefined
      
            fetchHabitData(seedDate); // Call the function
        
    }, [seedDate, dates, showAddHabitDialog, showCustomDialog]); // Include seedDate as a dependency


    async function onAgree(closeModal) {
        if (Object.keys(checkboxStates).length === 0 && idsToDelete.length === 0 ){
            console.log("no backend api fired");
            closeModal();
            return
        }
      try{
        console.log(`states are : ${JSON.stringify(checkboxStates)}`)
        const res = await api.post("habit/updatelogs/", {
            'checkboxStates': checkboxStates,
            'idsToDelete':idsToDelete,
        })
        fetchHabitData(seedDate)
    
        setIdsToDelete(()=>[])
        closeModal();

      }catch(e){closeModal();}
        
    }

    function fetchDates(normal_dict) {
        const dates_dict = normal_dict['sequence'];

        const internal_array = [];
        for (const date in dates_dict) {
            var day = new Date(date).getDate();
            internal_array.push(day);
        }
        if (dates.length === 0) {
            setDates(internal_array);
        }
        
    }

    const CustomDialog = ({ show, onClose, onAgree }) => (
        <Dialog
            open={show}
            onClose={onClose}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">
                {"Before you save ..."}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    You are about to update the habit logs for the selected dates.
                    Are you sure you want to proceed with these changes?
                    Please confirm your action to continue.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()} autoFocus>
                    Disagree
                </Button>
                <Button onClick={() => onAgree(onClose)} autoFocus>
                    Agree
                </Button>
            </DialogActions>
        </Dialog>
    );

    function handleArrowBack() {
        setSeedDate(prevDate => {
            const newDate = new Date(prevDate); // Create a new Date object
            newDate.setDate(prevDate.getDate() - 7); // Subtract 6 days from the date

            setHabitData({})
            setDates([])
            return newDate; // Return the new Date object
        });
    }

    function handleArrowFront() {
        setSeedDate(prevDate => {
            const newDate = new Date(prevDate); // Create a new Date object
            newDate.setDate(prevDate.getDate() + 7); // Subtract 6 days from the date

            setHabitData({})
            setDates([])
            return newDate; // Return the new Date object
        });
    }





    function handleCheckboxCheck(id, date) {



        if (editMode === true) {
            setCheckboxStates((prevState) => {
                const dateSet = new Set(prevState[id] || []);
                dateSet.add(date); // Add the new date to the set

                return {
                    ...prevState,
                    [id]: [...dateSet], // Convert the set back to an array
                };
            });
        }
        console.log(JSON.stringify(checkboxStates));
    }

    function handleEditOrSave() {
        if (editMode === false) {
            setEditMode(true);
        } else {
            setEditMode(false);
            openCustomModel()
        }
    }

    function handleHabitDeletion(id){
        if (editMode === true) {
            if (idsToDelete.includes(id)) {
                setIdsToDelete(prevList => prevList.filter(item => item!== id));
                return
            }
            setIdsToDelete((prevList)=>[
                ...prevList,
                 id
            ])
        }else{
            return
        }
    }

    return (
        <>
            <ResponsiveAppBar />
            <div className="grid-container" key={showAddHabitDialog}   >
                <h1>Habit Tracker</h1>
                <div className="grid" key={habitData+showCustomDialog}>
                    <React.Fragment>
                        <div className="grid-title">Streak</div>
                        <div className="grid-title">Name</div>
                        {dates.map((date, i) => (
                            <div key={i} className="grid-title">
                                {date}
                            </div>
                        ))}
                    </React.Fragment>
                    <React.Fragment key={habitData}>
                        {Object.entries(habitData).map(([habit, value]) => {
                            var hab_id = value['id'];
                            return (
                                <React.Fragment key={hab_id}>
                                    <div className="grid-item">{value['streak']}</div>
                                    <div style={
                                        {color: idsToDelete.includes(hab_id) ? '#ff0000' : 'black',
                                        fontWeight:idsToDelete.includes(hab_id) ? 'bold' : 'lighter'
                                        }
                                    } onClick={()=>handleHabitDeletion(hab_id)} className="grid-item">{habit}</div>

                                    {Object.entries(value['sequence']).map(([date, signal]) => (
                                        <Checkbox
                                            key={date}
                                            {...label}
                                            id={date}
                                            checked={hab_id in checkboxStates && checkboxStates[hab_id].includes(date) ? true : signal}
                                            onClick={() => handleCheckboxCheck(hab_id, date)}
                                            icon={<FavoriteBorder />}
                                            checkedIcon={<Favorite />}
                                        />
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </React.Fragment>
                    <CustomDialog show={showCustomDialog} onClose={closeCustomModel} onAgree={onAgree} />
                    <Stack direction="row" spacing={1}>
                        <IconButton aria-label="delete" onClick={() => handleArrowBack()}>
                            <ArrowBackIcon fontSize="large" />
                        </IconButton>
                        <IconButton onClick={() => handleArrowFront()} aria-label="delete" disabled={seedDate.getDate() === new Date().getDate()} color="primary">
                            <ArrowForwardIcon fontSize="large" />
                        </IconButton>
                        <IconButton onClick={() => handleEditOrSave('')} color="secondary" aria-label="add an alarm">
                            {editMode ? <SaveIcon /> : <EditIcon />}
                        </IconButton>
                        <IconButton

                            color="primary"
                            size="large"
                            edge="start"
                            onClick={() => openAddHabitModel()}
                        >
                            <AddIcon />
                        </IconButton>

                        {showAddHabitDialog && <AddHabitModel newHabitName={content} ref={habitNameRef} show={showAddHabitDialog} onClose={closeAddHabitModel} ></AddHabitModel>}
                    </Stack>
                </div>
            </div>
        </>
    );
}