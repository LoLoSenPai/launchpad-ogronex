import { default as Countdown } from "react-countdown";

export function ClaimCountdown({ deadline }) {
    if (deadline === null) {
        return null;
    }
    const deadlineInSeconds = parseInt(deadline.toString()) + 24*60*60; // convert deadline to seconds and add 24 hours
    const deadlineInMilliseconds = deadlineInSeconds * 1000; // convert deadline to milliseconds
    const renderer = ({ hours, minutes, seconds, completed }) => {
        if (completed) {
            return <div>Claim closed</div>;
        } else {
            return (
                <div>
                    Time left to claim : {hours}h {minutes}m {seconds}s
                </div>
            );
        }
    };

    return <Countdown date={deadlineInMilliseconds} renderer={renderer} />;
}
