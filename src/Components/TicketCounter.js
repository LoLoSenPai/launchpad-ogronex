import { useEffect, useState } from "react";
import { TiTicket } from "react-icons/ti";
import AnimatedTickets from "./AnimatedTickets";

function TicketCounter({ isConnected, availableToMint, ticketsBought, publicSale, hasCheckedWinner, winnerNbMint, totalRemainingTickets }) {
    const [prevTicketsBought, setPrevTicketsBought] = useState(ticketsBought);
    const [triggerAnimation, setTriggerAnimation] = useState(false);

    const resetTriggerAnimation = () => {
        setTriggerAnimation(false);
    }    


    useEffect(() => {
        if (ticketsBought !== prevTicketsBought) {
            setTriggerAnimation(true);
            setPrevTicketsBought(ticketsBought);
        }
    }, [ticketsBought, prevTicketsBought]);

    return (
        <div className="flex flex-col justify-center items-center lg:min-w-[110px] space-y-4">
            {isConnected && availableToMint !== undefined && (
                <div className="flex space-x-4">
                    <AnimatedTickets triggerAnimation={triggerAnimation} resetTriggerAnimation={resetTriggerAnimation} />
                    <TiTicket className="text-3xl text-light" />
                    <span className=" text-light text-xl ">
                        {totalRemainingTickets}
                    </span>
                </div>
            )}
            {isConnected && ticketsBought !== undefined && publicSale.status === 'Live' && (
                <>
                    <div className="flex space-x-4">
                            <TiTicket className="text-3xl text-white" />
                            <span className="text-light">{ticketsBought}</span>
                    </div>
                </>
            )}
            {isConnected && hasCheckedWinner && (
                <p className="flex items-center lg:text-xl text-white sm:mt-3 md:mt-1">
                    Won:
                    <span className="ml-12 md:ml-12 lg:ml-8 text-light ">{winnerNbMint}</span>
                </p>
            )}
        </div>
    );
}

export default TicketCounter;