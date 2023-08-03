import React, { createContext, useState, useEffect } from 'react';
import { Network, Alchemy } from 'alchemy-sdk';

export const SaleStatusContext = createContext();

export const SaleStatusProvider = ({ children }) => {
    const [saleStatus, setSaleStatus] = useState({
        holder: {
            status: '',
            start: null,
            end: null,
        },
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

                // holder sale
                const dateStartNftHolder = 1690977600; //     Wed Aug 02 2023 12:00:00 GMT+0 START HOLDERS PHASE
                const dateEndtNftHolder = 1690988400; //     Wed Aug 02 2023 15:00:00 GMT+0 END HOLDERS PHASE
                // OG fcfs
                const dateStartNft = 1690988400; //     Wed Aug 02 2023 15:00:00 GMT+0 START OG PHASE
                const dateEndtNftGuaranteed = 1690992000; //     Wed Aug 02 2023 16:00:00 GMT+0 END OG PHASE
                // whitelist fcfs
                const whitelistFcfsStart =1690992000; //     Wed Aug 02 2023 16:00:00 GMT+0 START WL PHASE
                const whitelistFcfsEnd = 1690995600; //    Wed Aug 02 2023 17:00:00 GMT+0 END WL PHASE
                // public sale
                const startTime = 1690995600; //    Wed Aug 02 2023 17:00:00 GMT+0 START PUBLIC PHASE
                const deadline = 1691006400; //     Wed Aug 02 2023 20:00:00 GMT+0 END PUBLIC

                let holderStatus = '';
                if (block.timestamp < dateStartNftHolder) {
                    holderStatus = "Not Started";
                } else if (block.timestamp >= dateStartNftHolder && block.timestamp <= dateEndtNftHolder) {
                    holderStatus = "Live";
                } else {
                    holderStatus = "Ended";
                }

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
                    holder: {
                        ...prevStatus.holder,
                        status: holderStatus,
                        start: dateStartNftHolder,
                        end: dateEndtNftHolder,
                    },
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
