import React from 'react';

const Button = ({ text, disabled, onClick }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
        >
            {text}
        </button>
    );
};

export default Button;