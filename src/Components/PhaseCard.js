import { useState } from "react";
import CountdownComponent from "./Countdown";
import Tooltip from "./Tooltip";

function PhaseCard({ title, status, start, end, tooltipText }) {

    const [showTooltip, setShowTooltip] = useState(false);

    const handleMouseEnter = () => {
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-2 xl:gap-10 p-4 bg-four rounded-lg border border-gray-600 justify-center md:justify-between">
            <div className="flex relative lg:text-lg xl:text-xl font-bold text-white">
                {title}
                <div
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="flex items-center justify-center text-light text-sm ml-3 border border-radius-50 border-light bg-secondary rounded-full w-6 h-6"
                >
                    i
                </div>
                <Tooltip
                    showTooltip={showTooltip}
                    tooltipText={tooltipText}
                />
            </div>
            <div className="flex flew-row justify-center">
                <p className={"flex items-center xl:text-lg font-bold text-white bg-secondary py-2 px-6 md:px-2 lg:px-6 rounded-lg border border-gray-600 bg-opacity-60"}>
                    <i className={`fas fa-circle pr-2 text-light text-sm animate-pulse ${status === 'Live' ? 'text-green-500' : 'text-red-500'}`}></i>
                    {status}
                </p>
            </div>
            {status !== 'Ended' && (
                <div className="flex flex-col justify-end md:-ml-1.5 lg:ml-2 xl:ml-0 min-w-[170px] xl:min-w-[233px]">
                    <div className="flex flex-col lg:flex-row text-center text-md justify-around items-center text-gray-400 bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60">
                        {status === 'Not Started' &&
                            <>
                                Live in
                                <span className="text-white pl-2 xl:text-xl">
                                    <CountdownComponent deadline={start} />
                                </span>
                            </>
                        }
                        {status === 'Live' &&
                            <>
                                Ends in
                                <span className="text-white pl-2 xl:text-xl">
                                    <CountdownComponent deadline={end} />
                                </span>
                            </>
                        }
                    </div>
                </div>
            )}
        </div>
    );
}

export default PhaseCard;
