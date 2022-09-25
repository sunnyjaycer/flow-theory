import { Dialog } from '../../components/dialog';
import Image from 'next/image';
import { wethToUSD } from '../../helpers/conversion';
import { DECIMALS } from '../../constants';
import { PrimaryButton } from '../../components/primary-button';
import { SecondaryButton } from '../../components/secondary-button';
import { DialogColumn } from '../../components/dialog-column';
import { BigNumber } from 'ethers';

export const RepayConfirmationDialog = ({
  repayAmount,
  interestPaid,
  showDialog,
  closeDialog,
  onBack,
}: {
  repayAmount: string;
  interestPaid: BigNumber;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onBack: VoidFunction;
}) => {
  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Repay Confirmation Overlay"
    >
      <div className="mb-4">
        <DialogColumn title="Repay">
          <Image src="/usdc-logo.png" width={50} height={50} alt="USDC Logo" />
          <p className="font-bold text-brand-blue text-3xl">
            {repayAmount.toString()}
          </p>
          <p className="font-thin text-blue--3">${repayAmount.toString()}</p>
        </DialogColumn>
      </div>

      <div className="text-left mb-4">
        <p className="font-bold text-lg">Interest Paid</p>
        <p className="font-light text-3xl">{interestPaid.toString()} USDCx</p>
      </div>

      <div className="flex justify-between">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton
          onClick={() => {
            // TODO: Call contract to do withdrawal
          }}
        >
          Confirm
        </PrimaryButton>
      </div>
    </Dialog>
  );
};
