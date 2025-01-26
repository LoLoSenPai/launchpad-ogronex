import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RaffleABI from "../ABI/launchpadRaffle.json";
import NftABI from "../ABI/Infected_NFT.json";
import { Alchemy, Network } from 'alchemy-sdk'
import { CONTRACT_RAFFLE, CONTRACT_NFT } from '../Lib/constants';

export default function useContracts() {
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState(null);
  const [contractRaffle, setContractRaffle] = useState(null);
  const [contractNft, setContractNft] = useState(null);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [isRaffleOver, setIsRaffleOver] = useState(false);
  const [nftSupply, setNftSupply] = useState(0);


  useEffect(() => {
    const getProviderAndData = async () => {
      const settings = {
        apiKey: "kKaUsI3UwlljF-I3np_9fWNG--9i9RlF",
        network: Network.MATIC_MAINNET,
      };
      setLoading(true);
      try {
        const alchemy = new Alchemy(settings);
        const alchemyProvider = await alchemy.config.getProvider();

        const contractRaffleInstance = new ethers.Contract(CONTRACT_RAFFLE, RaffleABI, alchemyProvider);
        const contractNftInstance = new ethers.Contract(CONTRACT_NFT, NftABI, alchemyProvider);

        const ticketsSold = await contractRaffleInstance.nbTicketSell();
        const isOver = await contractNftInstance.isRaffleOver();
        const nftSupply = await contractNftInstance.totalSupply();

        setProvider(alchemyProvider);
        setContractRaffle(contractRaffleInstance);
        setContractNft(contractNftInstance);
        setTicketsSold(ticketsSold.toNumber());
        setIsRaffleOver(isOver);
        setNftSupply(nftSupply.toNumber());

      } catch (error) {
        console.error("An error occurred while fetching data:", error);
      }
      setLoading(false);
    };

    getProviderAndData();
  }, []);

  return { provider, contractRaffle, contractNft, ticketsSold, isRaffleOver, nftSupply, loading };
}