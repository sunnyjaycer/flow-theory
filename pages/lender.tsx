import { useEffect, useState } from 'react';
import { FancyDottedBox } from '../components/fancy-dotted-box';
import { PrimaryButton } from '../components/primary-button';
import { DepositConfirmationDialog } from '../modals/lender/deposit-confirmation-dialog';
import { DepositDialog } from '../modals/lender/deposit-dialog';
import { PlusIcon } from '../svg/plus-icon';
import ERC20 from '../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useProvider,
  useSigner,
} from 'wagmi';
import { useLendingCoreAddress } from '../hooks/use-lending-core-address';
import { BigNumber, ethers } from 'ethers';
import { TableHeader } from '../components/table-header';
import Image from 'next/image';
import { DECIMALS } from '../constants';
import { formatEther } from 'ethers/lib/utils';
import { SecondaryButton } from '../components/secondary-button';
import { MinusIcon } from '../svg/minux-icon';
import { WithdrawDialog } from '../modals/lender/withdraw-dialog';
import { Loading } from '../components/loading';
import { WithdrawConfirmationDialog } from '../modals/lender/withdraw-confirmation-dialog';
import { useUsdcxAddress } from '../hooks/use-usdcx-address';
import { useWriteWithWait } from '../hooks/use-write-with-wait';
import {
  IWeb3FlowOperatorData,
  Framework,
  IWeb3Subscription,
} from '@superfluid-finance/sdk-core';
import { useInterestManagerAddress } from '../hooks/use-interest-manager-address';

type CurrentDialog =
  | 'depositDialog'
  | 'depositConfirmationDialog'
  | 'withdrawDialog'
  | 'withdrawConfirmationDialog'
  | undefined;

const Lender = () => {
  const [currentDialog, setCurrentDialog] = useState<CurrentDialog>();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const { address: owner } = useAccount();
  const { contractAddress: lendingCoreAddress, abi: lendingCoreAbi } =
    useLendingCoreAddress();
  const {
    data: lenderProfile,
    refetch: refetchLenderProfiles,
    isFetching: fetchingAllowance,
  } = useContractRead({
    addressOrName: lendingCoreAddress,
    contractInterface: lendingCoreAbi,
    functionName: 'lenderProfiles',
    args: [owner],
    enabled: owner !== undefined,
  });

  const exitDialog = () => {
    setCurrentDialog(undefined);
    setDepositAmount('');
    setWithdrawAmount('');
    refetchLenderProfiles();
  };

  // TODO: This needs to come from contract
  const interestGained = 10;

  if (fetchingAllowance) {
    return <Loading />;
  }

  const currentLendAmount = (lenderProfile ??
    BigNumber.from(0)) as any as BigNumber;

  return (
    <>
      {currentLendAmount.eq(0) ? (
        <NoLends
          openDialog={() => {
            setCurrentDialog('depositDialog');
          }}
        />
      ) : (
        <LendsTable
          currentLendAmount={currentLendAmount}
          openDepositDialog={() => setCurrentDialog('depositDialog')}
          openWithdrawDialog={() => setCurrentDialog('withdrawDialog')}
        />
      )}
      <DepositDialog
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
        showDialog={currentDialog === 'depositDialog'}
        closeDialog={exitDialog}
        onApprove={() => setCurrentDialog('depositConfirmationDialog')}
      />
      <DepositConfirmationDialog
        depositAmount={depositAmount}
        showDialog={currentDialog === 'depositConfirmationDialog'}
        closeDialog={exitDialog}
      />
      <WithdrawDialog
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        maxWithdrawAmount={currentLendAmount}
        showDialog={currentDialog === 'withdrawDialog'}
        closeDialog={exitDialog}
        onApprove={() => setCurrentDialog('withdrawConfirmationDialog')}
      />
      <WithdrawConfirmationDialog
        withdrawAmount={withdrawAmount}
        interestGained={interestGained}
        showDialog={currentDialog === 'withdrawConfirmationDialog'}
        closeDialog={exitDialog}
      />
    </>
  );
};

const useSfIda = () => {
  const { chain } = useNetwork();
  const provider = useProvider();

  const { address: owner } = useAccount();
  const { data: signer } = useSigner();
  const { contractAddress: usdcxAddress } = useUsdcxAddress();
  const { contractAddress: interestManagerAddress } =
    useInterestManagerAddress();
  const { contractAddress: lendingCoreAddress } = useLendingCoreAddress();
  const [subscriptionData, setSubscriptionData] = useState<IWeb3Subscription>();
  const [createdIdaIndex, setCreatedIdaIndex] = useState(false);
  const indexId = '0';
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const func = async () => {
      if (!owner) return;

      const sf = await Framework.create({
        chainId: chain?.id ?? provider.network.chainId,
        provider: provider,
      });

      let data = await sf.idaV1.getSubscription({
        superToken: usdcxAddress,
        publisher: interestManagerAddress,
        indexId,
        subscriber: owner,
        providerOrSigner: provider,
      });
      setSubscriptionData(data);
    };
    func();
  }, [createdIdaIndex]);

  const approveIdaSubscription = async () => {
    if (signer == null) return;

    setLoading(true);
    const sf = await Framework.create({
      chainId: chain?.id ?? 1,
      provider: provider,
    });

    const tx = await sf.idaV1.approveSubscription({
      indexId,
      superToken: usdcxAddress,
      publisher: interestManagerAddress,
    });
    const exec = await tx.exec(signer);
    await exec.wait();
    setCreatedIdaIndex(true);
    setLoading(false);
  };

  return { subscriptionData, approveIdaSubscription, loading };
};

const NoLends = ({ openDialog }: { openDialog: VoidFunction }) => {
  const { address: owner } = useAccount();
  const { contractAddress: lendingCoreAddress } = useLendingCoreAddress();
  const { contractAddress: usdcxAddress, abi: usdcxAbi } = useUsdcxAddress();
  const {
    data,
    isLoading: loadingAllowance,
    refetch,
  } = useContractRead({
    addressOrName: usdcxAddress,
    contractInterface: usdcxAbi,
    functionName: 'allowance',
    args: [owner, lendingCoreAddress],
    enabled: owner !== undefined,
  });
  const allowance = Number(data?.toString());

  const { config: configIncreaseAllowance, isLoading: loadingApproval } =
    usePrepareContractWrite({
      addressOrName: usdcxAddress,
      contractInterface: usdcxAbi,
      functionName: 'approve',
      args: [lendingCoreAddress, ethers.constants.MaxUint256],
    });
  const { writeAsync: increaseAllowance } = useContractWrite(
    configIncreaseAllowance
  );

  const {
    callWithWait: onClickIncreaseAllowance,
    loading: loadingIncreaseAllowance,
  } = useWriteWithWait(increaseAllowance, refetch);

  const {
    subscriptionData,
    approveIdaSubscription,
    loading: approveIdaSubscriptionLoading,
  } = useSfIda();

  if (loadingAllowance || loadingAllowance || increaseAllowance === undefined) {
    return <Loading />;
  }

  const getPrimaryButton = () => {
    if (allowance === 0) {
      return (
        <PrimaryButton
          onClick={onClickIncreaseAllowance}
          isLoading={loadingIncreaseAllowance}
          disabled={loadingIncreaseAllowance}
        >
          <div className="flex items-center gap-2">Allow spending of USDCx</div>
        </PrimaryButton>
      );
    } else if (!subscriptionData?.approved) {
      return (
        <PrimaryButton
          onClick={approveIdaSubscription}
          isLoading={approveIdaSubscriptionLoading}
          disabled={approveIdaSubscriptionLoading}
        >
          <div className="flex items-center gap-2">
            Subscribe for interest distribution
          </div>
        </PrimaryButton>
      );
    } else {
      return (
        <PrimaryButton onClick={openDialog}>
          <div className="flex items-center gap-2">
            <div className="mb-1">
              <PlusIcon />
            </div>
            Deposit Collateral
          </div>
        </PrimaryButton>
      );
    }
  };

  return (
    <FancyDottedBox>
      <div className="h-full flex gap-4 items-center">
        <p className="text-gray-400">Start depositing</p>
        {getPrimaryButton()}
      </div>
    </FancyDottedBox>
  );
};

const LendsTable = ({
  currentLendAmount,
  openDepositDialog,
  openWithdrawDialog,
}: {
  currentLendAmount: BigNumber;
  openDepositDialog: VoidFunction;
  openWithdrawDialog: VoidFunction;
}) => {
  const parsedLendAmount = formatEther(currentLendAmount);

  return (
    <div className="mx-8">
      <TableHeader>Deposits</TableHeader>
      <div className="bg-blue-3 p-4 flex items-center gap-8">
        <Image src="/usdc-logo.png" width={50} height={50} alt="" />
        <p className="font-bold text-xl">{parsedLendAmount}</p>
        <div className="flex h-fit gap-8">
          <PrimaryButton onClick={openDepositDialog}>
            <div className="flex items-center gap-2">
              <PlusIcon />
              Deposit
            </div>
          </PrimaryButton>
          <SecondaryButton onClick={openWithdrawDialog}>
            <div className="flex items-center gap-2">
              <MinusIcon />
              Withdraw
            </div>
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default Lender;
