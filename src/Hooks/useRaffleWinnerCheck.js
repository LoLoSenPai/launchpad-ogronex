const useRaffleWinnerCheck = ({ isConnected, hasCheckedWinner, publicSale, contractNft, checkWinner, setHasCheckedWinner, setShowModalWinner, setShowModalPending, setShowModalLooser }) => {
    const checkRaffleWinner = async () => {
        if (publicSale.status !== 'Ended' || hasCheckedWinner || !isConnected) {
            return;
        }

        const isRaffleOver = await contractNft.isRaffleOver();
        if (!isRaffleOver) {
            setShowModalPending(true);
            return;
        }

        const isWinner = await checkWinner();
        setHasCheckedWinner(true);
        
        if (isWinner) {
            setShowModalWinner(true);
        } else {
            setShowModalLooser(true);
        }
    };

    return checkRaffleWinner;
};

export default useRaffleWinnerCheck;