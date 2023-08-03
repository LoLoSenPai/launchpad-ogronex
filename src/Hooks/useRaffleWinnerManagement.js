import { useState, useCallback, useContext } from 'react';
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { SaleStatusContext } from "../Context/SaleStatusContext";
import useContracts from './useContracts';

export default function useRaffleWinnerManagement() {
    const [isWinnerRaffle, setIsWinnerRaffle] = useState(false);
    const [winnerNbMint, setWinnerNbMint] = useState(0);
    const [hasNotMinted, setHasNotMinted] = useState(false);
    const [waitingBuy, setWaitingBuy] = useState(false);

    const { provider, contractNft } = useContracts();
    const { publicSale } = useContext(SaleStatusContext);
    const { address, isConnected } = useAccount();

    const winnerRaffleMint = useCallback(async () => {
        if (!isConnected && !isWinnerRaffle) return;
        try {
            if (!hasNotMinted) {
                toast.error("You have already minted your winning ticket!");
                return;
            }
            setWaitingBuy(true);
            const tx = await contractNft.winnerRaffleSaleMint();
            await provider.waitForTransaction(tx.hash);
            toast.success("Success Mint !");
        } catch (error) {
            toast.error("Transaction error! But don't worry, even the best stumble sometimes!")
        } finally {
            setWaitingBuy(false);
        }
    }, [isConnected, isWinnerRaffle, hasNotMinted, contractNft, provider]);

    const checkWinner = useCallback(async () => {
        if (!isConnected && publicSale.status === "End") return false;
        try {
            const winnerData = await contractNft.winnerByAddress(address);
            const isWinner = winnerData.addressWinner === address && winnerData.numberOfWin > 0;
            const notMinted = winnerData.notMinted;
            setHasNotMinted(notMinted);
            if (isWinner) {
                setIsWinnerRaffle(true);
                setWinnerNbMint(winnerData.numberOfWin.toNumber());
                toast.success("LUCKY ! GO MINT 🎫");
            } else {
                setIsWinnerRaffle(false);
            }
            return isWinner;
        } catch (error) {
            console.log("Error checking winner:", error);
        }
    }, [isConnected, publicSale.status, contractNft, address]);

    return { winnerRaffleMint, checkWinner, isWinnerRaffle, winnerNbMint, waitingBuy };
}
