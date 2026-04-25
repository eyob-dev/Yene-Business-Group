import React from 'react';

export const Button = ({ children, className = '', onClick, type = 'button', disabled = false }: { children: React.ReactNode, className?: string, onClick?: () => void, type?: 'button' | 'submit', disabled?: boolean }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-colors ${className}`}
  >
    {children}
  </button>
);
