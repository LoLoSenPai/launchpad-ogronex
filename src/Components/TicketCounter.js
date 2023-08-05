import { useEffect, useState } from "react";
import { TiTicket } from "react-icons/ti";
import { motion, useAnimation } from "framer-motion";

function TicketCounter({ isConnected, availableToMint, ticketsBought, publicSale, hasCheckedWinner, winnerNbMint, totalRemainingTickets, triggerAnimation, resetTriggerAnimation }) {
    const [prevTicketsBought, setPrevTicketsBought] = useState(ticketsBought);
    const controls = useAnimation();

    const variants = {
        initial: { scale: 1 },
        animate: { scale: [1, 1.2, 1], transition: { duration: 0.5 } },
    };

    useEffect(() => {
        if (triggerAnimation) {
            controls.start("animate");
            resetTriggerAnimation();
        }
    }, [triggerAnimation, resetTriggerAnimation, controls]);

    useEffect(() => {
        if (ticketsBought !== prevTicketsBought) {
            setPrevTicketsBought(ticketsBought);
        }
    }, [ticketsBought]);

    return (
        <div className="flex flex-col justify-center items-center lg:min-w-[110px] space-y-4">
            {isConnected && availableToMint !== undefined && (
                <div className="flex space-x-4">
                    <TiTicket className="text-3xl text-light" />
                    <span className=" text-light text-xl ">
                        {totalRemainingTickets}
                    </span>
                </div>
            )}
            {isConnected && ticketsBought !== undefined && publicSale.status === 'Live' && (
                <>
                    <div className="flex space-x-4">
                        <motion.div
                            className="flex space-x-4"
                            animate={controls}
                            initial="initial"
                            variants={variants}
                        >
                            <TiTicket className="text-3xl text-white" />
                            <span className="text-light">{ticketsBought}</span>
                        </motion.div>
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