import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';

export const PrimaryButton = (
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  return (
    <button
      {...props}
      className="p-2 px-4 rounded-md font-bold bg-brand-blue text-white"
    ></button>
  );
};
