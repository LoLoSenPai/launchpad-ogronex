import React, { createContext, useState, useEffect } from 'react';
import { Network, Alchemy } from 'alchemy-sdk';

export const SaleStatusContext = createContext();

export const SaleStatusProvider = ({ children }) => {
    const maticProvider = useAlchemy();
    const provider = useEthereumProvider();
    const { contractNft, contractRaffle } = useContracts(provider);
    const [error, setError] = useState(null);
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
        publicSale: {
            status: '',
            start: null,
            end: null,
        },
    });

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
                if (block.timestamp < dateStartNft) {
                    guaranteedStatus = "Not Started";
                } else if (block.timestamp >= dateStartNft && block.timestamp <= dateEndtNftGuaranteed) {
                    guaranteedStatus = "Live";
                } else {
                    guaranteedStatus = "Ended";
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return (
        <SaleStatusContext.Provider value={contextValue}>
            {children}
        </SaleStatusContext.Provider>
    );
};