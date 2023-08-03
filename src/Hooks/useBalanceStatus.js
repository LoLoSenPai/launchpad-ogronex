import { useState, useEffect } from 'react';

function useBalanceStatus(hasBalance, publicSale) {
    const [balanceStatus, setBalanceStatus] = useState({
        text: "Waiting for next phase",
        disabled: true,
        onClick: () => { },
    });

    useEffect(() => {
        let text = "Waiting for next phase";
        let disabled = true;
        let onClick = () => { };

        if (!hasBalance && publicSale && publicSale.status === 'Live') {
            text = "Insufficient Balance";
        }

        setBalanceStatus({ text, disabled, onClick });
      
    }, [hasBalance, publicSale]);

    return balanceStatus;
}

export default useBalanceStatus;