import { useState, useEffect } from 'react';
import { PuffLoader } from 'react-spinners';

const useSaleButtonText = (props) => {
    const {
        isConnected,
        waitingBuy,
        hasBalance,
        address,
        isWhitelisted,
        isWinnerRaffle,
        hasCheckedWinner,
        guaranteed,
        whitelistSale,
        publicSale
    } = props;

    const [textButton, setTextButton] = useState("Waiting for next phase");
    const [buttonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {
        let newTextButton = "Waiting for next phase";
        let newButtonDisabled = false;

        if (waitingBuy) {
            newButtonDisabled = true;
            newTextButton = <PuffLoader color="#000" />;
        } else if (!isConnected) {
            newButtonDisabled = true;
            newTextButton = "Connect your wallet";
        } else if (isWhitelisted(address) && guaranteed.status === 'Live') {
            newTextButton = "Mint";
        } else if (whitelistSale.status === 'Live') {
            newTextButton = "Hurry Up! Mint Now!";
        } else if (!hasBalance && publicSale.status === 'Live') {
            newButtonDisabled = true;
            newTextButton = "Insufficient Balance";
        } else if (publicSale.status === 'Live') {
            newTextButton = "Buy Tickets";
        } else if (publicSale.status === 'Ended' && !hasCheckedWinner && isConnected) {
            newTextButton = "Verify";
        } else if (publicSale.status === 'Ended' && hasCheckedWinner && isWinnerRaffle) {
            newTextButton = "Claim";
        } else if (publicSale.status === 'Ended' && hasCheckedWinner && !isWinnerRaffle) {
            newButtonDisabled = true;
            newTextButton = "You didn't win...";
        }

        if (newTextButton === "Waiting for next phase") {
            newButtonDisabled = true;
        }

        setTextButton(newTextButton);
        setButtonDisabled(newButtonDisabled);
    }, [isConnected, waitingBuy, hasBalance, address, isWhitelisted, isWinnerRaffle, hasCheckedWinner, guaranteed, publicSale]);

    return {textButton, buttonDisabled};
};

export default useSaleButtonText;
