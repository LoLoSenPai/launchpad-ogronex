import React, { createContext, useState, useEffect } from 'react';
import { Network, Alchemy } from 'alchemy-sdk';
import { ethers } from 'ethers';
import NftABI from '../ABI/TBT_NFT.json';
import RaffleABI from '../ABI/RaffleG_0.json';

const contractNftAddress = "0x5E82c890a9531784F5c2730C16c76361670D0429";
const contractRaffleAddress = "0x84D78f7826e4d614B294DD1A65aeAb3e08CbC738";

export const SaleStatusContext = createContext();

export const SaleStatusProvider = ({ children }) => {
    const [saleStatus, setSaleStatus] = useState({
        guaranteed: {
            status: '',
            start: null,
            end: null,
        },
        whitelistFCFS: {
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
    
                const dateStartNft = 1690729200;
                const dateEndtNftGuaranteed = 1690815600;
                const whitelistFcfsStart = 1690815610;
                const whitelistFcfsEnd = 1690819200;
                const startTime = 1690819210;
                const deadline = 1690830000;
                // const dateStartNft = await contractNft.saleStartTime();
                // const dateEndtNftGuaranteed = await contractNft.endTimeGuaranteed();
                // const whitelistFcfsStart = await contractNft.saleStartTime();
                // const whitelistFcfsEnd = await contractNft.endTimeGuaranteed();
                // const startTime = await contractRaffleBeforeConnection.startDate();
                // const deadline = await contractRaffleBeforeConnection.deadline();
    
                let guaranteedStatus = '';
                if (block.timestamp < dateStartNft) {
                    guaranteedStatus = "Not Started";
                } else if (block.timestamp >= dateStartNft && block.timestamp <= dateEndtNftGuaranteed) {
                    guaranteedStatus = "Live";
                } else {
                    guaranteedStatus = "Ended";
                }
               
                let whitelistStatus = '';
                if (block.timestamp < whitelistFcfsStart) {
                    whitelistStatus = "Not Started";
                } else if (block.timestamp >= whitelistFcfsStart && block.timestamp <= whitelistFcfsEnd) {
                    whitelistStatus = "Live";
                } else {
                    whitelistStatus = "Ended";
                }
    
                let publicSaleStatus = '';
                if (block.timestamp < startTime) {
                    publicSaleStatus = "Not Started";
                } else if (block.timestamp >= startTime && block.timestamp <= deadline) {
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
                    whitelistFCFS: {
                        ...prevStatus.whitelistFCFS,
                        status: whitelistStatus,
                        start: whitelistFcfsStart,
                        end: whitelistFcfsEnd,
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
