import { createPortal } from 'react-dom';
import ModalWinner from '../Modals/ModalWinner';
import ModalPending from '../Modals/ModalPending';
import ModalLooser from '../Modals/ModalLooser';
import useSaleButtonText from '../Hooks/useSaleButtonText';
import useSaleButtonAction from '../Hooks/useSaleButtonAction';

export default function SaleButton(props) {
    const { textButton, buttonDisabled } = useSaleButtonText(props);
    const buttonOnClick = useSaleButtonAction(props);
    const { 
        showModalWinner, 
        setShowModalWinner, 
        showModalPending, 
        setShowModalPending, 
        showModalLooser, 
        setShowModalLooser, 
        winnerNbMint
    } = props;

    return (
        <>
            <button
                className={`lg:py-2 w-full rounded-lg text-xl xl:text-2xl bg-light font-bold text-black col-span-2 min-h-[60px] max-h-[80px] md:max-h-auto btn-shadow ${buttonDisabled ? 'opacity-50' : ''} flex justify-center items-center`}
                onClick={buttonOnClick}
                disabled={buttonDisabled}
            >
                {textButton}
            </button>
            {showModalWinner && createPortal(<ModalWinner closeModal={() => setShowModalWinner(false)} winnerNbMint={winnerNbMint} />, document.body)}
            {showModalPending && createPortal(<ModalPending closeModal={() => setShowModalPending(false)} />, document.body)}
            {showModalLooser && createPortal(<ModalLooser closeModal={() => setShowModalLooser(false)} />, document.body)}
        </>
    );
}
