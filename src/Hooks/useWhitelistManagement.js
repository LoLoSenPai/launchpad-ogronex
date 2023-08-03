import { useState, useCallback, useContext } from 'react';
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { SaleStatusContext } from "../Context/SaleStatusContext";
import { useContracts } from '../Hooks/useContracts';
import { ethers } from 'ethers';
import dataWhiteListGuaranteed from '../Lib/dataWhiteListGuaranteed.json';
import dataWhiteListOG from '../Lib/dataWhiteListOG.json';
import dataWhiteListWL from '../Lib/dataWhiteListWL.json';

export default function useWhitelistManagement() {

    const [waitingBuy, setWaitingBuy] = useState(false);
    const [remainingTickets, setRemainingTickets] = useState(0);

    const { provider, contractNft } = useContracts();
    const { holder, guaranteed, whitelistFCFS } = useContext(SaleStatusContext);
    const { address } = useAccount();


    const isWhitelisted = useCallback((address) => {
        const whitelistGuaranteed = dataWhiteListGuaranteed.reduce((obj, item) => ({ ...obj, [item.address]: item }), {});
        const whitelistOG = dataWhiteListOG.reduce((obj, item) => ({ ...obj, [item.address]: item }), {});
        const whitelistWL = dataWhiteListWL.reduce((obj, item) => ({ ...obj, [item.address]: item }), {});

        if (holder.status === "Live") {
            return whitelistGuaranteed[address];
        } else if (guaranteed.status === "Live") {
            return whitelistOG[address];
        } else if (whitelistFCFS.status === "Live") {
            return whitelistWL[address];
        } else {
            return false;
        }
    }, [holder.status, guaranteed.status, whitelistFCFS.status]);


    const whiteListMint = useCallback(async () => {
        // Code pour le mint de la whitelist ici
        if (!provider || !contractNft) return;
        try {
            // conditionner la WL en function de la phase (holder, og and wl)!
            setWaitingBuy(true);
            const whitelistObject = isWhitelisted(address);
            const tx = await contractNft.whitelistMint(1, whitelistObject.proof, 1, { value: ethers.utils.parseEther((1 * 0.5).toString()) });
            await provider.waitForTransaction(tx.hash);
            setWaitingBuy(false);
            toast.success("Success Mint !");
            const availableToMint = await contractNft.availableToMint();
            let alreadyMintGuaranted = 0;
            let alreadyMintOG = 0;
            let alreadyMintWL = 0;
            if (holder.status === "Live") {
                alreadyMintGuaranted = await contractNft.alreadyMintedHolders(address)
                setRemainingTickets(availableToMint - alreadyMintGuaranted);
                toast.success(`You have already mint ${alreadyMintGuaranted} NFT`)
            }
            if (guaranteed.status === "Live") {
                alreadyMintOG = await contractNft.alreadyMintedOG(address)
                setRemainingTickets(availableToMint - alreadyMintOG);
                toast.success(`You have already mint ${alreadyMintOG} NFT`)
            }
            if (whitelistFCFS.status === "Live") {
                alreadyMintWL = await contractNft.alreadyMintedWhitelist(address)
                setRemainingTickets(availableToMint - alreadyMintWL);
                toast.success(`You have already mint ${alreadyMintWL} NFT`)
            }
            const newRemainingTickets = availableToMint - alreadyMintGuaranted - alreadyMintOG - alreadyMintWL;
            setRemainingTickets(newRemainingTickets);
            localStorage.setItem('remainingTickets', newRemainingTickets.toString());
            // await getTotalSupply();
        } catch (error) {
            console.log(error);
            if (error.message.includes('execution reverted')) {
                const errorMessage = error.reason.split(':')[1].trim();
                toast.error(errorMessage)
            } else (
                toast.error("Transaction error! But don't worry, even the best stumble sometimes!")
            )
            setWaitingBuy(false);
        }
    }, [provider, contractNft, isWhitelisted, address, holder.status, guaranteed.status, whitelistFCFS.status]);

    return { whiteListMint, isWhitelisted, waitingBuy, remainingTickets };
}
