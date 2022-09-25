import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { useCurrentDashboard } from '../hooks/use-current-dashboard';

export const DashboardSelector = () => {
  const currentDashboard = useCurrentDashboard();

  if (currentDashboard === undefined) {
    return null;
  }

  return (
    <div className="font-bold flex gap-2 max-w-[150px]">
      <DashboardSelectorItem
        selected={currentDashboard === 'lender'}
        href="/lender"
      >
        Lend
      </DashboardSelectorItem>
      <DashboardSelectorItem
        selected={currentDashboard === 'borrower'}
        href="/borrower"
      >
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
