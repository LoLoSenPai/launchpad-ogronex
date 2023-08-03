import React from "react";


const Tooltip = ({ onMouseEnter, onMouseLeave, showTooltip, children, tooltipText }) => (
  <div
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={{
      position: "relative",
      display: "inline-block",
    }}
  >
    {children}
    {showTooltip && (
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "black",
          color: "white",
          padding: 15,
          borderRadius: 7,
          zIndex: 1,
        }}
      >
        <p>
          <strong>{tooltipText}</strong>
        </p>
      </div>
    )}
  </div>
);

export default Tooltip;