import { useState, useEffect } from 'react';

function useWhitelistStatus(isWhitelisted, address, holder, guaranteed, whitelistFCFS, whiteListMint) {
    const [whitelistStatus, setWhitelistStatus] = useState({
        text: "Waiting for next phase",
        disabled: true,
        onClick: () => { },
    });

    useEffect(() => {
        let text = "Waiting for next phase";
        let disabled = true;
        let onClick = () => { };

        if (isWhitelisted(address) && holder && holder.status === 'Live') {
            text = "Holder Mint";
            onClick = () => whiteListMint();
            disabled = false;
        } else if (isWhitelisted(address) && guaranteed && guaranteed.status === 'Live') {
            text = "OG Mint! Hurry up!";
            onClick = () => whiteListMint();
            disabled = false;
        } else if (isWhitelisted(address) && whitelistFCFS && whitelistFCFS.status === 'Live') {
            text = "Whitelist Mint! Hurry up!";
            onClick = () => whiteListMint();
            disabled = false;
        }

        setWhitelistStatus({ text, disabled, onClick });
    }, [isWhitelisted, address, holder, guaranteed, whitelistFCFS, whiteListMint]);

    return whitelistStatus;
}

export default useWhitelistStatus;