import { Dialog } from '../components/dialog';
import { Dispatch, SetStateAction } from 'react';
import { onChangeNumberAmount } from '../helpers/number-helpers';
import { DECIMALS } from '../constants';
import { PrimaryButton } from '../components/primary-button';

export const DepositDialog = ({
  depositAmount,
  setDepositAmount,
  newCollateralRatio,
  showDialog,
  closeDialog,
  onApprove,
}: {
  depositAmount: number;
  setDepositAmount: Dispatch<SetStateAction<number>>;
  newCollateralRatio?: number;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onApprove: VoidFunction;
}) => {
  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Deposit Overlay"
    >
      <div className="text-left">
        <div className="flex-1 text-left">
          <h2 className="text-2xl font-thin mb-4">Add Collateral</h2>
          <input
            placeholder="0"
            className="bg-background text-xl font-thin w-full mb-4 h-12 px-4"
            value={depositAmount}
            onChange={(e) => onChangeNumberAmount(e, setDepositAmount)}
          />
        </div>
        <div className="mb-4">
          <span className="font-bold">New Collateral Ratio: </span>
          <span>
            {newCollateralRatio === undefined
              ? '--:--'
              : newCollateralRatio.toFixed(DECIMALS)}{' '}
          </span>
        </div>
        <div>
          <PrimaryButton onClick={onApprove}>Approve</PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};
