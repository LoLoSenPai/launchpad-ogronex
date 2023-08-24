import React, { useEffect, useRef } from "react";
import { TiTicket } from "react-icons/ti";
import AnimatedTickets from "./AnimatedTickets";
import { useAnimation } from "../Context/AnimationContext";

function TicketCounter({ isConnected, availableToMint, ticketsBought, publicSale, hasCheckedWinner, winnerNbMint, totalRemainingTickets }) {
    const prevTicketsBoughtRef = useRef(ticketsBought);

    const { triggerAnimation, setTriggerAnimation, resetTriggerAnimation } = useAnimation();

    useEffect(() => {
        if (ticketsBought !== prevTicketsBoughtRef.current) {
            setTriggerAnimation(true);
            prevTicketsBoughtRef.current = ticketsBought;
        }
    }, [ticketsBought, setTriggerAnimation]);

    return (
        <div className="flex flex-col justify-center items-center space-y-4">
            {isConnected && availableToMint !== undefined && publicSale.status !== 'Live' && (
                <div className="flex flex-col md:flex-row space-x-4">
                    <AnimatedTickets triggerAnimation={triggerAnimation} resetTriggerAnimation={resetTriggerAnimation} />
                    <span className=" text-light text-xl ">
                        {totalRemainingTickets}
                    </span>
                </div>
            )}
            {isConnected && ticketsBought !== undefined && publicSale.status === 'Live' && (
                <>
                    <div className="flex space-x-4">
                        <AnimatedTickets triggerAnimation={triggerAnimation} resetTriggerAnimation={resetTriggerAnimation} />
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

export default React.memo(TicketCounter);