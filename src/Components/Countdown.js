import React, { useState, useEffect } from "react";
import { default as Countdown } from "react-countdown";

export default function CountdownComponent(props) {
    
    const [countdownDate, setCountdownDate] = useState(convertTimestamp(props.time));

    useEffect(() => {
      const interval = setInterval(() => {
        setCountdownDate(convertTimestamp(props.time));
      }, 1000);
  
      return () => {
        clearInterval(interval);
      };
    }, [props.time]);

    function convertTimestamp(timestamp) {
        const date = new Date(timestamp*1000);
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        const hours = '24';
        const minutes = '00';
        const seconds = '00';
        
        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        
        return formattedDate;
      }
      
    const renderer = ({ days, hours, minutes, seconds, completed }) => {
        if (completed) {
            return <div>Ended</div>;
        } else {
            return (
                <div>
                    {days} days {hours}h {minutes}m {seconds}
                </div>
            );
        }
    };

    return <Countdown date={countdownDate} renderer={renderer} />;
}
