import { formatEther, parseEther } from 'ethers/lib/utils';
import { Dispatch, SetStateAction, useState } from 'react';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { Dialog } from '../../components/dialog';
import { DialogColumn } from '../../components/dialog-column';
import { DialogInput } from '../../components/dialog-input';
import { PrimaryButton } from '../../components/primary-button';
import { useLendingCoreAddress } from '../../hooks/use-lending-core-address';

export const WithdrawDialog = ({
  withdrawAmount,
  setWithdrawAmount,
  maxWithdrawAmount,
  showDialog,
  closeDialog,
  onApprove,
}: {
  withdrawAmount: string;
  setWithdrawAmount: Dispatch<SetStateAction<string>>;
  maxWithdrawAmount: number;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onApprove: VoidFunction;
}) => {
  const formattedWithdrawAmount = parseEther(
    withdrawAmount === '' ? '0' : withdrawAmount
  );
  const formattedMaxWithdrawAmount = formatEther(maxWithdrawAmount.toString());
  const { contractAddress, abi } = useLendingCoreAddress();
  const { config, error } = usePrepareContractWrite({
    addressOrName: contractAddress,
    contractInterface: abi,
    functionName: 'withdrawLiquidity(uint256)',
    args: [formattedWithdrawAmount],
  });
  const { writeAsync: confirmWIthdraw } = useContractWrite(config);
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const tx = await confirmWIthdraw?.();
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
      aria-label="Withdraw Overlay"
    >
      <div className="text-left">
        <DialogColumn title="Withdraw">
          <DialogInput
            value={withdrawAmount}
            label="Amount"
            onChange={setWithdrawAmount}
            icon={'/usdc-logo.png'}
            className="mb-4"
            buttonText="Use Max"
            onButtonPress={() => setWithdrawAmount(formattedMaxWithdrawAmount)}
          />
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
