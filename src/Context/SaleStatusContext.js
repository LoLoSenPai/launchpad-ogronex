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

            const maticProvider = await alchemy.config.getProvider();
            const block = await maticProvider.getBlock();
            // const contractRaffleBeforeConnection = new ethers.Contract(contractRaffleAddress, RaffleABI.abi, maticProvider);
            // const dateStartNft = await contractNft.saleStartTime();
            // const dateEndtNftGuaranteed = await contractNft.endTimeGuaranteed();
            // const startTime = await contractRaffleBeforeConnection.startDate();
            // const deadline = await contractRaffleBeforeConnection.deadline();

            const dateStartNft = 1690230600;
            const dateEndtNftGuaranteed = 1690230605;
            const startTime = 1690230610;
            const deadline = 1690230615;

            setSaleStatus((prevStatus) => ({
                ...prevStatus,
                guaranteed: {
                    ...prevStatus.guaranteed,
                    status: block.timestamp < dateStartNft
                        ? "Not Started"
                        : block.timestamp >= dateStartNft && block.timestamp <= dateEndtNftGuaranteed
                            ? "Live"
                            : "Ended",
                    start: dateStartNft,
                    end: dateEndtNftGuaranteed,
                },
                publicSale: {
                    ...prevStatus.publicSale,
                    status: block.timestamp < startTime
                        ? "Not Started"
                        : block.timestamp >= startTime && block.timestamp <= deadline
                            ? "Live"
                            : "Ended",
                    start: startTime,
                    end: deadline,
                },
            }));
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
