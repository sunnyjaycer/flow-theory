import { Dispatch, SetStateAction } from 'react';
import { Dialog } from '../components/dialog';
import { DialogColumn } from '../components/dialog-column';
import { DialogInput } from '../components/dialog-input';
import { GradientText } from '../components/gradient-text';
import { PrimaryButton } from '../components/primary-button';
import { DECIMALS } from '../constants';
import { onChangeNumberAmount } from '../helpers/number-helpers';

export const RepayDialog = ({
  repayAmount,
  setRepayAmount,
  newCollateralRatio,
  newInterest,
  showDialog,
  closeDialog,
  onApprove,
}: {
  repayAmount: number;
  setRepayAmount: Dispatch<SetStateAction<number>>;
  newCollateralRatio?: number;
  newInterest: number;
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
              value={repayAmount}
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
              : newCollateralRatio.toFixed(DECIMALS)}{' '}
          </span>
        </div>
        <GradientText className="mb-4">
          <span className="font-bold">Fixed APR: </span>
          <span className="font-thin">1%</span>
        </GradientText>
        <div className="mb-4">
          <span className="font-bold">New Interest: </span>
          <span>{newInterest.toFixed(DECIMALS)}</span>
        </div>
        <div>
          <PrimaryButton onClick={onApprove}>Approve</PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};
