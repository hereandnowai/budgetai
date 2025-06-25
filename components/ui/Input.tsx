
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  wrapperClassName?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', wrapperClassName = '', id, ...props }) => {
  const inputId = id || props.name || `input-${Math.random().toString(36).substring(7)}`;
  return (
    <div className={` ${wrapperClassName}`}>
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        id={inputId}
        className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm ${className}`}
        {...props}
      />
    </div>
  );
};
