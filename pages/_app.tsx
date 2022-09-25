import '@reach/dialog/styles.css';
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Header } from '../components/header';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  chain,
  chainId,
  configureChains,
  createClient,
  useNetwork,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { DashboardSelector } from '../components/dashboard-selector';
import { Sidebar } from '../components/sidebar';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  NormalizedCacheObject,
} from '@apollo/client';
import { ReactNode } from 'react';

const { chains, provider } = configureChains(
  [
    chain.goerli,
    chain.polygonMumbai,
    chain.optimismGoerli,
    // chain.mainnet,
    // chain.polygon,
    // chain.optimism,
    // chain.arbitrum,
  ],
  [alchemyProvider({ apiKey: process.env.ALCHEMY_ID }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Flow Theory',
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
        <EnhancedApolloProvider>
          <Header />
          <div className="mx-14">
            <DashboardSelector />
            <div className="flex flex-col md:flex-row gap-8 md:gap-0 mt-16">
              <Sidebar />
              <div className="flex-1">
                <Component {...pageProps} />
              </div>
            </div>
          </div>
        </EnhancedApolloProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

const EnhancedApolloProvider = ({ children }: { children: ReactNode }) => {
  const { chain } = useNetwork();
  const goerliClient = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli',
    cache: new InMemoryCache(),
  });

  if (chain === undefined) {
    return <ApolloProvider client={goerliClient}>{children}</ApolloProvider>;
  }

  const uri = {
    [chainId.goerli]:
      'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-goerli',
    [chainId.rinkeby]: '',
    [chainId.mainnet]: '',
    [chainId.optimismGoerli]:
      'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-optimism-goerli',
    [chainId.polygonMumbai]:
      'https://api.thegraph.com/subgraphs/name/superfluid-finance/protocol-v1-mumbai',
  }[chain.id];

  const client = new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default MyApp;
