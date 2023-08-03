// useSaleStatus.js
import { useState, useEffect } from 'react';

const useSaleStatus = (
    holder, publicSale,
    remainingTickets, availableToMint, buyTickets
) => {
    // Initialisation de l'état du bouton de vente
    const [saleStatus, setSaleStatus] = useState({
        text: "Waiting for next phase",
        disabled: true,
        onClick: () => { },
    });

    // Mise à jour de l'état du bouton de vente en fonction des dépendances
    useEffect(() => {
        let text = "Waiting for next phase";
        let disabled = true;
        let onClick = () => { };


        if ((remainingTickets > availableToMint) && holder && holder.status === 'Live') {
            text = "All NFTs are minted";
        } else if (publicSale && publicSale.status === 'Live') {
            text = "Buy Tickets";
            onClick = () => buyTickets();
        }

        // Mettre à jour l'état du bouton de vente
        setSaleStatus({ text, disabled, onClick });
    }, [holder, publicSale, remainingTickets, availableToMint, buyTickets]);

    return saleStatus;
};

export default useSaleStatus;
