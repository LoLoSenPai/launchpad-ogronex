import React, { useState, useEffect, useCallback, useContext } from "react";
import { DynamicWidget } from "@dynamic-labs/sdk-react";
import { useAccount, useBalance } from "wagmi";
import { ethers } from "ethers";
import { Network, Alchemy } from 'alchemy-sdk';
import CountdownComponent from "../Components/Countdown";
import RaffleABI from "../ABI/launchpadRaffle.json";
import NftABI from "../ABI/Infected_NFT.json";
// import whitelistGuaranteed from '../Whitelist/whitelistGuaranteed.json';
// import whitelistOG from '../Whitelist/whitelistOG.json';
// import whitelistWL from '../Whitelist/whitelistWL.json';

// Just for testing
import dataWhiteListGuaranteed from '../Whitelist/dataWhiteListGuaranteed.json';
import dataWhiteListOG from '../Whitelist/dataWhiteListOG.json';
import dataWhiteListWL from '../Whitelist/dataWhiteListWL.json';
// Just for testing

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SaleStatusContext } from "../Context/SaleStatusContext";
import SaleButton from "../Components/SaleButton";
import TermsAndConditions from "./TermsAndConditions";
import { ClaimCountdown } from "../Components/ClaimCountdown";
// import ShareButton from "../Components/ShareButton";

const contractNftAddress = "0xe152A5552A9b11751a28981CBe7d1Dc4A6bc6223";
const contractRaffleAddress = "0xFA820767b124d6537a39F949De036f534f2ACE6B";

export default function Home() {

  const { address, isConnected } = useAccount();
  const balance = useBalance({ address: address });

  const [ticketCount, setTicketCount] = useState(1);
  const [remainingTickets, setRemainingTickets] = useState(0);
  const [ticketsBought, setTicketsBought] = useState(0);
  const [nftSupply, setNftSupply] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [waitingBuy, setWaitingBuy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableToMint, setAvailableToMint] = useState(0);

  const [showTooltipHolder, setShowTooltipHolder] = useState(false);
  const [showTooltipOG, setShowTooltipOG] = useState(false);
  const [showTooltipWL, setShowTooltipWL] = useState(false);
  const [showTooltipPublic, setShowTooltipPublic] = useState(false);
  const [hasBalance, setHasBalance] = useState(false);
  const [showModalWinner, setShowModalWinner] = useState(false);
  const [showModalLooser, setShowModalLooser] = useState(false);
  const [showModalPending, setShowModalPending] = useState(false);

  //winner state
  const [isWinnerRaffle, setIsWinnerRaffle] = useState(false);
  const [hasCheckedWinner, setHasCheckedWinner] = useState(false);
  const [winnerNbMint, setWinnerNbMint] = useState(0);
  const [hasNotMinted, setHasNotMinted] = useState(false);
  const [appIsRaffleOver, setAppIsRaffleOver] = useState(false);

  const { holder, guaranteed, whitelistFCFS, publicSale } = useContext(SaleStatusContext);
  // Use `guaranteed.status`, `guaranteed.start`, `guaranteed.end` etc


  const getAlchemyProviderAndData = async () => {
    const settings = {
      apiKey: "kKaUsI3UwlljF-I3np_9fWNG--9i9RlF",
      network: Network.MATIC_MAINNET,
    };
    try {
      const alchemy = new Alchemy(settings);
      const maticProvider = await alchemy.config.getProvider();
      const contractRaffleBeforeConnection = new ethers.Contract(contractRaffleAddress, RaffleABI, maticProvider);
      const contractNftBeforeConnection = new ethers.Contract(contractNftAddress, NftABI, maticProvider);
      const ticketsSold = await contractRaffleBeforeConnection.nbTicketSell();
      const isOver = await contractNftBeforeConnection.isRaffleOver();
      const nftsupply = await contractNftBeforeConnection.totalSupply();
      setTicketsSold(ticketsSold.toNumber());
      setAppIsRaffleOver(isOver);
      setNftSupply(nftsupply.toNumber());
    } catch (error) {
      console.error("An error occurred while fetching data:", error);
    }
  };

  const ticketPrice = 1;

  const isWhitelisted = useCallback((address) => {
    if (holder.status === "Live") {
      return dataWhiteListGuaranteed.find(item => item.address === address);
    } else if (guaranteed.status === "Live") {
      return dataWhiteListOG.find(item => item.address === address);
    } else if (whitelistFCFS.status === "Live") {
      return dataWhiteListWL.find(item => item.address === address);
    }
    else {
      return false;
    }
  }, [holder.status, guaranteed.status, whitelistFCFS.status]);


  // Tooltip for i icon
  const handleMouseEnterHolder = () => {
    setShowTooltipHolder(true);
  };
  const handleMouseLeaveHolder = () => {
    setShowTooltipHolder(false);
  };

  const handleMouseEnter = () => {
    setShowTooltipOG(true);
  };
  const handleMouseLeave = () => {
    setShowTooltipOG(false);
  };

  const handleMouseEnterWL = () => {
    setShowTooltipWL(true);
  };
  const handleMouseLeaveWL = () => {
    setShowTooltipWL(false);
  };

  const handleMouseEnterPublic = () => {
    setShowTooltipPublic(true);
  };
  const handleMouseLeavePublic = () => {
    setShowTooltipPublic(false);
  };

  const handleIncrease = () => {
    if (ticketCount < maxTickets) {
      setTicketCount(ticketCount + 1);
    }
  };

  const handleDecrease = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  const getTicketsSold = async () => {
    if (!isConnected) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractRaffle = new ethers.Contract(contractRaffleAddress, RaffleABI, signer);
    const ticketsSold = await contractRaffle.nbTicketSell();
    setTicketsSold(ticketsSold.toNumber());
  };

  const getRaffleOver = async () => {
    if (!isConnected) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractNft = new ethers.Contract(contractNftAddress, NftABI, signer);
    const isOver = await contractNft.isRaffleOver();
    setAppIsRaffleOver(isOver);
  };

  const getTotalSupply = async () => {
    if (!isConnected) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractNft = new ethers.Contract(contractNftAddress, NftABI, signer);
    const nftsupply = await contractNft.totalSupply();
    setNftSupply(nftsupply.toNumber());
  };

  const getTicketsBought = useCallback(async () => {
    if (!isConnected) return;
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractRaffle = new ethers.Contract(contractRaffleAddress, RaffleABI, signer);
      const idPlayer = await contractRaffle.idByAddress(address);
      const player = await contractRaffle.playersList(idPlayer);
      if (player.addressPlayer === address) {
        const ticketsBought = player.ticketsBought;
        setTicketsBought(ticketsBought.toNumber());
      } else {
        setTicketsBought(0);
      }
    } catch (error) {
      console.error("Error getting tickets bought:", error);
    }
  }, [address]);

  async function buyTickets() {
    if (isConnected) {
      try {
        setWaitingBuy(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractRaffle = new ethers.Contract(contractRaffleAddress, RaffleABI, signer);
        const tx = await contractRaffle.buyTicket(ticketCount, { value: ethers.utils.parseEther((ticketCount * ticketPrice).toString()) });
        await provider.waitForTransaction(tx.hash);
        toast.success("You're in the game! Good luck for the draw!");
        setWaitingBuy(false);
        await getTicketsBought();
        await getTicketsSold();
      } catch (error) {
        toast.error("Transaction error! But don't worry, even the best stumble sometimes!");
        setWaitingBuy(false);
      }
    }
  }

  async function whiteListMint() {
    if (!isConnected) return // conditionner aussi a la phase guarranteed Mint
    try {
      // conditionner la WL en function de la phase (holder, og and wl)!
      setWaitingBuy(true);
      const whitelistObject = isWhitelisted(address);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractNft = new ethers.Contract(contractNftAddress, NftABI, signer);
      const tx = await contractNft.whitelistMint(availableToMint, whitelistObject.proof, ticketCount, { value: ethers.utils.parseEther((ticketCount * 0.5).toString()) });
      await provider.waitForTransaction(tx.hash);
      setWaitingBuy(false);
      toast.success("Success Mint !");
      let alreadyMintGuaranted = 0;
      let alreadyMintOG = 0;
      let alreadyMintWL = 0;
      if (holder.status === "Live") {
        alreadyMintGuaranted = await contractNft.alreadyMintedHolders(address)
        setRemainingTickets(availableToMint - alreadyMintGuaranted);
        toast.success(`You have already mint ${alreadyMintGuaranted} NFT`)
      }
      if (guaranteed.status === "Live") {
        alreadyMintOG = await contractNft.alreadyMintedOG(address)
        setRemainingTickets(availableToMint - alreadyMintOG);
        toast.success(`You have already mint ${alreadyMintOG} NFT`)
      }
      if (whitelistFCFS.status === "Live") {
        alreadyMintWL = await contractNft.alreadyMintedWhitelist(address)
        setRemainingTickets(availableToMint - alreadyMintWL);
        toast.success(`You have already mint ${alreadyMintWL} NFT`)
      }
      const newRemainingTickets = availableToMint - alreadyMintGuaranted - alreadyMintOG - alreadyMintWL;
      setRemainingTickets(newRemainingTickets);
      localStorage.setItem('remainingTickets', newRemainingTickets.toString());
      await getTotalSupply();
    } catch (error) {
      if (error.message.includes('execution reverted')) {
        const errorMessage = error.reason.split(':')[1].trim();
        toast.error(errorMessage)
      } else (
        toast.error("Transaction error! But don't worry, even the best stumble sometimes!")
      )
      setWaitingBuy(false);
    }
  }

  async function winnerRaffleMint() {
    if (!isConnected && !isWinnerRaffle) return; // conditionner aussi a la phase winner Mint
    try {
      if (!hasNotMinted) {
        toast.error("You have already minted your winning ticket!");
        return;
      }
      setWaitingBuy(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractNft = new ethers.Contract(contractNftAddress, NftABI, signer);
      const tx = await contractNft.winnerRaffleSaleMint();
      await provider.waitForTransaction(tx.hash);
      toast.success("Success Mint !");
    } catch (error) {
      toast.error("Transaction error! But don't worry, even the best stumble sometimes!")
    } finally {
      setWaitingBuy(false);
    }
  }

  async function checkWinner() {
    if (!isConnected && !appIsRaffleOver) return false; // need to be connected and raffleOver
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractNft = new ethers.Contract(contractNftAddress, NftABI, signer);
      const winnerData = await contractNft.winnerByAddress(address);
      const isWinner = winnerData.addressWinner === address && winnerData.numberOfWin > 0;
      const notMinted = winnerData.notMinted;
      setHasNotMinted(notMinted);
      if (isWinner) {
        setIsWinnerRaffle(true);
        setWinnerNbMint(winnerData.numberOfWin.toNumber());
        toast.success("LUCKY ! GO MINT 🎫");
      } else {
        setIsWinnerRaffle(false);
      }
      return isWinner;
    } catch (error) {
      console.log("Error checking winner:", error);
    }
  }

  useEffect(() => {
    const remainingTicketsFromLocalStorage = localStorage.getItem('remainingTickets');
    if (remainingTicketsFromLocalStorage) {
      setRemainingTickets(Number(remainingTicketsFromLocalStorage));
    } else {
      setRemainingTickets(availableToMint);
    }
  }, [availableToMint]);

  useEffect(() => {
    if (holder.status === 'Live' || publicSale.status === 'Ended') {
      setTicketCount(remainingTickets);
    } else {
      setTicketCount(1);
    }
  }, [holder.status, publicSale.status, remainingTickets]);

  // useEffect(() => {
  //   if (isConnected) {
  //     getTicketsBought();
  //     getTicketsSold();
  //     getRaffleOver();
  //     getTotalSupply()
  //   } else {
  //     (async function fetchProviderAndData() {
  //       await getAlchemyProviderAndData();
  //     })();
  //   }
  // }, [address]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (isConnected) {
        await getTicketsBought();
        await getTicketsSold();
        await getRaffleOver();
        await getTotalSupply()
      } else {
        await getAlchemyProviderAndData();
      }
      setLoading(false);
    }
    fetchData();
  }, [address]);


  useEffect(() => {
    const whitelistObject = isWhitelisted(address);
    let newAvailableToMint = whitelistObject ? whitelistObject.availableToMint : undefined;
    // Check if a value is saved in localStorage
    const availableToMintFromStorage = localStorage.getItem('availableToMint');
    if (availableToMintFromStorage) {
      // Use the value from localStorage if it exists
      newAvailableToMint = availableToMintFromStorage;
    }
    setAvailableToMint(newAvailableToMint);
    // Save the value in localStorage
    localStorage.setItem('availableToMint', newAvailableToMint);
  }, [address, isWhitelisted]);

  // useEffect(() => {
  //   const whitelistObject = isWhitelisted(address);
  //   setAvailableToMint(whitelistObject ? whitelistObject.availableToMint : undefined);
  // }, [address, isWhitelisted]);

  useEffect(() => {
    if (!isConnected) return;
    if (balance.data && typeof ticketCount === 'number' && typeof ticketPrice === 'number') {
      const userBalanceInWei = balance.data.value;
      const ticketCostInWei = ethers.utils.parseEther((ticketCount * ticketPrice).toString());
      setHasBalance(() => ticketCostInWei.lte(userBalanceInWei));
    } else {
      setHasBalance(false);
    }
  }, [address, ticketCount]);


  let maxTickets = 1;
  let showInput = true;
  if (holder.status === 'Live') {
    maxTickets = remainingTickets;
  }
  else if (guaranteed.status === 'Live') {
    maxTickets = 1;
  }
  else if (whitelistFCFS.status === 'Live') {
    maxTickets = 1;
  }
  else if (publicSale.status === 'Live') {
    maxTickets = 100000;
  }
  else if (publicSale.status === 'Ended') {
    maxTickets = winnerNbMint;
    showInput = false;
  }
  else {
    maxTickets = 1;
  }

  return (
    <>
      <ToastContainer
        position="bottom-center"
        theme="dark"
      />
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
      <div className="homepage py-10 px-2 lg:px-5 xl:px-0 md:justify-center xl:max-w-[80vw] md:mx-auto">

        <header className="navbar px-0 -ml-6 md:-ml-0 md:px-2">
          <nav className="flex justify-center md:justify-between gap-0">
            <div className="invisible md:visible ">
              <a href="/" className="">
                <span className="sr-only">Ogronex</span>
                <img
                  className="h-11 md:h-14 w-auto"
                  src="./Images/logo.png"
                  alt="Ogronex logo"
                />
              </a>
            </div>
            <div className="flex flex-row items-center gap-4 md:gap-8 z-30">
              <TermsAndConditions />
              <div className="z-30">
                <DynamicWidget variant='dropdown' />
              </div>
            </div>
          </nav>
        </header>

        <main className="relative lg:justify-center">

          <div className="flex flex-col-reverse md:flex-row justify-center w-full xl:pl-35">
            <div className="flex flex-col mt-10 w-full gap-6 px-4">
              <div className="flex justify-between xl:justify-normal items-center p-0 md:p-3 md:pl-0 xl:ml-5">
                <h1 className="text-xl md:text-6xl font-bold text-white">Infected Dalmatians</h1>
                <div className="flex flex-col md:flex-row items-center gap-3 xl:ml-10">
                  <a href="https://discord.gg/boxbies" target="_blank" rel="noreferrer"><i className="fab fa-discord text-lg text-gray-500"></i></a>
                  <a href="https://twitter.com/dalmatiansnft" target="_blank" rel="noreferrer"><i className="fab fa-twitter text-lg text-gray-500"></i></a>
                  <a href="https://www.boxbies.io/" target="_blank" rel="noreferrer"><i className="fas fa-globe text-lg text-gray-500"></i></a>
                </div>
              </div>
              <div className="flex flex-row xl:max-w-[70%] xl:px-4 pb-3 md:pb-0">
                <p className="text-justify md:text-lg xl:text-xl font-bold text-gray-500">
                  The dogs ate the toxic fud, they were infected!
                  oh man...
                  now a troop of infected dalmatians are coming your way!
                  Do you want to catch them or run away?
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center lg:mt-10 sm:max-md:overflow-hidden lg:pb-10 xl:pb-12">
            <div className="flex justify-center items-center w-full max-w-[400px] lg:min-w-[500px] xl:max-w-[600px] h-auto overflow-hidden md:overflow-visible pt-8 pb-12 lg:pb-8">
              <img className="w-full scale-125" src="./Images/prize-maschine-infected-dalmatians.png" alt="maschine with a hook to grab prize" />
            </div>
            <div className="flex flex-col md:mt-10 w-full md:max-w-[420px] lg:max-w-[510px] xl:max-w-[650px] z-10 gap-6">

              <div className="flex flex-row py-4 px-2 md:p-4 xl:px-0 bg-secondary rounded-lg justify-around gap-3 md:gap-7 lg:gap-0 border border-gray-600 bg-opacity-60">
                <p className="flex flex-col xl:flex-row text-md lg:text-lg xl:text-xl font-bold text-white">Mint price:<span className=" text-sm md:text-md lg:text-lg xl:text-xl text-light">FREE</span><span className=" text-gray-400 text-xs lg:text-sm">+ 1 MATIC ticket fee</span>
                </p>
                <p className="flex flex-col xl:flex-row text-md lg:text-lg xl:text-xl font-bold text-white">Supply:<span className="text-center text-light"> {nftSupply} / 5000</span>
                </p>
                <div className="flex flex-col xl:flex-row text-md lg:text-lg xl:text-xl font-bold text-white">
                  Tickets sold:
                  <div className="flex justify-end">
                    <span className="ml-1 text-light">{ticketsSold}</span>
                    <span className="ml-1 text-gray-400 text-md">/ &#8734;</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:gap-6">

                <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-2 xl:gap-10 p-4 bg-four rounded-lg border border-gray-600 justify-center md:justify-between">
                  <div className="relative lg:text-lg xl:text-xl font-bold text-white">
                    Holders
                    <span
                      className="ml-3 text-light border border-light rounded-full px-2 text-sm"
                      onMouseEnter={handleMouseEnterHolder}
                      onMouseLeave={handleMouseLeaveHolder}
                    >
                      i
                    </span>
                    {showTooltipHolder &&
                      <div className="text-center tooltip absolute left-1/2 top-full -translate-x-1/2 transform whitespace-nowrap rounded bg-secondary bg-opacity-80 p-2 text-white z-10">
                        Boxbies and Dalmatians Holders
                      </div>
                    }
                  </div>
                  <div className="flex flew-row justify-center lg:px-2">
                    <p className={"flex items-center xl:text-xl font-bold text-white bg-secondary py-2 px-6 md:px-2 lg:px-6 rounded-lg border border-gray-600 bg-opacity-60 md:h-[66px] xl:h-[74px] min-w-[160px] md:min-w-[80px] md:max-w-[90px] lg:min-w-[160px] xl:min-w-[180px]"}>
                      <i className={`fas fa-circle pr-2 text-light text-sm animate-pulse ${holder.status === 'Live' ? 'text-green-500' : 'text-red-500'}`}></i>
                      {holder.status}
                    </p>
                  </div>
                  {holder.status !== 'Ended' && (
                    <div className="flex flex-col justify-end md:-ml-1.5 lg:ml-2 xl:ml-0 min-w-[170px] xl:min-w-[233px]">
                      <div className="flex flex-col text-center text-md text-gray-400 bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60">
                        {holder.status === 'Not Started' &&
                          <>
                            Live in
                            <span className="text-white pl-2 xl:text-xl">
                              <CountdownComponent deadline={holder.start} />
                            </span>
                          </>
                        }
                        {holder.status === 'Live' &&
                          <>
                            Ends in
                            <span className="text-white pl-2 xl:text-xl">
                              <CountdownComponent deadline={holder.end} />
                            </span>
                          </>
                        }
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-2 xl:gap-10 p-4 bg-four rounded-lg border border-gray-600 justify-center md:justify-between">
                  <div className="relative lg:text-lg xl:text-xl font-bold text-white">
                    OG FCFS
                    <span
                      className="ml-3 text-light border border-light rounded-full px-2 text-sm"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      i
                    </span>
                    {showTooltipOG &&
                      <div className="text-center tooltip absolute left-1/2 top-full -translate-x-1/2 transform whitespace-nowrap rounded bg-secondary bg-opacity-80 p-2 text-white z-10">
                        One mint per wallet
                      </div>
                    }
                  </div>
                  <div className="flex flew-row justify-center lg:px-2">
                    <p className={"flex items-center xl:text-xl font-bold text-white bg-secondary py-2 px-6 md:px-2 lg:px-6 rounded-lg border border-gray-600 bg-opacity-60 md:h-[66px] xl:h-[74px] min-w-[160px] md:min-w-[80px] md:max-w-[90px] lg:min-w-[160px] xl:min-w-[180px]"}>
                      <i className={`fas fa-circle pr-2 text-light text-sm animate-pulse ${guaranteed.status === 'Live' ? 'text-green-500' : 'text-red-500'}`}></i>
                      {guaranteed.status}
                    </p>
                  </div>
                  {guaranteed.status !== 'Ended' && (
                    <div className="flex flex-col justify-end md:-ml-1.5 lg:ml-2 xl:ml-0 min-w-[170px] xl:min-w-[233px]">
                      <div className="flex flex-col text-center text-md text-gray-400 bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60">
                        {guaranteed.status === 'Not Started' &&
                          <>
                            Live in
                            <span className="text-white pl-2 xl:text-xl">
                              <CountdownComponent deadline={guaranteed.start} />
                            </span>
                          </>
                        }
                        {guaranteed.status === 'Live' &&
                          <>
                            Ends in
                            <span className="text-white pl-2 xl:text-xl">
                              <CountdownComponent deadline={guaranteed.end} />
                            </span>
                          </>
                        }
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-2 xl:gap-10 p-4 bg-four rounded-lg border border-gray-600 justify-center md:justify-between">
                  <div className="relative lg:text-lg xl:text-xl font-bold text-white">
                    Whitelist FCFS
                    <span
                      className="ml-3 text-light border border-light rounded-full px-2 text-sm"
                      onMouseEnter={handleMouseEnterWL}
                      onMouseLeave={handleMouseLeaveWL}
                    >
                      i
                    </span>
                    {showTooltipWL &&
                      <div className="text-center tooltip absolute left-1/2 top-full -translate-x-1/2 transform whitespace-nowrap rounded bg-secondary bg-opacity-80 p-2 text-white z-10">
                        One mint per wallet
                      </div>
                    }
                  </div>
                  <div className="flex flew-row justify-center lg:px-2">
                    <div className={"flex items-center xl:text-xl font-bold text-white bg-secondary py-2 px-6 md:px-2 lg:px-6 rounded-lg border border-gray-600 bg-opacity-60 md:h-[66px] xl:h-[74px] min-w-[160px] md:min-w-[80px] md:max-w-[90px] lg:min-w-[160px] xl:min-w-[180px]"}>
                      <i className={`fas fa-circle pr-2 text-light text-sm animate-pulse ${whitelistFCFS.status === 'Live' ? 'text-green-500' : 'text-red-500'}`}></i>
                      {whitelistFCFS.status}
                    </div>
                  </div>
                  {whitelistFCFS.status !== 'Ended' && (
                    <div className="flex flex-col justify-end md:-ml-1.5 lg:ml-2 xl:ml-0 min-w-[170px] xl:min-w-[233px]">
                      <div className="flex flex-col text-center text-md text-gray-400 bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60">
                        {whitelistFCFS.status === 'Not Started' &&
                          <>
                            Live in
                            <span className="text-white pl-2 xl:text-xl">
                              <CountdownComponent deadline={whitelistFCFS.start} />
                            </span>
                          </>
                        }
                        {whitelistFCFS.status === 'Live' &&
                          <>
                            Ends in
                            <span className="text-white pl-2 xl:text-xl">
                              <CountdownComponent deadline={whitelistFCFS.end} />
                            </span>
                          </>
                        }
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col md:flex-row items-center p-4 bg-four rounded-lg border border-gray-600 gap-4 md:gap-6 md:justify-between">
                  <div className="relative lg:text-lg xl:text-xl font-bold text-white xl:mr-5">
                    Public
                    <span
                      className="ml-3 text-light border border-light rounded-full px-2 text-sm"
                      onMouseEnter={handleMouseEnterPublic}
                      onMouseLeave={handleMouseLeavePublic}
                    >
                      i
                    </span>
                    {showTooltipPublic && (
                      <div className="tooltip absolute left-1/2 top-full -translate-x-1/2 transform whitespace-normal md:whitespace-nowrap rounded bg-secondary bg-opacity-80 p-2 text-white text-center text-md min-w-[75vw] md:min-w-[60vw] xl:min-w-[30vw] overflow-hidden text-overflow-ellipsis z-10">
                        All winners will be drawn few minutes after the end.
                      </div>
                    )}
                  </div>
                  <div className="flex flew-row justify-center lg:ml-2">
                    <div className={"flex items-center xl:text-xl font-bold text-white bg-secondary py-2 px-6 md:px-2 lg:px-6 rounded-lg border border-gray-600 bg-opacity-60 md:h-[66px] xl:h-[74px] min-w-[160px] md:min-w-[80px] md:max-w-[90px] lg:min-w-[160px] xl:min-w-[180px]"}>
                      <i className={`fas fa-circle pr-2 text-light text-sm animate-pulse ${publicSale.status === 'Live' ? 'text-green-500' : 'text-red-500'}`}></i>
                      {publicSale.status}
                    </div>
                  </div>
                  {publicSale.status !== "Ended" && (
                    <div className="flex flex-col lg:justify-end min-w-[170px] xl:min-w-[233px]">
                      <div className="flex flex-col text-center text-md text-gray-400 bg-secondary py-2 xl:py-2.5 px-6 rounded-lg border border-gray-600 bg-opacity-60">
                        {publicSale.status === "Not Started" &&
                          <>
                            Live in
                            <span className="text-white pl-2 xl:text-xl">
                              <CountdownComponent deadline={publicSale.start} />
                            </span>
                          </>
                        }
                        {publicSale.status === "Live" &&
                          <>
                            Ends in
                            <span className="text-white pl-2 xl:text-xl">
                              <CountdownComponent deadline={publicSale.end} />
                            </span>
                          </>
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 lg:flex flew-row gap-2 md:gap-4 lg:gap-6 xl:gap-11 w-full max-h-[70px] justify-between">
                {showInput && (
                  <div className="flex justify-around items-center rounded-lg border border-gray-600 bg-secondary z-10">
                    <button className="w-10 h-14 rounded-l-lg text-white text-2xl" onClick={handleDecrease}>
                      -
                    </button>
                    <input
                      type="number"
                      className="w-4 md:w-6 lg:w-10 h-14 rounded-none bg-secondary text-white text-xl text-center"
                      min={1}
                      max={maxTickets}
                      value={ticketCount}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          setTicketCount(1);
                        } else {
                          setTicketCount(Math.min(parseInt(e.target.value), maxTickets));
                        }
                      }}
                    />
                    <button className="w-10 h-14 rounded-r-lg text-white text-2xl" onClick={handleIncrease}>
                      +
                    </button>
                  </div>
                )}
                <SaleButton
                  isConnected={isConnected}
                  waitingBuy={waitingBuy}
                  hasBalance={hasBalance}
                  address={address}
                  isWhitelisted={isWhitelisted}
                  isWinnerRaffle={isWinnerRaffle}
                  whiteListMint={whiteListMint}
                  buyTickets={buyTickets}
                  checkWinner={checkWinner}
                  winnerRaffleMint={winnerRaffleMint}
                  appIsRaffleOver={appIsRaffleOver}
                  setShowModalWinner={setShowModalWinner}
                  showModalWinner={showModalWinner}
                  setShowModalLooser={setShowModalLooser}
                  showModalLooser={showModalLooser}
                  setShowModalPending={setShowModalPending}
                  showModalPending={showModalPending}
                  setHasCheckedWinner={setHasCheckedWinner}
                  hasCheckedWinner={hasCheckedWinner}
                  holder={holder}
                  guaranteed={guaranteed}
                  whitelistFCFS={whitelistFCFS}
                  publicSale={publicSale}
                  setIsWinnerRaffle={setIsWinnerRaffle}
                  remainingTickets={remainingTickets}
                />

                <div className="flex flex-col justify-center items-center lg:min-w-[110px] pr-3">
                  {guaranteed.status === 'Live' && isConnected && availableToMint && (
                    <p className="flex items-center lg:text-xl text-white sm:mt-3 md:mt-1">
                      Available to mint:
                      <span className="ml-12 md:ml-12 lg:ml-8 text-light ">{remainingTickets}</span>
                    </p>
                  )}
                  <p className="flex justify-content items-end lg:text-xl text-white leading-tight mt-2 xl:mt-0">
                    Your tickets:
                    {isConnected && <span className="ml-1 text-light">{ticketsBought}</span>}
                  </p>
                  {isConnected && hasCheckedWinner && (
                    <p className="flex items-center lg:text-xl text-white sm:mt-3 md:mt-1">
                      Won:
                      <span className="ml-12 md:ml-12 lg:ml-8 text-light ">{winnerNbMint}</span>
                    </p>
                  )}
                </div>
              </div>
              {/* <ShareButton /> */}
              {publicSale.status === "Ended" &&
                <div className="flex flex-col justify-center items-center mt-4">
                  <div className="text-center text-white text-md md:text-lg lg:text-xl font-bold">
                    <ClaimCountdown deadline={publicSale.end} />
                  </div>
                </div>
              }
            </div>
          </div>
          <div className="flex flex-row justify-end mt-10 lg:mt-0 mr-2 md:mr-5">
            <p className="text-xl font-bold text-gray-400">Powered by <span className="text-light">Ogronex</span>
            </p>
          </div>
        </main>
      </div>
    )}
    </>
  )
}