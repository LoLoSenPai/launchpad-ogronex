import React, { useState, useEffect, useMemo, useCallback } from "react";
import { DynamicWidget } from "@dynamic-labs/sdk-react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { Network, Alchemy } from 'alchemy-sdk';
import CountdownComponent from "../Components/Countdown";
import RaffleABI from "../ABI/RaffleG_0.json";
import whitelist from './whitelist.json';
import { PuffLoader } from "react-spinners";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const contractRaffleAddress = "0xBA73277276e86b325767A745617A601E05Ba4DD4";

export default function Home() {

  const { address, isConnected } = useAccount();
  const [ticketCount, setTicketCount] = useState(1);
  const [successBuy, setSuccessBuy] = useState(false);
  const [waitingBuy, setWaitingBuy] = useState(false);
  const [errorBuy, setErrorBuy] = useState(false);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [ticketsBought, setTicketsBought] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [startTimeBool, setStartTimeBool] = useState(false);
  const [endTimeBool, setEndTimeBool] = useState(false);
  const [blockTimestamp, setBlockTimestamp] = useState(0);

  const settings = {
    apiKey: "4OV2g4TrNiCkA9wIc8OjGZzovYl_dx2r",
    network: Network.MATIC_MUMBAI,
  };

  const alchemy = new Alchemy(settings);

  const getAlchemyProviderAndData = useCallback(async () => {
    const maticProvider = await alchemy.config.getProvider();
    const block = await maticProvider.getBlock();
    console.log("block : ", block.timestamp);
    setBlockTimestamp(block.timestamp);
    const contractRaffleBeforeConnection = new ethers.Contract(contractRaffleAddress, RaffleABI.abi, maticProvider);
    const ticketsSold = await contractRaffleBeforeConnection.nbTicketSell();
    setTicketsSold(ticketsSold.toNumber());
  }, [alchemy.config]);

  const ticketPrice = 0.01
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractRaffle = useMemo(() => {
    return new ethers.Contract(contractRaffleAddress, RaffleABI.abi, signer);
  }, [signer]);

  const isWhitelisted = (address) => {
    return whitelist.some(item => item.address === address);
  }

  const getSaleStatus = () => {
    const now = Date.now() / 1000;

    if (now < startTime) {
      return "Not Started";
    } else if (now >= startTime && now <= endTime) {
      return "Live";
    } else if (now > endTime) {
      return "Ended";
    }
  };

  const saleStatus = getSaleStatus();

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
    console.log(deadline.toNumber());
    setEndTime(deadline.toNumber());
    setEndTimeBool(true);
  };

  const getTicketsBought = useCallback(async () => {
    if (!isConnected) return;
    try {
      const idPlayer = await contractRaffle.idByAddress(address);
      const player = await contractRaffle.playersList(idPlayer);
      if (player.addressPlayer === address) {
        console.log(player);
        const ticketsBought = player.ticketsBought;
        setTicketsBought(ticketsBought.toNumber());
      }
    } catch (error) {
      console.error("Error getting tickets bought:", error);
    }
  }, [address, isConnected, contractRaffle]);

  async function buyTickets() {
    if (isConnected) {
      try {
        setWaitingBuy(true);
        const tx = await contractRaffle.buyTicket(ticketCount, { value: ethers.utils.parseEther((ticketCount * ticketPrice).toString()) });
        await provider.waitForTransaction(tx.hash);
        setWaitingBuy(false);
        setSuccessBuy(true);
        toast.success("You're in the game! Good luck with the draw!");
        getTicketsBought();
        getTicketsSold();
      } catch (error) {
        setWaitingBuy(false);
        setSuccessBuy(false);
        setErrorBuy(true);
        toast.error("Transaction error! But don't worry, even the best stumble sometimes!");
      }
    }
  }

  useEffect(() => {
    const checkTime = async () => {
      try {
        const maticProvider = await alchemy.config.getProvider();
        const block = await maticProvider.getBlock();
        console.log("block : ", block.timestamp);
        setBlockTimestamp(block.timestamp);
        const contractRaffleBeforeConnection = new ethers.Contract(contractRaffleAddress, RaffleABI.abi, maticProvider);
        const deadline = await contractRaffleBeforeConnection.deadline();
        const startTime = await contractRaffleBeforeConnection.startDate();

        if (block.timestamp < startTime) {
          setStartTimeBool(true);
          setEndTimeBool(false);
          setStartTime(startTime);
        } else if (block.timestamp >= startTime && block.timestamp <= deadline) {
          setStartTimeBool(false);
          setEndTimeBool(true);
          setEndTime(deadline);
        } else {
          setStartTimeBool(false);
          setEndTimeBool(false);
        }
      } catch (error) {
        console.error("An error occurred while checking the time:", error);
      }
    };

    checkTime();
  }, []);


  useEffect(() => {
    getAlchemyProviderAndData();
  }, [address, getAlchemyProviderAndData]);

  useEffect(() => {
    if (isConnected) {
      getTicketsBought();
    }
  }, [isConnected, getTicketsBought]);

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
          <nav className="flex justify-center justify-between">
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
            <div className="flex flex-row items-center gap-8 z-30">
              <a href="#1" className="text-xs sm:text-xl font-bold text-gray-400">Terms and conditions</a>
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
              <div className="flex flex-row px-4">
                <p className="text-justify text-xl font-bold text-gray-500">Introducing "Teddy Bear Treasures," an NFT project featuring 333 unique and
                  lovable teddy bears. Own a digital representation of these adorable companions,
                  unlock exclusive benefits, and immerse yourself in a vibrant community of teddy
                  bear enthusiasts.
                </p>
              </div>
              <div className="flex flex-row p-4 bg-secondary rounded-lg justify-around gap-3 sm:gap-7 border border-gray-600 bg-opacity-60">
                <p className="flex flex-col lg:flex-row text-md lg:text-xl font-bold text-white">Mint price:<span className="ml-1 text-sm md:text-md lg:text-xl text-light">FREE</span><span className="ml-1 text-gray-400 text-xs lg:text-sm">+ 1 MATIC ticket fee</span>
                </p>
                <p className="flex flex-col lg:flex-row text-md lg:text-xl font-bold text-white">Supply:<span className="ml-1 text-light">333</span>
                </p>
                <p className="flex flex-col lg:flex-row text-md lg:text-xl font-bold text-white">Tickets sold:
                  <div className="flex">
                    <span className="ml-1 text-light">{ticketsSold}</span>
                    <span className="ml-1 text-gray-400 text-md">/ &#8734;</span>
                  </div>
                </p>
              </div>
              <div className="flex flex-row items-center p-4 bg-four rounded-lg border border-gray-600 justify-between">
                <p className="text-xl font-bold text-white">Guaranteed mint<span className="ml-3 text-light border border-light rounded-full px-2 text-sm">i</span>
                </p>
                <div className="flex flex-col justify-end ml-3 xs:ml-5">
                  <p className={"text-xl font-bold text-white bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60 min-w-[130px]"}>
                    <i className={`fas fa-circle pr-2 text-light text-sm animate-pulse ${saleStatus === 'Live' ? 'text-green-500' : 'text-red-500'}`}></i>
                    {saleStatus}
                  </p>
                </div>
              </div>
              <div className="flex flex-row items-center p-4 bg-four rounded-lg border border-gray-600 justify-between">
                <p className="text-xl font-bold text-white">Public<span className="ml-3 text-light border border-light rounded-full px-2 text-sm">i</span>
                </p>
                <div className="flex flex-col justify-end ml-2 xs:ml-5 min-w-[160px] sm:min-w-[233px]">
                  <div className="text-md text-gray-400 bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60">
                    {endTimeBool ? (<>
                      Ends in
                      <span className="text-white pl-2 text-xl">
                        <CountdownComponent deadline={endTime} />
                      </span>
                    </>) : null}
                    {startTimeBool ? (<>
                      Live in
                      <span className="text-white pl-2 text-xl">
                        <CountdownComponent deadline={startTime} />
                      </span>
                    </>) : null}
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
                    defaultValue={1}
                    min={1}
                    value={ticketCount}
                    onChange={(e) => setTicketCount(parseInt(e.target.value))}
                  />
                  <button className="w-10 h-14 rounded-r-lg text-white text-2xl" onClick={() => handleIncrease()}>
                    +
                  </button>
                </div>
                <button className="w-full lg:w-2/4 h-14 rounded-lg text-2xl bg-light font-bold text-black col-span-2" onClick={() => buyTickets()}>
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