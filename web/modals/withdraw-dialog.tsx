import { Dispatch, SetStateAction } from 'react';
import { Dialog } from '../components/dialog';
import { DialogColumn } from '../components/dialog-column';
import { DialogInput } from '../components/dialog-input';
import { GradientText } from '../components/gradient-text';
import { PrimaryButton } from '../components/primary-button';
import { DECIMALS } from '../constants';
import { onChangeNumberAmount } from '../helpers/number-helpers';
// gelato crypto recurring
// acl approval needs to be done for lending core contract
// IDA subscribe has to be done for insterest manager

export const WithdrawDialog = ({
  withdrawAmount,
  setWithdrawAmount,
  repayAmount,
  setRepayAmount,
  newCollateralRatio,
  newInterest,
  showDialog,
  closeDialog,
  onApprove,
}: {
  withdrawAmount: number;
  setWithdrawAmount: Dispatch<SetStateAction<number>>;
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
      aria-label="Withdraw Overlay"
    >
      <div className="flex gap-4">
        <div className="flex-1 text-left">
          <DialogColumn title="Withdraw Collateral">
            <DialogInput
              value={withdrawAmount}
              label="Amount"
              onChange={setWithdrawAmount}
              icon={'/weth-logo.png'}
              className="mb-4"
              buttonText="Use Max"
              // TODO: Max functionality
              onButtonPress={() => {}}
            />
            <p className="font-thin text-blue--3">Only deposit USDC</p>
          </DialogColumn>
        </div>
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
          </DialogColumn>
          <div className="text-right mt-4">
            <PrimaryButton onClick={onApprove}>Approve</PrimaryButton>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
