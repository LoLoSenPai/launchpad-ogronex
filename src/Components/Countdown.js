import { useState } from "react";
import { default as Countdown } from "react-countdown";
import classNames from "classnames";

const CountdownComponent = ({deadline}) => {
    const [isCompleted, setIsCompleted] = useState(false);

    const renderer = ({
        days,
        hours,
        minutes,
        seconds,
        completed }) => {
        if (completed) {
            setIsCompleted(true);
            return <div>Times up!</div>;
        } else {
            return (
                <div>
                    {days > 0 && `${days}D `}
                    {hours > 0 && `${hours}H `}
                    {minutes >= 0 && `${minutes}m `}
                    {seconds >= 0 && `${seconds}`}
                </div>
            );
        }
    };

    return (
        <div className={classNames("", { "opacity-50": isCompleted })}>
            <Countdown date={deadline * 1000} renderer={renderer} />
        </div>
    );
}

export default CountdownComponent;
