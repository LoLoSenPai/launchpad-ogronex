import { useState } from "react";
import { default as Countdown } from "react-countdown";
import classNames from "classnames";

const CountdownComponent = ({ deadline }) => {
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
                <div className="flex">
                    {days > 0 && <span className="w-8 md:w-6 xl:w-9 text-center">{String(days).padStart(2, '0')}D</span>}
                    {hours > 0 && <span className="w-8 md:w-6 xl:w-9 text-center">{String(hours).padStart(2, '0')}H</span>}
                    {minutes >= 0 && <span className="w-8 md:w-6.5 xl:w-9 text-center">{String(minutes).padStart(2, '0')} :</span>}
                    {seconds >= 0 && <span className="w-8 md:w-6 xl:w-9 text-start">{String(seconds).padStart(2, '0')}</span>}
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
