import { BigNumber } from 'ethers';
import { Dispatch, SetStateAction } from 'react';
import { Dialog } from '../../components/dialog';
import { DialogColumn } from '../../components/dialog-column';
import { DialogInput } from '../../components/dialog-input';
import { GradientText } from '../../components/gradient-text';
import { PrimaryButton } from '../../components/primary-button';
import { DECIMALS } from '../../constants';
import { onChangeNumberAmount } from '../../helpers/number-helpers';
// gelato crypto recurring
// acl approval needs to be done for lending core contract
// IDA subscribe has to be done for insterest manager

export const WithdrawDialog = ({
  withdrawAmount,
  setWithdrawAmount,
  showDialog,
  closeDialog,
  onApprove,
}: {
  withdrawAmount: string;
  setWithdrawAmount: Dispatch<SetStateAction<string>>;
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

      <div className="text-right mt-4">
        <PrimaryButton onClick={onApprove}>Approve</PrimaryButton>
      </div>
    </Dialog>
  );
};
