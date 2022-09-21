import { ReactNode } from 'react';
import { Dialog as ReachDialog } from '@reach/dialog';

export interface DialogProps {
  isOpen: boolean;
  onDismiss: VoidFunction;
  'aria-label': string;
}

export const Dialog = ({
  children,
  ...dialogProps
}: { children: ReactNode } & DialogProps) => {
  return (
    <ReachDialog
      {...dialogProps}
      className="bg-blue-3 text-white rounded-lg p-8 px-8 text-center max-w-3xl"
    >
      {children}
    </ReachDialog>
  );
};
