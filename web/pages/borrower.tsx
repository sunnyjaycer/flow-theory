import { useState, ReactNode } from 'react';
import { PrimaryButton } from '../components/primary-button';
import { PlusIcon } from '../svg/plus-icon';
import Image from 'next/image';
import { SecondaryButton } from '../components/secondary-button';
import { useLendingCoreAddress } from '../hooks/use-lending-core-address';
import { useContractRead, useAccount } from 'wagmi';
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

const Borrower = () => {
  const [currentDialog, setCurrentDialog] = useState<CurrentDialog>();
  const onApproveDeposit = () => {
    setCurrentDialog('borrowConfirmationDialog');
  };
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [repayAmount, setRepayAmount] = useState(0);

  const exitDialog = () => {
    setCurrentDialog(undefined);
    setCollateralAmount(0);
    setBorrowAmount(0);
    setDepositAmount(0);
    setWithdrawAmount(0);
    setRepayAmount(0);
  };

  const { address } = useAccount();
  const lendingCoreAddress = useLendingCoreAddress();
  const { data, isError, isLoading } = useContractRead({
    addressOrName: lendingCoreAddress,
    contractInterface: LendingCore.abi,
    functionName: 'borrowerProfiles(address)',
    args: [address],
  });
  const currentCollateralAmount = data?.collateralAmount.toNumber();
  // const currentBorrowAmount = data?.debtAmount.toNumber();
  const currentBorrowAmount = 0;

  // TODO: These should come from subgraph
  const interestRate = 0.01;
  const interestPaid = 10;

  const totalBorrowAmount = currentBorrowAmount + borrowAmount - repayAmount;
  const totalCollateralAmount =
    currentCollateralAmount + collateralAmount + depositAmount - withdrawAmount;

  const getNewCollateralRatio = () => {
    if (totalBorrowAmount <= 0) {
      // Guard against divide by 0
      return;
    }

    return totalCollateralAmount / totalBorrowAmount;
  };

  const getNewInterest = () => {
    return totalBorrowAmount * interestRate;
  };

  const newCollateralRatio = getNewCollateralRatio();
  const newInterest = getNewInterest();

  return (
    <>
      {/* {currentBorrowAmount === 0 || isLoading ? ( */}
      {currentBorrowAmount === 0 ? (
        <NoBorrows openDialog={() => setCurrentDialog('borrowDialog')} />
      ) : (
        <BorrowsTable
          openDepositDialog={() => setCurrentDialog('depositDialog')}
          openWithdrawDialog={() => setCurrentDialog('withdrawDialog')}
          openRepayDialog={() => setCurrentDialog('repayDialog')}
          openBorrowDialog={() => setCurrentDialog('borrowDialog')}
        />
      )}
      <BorrowDialog
        collateralAmount={collateralAmount}
        setCollateralAmount={setCollateralAmount}
        borrowAmount={borrowAmount}
        setBorrowAmount={setBorrowAmount}
        newCollateralRatio={newCollateralRatio}
        newInterest={newInterest}
        showDialog={currentDialog === 'borrowDialog'}
        closeDialog={exitDialog}
        onApprove={onApproveDeposit}
      />
      <BorrowConfirmationDialog
        collateralAmount={collateralAmount}
        borrowAmount={borrowAmount}
        collateralRatio={newCollateralRatio ?? 0}
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
        collateralRatio={newCollateralRatio ?? 0}
        interest={newInterest}
        depositAmount={depositAmount}
        showDialog={currentDialog === 'depositConfirmationDialog'}
        closeDialog={exitDialog}
        onBack={() => setCurrentDialog('depositDialog')}
      />
      <WithdrawDialog
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        repayAmount={repayAmount}
        setRepayAmount={setRepayAmount}
        newCollateralRatio={newCollateralRatio}
        newInterest={newInterest}
        showDialog={currentDialog === 'withdrawDialog'}
        closeDialog={exitDialog}
        onApprove={() => setCurrentDialog('withdrawConfirmationDialog')}
      />
      <WithdrawConfirmationDialog
        withdrawAmount={withdrawAmount}
        repayAmount={repayAmount}
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
  return (
    <FancyDottedBox>
      <div className="h-full flex gap-4 items-center">
        <p className="text-gray-400">No Borrows</p>
        <PrimaryButton onClick={openDialog}>
          <div className="flex items-center gap-2">
            <div className="mb-1">
              <PlusIcon />
            </div>
            Deposit Collateral
          </div>
        </PrimaryButton>
      </div>
    </FancyDottedBox>
  );
};

const BorrowsTable = ({
  openDepositDialog,
  openWithdrawDialog,
  openRepayDialog,
  openBorrowDialog,
}: {
  openDepositDialog: VoidFunction;
  openWithdrawDialog: VoidFunction;
  openRepayDialog: VoidFunction;
  openBorrowDialog: VoidFunction;
}) => {
  const collateralAmount = 10;
  const borrowedAmount = 10;

  return (
    <div className="flex gap-4 mx-8">
      <div className="flex-1">
        <TableHeader>Collateral</TableHeader>
        <div className="bg-blue-3 p-4 flex items-center gap-8">
          <Image src="/weth-logo.png" width={50} height={50} alt="" />
          <p>{collateralAmount.toFixed(DECIMALS)}</p>
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
          <p>{borrowedAmount.toFixed(DECIMALS)}</p>
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
