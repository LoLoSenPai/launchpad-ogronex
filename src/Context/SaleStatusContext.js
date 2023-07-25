import React, { createContext, useState, useEffect } from 'react';
import { Network, Alchemy } from 'alchemy-sdk';
import { ethers } from 'ethers';
import NftABI from '../ABI/TBT_NFT.json';
import RaffleABI from '../ABI/RaffleG_0.json';

const contractNftAddress = "0x5C4F40C2a4719C2E08CDA077dCAbB0F4B3Ef737d"
const contractRaffleAddress = "0x7DB03BA949b8CBfC1208247f8050cC977dc13f03";

export const SaleStatusContext = createContext();

export const SaleStatusProvider = ({ children }) => {
    const [saleStatus, setSaleStatus] = useState({
        guaranteed: {
            status: '',
            start: null,
            end: null,
        },
        publicSale: {
            status: '',
            start: null,
            end: null,
        },
    });


    const settings = {
        apiKey: "ZQYOoMuEPgZwfP0yxEz1NzGyn2y2qCTW",
        network: Network.MATIC_MAINNET,
    };

    const alchemy = new Alchemy(settings);


    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const maticProvider = await alchemy.config.getProvider();
                const block = await maticProvider.getBlock();
    
                const contractNft = new ethers.Contract(contractNftAddress, NftABI.abi, maticProvider);
                const contractRaffleBeforeConnection = new ethers.Contract(contractRaffleAddress, RaffleABI.abi, maticProvider)
    
                const dateStartNft = await contractNft.saleStartTime();
                const dateEndtNftGuaranteed = await contractNft.endTimeGuaranteed();
                const startTime = await contractRaffleBeforeConnection.startDate();
                const deadline = await contractRaffleBeforeConnection.deadline();
    
                let guaranteedStatus = '';
                if (block.timestamp < dateStartNft.toNumber()) {
                    guaranteedStatus = "Not Started";
                } else if (block.timestamp >= dateStartNft.toNumber() && block.timestamp <= dateEndtNftGuaranteed.toNumber()) {
                    guaranteedStatus = "Live";
                } else {
                    guaranteedStatus = "Ended";
                }
    
                let publicSaleStatus = '';
                if (block.timestamp < startTime.toNumber()) {
                    publicSaleStatus = "Not Started";
                } else if (block.timestamp >= startTime.toNumber() && block.timestamp <= deadline.toNumber()) {
                    publicSaleStatus = "Live";
                } else {
                    publicSaleStatus = "Ended";
                }
    
                setSaleStatus((prevStatus) => ({
                    ...prevStatus,
                    guaranteed: {
                        ...prevStatus.guaranteed,
                        status: guaranteedStatus,
                        start: dateStartNft,
                        end: dateEndtNftGuaranteed,
                    },
                    publicSale: {
                        ...prevStatus.publicSale,
                        status: publicSaleStatus,
                        start: startTime,
                        end: deadline,
                    },
                }));
            } catch (error) {
                console.error("An error occurred while checking the time:", error);
            }
        }, 1000);
    
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    

    return (
        <SaleStatusContext.Provider value={saleStatus}>
            {children}
        </SaleStatusContext.Provider>
    );
};
