import { Dispatch, SetStateAction, ChangeEvent } from 'react';
import { Dialog } from '../components/dialog';
import { DialogColumn } from '../components/dialog-column';
import { GradientText } from '../components/gradient-text';
import { PrimaryButton } from '../components/primary-button';
import { DECIMALS } from '../constants';
import { onChangeNumberAmount } from '../helpers/number-helpers';

export const BorrowDialog = ({
  collateralAmount,
  setCollateralAmount,
  borrowAmount,
  setBorrowAmount,
  newCollateralRatio,
  newInterest,
  showDialog,
  closeDialog,
  onApprove,
}: {
  collateralAmount: number;
  setCollateralAmount: Dispatch<SetStateAction<number>>;
  borrowAmount: number;
  setBorrowAmount: Dispatch<SetStateAction<number>>;
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
      aria-label="Borrow Overlay"
    >
      <div className="flex gap-4">
        <div className="flex-1 text-left">
          <DialogColumn title="Add Collateral">
            <input
              placeholder="0"
              className="bg-background text-xl font-thin w-full mb-4 h-12 px-4"
              value={collateralAmount}
              onChange={(e) => onChangeNumberAmount(e, setCollateralAmount)}
            />
            <p className="font-thin text-blue--3">Only deposit USDC</p>
          </DialogColumn>
        </div>
        <div className="flex-1 text-left">
          <DialogColumn title="Borrow">
            <input
              placeholder="0"
              className="bg-background text-xl font-thin w-full mb-4 h-12 px-4"
              value={borrowAmount}
              onChange={(e) => onChangeNumberAmount(e, setBorrowAmount)}
            />
          </DialogColumn>
          <div className="mb-4">
            <span className="font-bold">New Collateral Ratio: </span>
            <span>
              {newCollateralRatio === undefined
                ? '--:--'
                : newCollateralRatio.toFixed(DECIMALS)}{' '}
            </span>
          </div>

          <GradientText className="mb-4 font-bold">Fixed APR 1%</GradientText>

          <div className="mb-4">
            <span className="font-bold">New Interest: </span>
            <span>{newInterest.toFixed(DECIMALS)}/year</span>
          </div>
          <div className="text-right mt-4">
            <PrimaryButton onClick={onApprove}>Approve</PrimaryButton>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
