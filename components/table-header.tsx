import { ReactNode } from 'react';

export const TableHeader = ({ children }: { children: ReactNode }) => {
  return <h1 className="bg-blue-3 p-4 font-thin mb-4 text-2xl">{children}</h1>;
};
