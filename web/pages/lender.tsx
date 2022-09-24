import { useState } from 'react';
import { FancyDottedBox } from '../components/fancy-dotted-box';
import { PrimaryButton } from '../components/primary-button';
import { DepositConfirmationDialog } from '../modals/lender/deposit-confirmation-dialog';
import { DepositDialog } from '../modals/lender/deposit-dialog';
import { PlusIcon } from '../svg/plus-icon';
import ERC20 from '../../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi';
import { useLendingCoreAddress } from '../hooks/use-lending-core-address';
import { ethers } from 'ethers';
import { TableHeader } from '../components/table-header';
import Image from 'next/image';
import { DECIMALS } from '../constants';
import { formatEther } from 'ethers/lib/utils';
import { SecondaryButton } from '../components/secondary-button';
import { MinusIcon } from '../svg/minux-icon';
import { WithdrawDialog } from '../modals/lender/withdraw-dialog';
import { Loading } from '../components/loading';
import { WithdrawConfirmationDialog } from '../modals/lender/withdraw-confirmation-dialog';

type CurrentDialog =
  | 'depositDialog'
  | 'depositConfirmationDialog'
  | 'withdrawDialog'
  | 'withdrawConfirmationDialog'
  | undefined;

const Lender = () => {
  const [currentDialog, setCurrentDialog] = useState<CurrentDialog>(
    'withdrawConfirmationDialog'
  );
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

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
  });

  const exitDialog = () => {
    setCurrentDialog(undefined);
    setDepositAmount(0);
    setWithdrawAmount(0);
    refetchLenderProfiles();
  };

  // TODO: This needs to come from contract
  const interestGained = 10;

  if (fetchingAllowance) {
    return <Loading />;
  }

  const currentLendAmount = Number(lenderProfile?.toString());

  return (
    <>
      {currentLendAmount === 0 ? (
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

const NoLends = ({ openDialog }: { openDialog: VoidFunction }) => {
  const usdcx = '0x8aE68021f6170E5a766bE613cEA0d75236ECCa9a'; // Goerly USDCX,
  const { address: owner } = useAccount();
  const { contractAddress: lendingCoreAddress } = useLendingCoreAddress();
  const {
    data,
    isLoading: loadingAllowance,
    refetch,
  } = useContractRead({
    addressOrName: usdcx,
    contractInterface: ERC20.abi,
    functionName: 'allowance',
    args: [owner, lendingCoreAddress],
  });
  const allowance = Number(data?.toString());

  const { config: configIncreaseAllowance, isLoading: loadingApproval } =
    usePrepareContractWrite({
      addressOrName: usdcx,
      contractInterface: ERC20.abi,
      functionName: 'approve',
      args: [lendingCoreAddress, ethers.constants.MaxUint256],
    });
  const { writeAsync: increaseAllowance } = useContractWrite(
    configIncreaseAllowance
  );

  const [loadingIncreaseAllowance, setLoadingIncreaseAllowance] =
    useState(false);

  const onClickIncreaseAllowance = async () => {
    try {
      setLoadingIncreaseAllowance(true);

      const tx = await increaseAllowance?.();
      if (tx === undefined) {
        setLoadingIncreaseAllowance(false);
        return;
      }

      await tx.wait();
      await refetch();
      setLoadingIncreaseAllowance(false);
    } catch (error) {
      setLoadingIncreaseAllowance(false);
    }
  };

  if (loadingAllowance || loadingAllowance || increaseAllowance === undefined) {
    return null;
  }

  return (
    <FancyDottedBox>
      <div className="h-full flex gap-4 items-center">
        <p className="text-gray-400">Start depositing</p>
        {allowance === 0 ? (
          <PrimaryButton
            onClick={onClickIncreaseAllowance}
            isLoading={loadingIncreaseAllowance}
            disabled={loadingIncreaseAllowance}
          >
            <div className="flex items-center gap-2">
              Allow spending of USDCx
            </div>
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={openDialog}>
            <div className="flex items-center gap-2">
              <div className="mb-1">
                <PlusIcon />
              </div>
              Deposit Collateral
            </div>
          </PrimaryButton>
        )}
      </div>
    </FancyDottedBox>
  );
};

const LendsTable = ({
  currentLendAmount,
  openDepositDialog,
  openWithdrawDialog,
}: {
  currentLendAmount: number;
  openDepositDialog: VoidFunction;
  openWithdrawDialog: VoidFunction;
}) => {
  const parsedLendAmount = formatEther(currentLendAmount.toString());

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
