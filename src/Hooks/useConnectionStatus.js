import { useState, useEffect } from 'react';

function useConnectionStatus(isConnected) {
    const [connectionStatus, setConnectionStatus] = useState({
        text: "Waiting for next phase",
        disabled: true,
        onClick: () => { },
    });

    useEffect(() => {
        let text = "Waiting for next phase";
        let disabled = true;
        let onClick = () => { };

        if (!isConnected) {
            text = "Connect your wallet";
        }

        setConnectionStatus({ text, disabled, onClick });
    }, [isConnected]);

    return connectionStatus;
}

export default useConnectionStatus;
