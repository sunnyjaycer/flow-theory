import {
  ChangeEvent,
  Dispatch,
  Reducer,
  ReducerAction,
  ReducerState,
  SetStateAction,
  useReducer,
  useState,
  ReactNode,
} from 'react';
import { Dialog } from '../components/dialog';
import { GradientText } from '../components/gradient-text';
import { PrimaryButton } from '../components/primary-button';
import { PlusIcon } from '../svg/plus-icon';
import Image from 'next/image';
import { SecondaryButton } from '../components/secondary-button';
import { useLendingCoreAddress } from '../hooks/use-lending-core-address';
import {
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useAccount,
} from 'wagmi';
import LendingCore from '../../artifacts/contracts/LendingCore.sol/LendingCore.json';
import { PrimaryButtonIcon } from '../components/primary-button-icon';
import { MinusIcon } from '../svg/minux-icon';
import { RepayIcon } from '../svg/repay-icon';
import { DollarIcon } from '../svg/dollar-icon';
import { BorrowDialog } from '../modals/borrow-dialog';
import { BorrowConfirmationDialog } from '../modals/borrow-confirmation-dialog';
import { DepositDialog } from '../modals/deposit-dialog';
import { DepositConfirmationDialog } from '../modals/deposit-confirmation-dialog';
import { WithdrawDialog } from '../modals/withdraw-dialog';
import { WithdrawConfirmationDialog } from '../modals/withdraw-confirmation-dialog';
import { RepayDialog } from '../modals/repay-dialog';
import { RepayConfirmationDialog } from '../modals/repay-confirmation-dialog';

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
  const borrowedAmount = 1;
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
  const currentBorrowAmount = 10;

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
      {currentBorrowAmount === 0 || isLoading ? (
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
    <>
      <div className="h-full mx-8 md:mx-16 rounded-2xl bg-gradient-to-b from-brand-blue to-brand-purple">
        <div className="h-full  border-background border-2 rounded-2xl  border-dashed">
          <div className="h-full bg-background flex gap-4 p-16 py-32 w-full rounded-2xl items-center">
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
        </div>
      </div>
    </>
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
  const Header = ({ children }: { children: ReactNode }) => {
    return <h1 className="bg-blue-3 p-4 font-thin mb-4">{children}</h1>;
  };

  const collateralAmount = 10;
  const borrowedAmount = 10;

  return (
    <div className="flex gap-4 mx-8">
      <div className="flex-1">
        <Header>Collateral</Header>
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
        <Header>Borrows</Header>
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
