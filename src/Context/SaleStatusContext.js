import React, { createContext, useState, useEffect } from 'react';

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
                const blockTimestamp = Math.floor(Date.now() / 1000); // Get current timestamp in seconds

                const dateStartNftHolder = 1691175606;
                const dateEndtNftHolder = 1691240406;
                const dateStartNft = 1691240406;
                const dateEndtNftGuaranteed = 1691326806;
                const whitelistFcfsStart = 1691326806;
                const whitelistFcfsEnd = 1691413206;
                const startTime = 1691413206;
                const deadline = 1691499606;

                let holderStatus = '';
                if (blockTimestamp < dateStartNftHolder) {
                    holderStatus = "Not Started";
                } else if (blockTimestamp >= dateStartNftHolder && blockTimestamp <= dateEndtNftHolder) {
                    holderStatus = "Live";
                } else {
                    holderStatus = "Ended";
                }

                let guaranteedStatus = '';
                if (blockTimestamp < dateStartNft) {
                    guaranteedStatus = "Not Started";
                } else if (blockTimestamp >= dateStartNft && blockTimestamp <= dateEndtNftGuaranteed) {
                    guaranteedStatus = "Live";
                } else {
                    guaranteedStatus = "Ended";
                }

                let whitelistStatus = '';
                if (blockTimestamp < whitelistFcfsStart) {
                    whitelistStatus = "Not Started";
                } else if (blockTimestamp >= whitelistFcfsStart && blockTimestamp <= whitelistFcfsEnd) {
                    whitelistStatus = "Live";
                } else {
                    whitelistStatus = "Ended";
                }

                let publicSaleStatus = '';
                if (blockTimestamp < startTime) {
                    publicSaleStatus = "Not Started";
                } else if (blockTimestamp >= startTime && blockTimestamp <= deadline) {
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
