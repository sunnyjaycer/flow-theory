import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';

export const SecondaryButton = (
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  return (
    <button
      {...props}
      className="p-2 px-4 rounded-md font-bold bg-blue-0 text-white"
    ></button>
  );
};
