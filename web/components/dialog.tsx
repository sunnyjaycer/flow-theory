import { ReactNode } from 'react';
import {
  Dialog as ReachDialog,
  DialogOverlay,
  DialogContent,
} from '@reach/dialog';

interface DialogProps {
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
      className="bg-blue-3 text-white rounded-lg p-8 px-8 text-center w-full lg:w-3/5 max-w-3xl"
    >
      {children}
    </ReachDialog>
  );
};
