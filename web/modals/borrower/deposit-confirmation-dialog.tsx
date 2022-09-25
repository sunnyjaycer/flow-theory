import { Dialog } from '../../components/dialog';
import Image from 'next/image';
import { PrimaryButton } from '../../components/primary-button';
import { SecondaryButton } from '../../components/secondary-button';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { useLendingCoreAddress } from '../../hooks/use-lending-core-address';
import { DialogColumn } from '../../components/dialog-column';
import { useTokenPrices } from '../../hooks/use-token-prices';
import { useWriteWithWait } from '../../hooks/use-write-with-wait';
import { parseEther } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

export const DepositConfirmationDialog = ({
  collateralRatio,
  depositAmount,
  showDialog,
  closeDialog,
  onBack,
}: {
  collateralRatio: BigNumber;
  depositAmount: string;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onBack: VoidFunction;
}) => {
  const formattedDepositAmount = parseEther(
    depositAmount === '' ? '0' : depositAmount
  );

  const { contractAddress: lendingCoreAddress, abi: lendingCoreAbi } =
    useLendingCoreAddress();
  const { config, error } = usePrepareContractWrite({
    addressOrName: lendingCoreAddress,
    contractInterface: lendingCoreAbi,
    functionName: 'depositCollateral(uint256)',
    args: [formattedDepositAmount],
    enabled: showDialog,
  });
  const { writeAsync: confirmDeposit } = useContractWrite(config);
  const { collateralTokenPrice, granularity } = useTokenPrices();
  const depositDollarAmount = collateralTokenPrice
    .mul(BigNumber.from(depositAmount === '' ? '0' : depositAmount))
    .div(granularity);

  const {
    callWithWait: onClickConfirmDeposit,
    loading: loadingConfirmDeposit,
  } = useWriteWithWait(confirmDeposit, async () => closeDialog());

  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Deposit Overlay"
    >
      <div className="flex gap-4 mb-4">
        <div className="flex-1 text-left">
          <DialogColumn title="Collateral">
            <Image
              src="/weth-logo.png"
              width={50}
              height={50}
              alt="WETH Logo"
            />
            <p className="font-bold text-brand-blue text-3xl">
              {depositAmount.toString()}
            </p>
            {/* Assuming the collateral amount is always USDC for now */}
            <p className="font-thin text-blue--3">
              ${depositDollarAmount.toString()}
            </p>
          </DialogColumn>
        </div>
      </div>

      <div className="text-left mb-4">
        <p className="font-bold text-lg">Collateral Ratio</p>
        <p className="font-thin text-3xl">{collateralRatio.toString()}</p>
      </div>

      <div className="flex justify-between">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton
          onClick={onClickConfirmDeposit}
          disabled={loadingConfirmDeposit}
          isLoading={loadingConfirmDeposit}
        >
          Confirm
        </PrimaryButton>
      </div>
    </Dialog>
  );
};
