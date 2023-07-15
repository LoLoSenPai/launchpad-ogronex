import React from "react";
import { default as Countdown } from "react-countdown";
// import moment from "moment-timezone";

export default function CountdownComponent(props) {
    const deadline = props.deadline * 1000;
    const renderer = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            return <div>Ended</div>;
        } else {
            return (
                <div>
                    {days} D {hours}h {minutes}m {seconds}
                </div>
            );
        }
    };

    return <Countdown date={deadline} renderer={renderer} />;
}
