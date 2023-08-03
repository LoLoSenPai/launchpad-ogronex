import { useState, useEffect } from 'react';

function useWinnerStatus(isWinnerRaffle, appIsRaffleOver, publicSale, checkWinner, winnerRaffleMint, setShowModalWinner, setShowModalLooser, setShowModalPending, hasCheckedWinner, setHasCheckedWinner) {
    const [winnerStatus, setWinnerStatus] = useState({
        text: "Waiting for next phase",
        disabled: true,
        onClick: () => { },
    });

    useEffect(() => {
        let text = "Waiting for next phase";
        let disabled = true;
        let onClick = () => { };

        if (publicSale && publicSale.status === 'Ended' && !hasCheckedWinner) {
            text = "Verify";
            onClick = async () => {
                if (appIsRaffleOver) {
                    const isWinner = await checkWinner();
                    setHasCheckedWinner(true);
                    if (isWinner) {
                        setShowModalWinner(true);
                    } else {
                        setShowModalLooser(true);
                    }
                } else {
                    setShowModalPending(true);
                }
            };
        } else if (publicSale && publicSale.status === 'Ended' && hasCheckedWinner && isWinnerRaffle) {
            text = "Claim";
            onClick = () => winnerRaffleMint();
        } else if (publicSale && publicSale.status === 'Ended' && hasCheckedWinner && !isWinnerRaffle) {
            text = "You didn't win...";
        }

        setWinnerStatus({ text, disabled, onClick });
    }, [isWinnerRaffle, appIsRaffleOver, publicSale, checkWinner, winnerRaffleMint, setShowModalWinner, setShowModalLooser, setShowModalPending, hasCheckedWinner, setHasCheckedWinner]);

    return winnerStatus;
}

export default useWinnerStatus;