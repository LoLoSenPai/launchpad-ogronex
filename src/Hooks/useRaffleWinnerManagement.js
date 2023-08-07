import { useState, useCallback, useContext } from 'react';
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { SaleStatusContext } from "../Context/SaleStatusContext";
import useContracts from './useContracts';
import { CONTRACT_NFT } from '../Lib/constants';
import { ethers } from 'ethers';
import NftABI from "../ABI/Infected_NFT.json";
import { useWaitingBuy } from '../Context/WaitingBuyContext';

export default function useRaffleWinnerManagement() {
    const [isWinnerRaffle, setIsWinnerRaffle] = useState(false);
    const [winnerNbMint, setWinnerNbMint] = useState(0);
    const [hasNotMinted, setHasNotMinted] = useState(false);
    const { waitingBuy, setWaitingBuy } = useWaitingBuy();

    const { contractNft } = useContracts();
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
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractNftConnect = new ethers.Contract(CONTRACT_NFT, NftABI, signer);
            const tx = await contractNftConnect.winnerRaffleSaleMint();
            await provider.waitForTransaction(tx.hash);
            toast.success("Success Mint !");
        } catch (error) {
            toast.error("Transaction error! But don't worry, even the best stumble sometimes!")
        } finally {
            setWaitingBuy(false);
        }
    }, [isConnected, isWinnerRaffle, hasNotMinted]);

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
