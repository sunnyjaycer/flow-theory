import { useState } from 'react';
import { Dialog } from '../components/dialog';
import { GradientText } from '../components/gradient-text';
import { PrimaryButton } from '../components/primary-button';
import { PlusIcon } from '../svg/plus-icon';

const Borrower = () => {
  const borrowedAmount = 0;
  const [showDialog, setShowDialog] = useState(false);

  if (borrowedAmount === 0) {
    return (
      <NoBorrows
        showDialog={showDialog}
        openDialog={() => setShowDialog(true)}
        closeDialog={() => setShowDialog(false)}
      />
    );
  }

  return <div></div>;
};

const NoBorrows = ({
  showDialog,
  openDialog,
  closeDialog,
}: {
  showDialog: boolean;
  openDialog: VoidFunction;
  closeDialog: VoidFunction;
}) => {
  return (
    <>
      <div className="mx-8 md:mx-16 rounded-2xl bg-gradient-to-b from-brand-blue to-brand-purple">
        <div className="  border-background border-2 rounded-2xl  border-dashed">
          <div className="bg-background flex gap-4 p-16 py-32 w-full rounded-2xl items-center">
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
      <BorrowDialog showDialog={showDialog} closeDialog={closeDialog} />
    </>
  );
};

const BorrowDialog = ({
  showDialog,
  closeDialog,
  approve,
}: {
  showDialog: boolean;
  closeDialog: VoidFunction;
  approve: VoidFunction;
}) => {
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
            type={'number'}
          ></input>
          <p className="font-thin text-blue-0">Only deposit USDC</p>
        </div>
        <div className="flex-1 text-left">
          <h2 className="text-2xl font-thin mb-4">Borrow</h2>
          <input
            placeholder="0"
            className="bg-background text-xl font-thin w-full mb-4 h-12 px-4"
            type={'number'}
          ></input>
          <p className="mb-4 font-bold">New Collateral Ratio</p>
          <p className="mb-4">--:--</p>
          <GradientText className="mb-4 font-bold">Fixed APR 1%</GradientText>
          <p className="mb-4 font-bold">New Interest</p>

          <div className="text-right mt-4">
            <PrimaryButton onClick={approve}>Approve</PrimaryButton>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default Borrower;
