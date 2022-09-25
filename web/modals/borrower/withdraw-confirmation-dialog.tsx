import { Dialog } from '../../components/dialog';
import Image from 'next/image';
import { wethToUSD } from '../../helpers/conversion';
import { PrimaryButton } from '../../components/primary-button';
import { SecondaryButton } from '../../components/secondary-button';
import { DECIMALS } from '../../constants';
import { DialogColumn } from '../../components/dialog-column';
import { BigNumber } from 'ethers';

export const WithdrawConfirmationDialog = ({
  withdrawAmount,
  repayAmount,
  interestPaid,
  showDialog,
  closeDialog,
  onBack,
}: {
  withdrawAmount: BigNumber;
  repayAmount: BigNumber;
  interestPaid: BigNumber;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onBack: VoidFunction;
}) => {
  const repayAmountInUSD = wethToUSD(repayAmount);

  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Withdraw Confirmation Overlay"
    >
      <div className="flex gap-4 mb-4">
        <div className="flex-1 text-left">
          <DialogColumn title="Withdraw">
            <Image
              src="/usdc-logo.png"
              width={50}
              height={50}
              alt="USDC Logo"
            />
            <p className="font-bold text-brand-blue text-3xl">
              {withdrawAmount.toString()}
            </p>
            {/* Assuming the collateral amount is always USDC for now */}
            <p className="font-thin text-blue--3">
              ${withdrawAmount.toString()}
            </p>
          </DialogColumn>
        </div>

        <div className="flex-1 text-left">
          <DialogColumn title="Repay">
            <Image
              src="/weth-logo.png"
              width={50}
              height={50}
              alt="WETH Logo"
            />
            <p className="font-bold text-brand-blue text-3xl">
              {repayAmount.toString()}
            </p>
            <p className="font-thin text-blue--3">
              ${repayAmountInUSD.toString()}
            </p>
          </DialogColumn>
        </div>
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
