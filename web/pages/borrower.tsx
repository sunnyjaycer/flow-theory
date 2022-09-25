import { useState, ReactNode } from 'react';
import { PrimaryButton } from '../components/primary-button';
import { PlusIcon } from '../svg/plus-icon';
import Image from 'next/image';
import { SecondaryButton } from '../components/secondary-button';
import { useLendingCoreAddress } from '../hooks/use-lending-core-address';
import {
  useContractRead,
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
} from 'wagmi';
import LendingCore from '../../artifacts/contracts/LendingCore.sol/LendingCore.json';
import { MinusIcon } from '../svg/minux-icon';
import { RepayIcon } from '../svg/repay-icon';
import { DollarIcon } from '../svg/dollar-icon';
import { BorrowDialog } from '../modals/borrower/borrow-dialog';
import { BorrowConfirmationDialog } from '../modals/borrower/borrow-confirmation-dialog';
import { DepositDialog } from '../modals/borrower/deposit-dialog';
import { DepositConfirmationDialog } from '../modals/borrower/deposit-confirmation-dialog';
import { WithdrawDialog } from '../modals/borrower/withdraw-dialog';
import { WithdrawConfirmationDialog } from '../modals/borrower/withdraw-confirmation-dialog';
import { RepayDialog } from '../modals/borrower/repay-dialog';
import { RepayConfirmationDialog } from '../modals/borrower/repay-confirmation-dialog';
import { FancyDottedBox } from '../components/fancy-dotted-box';
import { TableHeader } from '../components/table-header';
import { Loading } from '../components/loading';
import { useTokenPrices } from '../hooks/use-token-prices';
import { useWethAddress } from '../hooks/use-weth-address';
import { BigNumber, ethers, FixedNumber } from 'ethers';
import { useWriteWithWait } from '../hooks/use-write-with-wait';
import { formatEther, parseEther } from 'ethers/lib/utils';

type CurrentDialog =
  | 'borrowDialog'
  | 'borrowConfirmationDialog'
  | 'depositDialog'
  | 'depositConfirmationDialog'
  | 'withdrawDialog'
  | 'withdrawConfirmationDialog'
  | 'repayDialog'
  | 'repayConfirmationDialog'
  | undefined;

const DECIMALS = 2;

const stringNumberOrZero = (num: string) => {
  if (num === '') {
    return '0';
  }
  return num;
};

const Borrower = () => {
  const [currentDialog, setCurrentDialog] = useState<CurrentDialog>();
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');

  const { address } = useAccount();
  const { contractAddress: lendingCoreAddress, abi: lendingCoreAbi } =
    useLendingCoreAddress();
  const {
    data: borrowerProfile,
    isFetching: isFetchingBorrowerProfiles,
    refetch: refetchBorrowerProfiles,
  } = useContractRead({
    addressOrName: lendingCoreAddress,
    contractInterface: lendingCoreAbi,
    functionName: 'borrowerProfiles',
    args: [address],
  });
  const currentCollateralAmount =
    borrowerProfile?.collateralAmount as any as BigNumber;
  const currentBorrowAmount = borrowerProfile?.debtAmount as any as BigNumber;

  const { collateralTokenPrice, debtTokenPrice, granularity } =
    useTokenPrices();

  const exitDialog = () => {
    setCurrentDialog(undefined);
    setCollateralAmount('');
    setBorrowAmount('');
    setDepositAmount('');
    setWithdrawAmount('');
    setRepayAmount('');

    refetchBorrowerProfiles();
  };

  if (isFetchingBorrowerProfiles) {
    return <Loading />;
  }

  // TODO: These should come from subgraph
  const interestRate = BigNumber.from(10);
  const interestPaid = BigNumber.from(10);

  console.log('currentBorrowAmount', currentBorrowAmount.toString());

  const totalBorrowAmount = currentBorrowAmount
    .add(parseEther(stringNumberOrZero(borrowAmount)))
    .sub(parseEther(stringNumberOrZero(repayAmount)));
  const totalCollateralAmount = currentCollateralAmount
    .add(parseEther(stringNumberOrZero(collateralAmount)))
    .add(parseEther(stringNumberOrZero(depositAmount)))
    .sub(parseEther(stringNumberOrZero(withdrawAmount)));

  const getNewCollateralRatio = () => {
    if (totalBorrowAmount.mul(debtTokenPrice).lte(0)) {
      // Guard against divide by 0
      return;
    }

    console.log(
      'totalCollateralAmount',
      formatEther(totalCollateralAmount.toString())
    );
    console.log('totalBorrowAmount', formatEther(totalBorrowAmount.toString()));

    return totalCollateralAmount
      .mul(collateralTokenPrice)
      .div(totalBorrowAmount.mul(debtTokenPrice));
  };

  const getNewInterest = () => {
    return formatEther(totalBorrowAmount.mul(interestRate).div(granularity));
  };

  const newCollateralRatio = getNewCollateralRatio();
  const newInterest = getNewInterest();

  return (
    <>
      {currentCollateralAmount.eq(0) ? (
        <NoBorrows openDialog={() => setCurrentDialog('depositDialog')} />
      ) : (
        <BorrowsTable
          currentCollateralAmount={currentCollateralAmount}
          currentBorrowAmount={currentBorrowAmount}
          openDepositDialog={() => setCurrentDialog('depositDialog')}
          openWithdrawDialog={() => setCurrentDialog('withdrawDialog')}
          openRepayDialog={() => setCurrentDialog('repayDialog')}
          openBorrowDialog={() => setCurrentDialog('borrowDialog')}
        />
      )}
      <BorrowDialog
        borrowAmount={borrowAmount}
        setBorrowAmount={setBorrowAmount}
        newCollateralRatio={newCollateralRatio}
        newInterest={newInterest}
        showDialog={currentDialog === 'borrowDialog'}
        closeDialog={exitDialog}
        onApprove={() => setCurrentDialog('borrowConfirmationDialog')}
      />
      <BorrowConfirmationDialog
        collateralAmount={collateralAmount}
        borrowAmount={borrowAmount}
        collateralRatio={newCollateralRatio ?? BigNumber.from(0)}
        interest={newInterest}
        showDialog={currentDialog === 'borrowConfirmationDialog'}
        closeDialog={exitDialog}
        onBack={() => setCurrentDialog('borrowDialog')}
      />
      <DepositDialog
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
        newCollateralRatio={newCollateralRatio}
        showDialog={currentDialog === 'depositDialog'}
        closeDialog={exitDialog}
        onApprove={() => setCurrentDialog('depositConfirmationDialog')}
      />
      <DepositConfirmationDialog
        collateralRatio={newCollateralRatio ?? BigNumber.from(0)}
        depositAmount={depositAmount}
        showDialog={currentDialog === 'depositConfirmationDialog'}
        closeDialog={exitDialog}
        onBack={() => setCurrentDialog('depositDialog')}
      />

      <WithdrawDialog
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        showDialog={currentDialog === 'withdrawDialog'}
        closeDialog={exitDialog}
        onApprove={() => setCurrentDialog('withdrawConfirmationDialog')}
      />
      <WithdrawConfirmationDialog
        withdrawAmount={withdrawAmount}
        interestPaid={interestPaid}
        showDialog={currentDialog === 'withdrawConfirmationDialog'}
        closeDialog={exitDialog}
        onBack={() => setCurrentDialog('withdrawDialog')}
      />
      <RepayDialog
        repayAmount={repayAmount}
        setRepayAmount={setRepayAmount}
        newCollateralRatio={newCollateralRatio}
        newInterest={newInterest}
        showDialog={currentDialog === 'repayDialog'}
        closeDialog={exitDialog}
        onApprove={() => setCurrentDialog('repayConfirmationDialog')}
      />
      <RepayConfirmationDialog
        repayAmount={repayAmount}
        interestPaid={interestPaid}
        showDialog={currentDialog === 'repayConfirmationDialog'}
        closeDialog={exitDialog}
        onBack={() => setCurrentDialog('repayDialog')}
      />
    </>
  );
};

const NoBorrows = ({ openDialog }: { openDialog: VoidFunction }) => {
  const { address: owner } = useAccount();
  const { contractAddress: lendingCoreAddress } = useLendingCoreAddress();
  const { contractAddress: wethAddress, abi: wethAbi } = useWethAddress();
  const {
    data,
    isLoading: loadingAllowance,
    refetch,
  } = useContractRead({
    addressOrName: wethAddress,
    contractInterface: wethAbi,
    functionName: 'allowance',
    args: [owner, lendingCoreAddress],
  });
  const allowance = Number(data?.toString());

  const { config: configIncreaseAllowance, isLoading: loadingApproval } =
    usePrepareContractWrite({
      addressOrName: wethAddress,
      contractInterface: wethAbi,
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

  if (loadingAllowance || loadingAllowance || increaseAllowance === undefined) {
    return <Loading />;
  }

  return (
    <FancyDottedBox>
      <div className="h-full flex gap-4 items-center">
        <p className="text-gray-400">No Borrows</p>
        {allowance === 0 ? (
          <PrimaryButton
            onClick={onClickIncreaseAllowance}
            isLoading={loadingIncreaseAllowance}
            disabled={loadingIncreaseAllowance}
          >
            <div className="flex items-center gap-2">
              Allow spending of WETH
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

const BorrowsTable = ({
  currentCollateralAmount,
  currentBorrowAmount,
  openDepositDialog,
  openWithdrawDialog,
  openRepayDialog,
  openBorrowDialog,
}: {
  currentCollateralAmount: BigNumber;
  currentBorrowAmount: BigNumber;
  openDepositDialog: VoidFunction;
  openWithdrawDialog: VoidFunction;
  openRepayDialog: VoidFunction;
  openBorrowDialog: VoidFunction;
}) => {
  const collateralAmount = formatEther(currentCollateralAmount);
  const borrowedAmount = formatEther(currentBorrowAmount);

  return (
    <div className="flex gap-4 mx-8">
      <div className="flex-1">
        <TableHeader>Collateral</TableHeader>
        <div className="bg-blue-3 p-4 flex items-center gap-8">
          <Image src="/weth-logo.png" width={50} height={50} alt="" />
          <p>{collateralAmount}</p>
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
      <div className="flex-1">
        <TableHeader>Borrows</TableHeader>
        <div className="bg-blue-3 p-4 flex items-center gap-8">
          <Image src="/usdc-logo.png" width={50} height={50} alt="" />
          <p>{borrowedAmount}</p>
          <div className="flex h-fit gap-8">
            <PrimaryButton onClick={openRepayDialog}>
              <div className="flex items-center gap-2">
                <RepayIcon />
                Repay
              </div>
            </PrimaryButton>
            <SecondaryButton onClick={openBorrowDialog}>
              <div className="flex items-center gap-2">
                <DollarIcon />
                Borrow
              </div>
            </SecondaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Borrower;
