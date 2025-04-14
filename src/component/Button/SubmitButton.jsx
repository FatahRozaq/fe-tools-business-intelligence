import React from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const SubmitButton = ({
  text = 'Submit',
  onClick,
  className = '',
  style = {},
  icon = <FaPaperPlane className="me-2" />,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn d-flex align-items-center justify-content-center py-2 h-25 w-100 mt-3 ${className}`}
      style={{
        backgroundColor: '#000080',
        color: 'white',
        borderRadius: '0.375rem',
        ...style,
      }}
    >
      {icon}
      {text}
    </button>
  );
};

export default SubmitButton;
