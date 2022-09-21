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

type CurrentDialog = 'borrowDialog' | 'borrowConfirmationDialog' | undefined;

const Borrower = () => {
  const borrowedAmount = 0;
  const [currentDialog, setCurrentDialog] = useState<CurrentDialog>();
  const onApproveDeposit = () => {
    setCurrentDialog('borrowConfirmationDialog');
  };
  const [collateralAmount, setCollateralAmount] = useState(0);
  const [borrowAmount, setBorrowAmount] = useState(0);

  return (
    <>
      {borrowedAmount === 0 ? (
        <NoBorrows openDialog={() => setCurrentDialog('borrowDialog')} />
      ) : (
        <BorrowsTable />
      )}
      {/*
        We probably want some kind of stack to handle these state changes
      */}
      <BorrowDialog
        collateralAmount={collateralAmount}
        setCollateralAmount={setCollateralAmount}
        borrowAmount={borrowAmount}
        setBorrowAmount={setBorrowAmount}
        showDialog={currentDialog === 'borrowDialog'}
        closeDialog={() => setCurrentDialog(undefined)}
        onApprove={onApproveDeposit}
      />
      <BorrowConfirmationDialog
        showDialog={currentDialog === 'borrowConfirmationDialog'}
        closeDialog={() => setCurrentDialog(undefined)}
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
  showDialog,
  closeDialog,
  onApprove,
}: {
  collateralAmount: number;
  setCollateralAmount: Dispatch<SetStateAction<number>>;
  borrowAmount: number;
  setBorrowAmount: Dispatch<SetStateAction<number>>;
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

  // These should come from subgraph
  const currentCollateralAmount = 0;
  const currentBorrowAmount = 0;

  const getNewCollateralRatio = () => {
    const totalBorrowAmount = currentBorrowAmount + borrowAmount;
    const totalCollateralAmount = currentCollateralAmount + collateralAmount;

    if (currentBorrowAmount + borrowAmount === 0) {
      // Guard against divide by 0
      return;
    }

    return totalCollateralAmount / totalBorrowAmount;
  };

  const getNewInterest = () => {
    const totalCollateralAmount = currentCollateralAmount + collateralAmount;
    return;
  };

  const newCollateralRatio = getNewCollateralRatio();
  const decimals = 2;

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
          <p className="mb-4 font-bold">New Collateral Ratio</p>
          <p className="mb-4">
            {newCollateralRatio === undefined
              ? '--:--'
              : newCollateralRatio.toFixed(decimals)}{' '}
          </p>
          <GradientText className="mb-4 font-bold">Fixed APR 1%</GradientText>
          <p className="mb-4 font-bold">New Interest</p>

          <div className="text-right mt-4">
            <PrimaryButton onClick={onApprove}>Approve</PrimaryButton>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

const BorrowConfirmationDialog = ({
  showDialog,
  closeDialog,
  onBack,
  onConfirm,
}: {
  showDialog: boolean;
  closeDialog: VoidFunction;
  onBack: VoidFunction;
  onConfirm: VoidFunction;
}) => {
  return (
    <Dialog
      isOpen={showDialog}
      onDismiss={closeDialog}
      aria-label="Borrow confirmation Overlay"
    >
      <div className="flex gap-4">
        <div className="flex-1 text-left">
          <h2 className="text-2xl font-thin mb-4">Collateral</h2>
          <Image src="/usdc-logo.png" width={50} height={50} alt="USDC Logo" />
          <p className="font-thin text-blue--3"></p>
          <p className="font-thin text-blue--3">$2500</p>
        </div>
      </div>
    </Dialog>
  );
};

export default Borrower;
