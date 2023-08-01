import React, { createContext, useState, useEffect } from 'react';
import { Network, Alchemy } from 'alchemy-sdk';

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

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                //only fetch block.timestamp no mor data when user not connected
                const settings = {
                    apiKey: "kKaUsI3UwlljF-I3np_9fWNG--9i9RlF",
                    network: Network.MATIC_MAINNET,
                };
            
                const alchemy = new Alchemy(settings);
                const maticProvider = await alchemy.config.getProvider();
                const block = await maticProvider.getBlock();
    
                const START_TIMESTAMP = 1690984800; //Wed Aug 02 2023 14:00:00 GMT+0
                const OG_START_TIMESTAMP = 1691071200; //Thu Aug 03 2023 14:00:00 GMT+0
                const WL_START_TIMESTAMP = 1691074800; //Thu Aug 03 2023 15:00:00 GMT+0
                const WL_END_TIMESTAMP = 1691078400; //Thu Aug 03 2023 16:00:00 GMT+0
                const START_RAFFLE_TIMESTAMP = 1691078400;//Thu Aug 03 2023 16:00:00 GMT+0
                const END_RAFFLE_TIMESTAMP = 1691089200;//Thu Aug 03 2023 19:00:00 GMT+0

                const dateStartNft = 1690984800;
                const dateEndtNftGuaranteed = 1691071200;
                const whitelistOGStart = 1691071200; //need to add the OG phase 
                const whitelistOGEnd = 1691074800; //need to add the OG phase 
                const whitelistFcfsStart = 1691074800;
                const whitelistFcfsEnd = 1691078400;
                const startTime = 1691078400;
                const deadline = 1691089200;
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
