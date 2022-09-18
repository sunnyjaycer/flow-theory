import { PrimaryButton } from '../components/primary-button';
import { PlusIcon } from '../svg/plus-icon';

const Borrower = () => {
  const borrowedAmount = 0;

  if (borrowedAmount === 0) {
    return <NoBorrows />;
  }

  return <div></div>;
};

const NoBorrows = () => {
  return (
    <div>
      <div className="w-4/6 mx-auto h-32 p-16 flex gap-4 items-center border-gray-400 border-2 rounded-2xl border-dotted text-gray-400">
        <span>No Borrows</span>
        <PrimaryButton>
          <div className="flex items-center gap-2">
            <div className="mb-1">
              <PlusIcon />
            </div>
            Deposit Collateral
          </div>
        </PrimaryButton>
      </div>
    </div>
  );
};

export default Borrower;
