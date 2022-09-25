import { parseEther } from 'ethers/lib/utils';
import { Dispatch, SetStateAction, useState } from 'react';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { Dialog } from '../../components/dialog';
import { DialogColumn } from '../../components/dialog-column';
import { DialogInput } from '../../components/dialog-input';
import { PrimaryButton } from '../../components/primary-button';
import { useLendingCoreAddress } from '../../hooks/use-lending-core-address';

export const DepositDialog = ({
  depositAmount,
  setDepositAmount,
  showDialog,
  closeDialog,
  onApprove,
}: {
  depositAmount: string;
  setDepositAmount: Dispatch<SetStateAction<string>>;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onApprove: VoidFunction;
}) => {
  const formattedDepositAmount = parseEther(
    depositAmount === '' ? '0' : depositAmount
  );
  const { contractAddress, abi } = useLendingCoreAddress();
  const { config, error } = usePrepareContractWrite({
    addressOrName: contractAddress,
    contractInterface: abi,
    functionName: 'depositLiquidity(uint256)',
    args: [formattedDepositAmount],
  });
  const { writeAsync: confirmDeposit } = useContractWrite(config);
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const tx = await confirmDeposit?.();
      if (tx === undefined) {
        setIsLoading(false);
        return;
      }

      await tx.wait();
      setIsLoading(false);
      onApprove();
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Deposit Overlay"
    >
      <div className="text-left">
        <DialogColumn title="Deposit">
          <DialogInput
            value={depositAmount}
            label="Amount"
            onChange={setDepositAmount}
            icon={'/usdc-logo.png'}
            className="mb-4"
          />
          <p className="font-thin text-blue--3 mb-4">Only deposit USDC</p>
          <p className="font-thin text-blue--3 mb-4">
            Interest paid out once a day
          </p>
        </DialogColumn>
      </div>
      <div className="text-right">
        <PrimaryButton
          onClick={onClick}
          isLoading={isLoading}
          disabled={isLoading}
        >
          Approve
        </PrimaryButton>
      </div>
    </Dialog>
  );
};
