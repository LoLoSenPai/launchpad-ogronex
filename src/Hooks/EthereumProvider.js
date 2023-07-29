import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useEthereumProvider = () => {
  const [provider, setProvider] = useState(null);
  
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
    } else {
      console.log("Please install an Ethereum-compatible browser or extension like MetaMask to use this dApp!");
    }
  }, []);
  
  return provider;
};
