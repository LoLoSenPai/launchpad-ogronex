import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import RaffleABI from '../ABI/RaffleG_0.json';
import NftABI from '../ABI/TBT_NFT.json';

export default function useContracts() {
  const [provider, setProvider] = useState(null);
  const [contractRaffle, setContractRaffle] = useState(null);
  const [contractNft, setContractNft] = useState(null);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [isRaffleOver, setIsRaffleOver] = useState(false);
  const [nftSupply, setNftSupply] = useState(0);

  const contractNftAddress = "0xe4b528300ef4e839097f74fa2551c6f1b47e9853";
  const contractRaffleAddress = "0xFA820767b124d6537a39F949De036f534f2ACE6B";

  useEffect(() => {
    const getProviderAndData = async () => {
      try {
        const alchemyProvider = new ethers.providers.AlchemyProvider('MATIC_MAINNET', 'kKaUsI3UwlljF-I3np_9fWNG--9i9RlF');

        const contractRaffleInstance = new ethers.Contract(contractRaffleAddress, RaffleABI, alchemyProvider);
        const contractNftInstance = new ethers.Contract(contractNftAddress, NftABI, alchemyProvider);

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
    };

    getProviderAndData();
  }, []);

  return { provider, contractRaffle, contractNft, ticketsSold, isRaffleOver, nftSupply };
}