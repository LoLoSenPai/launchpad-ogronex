import React, { createContext, useState, useContext, useMemo } from 'react';

const WaitingBuyContext = createContext();

export const WaitingBuyProvider = ({ children }) => {
    const [waitingBuy, setWaitingBuy] = useState(false);

    const value = useMemo(() => ({ waitingBuy, setWaitingBuy }), [waitingBuy, setWaitingBuy]);

    return (
        <WaitingBuyContext.Provider value={value}>
            {children}
        </WaitingBuyContext.Provider>
    );
};

export const useWaitingBuy = () => useContext(WaitingBuyContext);