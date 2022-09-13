import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

export const Header = () => {
  const { pathname } = useRouter();
  const isLender = pathname.includes('lender');
  const isBorrower = pathname.includes('borrower');

  return (
    <header className="w-full flex items-center justify-between">
      <Link href="/">
        <a className="flex items-center gap-4" href="/">
          <div className="h-8 w-8 rounded-full bg-gray-400"></div>
          <span className="font-bold">Flow Theory</span>
        </a>
      </Link>

      <div className="font-bold flex gap-2">
        <DashboardSelector selected={isBorrower} href="/borrower">
          Borrower
        </DashboardSelector>
        <span>/</span>
        <DashboardSelector selected={isLender} href="/lender">
          Lender
        </DashboardSelector>
      </div>

      <div>
        <ConnectButton />
      </div>
    </header>
  );
};

const DashboardSelector = ({
  selected,
  children,
  href,
}: {
  selected: boolean;
  children: ReactNode;
  href: string;
}) => {
  return (
    <div className="flex flex-col relative">
      <Link href={href}>{children}</Link>
      {selected === true ? (
        <div className="absolute left-0 right-0 mt-2 h-1 bg-gray-400 rounded-full -bottom-2" />
      ) : null}
    </div>
  );
};
