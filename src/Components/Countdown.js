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
                    {days > 0 && `${days} Day${days === 1 ? "" : "s"} `}
                    {hours > 0 && `${hours} Hour${hours === 1 ? "" : "s"} `}
                    {minutes > 0 && `${minutes} Minute${minutes === 1 ? "" : "s"} `}
                    {seconds >= 0 && `${seconds} Second${seconds === 1 ? '' : 's'}`}
                </div>
            );
        }
    };

    return (
        <div className={classNames("", { "opacity-50": isCompleted })}>
            <Countdown date={deadline} renderer={renderer} />
        </div>
    );
}

export default CountdownComponent;
