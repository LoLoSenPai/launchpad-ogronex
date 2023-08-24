import { createContext, useContext, useState, useMemo, useCallback } from "react";

const AnimationContext = createContext();

export const useAnimation = () => useContext(AnimationContext);

export const AnimationProvider = ({ children }) => {
    const [triggerAnimation, setTriggerAnimation] = useState(false);

    const resetTriggerAnimation = useCallback(() => {
        setTriggerAnimation(false);
    }, []);
    

    const value = useMemo(() => ({
        triggerAnimation,
        setTriggerAnimation,
        resetTriggerAnimation
    }), [triggerAnimation, setTriggerAnimation, resetTriggerAnimation]);

    return (
        <AnimationContext.Provider value={value}>
            {children}
        </AnimationContext.Provider>
    );
};
