import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';

export const SuperButton = (
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
) => {
  return (
    <button
      {...props}
      className="p-2 px-4 rounded-md font-bold bg-gradient-to-b from-brand-blue to-brand-purple"
    ></button>
  );
};
