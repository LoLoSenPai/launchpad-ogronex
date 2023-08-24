import { useState, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';
import { SaleStatusContext } from '../Context/SaleStatusContext';
import useContracts from './useContracts';
import { CONTRACT_RAFFLE } from '../Lib/constants';
import RaffleABI from "../ABI/launchpadRaffle.json";
import { useWaitingBuy } from '../Context/WaitingBuyContext';
import { useAnimation } from '../Context/AnimationContext';


export default function useTicketManagement() {
    const [ticketsBought, setTicketsBought] = useState(0);
    const [ticketsSold, setTicketsSold] = useState(0);
    const { waitingBuy, setWaitingBuy } = useWaitingBuy();
    const { triggerAnimation, setTriggerAnimation, resetTriggerAnimation } = useAnimation();
    const { provider, contractRaffle } = useContracts();
    const { address, isConnected } = useAccount();
    const { publicSale } = useContext(SaleStatusContext);

    const getTicketsSold = useCallback(async () => {
        // Code pour obtenir le nombre de tickets vendus ici
        if (!provider || !contractRaffle) return;
        try {
            const ticketsSold = await contractRaffle.nbTicketSell();
            setTicketsSold(ticketsSold.toNumber());
        } catch (error) {
            console.log(error);
        }
    }, [contractRaffle, provider]);

    const getTicketsBought = useCallback(async () => {
        if (!isConnected || !contractRaffle || publicSale.status !== "Live" || !address) return;
        try {
            const idPlayer = await contractRaffle.idByAddress(address);
            const player = await contractRaffle.playersList(idPlayer);
            if (player.addressPlayer === address) {
                const ticketsBought = player.ticketsBought;
                setTicketsBought(ticketsBought.toNumber());
            } else {
                setTicketsBought(0);
            }
        } catch (error) {
            console.error("Error getting tickets bought:", error);
            if (error.code === 4001) {
                toast.error("Transaction cancelled by the user");
            } else {
                toast.error("An error occured");
            }
        }
    }, [address, isConnected, contractRaffle, publicSale.status]);


    const buyTickets = useCallback(async (ticketCount, ticketPrice) => {
        if (!provider || !contractRaffle || publicSale.status !== "Live") return;
        try {
            setWaitingBuy(true);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractRaffleConnect = new ethers.Contract(CONTRACT_RAFFLE, RaffleABI, signer);
            console.log('Before buying tickets'); // debug log
            const tx = await contractRaffleConnect.buyTicket(ticketCount, { value: ethers.utils.parseEther((ticketCount * ticketPrice).toString()) });
            console.log('After buying tickets, before waiting for transaction'); // debug log
            await provider.waitForTransaction(tx.hash);
            console.log('After waiting for transaction'); // debug log
            toast.success("You're in the game! Good luck for the draw!");
            await getTicketsBought();
            await getTicketsSold();
            setTriggerAnimation(true);
        } catch (error) {
            if (error.code === 4001) {
                toast.error("Transaction cancelled by the user.");
            } else {
                toast.error("Transaction error! But don't worry, even the best stumble sometimes!");
            }
        } finally {
            console.log('In finally block'); // debug log
            setWaitingBuy(false);
        }
    }, [provider, contractRaffle, getTicketsBought, getTicketsSold, publicSale.status, setTriggerAnimation, setWaitingBuy]);

    return { getTicketsBought, buyTickets, getTicketsSold, waitingBuy, ticketsBought, ticketsSold, triggerAnimation, resetTriggerAnimation };
}
