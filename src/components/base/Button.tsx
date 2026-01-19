import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}: ButtonProps) {
  const baseStyles = 'whitespace-nowrap cursor-pointer font-medium transition-all duration-300 rounded-lg';
  
  const variants = {
    primary: 'bg-[#FF8C00] text-white hover:bg-[#e67e00] shadow-md hover:shadow-lg',
    secondary: 'bg-[#0056b3] text-white hover:bg-[#004494] shadow-md hover:shadow-lg',
    outline: 'border-2 border-[#FF8C00] text-[#FF8C00] hover:bg-[#FF8C00] hover:text-white'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}