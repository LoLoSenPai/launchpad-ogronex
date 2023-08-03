import { useState, useEffect } from 'react';
import PuffLoader from "react-spinners/PuffLoader";

function useWaitingBuyStatus(waitingBuy) {
    const [waitingBuyStatus, setWaintingBuyStatus] = useState({
        text: "Waiting for next phase",
        disabled: true,
        onClick: () => { },
    });

    useEffect(() => {
        let text = "Waiting for next phase";
        let disabled = true;
        let onClick = () => { };

        if (waitingBuy) {
            text = <PuffLoader size={20} color={"#000"} />;
        }
      
        setWaintingBuyStatus({ text, disabled, onClick });

    }, [waitingBuy]);

    return waitingBuyStatus;
}

export default useWaitingBuyStatus;