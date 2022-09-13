import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Flow Theory</title>
        <meta name="description" content="FLow theory" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mt-16 text-center">
        Welcome to Flow Theory. Would you like to borrow or lend?
      </div>
    </div>
  );
};

export default Home;
