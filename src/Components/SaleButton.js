import React, { useState, useEffect } from 'react';
import { PuffLoader } from 'react-spinners';
import { createPortal } from 'react-dom';
import ModalWinner from '../Modals/ModalWinner';
import ModalPending from '../Modals/ModalPending';
import ModalLooser from '../Modals/ModalLooser';

export default function SaleButton(props) {
    const {
        isConnected,
        waitingBuy,
        hasBalance,
        address,
        isWhitelisted,
        isWinnerRaffle,
        whiteListMint,
        buyTickets,
        checkWinner,
        winnerRaffleMint,
        hasCheckedWinner,
        setHasCheckedWinner,
        showModalWinner,
        setShowModalWinner,
        showModalPending,
        setShowModalPending,
        showModalLooser,
        setShowModalLooser,
        isRaffleOver,
        guaranteed,
        whitelistFCFS,
        publicSale,
        winnerNbMint,
    } = props;

    const [textButton, setTextButton] = useState("Waiting for next phase");
    const [buttonOnClick, setButtonOnClick] = useState(() => { });
    const [buttonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {
        let newTextButton = "Waiting for next phase";
        let newButtonOnClick = () => { };
        let newButtonDisabled = false;

        if (waitingBuy) {
            newButtonDisabled = true;
            newTextButton = <PuffLoader color="#000" />;
        } else if (!isConnected) {
            newButtonDisabled = true;
            newTextButton = "Connect your wallet";
        } else if (isWhitelisted(address) && guaranteed.status === 'Live') {
            newTextButton = "Mint";
            newButtonOnClick = () => whiteListMint();
        } else if (isWhitelisted(address) && whitelistFCFS.status === 'Live') {
            newTextButton = "Hurry up! Mint now";
            newButtonOnClick = () => whiteListMint();
        } else if (!hasBalance && publicSale.status === 'Live') {
            newButtonDisabled = true;
            newTextButton = "Insufficient Balance";
        } else if (publicSale.status === 'Live') {
            newTextButton = "Buy Tickets";
            newButtonOnClick = () => buyTickets();
        } else if (publicSale.status === 'Ended' && !hasCheckedWinner && isConnected) {
            newTextButton = "Verify";
            newButtonOnClick = async () => {
                if (isRaffleOver.status) {
                    const isWinner = await checkWinner();
                    setHasCheckedWinner(true);
                    console.log("hasCheckedWinner from button", hasCheckedWinner);
                    if (isWinner) {
                        setShowModalWinner(true);
                        console.log("setShowModalWinner from button", showModalWinner);
                    } else {
                        setShowModalLooser(true);
                        console.log("setShowModalLooser from button", showModalLooser);
                    }
                } else {
                    setShowModalPending(true);
                    console.log("setShowModalPending from button", showModalPending);
                }
            };
        } else if (publicSale.status === 'Ended' && hasCheckedWinner && isWinnerRaffle) {
            newTextButton = "Claim";
            newButtonOnClick = () => winnerRaffleMint();
        } else if (publicSale.status === 'Ended' && hasCheckedWinner && !isWinnerRaffle) {
            newButtonDisabled = true;
            newTextButton = "You didn't win...";
        }

        if (newTextButton === "Waiting for next phase") {
            newButtonDisabled = true;
        }

        setTextButton(newTextButton);
        setButtonOnClick(() => newButtonOnClick);
        setButtonDisabled(newButtonDisabled);
    }, [isConnected, waitingBuy, hasBalance, address, isWhitelisted, isWinnerRaffle, hasCheckedWinner, guaranteed, publicSale]);

    return (
        <>
            <button
                className={`lg:py-2 w-full rounded-lg text-xl xl:text-2xl bg-light font-bold text-black col-span-2 min-h-[60px] max-h-[80px] md:max-h-auto btn-shadow ${buttonDisabled ? 'opacity-50' : ''} flex justify-center items-center`}
                onClick={buttonOnClick}
                disabled={buttonDisabled}
            >
                {textButton}
            </button>
            {showModalWinner && createPortal(<ModalWinner closeModal={() => setShowModalWinner(false)} winnerNbMint={winnerNbMint} />, document.body)}
            {showModalPending && createPortal(<ModalPending closeModal={() => setShowModalPending(false)} />, document.body)}
            {showModalLooser && createPortal(<ModalLooser closeModal={() => setShowModalLooser(false)} />, document.body)}
        </>
    );
}
