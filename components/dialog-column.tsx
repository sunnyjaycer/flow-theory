import { ReactNode } from 'react';

export const DialogColumn = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  return (
    <div>
      <h2 className="text-2xl font-thin mb-4">{title}</h2>
      {children}
    </div>
  );
};
