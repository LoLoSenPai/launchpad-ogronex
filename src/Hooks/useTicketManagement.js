import { useState, useCallback, useContext } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useAccount } from 'wagmi';
import { SaleStatusContext } from '../Context/SaleStatusContext';
import { useContracts } from './useContracts';

export default function useTicketManagement() {
    const [ticketsBought, setTicketsBought] = useState(0);
    const [ticketsSold, setTicketsSold] = useState(0);
    const [waitingBuy, setWaitingBuy] = useState(false);

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
        if (!isConnected) return;
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
        }
    }, [address, isConnected, contractRaffle]);


    const buyTickets = useCallback(async (ticketCount, ticketPrice) => {
        // Code pour acheter des tickets ici
        if (!provider || !contractRaffle || !publicSale.status === "Live") return;
        try {
            setWaitingBuy(true);
            const tx = await contractRaffle.buyTicket(ticketCount, { value: ethers.utils.parseEther((ticketCount * ticketPrice).toString()) });
            await provider.waitForTransaction(tx.hash);
            toast.success("You're in the game! Good luck for the draw!");
            setWaitingBuy(false);
            await getTicketsBought();
            await getTicketsSold();
        } catch (error) {
            toast.error("Transaction error! But don't worry, even the best stumble sometimes!");
            setWaitingBuy(false);
        }
    }, [provider, contractRaffle, getTicketsBought, getTicketsSold, publicSale.status]);

    return { getTicketsBought, buyTickets, getTicketsSold, waitingBuy, ticketsBought, ticketsSold };
}
