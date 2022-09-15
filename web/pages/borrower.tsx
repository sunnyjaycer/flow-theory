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
      <div className="w-4/6 mx-auto h-32 p-16 flex items-center border-gray-400 border-2 rounded-2xl border-dotted text-gray-400">
        <span>No Borrows</span>
        <button>Borrow</button>
      </div>
    </div>
  );
};

export default Borrower;
