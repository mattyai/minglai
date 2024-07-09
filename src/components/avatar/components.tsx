import React, {ButtonHTMLAttributes, InputHTMLAttributes} from 'react';

// Button Component
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'secondary' | 'destructive';
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  variant = 'default',
                                                  className = '',
                                                  ...props
                                              }) => {
    const baseStyle = 'px-4 py-2 rounded font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75';
    const variantStyles = {
        default: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300',
        destructive: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    };

    return (
        <button
            className={`${baseStyle} ${variantStyles[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

// Input Component
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
}

export const Input: React.FC<InputProps> = ({className = '', ...props}) => (
    <input
        className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
    />
);
