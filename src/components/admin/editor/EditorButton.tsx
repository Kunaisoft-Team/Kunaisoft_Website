import { type ButtonHTMLAttributes } from 'react';

interface EditorButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  title: string;
}

export const EditorButton = ({ isActive, children, className = '', ...props }: EditorButtonProps) => {
  return (
    <button
      {...props}
      type="button"
      className={`p-2 rounded hover:bg-gray-200 transition-colors ${
        isActive ? 'bg-gray-200 text-primary' : 'text-gray-700'
      } ${className}`}
    >
      {children}
    </button>
  );
};