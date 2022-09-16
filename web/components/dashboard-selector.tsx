import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

export const DashboardSelector = () => {
  const { pathname } = useRouter();
  const isLender = pathname.includes('lender');
  const isBorrower = pathname.includes('borrower');

  return (
    <div className="font-bold flex gap-2 max-w-[150px]">
      <DashboardSelectorItem selected={isLender} href="/lender">
        Lend
      </DashboardSelectorItem>
      <DashboardSelectorItem selected={isBorrower} href="/borrower">
        Borrow
      </DashboardSelectorItem>
    </div>
  );
};

const DashboardSelectorItem = ({
  selected,
  children,
  href,
}: {
  selected: boolean;
  children: ReactNode;
  href: string;
}) => {
  return (
    <Link href={href}>
      <a
        className={`flex flex-col p-2 rounded-md flex-1 items-center ${
          selected ? 'bg-blue-0' : 'bg-blue-3'
        }`}
      >
        {children}
        {/* {selected === true ? (
        <div className="absolute left-0 right-0 mt-2 h-1 bg-gray-400 rounded-full -bottom-2" />
      ) : null} */}
      </a>
    </Link>
  );
};
