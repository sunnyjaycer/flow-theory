import Image from 'next/image';
import { Dialog } from '../../components/dialog';
import { DialogColumn } from '../../components/dialog-column';
import { GradientText } from '../../components/gradient-text';
import { PrimaryButton } from '../../components/primary-button';
import { DECIMALS } from '../../constants';

export const DepositConfirmationDialog = ({
  depositAmount,
  showDialog,
  closeDialog,
}: {
  depositAmount: number;
  showDialog: boolean;
  closeDialog: VoidFunction;
}) => {
  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Deposit Success Overlay"
    >
      <div className="text-left">
        <DialogColumn title="Deposit Success!">
          <div>
            <Image src="/usdc-logo.png" width={50} height={50} alt="" />
          </div>
          <GradientText className="text-4xl font-bold mt-4">
            {depositAmount.toFixed(DECIMALS)}
          </GradientText>
          <p className="font-thin text-blue--3 mb-4">${depositAmount}</p>
          <div className="font-bold text-lg flex gap-2 mb-4">
            <span>Interest rate</span>
            <GradientText className="inline font-bold">1%</GradientText>
          </div>
        </DialogColumn>
        <div className="text-right">
          <PrimaryButton onClick={closeDialog}>👍 Got it</PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};
