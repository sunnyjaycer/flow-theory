import '@reach/dialog/styles.css';
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Header } from '../components/header';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { DashboardSelector } from '../components/dashboard-selector';
import { Sidebar } from '../components/sidebar';

const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon, chain.optimism, chain.arbitrum],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Header />
        <DashboardSelector />
        <div className="flex flex-col md:flex-row gap-8 md:gap-0 mt-16">
          <Sidebar />
          <div className="flex-1">
            <Component {...pageProps} />
          </div>
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
