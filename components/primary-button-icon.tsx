import { ReactNode } from 'react';
import { PrimaryButton } from './primary-button';

export const PrimaryButtonIcon = ({ icon }: { icon: ReactNode }) => {
  return (
    <PrimaryButton>
      <div className="flex">{icon}</div>
    </PrimaryButton>
  );
};
