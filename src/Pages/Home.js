import React, { useState, useEffect, useCallback, useContext } from "react";
import { DynamicWidget } from "@dynamic-labs/sdk-react";
import { useAccount, useBalance } from "wagmi";
import { ethers } from "ethers";
import { Network, Alchemy } from 'alchemy-sdk';
import CountdownComponent from "../Components/Countdown";
import RaffleABI from "../ABI/launchpadRaffle.json";
import NftABI from "../ABI/Infected_NFT.json";
import whitelistGuaranteed from '../Whitelist/whitelistGuaranteed.json';
import whitelistOG from '../Whitelist/whitelistOG.json';
import whitelistWL from '../Whitelist/whitelistWL.json';

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
import ShareButton from "../Components/ShareButton";

const contractNftAddress = "0x23c52B5D1E7a5cC70737BFc1Ad1d12f5515caf17";
const contractRaffleAddress = "0xB63bc9Af975eEfB37377E9D1a2175428c6CcCf2F";

export default function Home() {

  const { address, isConnected } = useAccount();
  const balance = useBalance({ address: address });

  const [ticketCount, setTicketCount] = useState(1);
  const [ticketsBought, setTicketsBought] = useState(0);
  const [nftSupply, setNftSupply] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [waitingBuy, setWaitingBuy] = useState(false);

  const [availableToMint, setAvailableToMint] = useState(undefined);

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
  const [isRaffleOver, setIsRaffleOver] = useState(false);


  const { holder, guaranteed, whitelistFCFS, publicSale } = useContext(SaleStatusContext);
  // Use `guaranteed.status`, `guaranteed.start`, `guaranteed.end`, `public.status`, `public.start`, `public.end`, `whitelistFCFS.status`, `whitelistFCFS.start`, `whitelistFCFS.end` to get the status of each sale


  const START_TIMESTAMP = 1690895400; //Wed Aug 02 2023 14:00:00 GMT+0
  const OG_START_TIMESTAMP = 1690896600; //Thu Aug 03 2023 14:00:00 GMT+0
  const WL_START_TIMESTAMP = 1690897800; //Thu Aug 03 2023 15:00:00 GMT+0
  const WL_END_TIMESTAMP = 1691078400; //Thu Aug 03 2023 16:00:00 GMT+0
  const START_RAFFLE_TIMESTAMP = 1691078400;//Thu Aug 03 2023 16:00:00 GMT+0
  const END_RAFFLE_TIMESTAMP = 1691089200;//Thu Aug 03 2023 19:00:00 GMT+0
  // const START_TIMESTAMP = 1690984800; //Wed Aug 02 2023 14:00:00 GMT+0
  // const OG_START_TIMESTAMP = 1691071200; //Thu Aug 03 2023 14:00:00 GMT+0
  // const WL_START_TIMESTAMP = 1691074800; //Thu Aug 03 2023 15:00:00 GMT+0
  // const WL_END_TIMESTAMP = 1691078400; //Thu Aug 03 2023 16:00:00 GMT+0
  // const START_RAFFLE_TIMESTAMP = 1691078400;//Thu Aug 03 2023 16:00:00 GMT+0
  // const END_RAFFLE_TIMESTAMP = 1691089200;//Thu Aug 03 2023 19:00:00 GMT+0


  const getAlchemyProviderAndData = async () => {
    const settings = {
      apiKey: "kKaUsI3UwlljF-I3np_9fWNG--9i9RlF",
      network: Network.MATIC_MAINNET,
    };
    const alchemy = new Alchemy(settings);
    const maticProvider = await alchemy.config.getProvider();
    const contractRaffleBeforeConnection = new ethers.Contract(contractRaffleAddress, RaffleABI, maticProvider);
    const contractNftBeforeConnection = new ethers.Contract(contractNftAddress, NftABI, maticProvider);
    const ticketsSold = await contractRaffleBeforeConnection.nbTicketSell();
    const isOver = await contractNftBeforeConnection.isRaffleOver();
    const nftsupply = await contractNftBeforeConnection.totalSupply();
    setTicketsSold(ticketsSold.toNumber());
    setIsRaffleOver(isOver);
    setNftSupply(nftsupply.toNumber());
  };

  const ticketPrice = 0.01;

  // const isWhitelisted = (address) => {
  //   const now = Date.now();
  //   if (now < OG_START_TIMESTAMP) { //Thu Aug 03 2023 14:00:00 GMT+0 (OG_START_TIMESTAMP)
  //     return whitelistGuaranteed.some(item => item.address === address);
  //   } else if (now < WL_START_TIMESTAMP) { //Thu Aug 03 2023 15:00:00 GMT+0 (WL_START_TIMESTAMP)
  //     return whitelistOG.some(item => item.address === address);
  //   } else {
  //     return whitelistWL.some(item => item.address === address);
  //   }
  // }
  // Just for testing
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
    if ((guaranteed.status === 'Live' && ticketCount < 1) || publicSale.status === 'Live') {
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
    setIsRaffleOver(isOver);
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
      const now = Date.now();
      setWaitingBuy(true);
      // let addressWl;
      // let proofWl
      // let availableToMint;
      // if (now > START_TIMESTAMP && now <= OG_START_TIMESTAMP) {
      //   const result = dataWhiteListGuaranteed.map((data) => {
      //     if (data.address === address) {
      //       addressWl = data.address;
      //       proofWl = data.proof;
      //       availableToMint = data.availableToMint;
      //       console.log(proofWl);
      //     }
      //   });
      //   console.log("test");
      // } else if (now > OG_START_TIMESTAMP && now <= WL_START_TIMESTAMP) {
      //   const result = dataWhiteListOG.map((data) => {
      //     if (data.address === address) {
      //       addressWl = data.address;
      //       proofWl = data.proof;
      //       availableToMint = data.availableToMint;
      //     }
      //   });
      // } else {
      //   const result = dataWhiteListWL.map((data) => {
      //     if (data.address === address) {
      //       addressWl = data.address;
      //       proofWl = data.proof;
      //       availableToMint = data.availableToMint;
      //     }
      //   });
      // }
      // if (now > START_TIMESTAMP && now <= OG_START_TIMESTAMP) {
        //   const result = whitelistGuaranteed.map((data) => {
          //     if (data.address === address) {
      //       addressWl = data.address;
      //       proofWl = data.proof;
      //       availableToMint = data.availableToMint;
      //     }
      //   });
      // } else if (now > OG_START_TIMESTAMP && now <= WL_START_TIMESTAMP) {
      //   const result = whitelistOG.map((data) => {
      //     if (data.address === address) {
      //       addressWl = data.address;
      //       proofWl = data.proof;
      //       availableToMint = data.availableToMint;
      //     }
      //   });
      // } else {
      //   const result = whitelistWL.map((data) => {
      //     if (data.address === address) {
      //       addressWl = data.address;
      //       proofWl = data.proof;
      //       availableToMint = data.availableToMint;
      //     }
      //   });
      // }
      const whitelistObject = isWhitelisted(address);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractNft = new ethers.Contract(contractNftAddress, NftABI, signer);
      const tx = await contractNft.whitelistMint(availableToMint, whitelistObject.proof, ticketCount, { value: ethers.utils.parseEther((ticketCount * 1).toString()) });
      await provider.waitForTransaction(tx.hash);
      setWaitingBuy(false);
      toast.success("Success Mint !");
      if (now > START_TIMESTAMP && now <= OG_START_TIMESTAMP) {
        const alreadyMintGuaranted = await contractNft.alreadyMintedHolders(address)
        toast.success(`You have already mint ${alreadyMintGuaranted} NFT`)
      }
      if (now > OG_START_TIMESTAMP && now <= WL_START_TIMESTAMP) {
        const alreadyMintOG = await contractNft.alreadyMintedOG(address)
        toast.success(`You have already mint ${alreadyMintOG} NFT`)
      }
      if (now > WL_START_TIMESTAMP && now <= WL_END_TIMESTAMP) {
        const alreadyMintWL = await contractNft.alreadyMintedWhitelist(address)
        toast.success(`You have already mint ${alreadyMintWL} NFT`)
      }
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
      await checkWinner();
    } catch (error) {
      toast.error("Transaction error! But don't worry, even the best stumble sometimes!")
    } finally {
      setWaitingBuy(false);
    }
  }

  async function checkWinner() {
    if (!isConnected && !isRaffleOver) return false; // need to be connected and raffleOver
    try {
      console.log("Checking winner...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractNft = new ethers.Contract(contractNftAddress, NftABI, signer);
      const winnerData = await contractNft.winnerByAddress(address);
      console.log("Winner data:", winnerData);
      const isWinner = winnerData.addressWinner === address && winnerData.numberOfWin > 0;
      const notMinted = winnerData.notMinted;
      setHasNotMinted(notMinted);
      if (isWinner) {
        setIsWinnerRaffle(true);
        setWinnerNbMint(winnerData.numberOfWin.toNumber());
        console.log("User is a winner");
        toast.success("LUCKY ! GO MINT 🎫");
      } else {
        setIsWinnerRaffle(false);
        console.log("User is not a winner");
      }
      return isWinner;
    } catch (error) {
      console.log("Error checking winner:", error);
    }
  }

  useEffect(() => {
    if (isConnected) {
      getTicketsBought();
      getTicketsSold();
      getRaffleOver();
      getTotalSupply()
    } else {
      (async function fetchProviderAndData() {
        await getAlchemyProviderAndData();
      })();
    }
  }, [address]);

  useEffect(() => {
    const whitelistObject = isWhitelisted(address);
    setAvailableToMint(whitelistObject ? whitelistObject.availableToMint : undefined);
  }, [address, isWhitelisted]);

  useEffect (() => {
    if (!isConnected) return;
    if (balance.data) {
      const userBalanceInWei = balance.data.value;
      const ticketCostInWei = ethers.utils.parseEther((ticketCount * ticketPrice).toString());
      console.log("User balance:", userBalanceInWei.toString());
      setHasBalance(() => ticketCostInWei.lte(userBalanceInWei));
    } else {
      setHasBalance(false);
    }
  }, [address]);


  let maxTickets;
  let showInput = true;
  if (holder.status === 'Live') {
    maxTickets = availableToMint;
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
    // showInput = false;
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
              <div className="flex flex-row p-0 md:p-3 md:pl-0">
                <h1 className="text-6xl font-bold text-white">Boxbies</h1>
                <div className="flex flex-col md:flex-row items-center ml-5 md:mt-4 gap-3">
                  <a href="https://discord.gg/boxbies" target="_blank" rel="noreferrer"><i className="fab fa-discord text-lg text-gray-500"></i></a>
                  <a href="https://twitter.com/dalmatiansnft" target="_blank" rel="noreferrer"><i className="fab fa-twitter text-lg text-gray-500"></i></a>
                  <a href="https://www.boxbies.io/" target="_blank" rel="noreferrer"><i className="fas fa-globe text-lg text-gray-500"></i></a>
                </div>
              </div>
              <div className="flex flex-row xl:max-w-[70%] xl:px-4">
                <p className="text-justify md:text-lg xl:text-xl font-bold text-gray-500">
                  The dogs ate the toxic fud, they were infected!
                  oh man...
                  now a troop of infected dalmatians are coming your way!
                  Do you want to catch them or run away?
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center md:mt-10 sm:max-md:overflow-hidden lg:pb-10 xl:pb-12">
            <div className="flex justify-center items-center w-full max-w-[400px] lg:min-w-[500px] xl:max-w-[600px] h-auto overflow-hidden xl:overflow-visible pb-7 lg:pb-8">
              <img className="w-full scale-125" src="./Images/prize-maschine.png" alt="maschine with a hook to grab prize" />
            </div>
            <div className="flex flex-col mt-10 w-full md:max-w-[420px] lg:max-w-[510px] xl:max-w-[650px] gap-6">

              <div className="flex flex-row py-4 px-2 md:p-4 xl:px-0 bg-secondary rounded-lg justify-around gap-3 md:gap-7 lg:gap-0 border border-gray-600 bg-opacity-60">
                <p className="flex flex-col lg:flex-row text-md lg:text-lg xl:text-xl font-bold text-white">Mint price:<span className=" text-sm md:text-md lg:text-lg xl:text-xl text-light">FREE</span><span className=" text-gray-400 text-xs lg:text-sm">+ 1 MATIC ticket fee</span>
                </p>
                <p className="flex flex-col lg:flex-row text-md lg:text-lg xl:text-xl font-bold text-white">Supply:<span className="text-center text-light"> {nftSupply} / 5000</span>
                </p>
                <div className="flex flex-col lg:flex-row text-md lg:text-lg xl:text-xl font-bold text-white">
                  Tickets sold:
                  <div className="flex justify-end">
                    <span className="ml-1 text-light">{ticketsSold}</span>
                    <span className="ml-1 text-gray-400 text-md">/ &#8734;</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-6">

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
                        1 mint per wallet
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
                  isRaffleOver={isRaffleOver}
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
                  publicSale={publicSale}
                  setIsWinnerRaffle={setIsWinnerRaffle}
                />

                <div className="flex flex-col justify-center items-center lg:min-w-[110px] pr-3">
                  {isConnected && availableToMint && (
                    <p className="flex items-center lg:text-xl text-white sm:mt-3 md:mt-1">
                      Available to mint:
                      <span className="ml-12 md:ml-12 lg:ml-8 text-light ">{availableToMint}</span>
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
              <ShareButton />
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

    </>
  )
}