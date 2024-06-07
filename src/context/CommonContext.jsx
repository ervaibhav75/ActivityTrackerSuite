import React, { createContext, useState } from 'react';

// Create a new context
const CommonContext = createContext({
    commonSignals: {},
    addSignal: () => {}
});

export const CommonContextProvider = ({ children }) => {
    const [commonSignals, setCommonSignals] = useState({});

    const addSignal = (name, value) => {
        console.log("Setting " + name + "Value: " + value);
        setCommonSignals(prevSignals => ({
            ...prevSignals,
            [name]: value,
        }));
    };

    const ctxValue = {
        commonSignals,
        addSignal,
    };

    return (
        <CommonContext.Provider value={ctxValue}>
            {children}
        </CommonContext.Provider>
    );
};

export default CommonContext;
