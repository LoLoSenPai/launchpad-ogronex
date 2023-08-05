import React from 'react';
import ReactDOM from 'react-dom/client';
import { DynamicContextProvider, SortWallets } from '@dynamic-labs/sdk-react';
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { Analytics } from "@vercel/analytics/react";
import App from './App';
import './Styles/globals.css';

// Setting up list of evmNetworks
const evmNetworks = [
  {
    blockExplorerUrls: ["https://polygonscan.com/"],
    chainId: 137,
    chainName: "Matic Mainnet",
    iconUrls: ["https://app.dynamic.xyz/assets/networks/polygon.svg"],
    nativeCurrency: {
      decimals: 18,
      name: "MATIC",
      symbol: "MATIC",
    },
    networkId: 137,
    rpcUrls: ["https://polygon-rpc.com"],
    shortName: "MATIC",
    vanityName: "Polygon",
  },
];

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <>
      <DynamicContextProvider
        settings={{
          appLogoUrl: "/big-logo-ogronex.png",
          appName: "Ogronex",
          environmentId: "e3820802-a4f1-4d39-9fa2-2608bb776301",
          multiWallet: false,
          evmNetworks,
          walletsFilter: SortWallets([
            "phantomevm",
            "metamask",
            "walletconnect",
            "coinbase",
          ]),
          defaultNumberOfWalletsToShow: 4,
          newToWeb3WalletChainMap: {
            primary_chain: "evm",
            wallets: {
              evm: "metamask",
              solana: "phantom",
            },
          },
        }}
      >
        <DynamicWagmiConnector>
          <App />
          <Analytics />
        </DynamicWagmiConnector>
      </DynamicContextProvider>
    </>
  </React.StrictMode>
);