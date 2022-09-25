import {
  usePrepareContractWrite,
  useContractWrite,
  useNetwork,
  useProvider,
  useAccount,
  useSigner,
} from 'wagmi';
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
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { useWriteWithWait } from '../../hooks/use-write-with-wait';
import { Framework, IWeb3FlowOperatorData } from '@superfluid-finance/sdk-core';
import { useEffect, useState } from 'react';
import { useUsdcxAddress } from '../../hooks/use-usdcx-address';

const useSfPermissions = () => {
  const { chain } = useNetwork();
  const provider = useProvider();

  const { address: owner } = useAccount();
  const { data: signer } = useSigner();
  const { contractAddress: usdcxAddress } = useUsdcxAddress();
  const { contractAddress: lendingCoreAddress } = useLendingCoreAddress();
  const [operatorData, setOperatorData] = useState<IWeb3FlowOperatorData>();

  useEffect(() => {
    const func = async () => {
      const sf = await Framework.create({
        chainId: chain?.id ?? 1,
        provider: provider,
      });

      let data = await sf.cfaV1.getFlowOperatorData({
        sender: owner ?? '',
        superToken: usdcxAddress,
        flowOperator: lendingCoreAddress,
        providerOrSigner: provider,
      });
      setOperatorData(data);
    };
    func();
  }, []);

  const grantSfPermissions = async () => {
    if (signer == null) return;

    const sf = await Framework.create({
      chainId: chain?.id ?? 1,
      provider: provider,
    });

    const tx = await sf.cfaV1.authorizeFlowOperatorWithFullControl({
      superToken: usdcxAddress,
      flowOperator: lendingCoreAddress,
    });
    const exec = await tx.exec(signer);
    await exec.wait();
  };

  return { operatorData, grantSfPermissions };
};

export const BorrowConfirmationDialog = ({
  collateralAmount,
  borrowAmount,
  collateralRatio,
  interest,
  showDialog,
  closeDialog,
  onBack,
}: {
  collateralAmount: string;
  borrowAmount: string;
  collateralRatio: BigNumber;
  interest: string;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onBack: VoidFunction;
}) => {
  const parsedBorrowAmount = parseEther(
    borrowAmount === '' ? '0' : borrowAmount
  );
  console.log('parsedBorrowAmount', parsedBorrowAmount.toString());
  const { operatorData, grantSfPermissions } = useSfPermissions();

  const { contractAddress: lendingCoreAddress, abi: lendingCoreAbi } =
    useLendingCoreAddress();
  const { config, error } = usePrepareContractWrite({
    addressOrName: lendingCoreAddress,
    contractInterface: lendingCoreAbi,
    functionName: 'borrow',
    args: [parsedBorrowAmount],
  });
  const { writeAsync: confirmBorrow } = useContractWrite(config);
  const { loading: confirmBorrowLoading, callWithWait: onClickConfirmBorrow } =
    useWriteWithWait(confirmBorrow, async () => closeDialog());

  const sufficientPermissions = operatorData?.permissions === '7';

  const [grantingSfPermissions, setGrantingSfPermissions] = useState(false);
  const onClickAllowFlow = async () => {
    try {
      setGrantingSfPermissions(true);
      await grantSfPermissions();
      setGrantingSfPermissions(false);
    } catch (error) {
      console.error(error);
      setGrantingSfPermissions(false);
    }
  };

  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Borrow confirmation Overlay"
    >
      <div className="mb-4 text-left">
        <DialogColumn title="Borrow">
          <Image src="/usdc-logo.png" width={50} height={50} alt="USDC Logo" />
          <p className="font-bold text-brand-blue text-3xl">{borrowAmount}</p>
          <p className="font-thin text-blue--3">${borrowAmount}</p>
        </DialogColumn>
      </div>

      <div className="text-left mb-4">
        <p className="font-bold text-lg">Collateral Ratio</p>
        <p className="font-thin text-3xl">{collateralRatio.toString()}</p>
        <GradientText className="mb-4 font-bold">Fixed APR 1%</GradientText>
        <div>
          <span className="font-bold">Interest: </span>
          <span className="font-thin">USDC {interest.toString()}/year</span>
        </div>
      </div>

      <div className="flex justify-between">
        <SecondaryButton onClick={onBack}>Back</SecondaryButton>
        {!sufficientPermissions ? (
          <PrimaryButton
            onClick={onClickAllowFlow}
            isLoading={grantingSfPermissions}
            disabled={grantingSfPermissions}
          >
            Allow Flow
          </PrimaryButton>
        ) : (
          <PrimaryButton
            onClick={onClickConfirmBorrow}
            isLoading={confirmBorrowLoading}
            disabled={confirmBorrowLoading}
          >
            Confirm
          </PrimaryButton>
        )}
      </div>
    </Dialog>
  );
};
