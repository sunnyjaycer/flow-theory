import { Dispatch, SetStateAction } from 'react';
import { Dialog } from '../components/dialog';
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
          <h2 className="text-2xl font-thin mb-4">Withdraw Collateral</h2>
          <input
            placeholder="0"
            className="bg-background text-xl font-thin w-full mb-4 h-12 px-4"
            value={withdrawAmount}
            onChange={(e) => onChangeNumberAmount(e, setWithdrawAmount)}
          />
          <p className="font-thin text-blue--3">Only deposit USDC</p>
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-2xl font-thin mb-4">Repay Loan</h2>
          <input
            placeholder="0"
            className="bg-background text-xl font-thin w-full mb-4 h-12 px-4"
            value={repayAmount}
            onChange={(e) => onChangeNumberAmount(e, setRepayAmount)}
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
          <div className="text-right mt-4">
            <PrimaryButton onClick={onApprove}>Approve</PrimaryButton>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
