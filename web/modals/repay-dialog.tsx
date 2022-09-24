import { Dispatch, SetStateAction } from 'react';
import { Dialog } from '../components/dialog';
import { DialogColumn } from '../components/dialog-column';
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
            <input
              placeholder="0"
              className="bg-background text-xl font-thin w-full mb-4 h-12 px-4"
              value={repayAmount}
              onChange={(e) => onChangeNumberAmount(e, setRepayAmount)}
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
