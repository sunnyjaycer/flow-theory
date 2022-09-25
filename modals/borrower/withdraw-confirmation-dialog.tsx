import { Dialog } from '../../components/dialog';
import Image from 'next/image';
import { PrimaryButton } from '../../components/primary-button';
import { SecondaryButton } from '../../components/secondary-button';
import { DialogColumn } from '../../components/dialog-column';
import { BigNumber } from 'ethers';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { useLendingCoreAddress } from '../../hooks/use-lending-core-address';
import { useTokenPrices } from '../../hooks/use-token-prices';
import { useWriteWithWait } from '../../hooks/use-write-with-wait';
import { parseEther } from 'ethers/lib/utils';

export const WithdrawConfirmationDialog = ({
  withdrawAmount,
  interestPaid,
  showDialog,
  closeDialog,
  onBack,
}: {
  withdrawAmount: string;
  interestPaid: BigNumber;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onBack: VoidFunction;
}) => {
  const formattedWithdrawAmount = parseEther(
    withdrawAmount === '' ? '0' : withdrawAmount
  );

  const { contractAddress: lendingCoreAddress, abi: lendingCoreAbi } =
    useLendingCoreAddress();
  const { config, error } = usePrepareContractWrite({
    addressOrName: lendingCoreAddress,
    contractInterface: lendingCoreAbi,
    functionName: 'withdrawCollateral(uint256)',
    args: [formattedWithdrawAmount],
    enabled: showDialog,
  });
  const { writeAsync: confirmWithdraw } = useContractWrite(config);
  const { collateralTokenPrice, granularity } = useTokenPrices();
  const withdrawDollarAmount = collateralTokenPrice
    .mul(BigNumber.from(withdrawAmount === '' ? '0' : withdrawAmount))
    .div(granularity);

  const {
    callWithWait: onClickConfirmWithdraw,
    loading: loadingConfirmWithdraw,
  } = useWriteWithWait(confirmWithdraw, async () => closeDialog());

  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Withdraw Confirmation Overlay"
    >
      <div className="text-left mb-4">
        <DialogColumn title="Withdraw">
          <Image src="/weth-logo.png" width={50} height={50} alt="USDC Logo" />
          <p className="font-bold text-brand-blue text-3xl">
            {withdrawAmount.toString()}
          </p>
          <p className="font-thin text-blue--3">
            ${withdrawDollarAmount.toString()}
          </p>
        </DialogColumn>
      </div>

      <div className="text-left mb-4">
        <p className="font-bold text-lg">Interest Paid</p>
        <p className="font-light text-3xl">{interestPaid.toString()} USDCx</p>
      </div>

      <div className="flex justify-between">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton
          onClick={onClickConfirmWithdraw}
          isLoading={loadingConfirmWithdraw}
          disabled={loadingConfirmWithdraw}
        >
          Confirm
        </PrimaryButton>
      </div>
    </Dialog>
  );
};
