import { createPortal } from 'react-dom';
import ModalWinner from '../../Modals/ModalWinner';
import ModalPending from '../../Modals/ModalPending';
import ModalLooser from '../../Modals/ModalLooser';
import Button from './Button';
import useSaleStatus from '../../Hooks/useSaleStatus';
import useConnectionStatus from '../../Hooks/useConnectionStatus';
import useWhitelistStatus from '../../Hooks/useWhitelistStatus';
import useBalanceStatus from '../../Hooks/useBalanceStatus';
import useWinnerStatus from '../../Hooks/useWinnerStatus';
import useWaitingBuyStatus from '../../Hooks/useWaitingBuyStatus';

const SaleButton = (props) => {
    // déstructure props
    const {
        isConnected, isWhitelisted, hasBalance, isWinnerRaffle, waitingBuy,
        publicSale, holder, remainingTickets, availableToMint, buyTickets,
        whitelistFCFS, guaranteed, whiteListMint, address, winnerNbMint
    } = props;

    // utiliser les hooks
    const connectionStatus = useConnectionStatus(isConnected);
    const saleStatus = useSaleStatus(holder, publicSale, remainingTickets, availableToMint, buyTickets);
    const balanceStatus = useBalanceStatus(hasBalance, publicSale, buyTickets);
    const winnerStatus = useWinnerStatus(isWinnerRaffle, publicSale, buyTickets, setShowModalWinner, setShowModalPending, setShowModalLooser);
    const waitingBuyStatus = useWaitingBuyStatus(waitingBuy, publicSale, buyTickets);
    const whitelistStatus = useWhitelistStatus(isWhitelisted);

    // déterminer quel statut utiliser
    let status;
    if (waitingBuy) {
        status = waitingBuyStatus;
    } else if (isWhitelisted) {
        status = whitelistStatus;
    } else if (isWinnerRaffle) {
        status = winnerStatus;
    } else if (hasBalance) {
        status = balanceStatus;
    } else {
        status = saleStatus;
    }

    // utiliser le statut déterminé pour rendre le bouton
    return (
        <>
            <Button
                onClick={status.onClick}
                disabled={status.disabled}
                text={status.text}
            />
            {showModalWinner && createPortal(<ModalWinner closeModal={() => setShowModalWinner(false)} winnerNbMint={winnerNbMint} />, document.body)}
            {showModalPending && createPortal(<ModalPending closeModal={() => setShowModalPending(false)} />, document.body)}
            {showModalLooser && createPortal(<ModalLooser closeModal={() => setShowModalLooser(false)} />, document.body)}
        </>
    );
}


export default SaleButton;
