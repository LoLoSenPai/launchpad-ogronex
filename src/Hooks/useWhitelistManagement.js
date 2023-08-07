import { useState, useCallback, useContext, useEffect } from 'react';
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { SaleStatusContext } from "../Context/SaleStatusContext";
import useContracts from './useContracts';
import { ethers } from 'ethers';
import dataWhiteListGuaranteed from '../Lib/dataWhiteListGuaranteed.json';
import dataWhiteListOG from '../Lib/dataWhiteListOG.json';
import dataWhiteListWL from '../Lib/dataWhiteListWL.json';
import { CONTRACT_NFT } from '../Lib/constants';
import NftABI from "../ABI/Infected_NFT.json";

export default function useWhitelistManagement() {

    const [waitingBuy, setWaitingBuy] = useState(false);
    const [totalRemainingTickets, setTotalRemainingTickets] = useState(0);

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

    // const getAvailableToMint = useCallback((address) => {
    //     const whitelistGuaranteed = dataWhiteListGuaranteed.reduce((obj, item) => ({ ...obj, [item.address]: item }), {});
    //     const whitelistOG = dataWhiteListOG.reduce((obj, item) => ({ ...obj, [item.address]: item }), {});
    //     const whitelistWL = dataWhiteListWL.reduce((obj, item) => ({ ...obj, [item.address]: item }), {});

    //     if (holder.status === "Live") {
    //         return whitelistGuaranteed[address].availableToMint;
    //     } else if (guaranteed.status === "Live") {
    //         return whitelistOG[address].availableToMint;
    //     } else if (whitelistFCFS.status === "Live") {
    //         return whitelistWL[address].availableToMint;
    //     } else {
    //         return 0;
    //     }
    // }, [holder.status, guaranteed.status, whitelistFCFS.status]);

    const checkWhitelistedForPhase = useCallback(() => {
        const whitelistGuaranteed = dataWhiteListGuaranteed.reduce((obj, item) => ({ ...obj, [item.address]: item }), {});
        const whitelistOG = dataWhiteListOG.reduce((obj, item) => ({ ...obj, [item.address]: item }), {});
        const whitelistWL = dataWhiteListWL.reduce((obj, item) => ({ ...obj, [item.address]: item }), {});
    
        return {
            holder: Boolean(whitelistGuaranteed[address]),
            guaranteed: Boolean(whitelistOG[address]),
            whitelistFCFS: Boolean(whitelistWL[address])
        };
    }, [address]);
    


    // const getTotalRemainingTickets = useCallback(async () => {
    //     let totalRemainingTickets = 0;

    //     if (!contractNft) {
    //         console.log("The user is not connected to a wallet.");
    //         return;
    //     }

    //     try {
    //         if (holder.status === "Live") {
    //             totalRemainingTickets += await contractNft.availableToMintHolders();
    //         }
    //         if (guaranteed.status === "Live") {
    //             totalRemainingTickets += await contractNft.availableToMintOG();
    //         }
    //         if (whitelistFCFS.status === "Live") {
    //             totalRemainingTickets += await contractNft.availableToMintWL();
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         toast.error("Error getting the total remaining tickets.");
    //     }

    //     setTotalRemainingTickets(totalRemainingTickets);
    // }, [contractNft, holder.status, guaranteed.status, whitelistFCFS.status]);

    const getTotalRemainingTickets = useCallback(() => {
        let totalRemainingTickets = 0;

        try {
            if (holder.status === "Live") {
                totalRemainingTickets += dataWhiteListGuaranteed
                    .filter(item => item.address === address)
                    .reduce((total, item) => total + parseInt(item.availableToMint), 0);
                console.log('total from holder', totalRemainingTickets);
            }
            if (guaranteed.status === "Live") {
                totalRemainingTickets += dataWhiteListOG
                    .filter(item => item.address === address)
                    .reduce((total, item) => total + parseInt(item.availableToMint), 0);
                console.log('total from og', totalRemainingTickets);
            }
            if (whitelistFCFS.status === "Live") {
                totalRemainingTickets += dataWhiteListWL
                    .filter(item => item.address === address)
                    .reduce((total, item) => total + parseInt(item.availableToMint), 0);
                console.log('total from wl', totalRemainingTickets);
            }
        } catch (error) {
            console.log(error);
            toast.error("Error getting the total remaining tickets.");
        }

        setTotalRemainingTickets(totalRemainingTickets);
    }, [holder.status, guaranteed.status, whitelistFCFS.status, address]);



    const whiteListMint = useCallback(async (ticketCount) => {
        if (!provider || !contractNft) return;
        try {
            // conditionner la WL en fonction de la phase (holder, og and wl)
            setWaitingBuy(true);
            const whitelistObject = isWhitelisted(address);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractNftConnect = new ethers.Contract(CONTRACT_NFT, NftABI, signer);
            const tx = await contractNftConnect.whitelistMint(Number(whitelistObject.availableToMint), whitelistObject.proof, ticketCount, { value: ethers.utils.parseEther((ticketCount * 0).toString()) });
            await provider.waitForTransaction(tx.hash);
            setWaitingBuy(false);
            toast.success("Success Mint !");
            await getTotalRemainingTickets();
        } catch (error) {
            console.log(error);
            setWaitingBuy(false);

            if (error.code === ethers.utils.Logger.errors.NONCE_EXPIRED) {
                toast.error("Transaction failed. The transaction nonce is too low. Try again.");
            } else if (error.code === ethers.utils.Logger.errors.INSUFFICIENT_FUNDS) {
                toast.error("Transaction failed. You don't have enough funds to perform this transaction.");
            } else if (error.code === ethers.utils.Logger.errors.UNPREDICTABLE_GAS_LIMIT) {
                toast.error("Transaction failed. The gas limit could not be estimated.");
            } else if (error.message.includes('execution reverted')) {
                const errorMessage = error.reason.split(':')[1].trim();
                toast.error(errorMessage);
            } else {
                toast.error("Unexpected error occurred. Please try again.");
            }
        }
    }, [provider, contractNft, isWhitelisted, address, getTotalRemainingTickets, ]);



    useEffect(() => {
        getTotalRemainingTickets();
    }, [holder.status, guaranteed.status, whitelistFCFS.status, getTotalRemainingTickets]);



    return { whiteListMint, isWhitelisted, waitingBuy, totalRemainingTickets, checkWhitelistedForPhase };
}
