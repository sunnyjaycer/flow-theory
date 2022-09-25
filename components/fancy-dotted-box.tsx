import { ReactNode } from 'react';

export const FancyDottedBox = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-full mx-8 md:mx-16 rounded-2xl bg-gradient-to-b from-brand-blue to-brand-purple">
      <div className="h-full  border-background border-2 rounded-2xl  border-dashed">
        <div className="h-full bg-background p-16 py-32 w-full rounded-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};
