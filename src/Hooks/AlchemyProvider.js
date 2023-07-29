import { useState, useEffect } from 'react';
import { Network, Alchemy } from 'alchemy-sdk';

const settings = {
  apiKey: "ZQYOoMuEPgZwfP0yxEz1NzGyn2y2qCTW",
  network: Network.MATIC_MAINNET,
};

const useAlchemy = () => {
  const [alchemy, setAlchemy] = useState(null);
  
  useEffect(() => {
    const alchemy = new Alchemy(settings);
    setAlchemy(alchemy);
  }, []);
  
  return alchemy;
};

export default useAlchemy;
