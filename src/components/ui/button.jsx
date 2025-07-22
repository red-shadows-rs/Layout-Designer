import React from "react";

export function Button({ children, className = '', variant = 'default', ...props }) {
  const base = 'px-4 py-2 rounded text-white font-bold transition-all';
  const styles = {
    default: 'bg-purple-600 hover:bg-purple-700',
    outline: 'border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white',
    ghost: 'text-gray-600 hover:text-black',
  };
  return (
    <button className={`${base} ${styles[variant] || ''} ${className}`} {...props}>
      {children}
    </button>
  );
}
