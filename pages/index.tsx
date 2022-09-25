import type { NextPage } from 'next';
import Head from 'next/head';
import { PrimaryButton } from '../components/primary-button';
import { DollarIcon } from '../svg/dollar-icon';
import { HeroArt } from '../svg/hero-art';
import { HeroImageText } from '../svg/hero-image-text';
import { PlusIcon } from '../svg/plus-icon';
import Link from 'next/link';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Flow Theory</title>
        <meta name="description" content="FLow theory" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mt-16 text-left text-6xl font-bold flex gap-4 relative w-fit mb-8">
        Welcome to
        <HeroImageText />
        <div className="absolute -right-32 -top-16">
          <HeroArt />
        </div>
      </div>
      <p className="text-2xl text-blue--3 mb-8">What would you like to do?</p>
      <div className="flex gap-8">
        <PrimaryButton>
          <Link href="/lender">
            <div className="flex items-center gap-2">
              <PlusIcon />
              Lend
            </div>
          </Link>
        </PrimaryButton>
        <PrimaryButton>
          <Link href="/borrower">
            <div className="flex items-center gap-2">
              <DollarIcon />
              Borrow
            </div>
          </Link>
        </PrimaryButton>
      </div>
    </div>
  );
};

export default Home;
