import { Dialog } from '../../components/dialog';
import Image from 'next/image';
import { GradientText } from '../../components/gradient-text';
import { PrimaryButton } from '../../components/primary-button';
import { SecondaryButton } from '../../components/secondary-button';
import { DECIMALS } from '../../constants';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { useLendingCoreAddress } from '../../hooks/use-lending-core-address';
import LendingCore from '../../../artifacts/contracts/LendingCore.sol/LendingCore.json';
import { DialogColumn } from '../../components/dialog-column';

export const DepositConfirmationDialog = ({
  collateralRatio,
  interest,
  depositAmount,
  showDialog,
  closeDialog,
  onBack,
}: {
  collateralRatio: number;
  interest: number;
  depositAmount: number;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onBack: VoidFunction;
}) => {
  const lendingCoreAddress = useLendingCoreAddress();
  const { config, error } = usePrepareContractWrite({
    addressOrName: lendingCoreAddress,
    contractInterface: LendingCore.abi,
    functionName: 'depositCollateral(uint256)',
    args: [depositAmount],
  });
  const { write: confirmDeposit } = useContractWrite(config);

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
              src="/usdc-logo.png"
              width={50}
              height={50}
              alt="USDC Logo"
            />
            <p className="font-bold text-brand-blue text-3xl">
              {depositAmount}
            </p>
            {/* Assuming the collateral amount is always USDC for now */}
            <p className="font-thin text-blue--3">${depositAmount}</p>
          </DialogColumn>
        </div>
      </div>

      <div className="text-left mb-4">
        <p className="font-bold text-lg">Collateral Ratio</p>
        <p className="font-thin text-3xl">
          {collateralRatio.toFixed(DECIMALS)}
        </p>
        <GradientText className="mb-4 font-bold">Fixed APR 1%</GradientText>
        <div>
          <span className="font-bold">Interest: </span>
          <span className="font-thin">
            USDC {interest.toFixed(DECIMALS)}/year
          </span>
        </div>
      </div>

      <div className="flex justify-between">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        <PrimaryButton
          onClick={() => {
            confirmDeposit?.();
          }}
        >
          Confirm
        </PrimaryButton>
      </div>
    </Dialog>
  );
};
