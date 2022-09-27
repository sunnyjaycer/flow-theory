import { Dialog } from '../../components/dialog';
import Image from 'next/image';
import { PrimaryButton } from '../../components/primary-button';
import { SecondaryButton } from '../../components/secondary-button';
import { DialogColumn } from '../../components/dialog-column';
import { BigNumber } from 'ethers';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { useLendingCoreAddress } from '../../hooks/use-lending-core-address';
import { useWriteWithWait } from '../../hooks/use-write-with-wait';
import { parseEther } from 'ethers/lib/utils';

export const RepayConfirmationDialog = ({
  repayAmount,
  interestPaid,
  showDialog,
  closeDialog,
  onBack,
}: {
  repayAmount: string;
  interestPaid: BigNumber;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onBack: VoidFunction;
}) => {
  const parsedRepayAmount = parseEther(repayAmount === '' ? '0' : repayAmount);

  const { contractAddress: lendingCoreAddress, abi: lendingCoreAbi } =
    useLendingCoreAddress();
  const { config, error } = usePrepareContractWrite({
    addressOrName: lendingCoreAddress,
    contractInterface: lendingCoreAbi,
    functionName: 'repay',
    args: [parsedRepayAmount],
    enabled: showDialog,
  });
  const { writeAsync: confirmRepay } = useContractWrite(config);
  const { loading: confirmRepayLoading, callWithWait: onClickConfirmRepay } =
    useWriteWithWait(confirmRepay, async () => closeDialog());

  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Repay Confirmation Overlay"
    >
      <div className="mb-4 text-left">
        <DialogColumn title="Repay">
          <Image src="/usdc-logo.png" width={50} height={50} alt="USDC Logo" />
          <p className="font-bold text-brand-blue text-3xl">
            {repayAmount.toString()}
          </p>
          <p className="font-thin text-blue--3 mb-4">
            ${repayAmount.toString()}
          </p>
          {/* <div className="mb-4">
            <p className="font-bold text-lg">Interest Paid</p>
            <p className="font-light text-3xl">
              {interestPaid.toString()} USDCx
            </p>
          </div> */}
        </DialogColumn>
      </div>

      <div className="flex justify-between">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton
          onClick={onClickConfirmRepay}
          isLoading={confirmRepayLoading}
          disabled={confirmRepayLoading}
        >
          Confirm
        </PrimaryButton>
      </div>
    </Dialog>
  );
};
