// import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { FlowTheoryLogo } from '../svg/flow-theory-logo';
import { ConnectButton } from './connect-button';

export const Header = () => {
  return (
    <header className="w-full flex items-center justify-between mb-8">
      <Link href="/">
        <a className="flex items-center gap-4" href="/">
          <FlowTheoryLogo />
          {/* <div className="h-8 w-8 rounded-full bg-gray-400"></div>
          <span className="font-bold">Flow Theory</span> */}
        </a>
      </Link>

      <div>
        <ConnectButton />
      </div>
    </header>
  );
};
