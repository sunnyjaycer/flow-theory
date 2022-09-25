import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';

export const PrimaryButton = ({
  children,
  isLoading,
  ...props
}: DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  isLoading?: boolean;
}) => {
  return (
    <button
      {...props}
      className="p-2 px-4 rounded-md font-bold bg-brand-blue text-white disabled:bg-gray-700"
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
