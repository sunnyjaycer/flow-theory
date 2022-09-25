import { Dialog } from '../../components/dialog';
import { Dispatch, SetStateAction } from 'react';
import { DECIMALS } from '../../constants';
import { PrimaryButton } from '../../components/primary-button';
import { DialogColumn } from '../../components/dialog-column';
import { DialogInput } from '../../components/dialog-input';
import { BigNumber } from 'ethers';

export const DepositDialog = ({
  depositAmount,
  setDepositAmount,
  newCollateralRatio,
  showDialog,
  closeDialog,
  onApprove,
}: {
  depositAmount: BigNumber;
  setDepositAmount: Dispatch<SetStateAction<BigNumber>>;
  newCollateralRatio?: BigNumber;
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
          <DialogColumn title="Deposit Collateral">
            <DialogInput
              value={depositAmount.toString()}
              label="Amount"
              onChange={setDepositAmount}
              icon={'/weth-logo.png'}
              className="mb-4"
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
        <div>
          <PrimaryButton onClick={onApprove}>Approve</PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
};
