import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DynamicWidget } from "@dynamic-labs/sdk-react";
import { useAccount, useBalance } from "wagmi";
import { ethers } from "ethers";
import { Network, Alchemy } from 'alchemy-sdk';
import CountdownComponent from "../Components/Countdown";
import RaffleABI from "../ABI/RaffleG_0.json";
import NftABI from "../ABI/TBT_NFT.json";
import whitelist from './whitelist.json';
import { PuffLoader } from "react-spinners";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const contractNftAddress = "0x70ee55cc52F32908461F2c4F70c6051274a4c2C5"
const contractRaffleAddress = "0xBA73277276e86b325767A745617A601E05Ba4DD4";

export default function Home() {

  const { address, isConnected } = useAccount();
  const balance = useBalance({ address: address });

  const [ticketCount, setTicketCount] = useState(1);
  const [ticketsBought, setTicketsBought] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [waitingBuy, setWaitingBuy] = useState(false);

  const [dateStartGuaranteed, setDateStartGuaranteed] = useState(0);
  const [dateEndGuaranteed, setDateEndGuaranteed] = useState(0);
  const [notStartedGuaranteedTimeBool, setGuaranteedNotStartedTimeBool] = useState(false);
  const [startGuaranteedTimeBool, setGuaranteedStartTimeBool] = useState(false);
  const [endGuaranteedTimeBool, setGuaranteedEndTimeBool] = useState(false);

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [notStartedTimeBool, setNotStartedTimeBool] = useState(false);
  const [startTimeBool, setStartTimeBool] = useState(false);
  const [endTimeBool, setEndTimeBool] = useState(false);

  const [showTooltipOG, setShowTooltipOG] = useState(false);
  const [showTooltipPublic, setShowTooltipPublic] = useState(false);
  const [hasBalance, setHasBalance] = useState(false);

  const settings = {
    apiKey: "4OV2g4TrNiCkA9wIc8OjGZzovYl_dx2r",
    network: Network.MATIC_MUMBAI,
  };

  const alchemy = new Alchemy(settings);

  const getAlchemyProviderAndData = async () => {
    const maticProvider = await alchemy.config.getProvider();
    // const block = await maticProvider.getBlock();
    const contractRaffleBeforeConnection = new ethers.Contract(contractRaffleAddress, RaffleABI.abi, maticProvider);
    const ticketsSold = await contractRaffleBeforeConnection.nbTicketSell();
    setTicketsSold(ticketsSold.toNumber());
  };

  const ticketPrice = 0.01
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractRaffle = useMemo(() => {
    return new ethers.Contract(contractRaffleAddress, RaffleABI.abi, signer);
  }, [signer]);
  const contractNft = useMemo(() => {
    return new ethers.Contract(contractNftAddress, NftABI.abi, signer);
  }, [signer]);

  const isWhitelisted = (address) => {
    return whitelist.some(item => item.address === address);
  }

  // Tooltip for i icon
  const handleMouseEnter = () => {
    setShowTooltipOG(true);
  };

  const handleMouseLeave = () => {
    setShowTooltipOG(false);
  };
  const handleMouseEnterPublic = () => {
    setShowTooltipPublic(true);
  };

  const handleMouseLeavePublic = () => {
    setShowTooltipPublic(false);
  };

  // Countdown
  const handleIncrease = () => {
    setTicketCount(ticketCount + 1);
  };

  const handleDecrease = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  const getTicketsSold = async () => {
    if (!contractRaffle) return;
    const ticketsSold = await contractRaffle.nbTicketSell();
    setTicketsSold(ticketsSold.toNumber());
  };

  const getDeadline = async () => {
    if (!contractRaffle) return;
    const deadline = await contractRaffle.deadline();
    setEndTime(deadline.toNumber());
    setEndTimeBool(true);
  };

  const getTicketsBought = useCallback(async () => {
    if (!isConnected) return;
    try {
      const idPlayer = await contractRaffle.idByAddress(address);
      const player = await contractRaffle.playersList(idPlayer);
      if (player.addressPlayer === address) {
        const ticketsBought = player.ticketsBought;
        setTicketsBought(ticketsBought.toNumber());
      }
    } catch (error) {
      console.error("Error getting tickets bought:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  async function buyTickets() {
    if (isConnected) {
      try {
        setWaitingBuy(true);
        const tx = await contractRaffle.buyTicket(ticketCount, { value: ethers.utils.parseEther((ticketCount * ticketPrice).toString()) });
        await provider.waitForTransaction(tx.hash);
        toast.success("You're in the game! Good luck with the draw!");
        getTicketsBought();
        getTicketsSold();
      } catch (error) {
        toast.error("Transaction error! But don't worry, even the best stumble sometimes!");
      }
    }
  }

  // Guaranteed sale status
  const getGuaranteedSaleStatus = () => {
    if (notStartedGuaranteedTimeBool) {
      return "Not Started";
    } else if (startGuaranteedTimeBool) {
      return "Live";
    } else if (endGuaranteedTimeBool) {
      return "Ended";
    }
  };
  const saleGuaranteedStatus = getGuaranteedSaleStatus();

  // Public sale status
  const getPublicSaleStatus = () => {
    if (notStartedTimeBool) {
      return "Not Started";
    } else if (startTimeBool) {
      return "Live";
    } else if (endTimeBool) {
      return "Ended";
    }
  };
  const salePublicStatus = getPublicSaleStatus();

  useEffect(() => {
    const checkTime = async () => {
      try {
        const maticProvider = await alchemy.config.getProvider();
        const block = await maticProvider.getBlock();
        const contractRaffleBeforeConnection = new ethers.Contract(contractRaffleAddress, RaffleABI.abi, maticProvider);
        const dateStartNft = await contractNft.saleStartTime();
        const dateEndtNftGuaranteed = await contractNft.endTimeGuarranted(); // to do: change endTimeGuarranted to endTimeGuaranteed
        const startTime = 1689871513;
        const deadline = await contractRaffleBeforeConnection.deadline();
        // console.log("dateStartNft", dateStartNft.toNumber());
        // console.log("dateEndtNftGuaranteed", dateEndtNftGuaranteed.toNumber());
        // console.log("startTime", startTime);
        // console.log("deadline", deadline.toNumber());

        if (block.timestamp < dateStartNft.toNumber()) {
          setGuaranteedNotStartedTimeBool(true);
          setGuaranteedStartTimeBool(false);
          setGuaranteedEndTimeBool(false);
          setDateStartGuaranteed(dateStartNft.toNumber());
        } else if (block.timestamp >= dateStartNft.toNumber() && block.timestamp <= dateEndtNftGuaranteed.toNumber()) {
          setGuaranteedNotStartedTimeBool(false);
          setGuaranteedStartTimeBool(true);
          setGuaranteedEndTimeBool(false);
          setDateEndGuaranteed(dateEndtNftGuaranteed.toNumber());
        } else if (block.timestamp > dateEndtNftGuaranteed.toNumber()) {
          setGuaranteedNotStartedTimeBool(false);
          setGuaranteedStartTimeBool(false);
          setGuaranteedEndTimeBool(true);
        }

        if (block.timestamp < startTime) {
          setNotStartedTimeBool(true);
          setStartTimeBool(false);
          setEndTimeBool(false);
          setStartTime(startTime);
        } else if (block.timestamp >= startTime && block.timestamp <= deadline.toNumber()) {
          setNotStartedTimeBool(false);
          setStartTimeBool(true);
          setEndTimeBool(false);
          setEndTime(deadline.toNumber());
        } else if (block.timestamp > deadline.toNumber()) {
          setNotStartedTimeBool(false);
          setStartTimeBool(false);
          setEndTimeBool(true);
        }
      } catch (error) {
        console.error("An error occurred while checking the time:", error);
      }
    };

    checkTime();
  }, [notStartedTimeBool, startTimeBool, endTimeBool, notStartedGuaranteedTimeBool, startGuaranteedTimeBool, endGuaranteedTimeBool]);

  useEffect(() => {
    (async function fetchProviderAndData() {
      await getAlchemyProviderAndData();
    })();
  }, [address]);

  useEffect(() => {
    if (isConnected) {
      getTicketsBought();
    }
  }, [isConnected, getTicketsBought, address]);

  useEffect(() => {
    setHasBalance(prevHasBalance => {
      if (balance && ticketCount > 0 && (balance.data?.value.toBigInt().toString() / 10 ** 18) >= ticketCount * ticketPrice) {
        return true;
      }
      return prevHasBalance;
    });
  }, [balance, ticketCount]);

  let buttonText;
  if (waitingBuy) {
    buttonText = (
      <div className="flex justify-center items-center h-full">
        <PuffLoader
          color="#000" />
      </div>
    );
  } else {
    buttonText = isWhitelisted(address) ? 'Mint' : 'Buy Tickets';
  }

  return (
    <>
      <ToastContainer
        position="bottom-center"
        theme="dark"
      />
      <div className="homepage py-10 px-5 md:pr-20 lg:px-30 xl:px-20">
        <header className="navbar sm:px-10 md:px-0">
          <nav className="flex justify-center justify-between gap-8 md:gap-0">
            <div className="">
              <a href="#1" className="">
                <span className="sr-only">Ogronex</span>
                <img
                  className="h-14 w-auto"
                  src="./Images/logo.png"
                  alt=""
                />
              </a>
            </div>
            <div className="flex flex-row items-center md:gap-8 z-30">
              <a href="./" className="text-sm sm:text-xl font-bold text-gray-400">Terms and conditions</a>
              <DynamicWidget variant='dropdown' />
            </div>
          </nav>
        </header>

        <main className="relative">
          <div className="flex flex-col-reverse md:flex-row justify-center">
            <div className="flex flex-col justify-center items-center w-full lg:w-2/4 h-auto">
              <img className="w-full lg:max-w-[800px] xl:max-w-[650px]" src="./Images/prize-maschine.png" alt="" />
            </div>
            <div className="flex flex-col mt-10 w-full md:w-2/4 md:max-w-[700px] gap-6">
              <div className="flex flex-row p-4">
                <h1 className="text-6xl font-bold text-white">OG Teddies</h1>
                <div className="md:flex items-center ml-5 mt-4 gap-3">
                  <a href="https://discord.gg/ogronexnft" target="_blank" rel="noreferrer"><i className="fab fa-discord text-lg text-gray-500"></i></a>
                  <a href="https://twitter.com/Ogronex" target="_blank" rel="noreferrer"><i className="fab fa-twitter text-lg text-gray-500"></i></a>
                  <a href="https://ogronex.com/" target="_blank" rel="noreferrer"><i className="fas fa-globe text-lg text-gray-500"></i></a>
                </div>
              </div>
              <div className="flex flex-row xl:px-4">
                <p className="text-justify text-lg xl:text-xl font-bold text-gray-500">Introducing "Teddy Bear Treasures," an NFT project featuring 333 unique and
                  lovable teddy bears. Own a digital representation of these adorable companions,
                  unlock exclusive benefits, and immerse yourself in a vibrant community of teddy
                  bear enthusiasts.
                </p>
              </div>
              <div className="flex flex-row p-4 bg-secondary rounded-lg justify-around gap-3 sm:gap-7 border border-gray-600 bg-opacity-60">
                <p className="flex flex-col xl:flex-row text-md lg:text-lg xl:text-xl font-bold text-white">Mint price:<span className="ml-1 text-sm md:text-md lg:text-lg xl:text-xl text-light">FREE</span><span className="ml-1 text-gray-400 text-xs lg:text-sm">+ 1 MATIC ticket fee</span>
                </p>
                <p className="flex flex-col xl:flex-row text-md lg:text-lg xl:text-xl font-bold text-white">Supply:<span className="text-center ml-1 text-light">333</span>
                </p>
                <div className="flex flex-col xl:flex-row text-md lg:text-lg xl:text-xl font-bold text-white">
                  Tickets sold:
                  <div className="flex">
                    <span className="ml-1 text-light">{ticketsSold}</span>
                    <span className="ml-1 text-gray-400 text-md">/ &#8734;</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0 p-4 bg-four rounded-lg border border-gray-600 justify-between">
                <div className="relative lg:text-lg xl:text-xl font-bold text-white">Guaranteed mint
                  <span
                    className="ml-3 text-light border border-light rounded-full px-2 text-sm"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    i
                  </span>
                  {showTooltipOG &&
                    <div className="tooltip absolute left-1/2 top-full -translate-x-1/2 transform whitespace-nowrap rounded bg-secondary bg-opacity-80 p-2 text-white">
                      One mint per wallet
                    </div>
                  }
                </div>
                <div className="flex px-3">
                  <p className={"lg:text-lg xl:text-xl font-bold text-white bg-secondary py-2 px-6 lg:px-4 xl:px-6 rounded-lg border border-gray-600 bg-opacity-60 lg:min-w-[110px] xl:min-w-[130px]"}>
                    <i className={`fas fa-circle pr-2 text-light text-sm animate-pulse ${saleGuaranteedStatus === 'Live' ? 'text-green-500' : 'text-red-500'}`}></i>
                    {saleGuaranteedStatus}
                  </p>
                </div>
                <div className="flex flex-col justify-end xl:ml-2 md:min-w-[110px] lg:min-w-[160px] xl:min-w-[233px]">
                  <div className="text-md text-gray-400 bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60">
                    {notStartedGuaranteedTimeBool &&
                      <>
                        Live in
                        <span className="text-white pl-2 xl:text-xl">
                          <CountdownComponent deadline={dateStartGuaranteed} />
                        </span>
                      </>
                    }
                    {endGuaranteedTimeBool &&
                      <>
                        Finished
                      </>
                    }
                    {startGuaranteedTimeBool &&
                      <>
                        Ends in
                        <span className="text-white pl-2 xl:text-xl">
                          <CountdownComponent deadline={dateEndGuaranteed} />
                        </span>
                      </>
                    }
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center p-4 bg-four rounded-lg border border-gray-600 gap-4 md:gap-0 justify-between">
                <p className="relative lg:text-lg xl:text-xl font-bold text-white">Public
                  <span
                    className="ml-3 text-light border border-light rounded-full px-2 text-sm"
                    onMouseEnter={handleMouseEnterPublic}
                    onMouseLeave={handleMouseLeavePublic}
                  >
                    i
                  </span>
                  {showTooltipPublic && (
                    <div className="tooltip absolute left-1/2 top-full -translate-x-1/2 transform whitespace-nowrap rounded bg-secondary bg-opacity-80 p-2 text-white">
                      All winners will be drawn directly at the end of the sale.
                    </div>
                  )}
                </p>
                <div className="flex ml-3 xs:ml-5 xl:ml-28">
                  <div className={"lg:text-lg xl:text-xl font-bold text-white bg-secondary py-2 px-4 xl:px-6 rounded-lg border border-gray-600 bg-opacity-60 lg:min-w-[110px] xl:min-w-[130px]"}>
                    <i className={`fas fa-circle pr-2 text-light text-sm animate-pulse ${salePublicStatus === 'Live' ? 'text-green-500' : 'text-red-500'}`}></i>
                    {salePublicStatus}
                  </div>
                </div>
                <div className="flex flex-col justify-end ml-2 xs:ml-5 md:min-w-[110px] lg:min-w-[160px] xl:min-w-[233px]">
                  <div className="text-md text-gray-400 bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60">
                    {notStartedTimeBool &&
                      <>
                        Live in
                        <span className="text-white pl-2 xl:text-xl">
                          <CountdownComponent deadline={1689871513} />
                        </span>
                      </>
                    }
                    {endTimeBool &&
                      <>
                        Finished
                      </>
                    }
                    {startTimeBool &&
                      <>
                        Ends in
                        <span className="text-white pl-2 xl:text-xl">
                          <CountdownComponent deadline={endTime} />
                        </span>
                      </>
                    }
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 lg:flex flew-row gap-2 md:gap-4 lg:gap-8 xl:gap-11 w-full justify-between">
                <div className="flex justify-around items-center rounded-lg border border-gray-600 bg-secondary">
                  <button className="w-10 h-14 rounded-l-lg text-white text-2xl" onClick={() => handleDecrease()}>
                    -
                  </button>
                  <input
                    type="number"
                    className="w-4 md:w-6 lg:w-16 h-14 rounded-none bg-secondary text-white text-xl text-center"
                    min={1}
                    value={ticketCount}
                    onChange={(e) => setTicketCount(parseInt(e.target.value))}
                  />
                  <button className="w-10 h-14 rounded-r-lg text-white text-2xl" onClick={() => handleIncrease()}>
                    +
                  </button>
                </div>
                <button
                  className="w-full lg:w-2/4 h-14 rounded-lg text-2xl bg-light font-bold text-black col-span-2"
                  onClick={() => buyTickets()}
                >
                  {buttonText}
                </button>
                <div className="mt-5 sm:mt-0">
                  <p className="flex items-center text-xl text-white">Your tickets:<span className="ml-1 text-light pr-4">{ticketsBought}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-end mt-10">
            <p className="text-xl font-bold text-gray-400">Powered by <span className="text-light">Ogronex</span>
            </p>
          </div>
        </main>
      </div>

    </>
  )
}