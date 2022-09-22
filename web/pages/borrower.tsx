import {
  ChangeEvent,
  Dispatch,
  Reducer,
  ReducerAction,
  ReducerState,
  SetStateAction,
  useReducer,
  useState,
} from 'react';
import { Dialog } from '../components/dialog';
import { GradientText } from '../components/gradient-text';
import { PrimaryButton } from '../components/primary-button';
import { PlusIcon } from '../svg/plus-icon';
import Image from 'next/image';
import { SecondaryButton } from '../components/secondary-button';

type CurrentDialog = 'borrowDialog' | 'borrowConfirmationDialog' | undefined;

const DECIMALS = 2;

const Borrower = () => {
  const borrowedAmount = 0;
  const [currentDialog, setCurrentDialog] = useState<CurrentDialog>();
  const onApproveDeposit = () => {
    setCurrentDialog('borrowConfirmationDialog');
  };
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);
  const exitDialog = () => {
    setCurrentDialog(undefined);
    setCollateralAmount(0);
    setBorrowAmount(0);
  };

  // TODO: These should come from subgraph
  const currentCollateralAmount = 0;
  const currentBorrowAmount = 0;
  const interestRate = 0.01;

  const totalBorrowAmount = currentBorrowAmount + borrowAmount;
  const totalCollateralAmount = currentCollateralAmount + collateralAmount;

  const getNewCollateralRatio = () => {
    if (totalBorrowAmount === 0) {
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
      {borrowedAmount === 0 ? (
        <NoBorrows openDialog={() => setCurrentDialog('borrowDialog')} />
      ) : (
        <BorrowsTable />
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
        onConfirm={() => {}}
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

const BorrowsTable = () => {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <h1>Collateral</h1>
      </div>
      <div className="flex-1">
        <h1>Borrows</h1>
      </div>
    </div>
  );
};

const BorrowDialog = ({
  collateralAmount,
  setCollateralAmount,
  borrowAmount,
  setBorrowAmount,
  newCollateralRatio,
  newInterest,
  showDialog,
  closeDialog,
  onApprove,
}: {
  collateralAmount: number;
  setCollateralAmount: Dispatch<SetStateAction<number>>;
  borrowAmount: number;
  setBorrowAmount: Dispatch<SetStateAction<number>>;
  newCollateralRatio?: number;
  newInterest: number;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onApprove: VoidFunction;
}) => {
  const onChangeNumberAmount = (
    e: ChangeEvent<HTMLInputElement>,
    callback: Dispatch<SetStateAction<number>>
  ) => {
    const value = Number(e.target.value);
    if (isNaN(value)) {
      return;
    }
    callback(value);
  };

  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Borrow Overlay"
    >
      <div className="flex gap-4">
        <div className="flex-1 text-left">
          <h2 className="text-2xl font-thin mb-4">Add Collateral</h2>
          <input
            placeholder="0"
            className="bg-background text-xl font-thin w-full mb-4 h-12 px-4"
            value={collateralAmount}
            onChange={(e) => onChangeNumberAmount(e, setCollateralAmount)}
          />
          <p className="font-thin text-blue--3">Only deposit USDC</p>
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-2xl font-thin mb-4">Borrow</h2>
          <input
            placeholder="0"
            className="bg-background text-xl font-thin w-full mb-4 h-12 px-4"
            value={borrowAmount}
            onChange={(e) => onChangeNumberAmount(e, setBorrowAmount)}
          />
          <div className="mb-4">
            <span className="font-bold">New Collateral Ratio: </span>
            <span>
              {newCollateralRatio === undefined
                ? '--:--'
                : newCollateralRatio.toFixed(DECIMALS)}{' '}
            </span>
          </div>

          <GradientText className="mb-4 font-bold">Fixed APR 1%</GradientText>

          <div className="mb-4">
            <span className="font-bold">New Interest: </span>
            <span>{newInterest.toFixed(DECIMALS)}/year</span>
          </div>
          <div className="text-right mt-4">
            <PrimaryButton onClick={onApprove}>Approve</PrimaryButton>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

const BorrowConfirmationDialog = ({
  collateralAmount,
  borrowAmount,
  collateralRatio,
  interest,
  showDialog,
  closeDialog,
  onBack,
  onConfirm,
}: {
  collateralAmount: number;
  borrowAmount: number;
  collateralRatio: number;
  interest: number;
  showDialog: boolean;
  closeDialog: VoidFunction;
  onBack: VoidFunction;
  onConfirm: VoidFunction;
}) => {
  const borrowAmountInUSDC = borrowAmount * 1300; // TODO: This should use real exchange rate

  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Borrow confirmation Overlay"
    >
      <div className="flex gap-4 mb-4">
        <div className="flex-1 text-left">
          <h2 className="text-2xl font-thin mb-4">Collateral</h2>
          <Image src="/usdc-logo.png" width={50} height={50} alt="USDC Logo" />
          <p className="font-bold text-brand-blue text-3xl">
            {collateralAmount}
          </p>
          {/* Assuming the collateral amount is always USDC for now */}
          <p className="font-thin text-blue--3">${collateralAmount}</p>
        </div>

        <div className="flex-1 text-left">
          <h2 className="text-2xl font-thin mb-4">Borrow</h2>
          <Image src="/weth-logo.png" width={50} height={50} alt="USDC Logo" />
          <p className="font-bold text-brand-blue text-3xl">{borrowAmount}</p>
          <p className="font-thin text-blue--3">${borrowAmountInUSDC}</p>
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
        <PrimaryButton>Confirm</PrimaryButton>
      </div>
    </Dialog>
  );
};

export default Borrower;
