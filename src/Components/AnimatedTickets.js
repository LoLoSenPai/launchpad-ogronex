import React, { useState, useEffect, useCallback } from "react";
import { TiTicket } from "react-icons/ti";
import { motion, useAnimation } from "framer-motion";

function AnimatedTickets({ triggerAnimation, resetTriggerAnimation }) {
    const [showAnimatedTicket, setShowAnimatedTicket] = useState(false);
    const controls = useAnimation();

    const delays = [0.2, 0.4, 0.6, 0.8, 1.0];

    const ticketAnimationVariants = {
        hidden: (index) => ({
            opacity: 0,
            x: -200 + ticketOffsets[index].x,
            y: ticketOffsets[index].y,
            rotate: ticketOffsets[index].rotate,
        }),
        visible: (index) => ({
            opacity: [0, 1, 1, 1, 0.7],
            x: [-200 + ticketOffsets[index].x, -205 + ticketOffsets[index].x, -195 + ticketOffsets[index].x, -200 + ticketOffsets[index].x, 15],
            y: [ticketOffsets[index].y, -150 + ticketOffsets[index].y, -145 + ticketOffsets[index].y, -150 + ticketOffsets[index].y, 0],
            rotate: ticketOffsets[index].rotate,
            transition: {
                delay: delays[index],
                duration: 2,
                when: "beforeChildren",
                staggerChildren: -0.1,
            }
        }),
        exit: {
            opacity: 0,
            x: 15,
            y: 0,
            rotate: 0,
            transition: { duration: 0.5, delay: 0.5 }
        }
    };

    const randomBetween = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const generateRandomOffsets = useCallback(() => {
        return Array.from({ length: 5 }).map(() => ({
            x: randomBetween(-15, 15),
            y: randomBetween(-15, 15),
            rotate: randomBetween(-15, 15)
        }));
    }, []);

    const [ticketOffsets, setTicketOffsets] = useState(generateRandomOffsets());

    useEffect(() => {
        if (showAnimatedTicket) {
            setTicketOffsets(generateRandomOffsets());
        }
    }, [showAnimatedTicket, generateRandomOffsets]);

    useEffect(() => {
        if (triggerAnimation) {
            controls.start("animate");
            resetTriggerAnimation();
            setTicketOffsets(generateRandomOffsets());
            setTimeout(() => {
                setShowAnimatedTicket(false);
            }, 2500);
        }
    }, [triggerAnimation, resetTriggerAnimation, controls, generateRandomOffsets]);

    return (
        <div className="absolute">
            {Array.from({ length: 5 }).map((_, index) => (
                <motion.div
                    custom={index}
                    key={`ticket-${index}`}
                    initial="hidden"
                    animate={showAnimatedTicket ? "visible" : "exit"}
                    variants={ticketAnimationVariants}
                    style={{
                        position: 'absolute',
                        zIndex: index,
                        transform: `rotate(${(index % 2 ? 1 : -1) * (2 + index)}deg)`
                    }}
                >
                    <TiTicket className="text-3xl text-white" />
                </motion.div>
            ))}
        </div>
    );
}

export default AnimatedTickets;
