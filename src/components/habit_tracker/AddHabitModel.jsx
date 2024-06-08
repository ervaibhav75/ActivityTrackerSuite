import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, MenuItem, DialogActions, Button } from "@mui/material";
import '../../styles/habit_landing.css';
import api from "../../api";

const AddHabitModel = React.forwardRef(({ newHabitName, show, onClose }, ref) => {
    const frequencies = [
        { value: '1', label: 'Daily' },
        { value: '2', label: 'Twice A Week' },
        { value: '3', label: 'Thrice A Week' },
    ];

    const [formValues, setFormValues] = useState({
        name: '',
        description: '',
        reward: '',
        repeat_after: '',
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const  handleSubmit = async () => {
        // Add your form submission logic here
        try{
            
            const res = await api.post('/habit/createOne/',formValues )
        }
        catch (error) {
            alert(error.response?.data?.error || "An error occurred");
        } finally {
            
        }
        console.log('Form submitted:', formValues);
        onClose();

    };

    return (
        <Dialog
            open={show}
            onClose={onClose}
            aria-labelledby="responsive-dialog-title"
        >
            <DialogTitle id="responsive-dialog-title">
                {"Add New Habit"}
            </DialogTitle>
            <DialogContent>
                <form>
                    <TextField

                        margin="dense"
                        id="name"
                        name={"name"}
                        label="Habit Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newHabitName||formValues.name}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        id="description"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={formValues.description}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        id="reward"
                        name="reward"
                        label="Reward For Motivation"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        value={formValues.reward}
                        onChange={handleInputChange}
                    />

                    <TextField
                        margin="dense"
                        id="frequency"
                        name="repeat_after"
                        label="Min Ones Repeat Duration"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formValues.repeat_after}
                        onChange={handleInputChange}
                    >
                       
                    </TextField>
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary">
                    Add Habits
                </Button>
            </DialogActions>
        </Dialog>
    );
});

export default AddHabitModel;
