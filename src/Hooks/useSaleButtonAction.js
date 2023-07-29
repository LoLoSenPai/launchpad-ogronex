import { useState, useEffect } from 'react';
import useRaffleWinnerCheck from './useRaffleWinnerCheck';

const useSaleButtonAction = (props) => {
    const {
        isConnected,
        waitingBuy,
        hasBalance,
        address,
        isWhitelisted,
        isWinnerRaffle,
        hasCheckedWinner,
        guaranteed,
        publicSale,
        whiteListMint,
        buyTickets,
        checkWinner,
        winnerRaffleMint,
        setHasCheckedWinner,
        setShowModalWinner,
        setShowModalPending,
        setShowModalLooser,
        contractNft,
        whitelistSale
    } = props;

    const checkRaffleWinner = useRaffleWinnerCheck(props);

    const [buttonOnClick, setButtonOnClick] = useState(() => { });

    useEffect(() => {
        let newButtonOnClick;

        if (isWhitelisted(address) && guaranteed.status === 'Live') {
            newButtonOnClick = () => whiteListMint();
        } else if (whitelistSale.status === 'Live') {
            newButtonOnClick = () => whiteListMint();
        } else if (publicSale.status === 'Live') {
            newButtonOnClick = () => buyTickets();
        } else if (publicSale.status === 'Ended' && !hasCheckedWinner && isConnected) {
            newButtonOnClick = checkRaffleWinner;
        } else if (publicSale.status === 'Ended' && hasCheckedWinner && isWinnerRaffle) {
            newButtonOnClick = () => winnerRaffleMint();
        }

        setButtonOnClick(() => newButtonOnClick);
    }, [isConnected, waitingBuy, hasBalance, address, isWhitelisted, isWinnerRaffle, hasCheckedWinner, guaranteed, whitelistSale ,publicSale, whiteListMint, buyTickets, checkWinner, winnerRaffleMint, setHasCheckedWinner, setShowModalWinner, setShowModalPending, setShowModalLooser, contractNft, checkRaffleWinner]);

    return buttonOnClick;
};

export default useSaleButtonAction;
