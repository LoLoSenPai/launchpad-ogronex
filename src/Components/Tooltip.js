import React from "react";

const Tooltip = ({ onMouseEnter, onMouseLeave, showTooltip, children }) => (
  <div
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {children}
    {showTooltip && (
      <div className="tooltip-content">
        {children}
      </div>
    )}
  </div>
);

export default Tooltip;
