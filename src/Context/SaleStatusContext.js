import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useEthereumProvider } from '../Hooks/EthereumProvider';
import { useContracts } from '../Hooks/Contracts';
import useAlchemy from '../Hooks/AlchemyProvider';

export const SaleStatusContext = createContext();

export const SaleStatusProvider = ({ children }) => {
    const maticProvider = useAlchemy();
    const provider = useEthereumProvider();
    const { contractNft, contractRaffle } = useContracts(provider);
    const [error, setError] = useState(null);
    const [saleStatus, setSaleStatus] = useState({
        guaranteed: {
            status: '',
            start: null,
            end: null,
        },
        whitelistSale: {
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

    const contextValue = useMemo(() => ({ saleStatus, error }), [saleStatus, error]);

    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const block = await maticProvider.getBlock();

                const dateStartNft = 1690658413;
                const dateEndtNftGuaranteed = 1690834813;

                const whitelistStartTime = 1690838413;
                const whitelistEndTime = 1690842013;

                const startTime = 1690845613;
                const deadline = 1690847953;
                // const dateStartNft = await contractNft.saleStartTime();
                // const dateEndtNftGuaranteed = await contractNft.endTimeGuaranteed();

                // const whitelistStartTime = await contractRaffle.saleStartTime();
                // const whitelistEndTime = await contractRaffle.endTimeGuaranteed();

                // const startTime = await contractRaffle.startDate();
                // const deadline = await contractRaffle.deadline();

                let guaranteedStatus = '';
                if (block.timestamp < dateStartNft) {
                    guaranteedStatus = "Not Started";
                } else if (block.timestamp >= dateStartNft && block.timestamp <= dateEndtNftGuaranteed) {
                    guaranteedStatus = "Live";
                } else {
                    guaranteedStatus = "Ended";
                }

                let whitelistStatus = '';
                if (block.timestamp < dateStartNft) {
                    whitelistStatus = "Not Started";
                } else if (block.timestamp >= dateStartNft && block.timestamp <= dateEndtNftGuaranteed) {
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
                    whitelistSale: {
                        ...prevStatus.whitelist,
                        status: whitelistStatus,
                        start: whitelistStartTime,
                        end: whitelistEndTime,
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
                setError(error);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [setSaleStatus, contractNft, contractRaffle, maticProvider]);

    return (
        <SaleStatusContext.Provider value={contextValue}>
            {children}
        </SaleStatusContext.Provider>
    );
};