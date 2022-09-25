import { BigNumber } from 'ethers';
import { Dispatch, SetStateAction } from 'react';
import { Dialog } from '../../components/dialog';
import { DialogColumn } from '../../components/dialog-column';
import { DialogInput } from '../../components/dialog-input';
import { GradientText } from '../../components/gradient-text';
import { PrimaryButton } from '../../components/primary-button';

export const RepayDialog = ({
  repayAmount,
  setRepayAmount,
  newCollateralRatio,
  newInterest,
  showDialog,
  closeDialog,
  onApprove,
}: {
  repayAmount: string;
  setRepayAmount: Dispatch<SetStateAction<string>>;
  newCollateralRatio?: BigNumber;
  newInterest: string;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onApprove: VoidFunction;
}) => {
  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Repay Overlay"
    >
      <div className="text-left">
        <div className="flex-1 text-left">
          <DialogColumn title="Repay Loan">
            <DialogInput
              value={repayAmount.toString()}
              label="Amount"
              onChange={setRepayAmount}
              icon={'/usdc-logo.png'}
              className="mb-4"
              buttonText="Use Max"
              // TODO: Max functionality
              onButtonPress={() => {}}
            />
          </DialogColumn>
        </div>
        <div className="mb-4">
          <span className="font-bold">New Collateral Ratio: </span>
          <span>
            {newCollateralRatio === undefined
              ? '--:--'
              : newCollateralRatio.toString()}{' '}
          </span>
        </div>
        <GradientText className="mb-4">
          <span className="font-bold">Fixed APR: </span>
          <span className="font-thin">1%</span>
        </GradientText>
        <div className="mb-4">
          <span className="font-bold">New Interest: </span>
          <span>{newInterest}</span>
        </div>
        <div>
          <PrimaryButton onClick={onApprove}>Approve</PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};
