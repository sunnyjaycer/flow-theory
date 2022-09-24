import { Dialog } from '../../components/dialog';
import { DialogColumn } from '../../components/dialog-column';
import { GradientText } from '../../components/gradient-text';
import { PrimaryButton } from '../../components/primary-button';
import { DECIMALS } from '../../constants';
import Image from 'next/image';

export const WithdrawConfirmationDialog = ({
  withdrawAmount,
  interestGained,
  showDialog,
  closeDialog,
}: {
  withdrawAmount: number;
  interestGained: number;
  showDialog: boolean;
  closeDialog: VoidFunction;
}) => {
  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Withdrawal Success Overlay"
    >
      <div className="text-left">
        <DialogColumn title="Withdrawal Success!">
          <div>
            <Image src="/usdc-logo.png" width={50} height={50} alt="" />
          </div>
          <GradientText className="text-4xl font-bold mt-4">
            {withdrawAmount.toFixed(DECIMALS)}
          </GradientText>
          <p className="font-thin text-blue--3 mb-4">${withdrawAmount}</p>
          <p className="font-bold text-lg">Interest Gained</p>
          <p className="font-thin text-2xl">
            ${interestGained.toFixed(DECIMALS)}
          </p>
        </DialogColumn>
        <div className="text-right">
          <PrimaryButton onClick={closeDialog}>👍 Got it</PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};
