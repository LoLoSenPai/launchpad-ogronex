import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import NftABI from '../ABI/TBT_NFT.json';
import RaffleABI from '../ABI/RaffleG_0.json';

const contractNftAddress = "0x5E82c890a9531784F5c2730C16c76361670D0429";
const contractRaffleAddress = "0x84D78f7826e4d614B294DD1A65aeAb3e08CbC738";

export const useContracts = (provider) => {
  const [contracts, setContracts] = useState({
    contractNft: null,
    contractRaffle: null,
  });
  
  useEffect(() => {
    if (provider) {
      const contractNft = new ethers.Contract(contractNftAddress, NftABI.abi, provider.getSigner());
      const contractRaffle = new ethers.Contract(contractRaffleAddress, RaffleABI.abi, provider.getSigner());
      
      setContracts({ contractNft, contractRaffle });
    }
  }, [provider]);
  
  return contracts;
};
