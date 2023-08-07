import { useState } from "react";
import CountdownComponent from "./Countdown";
import Tooltip from "./Tooltip";
import { LuLock, LuUnlock } from "react-icons/lu";

function PhaseCard({ title, status, start, end, tooltipText, isAccessible }) {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleMouseEnter = () => setShowTooltip(true);
    const handleMouseLeave = () => setShowTooltip(false);



    return (
        <div className={`flex flex-col md:flex-row xl:gap-10 p-2 lg:p-4 bg-four rounded-lg border ${status === 'Live' ? 'border-light' : 'border-gray-600'} items-center md:justify-between`}>

            {/* Phase */}
            <div className="flex items-center xl:space-x-3 lg:text-lg xl:text-xl text-white mb-2 md:mb-0">
                {title !== "Public Raffle" && (isAccessible ? <LuUnlock className="text-light mr-1" /> : <LuLock className="text-gray-400 mr-1" />)}
                <span className="whitespace-nowrap text-lg">{title}</span>
                <div
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="flex items-center justify-center text-light text-sm mx-1 lg:ml-3 border border-radius-50 border-light bg-secondary rounded-full w-5 h-5 md:w-3 md:h-3 lg:w-6 lg:h-6"
                >
                    i
                </div>
                <Tooltip showTooltip={showTooltip} tooltipText={tooltipText} />
            </div>

            {/* Status */}
            <div className="flex justify-center mb-2 md:mb-0">
                <div className='relative inline-block overflow-hidden rounded-full p-[1px]'>
                    <div className={`absolute inset-[-1000%] animate-[spin_2s_linear_infinite] ${status === 'Live' ? 'bg-[conic-gradient(from_90deg_at_50%_50%,#008000_0%,#02ffa7_50%,#008000_100%)]' : 'bg-[conic-gradient(from_90deg_at_50%_50%,#800000_0%,#ff3d3d_50%,#800000_100%)]'}`} />
                    <div className='inline-flex h-full w-full cursor-default items-center justify-center rounded-full bg-secondary px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl'>
                        <i className={`fas fa-circle pr-2 ${status === 'Live' ? 'text-light' : 'text-red-500'} text-[7px] animate-pulse`}></i>
                        <span className="whitespace-nowrap text-lg md:text-[12px] lg:text-md">
                            {status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Countdown */}
            {status !== 'Ended' && (
                <div className="flex justify-center md:justify-end mt-2 md:mt-0">
                    <div className="flex text-center text-md justify-around items-center text-gray-400 bg-secondary py-2 lg:px-6 rounded-lg border border-gray-600 bg-opacity-60 min-w-[190px] md:min-w-[140px] lg:min-w-[170px] xl:min-w-[210px]">
                        {status === 'Not Started' &&
                            <>
                                Live in
                                <span className="text-white lg:pl-2 md:text-sm xl:text-xl">
                                    <CountdownComponent deadline={start} />
                                </span>
                            </>
                        }
                        {status === 'Live' &&
                            <>
                                Ends in
                                <span className="text-white lg:pl-2 md:text-sm xl:text-xl">
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
