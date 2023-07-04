import React from "react";
import { default as Countdown } from "react-countdown";
import moment from "moment-timezone";

export default function CountdownComponent() {
    const countdownDate = moment.tz("2023-07-05T12:00:00", "Europe/Paris").toDate();

    const renderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
            return <div>Ended</div>;
        } else {
            return (
                <div>
                    {hours}h {minutes}m {seconds}
                </div>
            );
        }
    };

    return <Countdown date={countdownDate} renderer={renderer} />;
}
