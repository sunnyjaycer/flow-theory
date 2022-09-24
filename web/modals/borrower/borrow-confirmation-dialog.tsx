import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { GradientText } from '../../components/gradient-text';
import { PrimaryButton } from '../../components/primary-button';
import { SecondaryButton } from '../../components/secondary-button';
import { DECIMALS } from '../../constants';
import { useLendingCoreAddress } from '../../hooks/use-lending-core-address';
import LendingCore from '../../../artifacts/contracts/LendingCore.sol/LendingCore.json';
import { Dialog } from '../../components/dialog';
import Image from 'next/image';
import { wethToUSD } from '../../helpers/conversion';
import { DialogColumn } from '../../components/dialog-column';

export const BorrowConfirmationDialog = ({
  collateralAmount,
  borrowAmount,
  collateralRatio,
  interest,
  showDialog,
  closeDialog,
  onBack,
}: {
  collateralAmount: number;
  borrowAmount: number;
  collateralRatio: number;
  interest: number;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onBack: VoidFunction;
}) => {
  const borrowAmountInUSD = wethToUSD(borrowAmount);

  // const lendingCoreAddress = useLendingCoreAddress();
  // console.log('lendingCoreAddress', lendingCoreAddress);
  // const { config, error } = usePrepareContractWrite({
  //   addressOrName: lendingCoreAddress,
  //   contractInterface: LendingCore.abi,
  //   functionName: 'borrow(uint256)',
  //   args: [borrowAmount],
  // });
  // const { write: confirmBorrow } = useContractWrite(config);

  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Borrow confirmation Overlay"
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
              {collateralAmount}
            </p>
            {/* Assuming the collateral amount is always USDC for now */}
            <p className="font-thin text-blue--3">${collateralAmount}</p>
          </DialogColumn>
        </div>

        <div className="flex-1 text-left">
          <h2 className="text-2xl font-thin mb-4">Borrow</h2>
          <Image src="/weth-logo.png" width={50} height={50} alt="USDC Logo" />
          <p className="font-bold text-brand-blue text-3xl">{borrowAmount}</p>
          <p className="font-thin text-blue--3">${borrowAmountInUSD}</p>
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
            console.log('Calling confirmBorrow');
            // console.log('confirmBorrow', confirmBorrow);
            // confirmBorrow?.();
          }}
        >
          Confirm
        </PrimaryButton>
      </div>
    </Dialog>
  );
};
