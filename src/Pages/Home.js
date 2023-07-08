import React, { useState, useEffect, useMemo } from "react";
import { DynamicWidget } from "@dynamic-labs/sdk-react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import CountdownComponent from "../Components/Countdown";
import RaffleABI from "../ABI/RaffleG_0.json";

const contractRaffleAddress = "0xe572A0fC14b83b1a2BA0b86A2b1637E481Aa5283";

export default function Home() {

  const ticketPrice = 0.01
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractRaffle = useMemo(() => {
    return new ethers.Contract(contractRaffleAddress, RaffleABI.abi, signer);
  }, [signer]);
  const { address, isConnected } = useAccount();

  const [ticketCount, setTicketCount] = useState(1);
  const [successBuy, setSuccessBuy] = useState(false);
  const [waitingBuy, setWaitingBuy] = useState(false);
  const [errorBuy, setErrorBuy] = useState(false);

  const [ticketsSold, setTicketsSold] = useState(0);
  const [ticketsBought, setTicketsBought] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [endTimeBool, setEndTimeBool] = useState(false);

  useEffect(() => {
    if (isConnected) {
      getDeadline();
      getTicketsSold();
      getTicketsBought();
    }
  }, [address]);

  const handleIncrease = () => {
    setTicketCount(ticketCount + 1);
  };

  const handleDecrease = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  async function buyTickets() {
    if (isConnected) {
      try {
        setWaitingBuy(true);
        await contractRaffle.buyTicket(ticketCount, { value: ethers.utils.parseEther((ticketCount * ticketPrice).toString()) });
        setWaitingBuy(false);
        setSuccessBuy(true);
      } catch (error) {
        setWaitingBuy(false);
        setSuccessBuy(false);
        setErrorBuy(true);
      }
    }
  }


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

  const getTicketsBought = async () => {
    if (!address) return;
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
  };
  return (
    <>
      <div className="homepage py-10 px-20 md:px-40 lg:px-60">
        <header className="navbar">
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
            <div className="flex flex-row items-center gap-8">
              <a href="#1" className="text-xl font-bold text-gray-400">Terms and conditions</a>
              <DynamicWidget variant='dropdown' />
            </div>
          </nav>
        </header>

        <main className="relative">
          <div className="flex flex-row justify-center">
            <div className="flex flex-col justify-center items-center w-[650px] h-auto">
              <img className="" src="./Images/prize-maschine.png" alt="" />
            </div>
            <div className="flex flex-col mt-10 max-w-[700px] gap-6">
              <div className="flex flex-row p-4">
                <h1 className="text-6xl font-bold text-white">OG Teddies</h1>
                <div className="flex items-center ml-5 mt-4 gap-3">
                  <a href="https://discord.gg/ogronexnft" target="_blank" rel="noreferrer"><i className="fab fa-discord text-lg text-gray-500"></i></a>
                  <a href="https://twitter.com/Ogronex" target="_blank" rel="noreferrer"><i className="fab fa-twitter text-lg text-gray-500"></i></a>
                  <a href="https://ogronex.com/" target="_blank" rel="noreferrer"><i className="fas fa-globe text-lg text-gray-500"></i></a>
                </div>
              </div>
              <div className="flex flex-row px-4">
                <p className="text-xl font-bold text-gray-500">Introducing "Teddy Bear Treasures," an NFT project featuring 333 unique and
                  lovable teddy bears. Own a digital representation of these adorable companions,
                  unlock exclusive benefits, and immerse yourself in a vibrant community of teddy
                  bear enthusiasts.
                </p>
              </div>
              <div className="flex flex-row p-4 bg-secondary rounded-lg justify-center gap-7 border border-gray-600 bg-opacity-60">
                <p className="text-xl font-bold text-white">Mint price:<span className="ml-1 text-md text-light">FREE</span><span className="ml-1 text-gray-400 text-sm">+ 1 MATIC ticket fee</span>
                </p>
                <p className="text-xl font-bold text-white">Winners:<span className="ml-1 text-light">333</span>
                </p>
                <p className="text-xl font-bold text-white">Tickets sold:<span className="ml-1 text-light">{ticketsSold}</span><span className="ml-1 text-gray-400 text-sm">/ &#8734;</span>
                </p>
              </div>
              <div className="flex flex-row items-center p-4 bg-four rounded-lg border border-gray-600 justify-between">
                <p className="text-xl font-bold text-white">Guaranteed mint<span className="ml-3 text-light border border-light rounded-full px-2 text-sm">i</span>
                </p>
                <div className="flex flex-col justify-end ml-5">
                  <p className="text-xl font-bold text-white bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60"><i className="fas fa-circle pr-2 text-light text-sm animate-pulse"></i>Live</p>
                </div>
              </div>
              <div className="flex flex-row items-center p-4 bg-four rounded-lg border border-gray-600 justify-between">
                <p className="text-xl font-bold text-white">Public<span className="ml-3 text-light border border-light rounded-full px-2 text-sm">i</span>
                </p>
                <div className="flex flex-col justify-end ml-5">
                  <p className="text-md text-gray-400 bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60">
                      <>
                        Live in
                        <span className="text-white pl-2 text-xl">
                        {endTimeBool ? (<CountdownComponent deadline={endTime} />) : null}
                        </span>
                      </>
                  </p>
                </div>
              </div>
              <div className="flex flew-row gap-11 w-full justify-between">
                <div className="flex items-center rounded-lg border border-gray-600">
                  <button className="w-10 h-14 rounded-l-lg bg-secondary text-white text-2xl" onClick={() => handleDecrease()}>
                    -
                  </button>
                  <input
                    type="number"
                    className="w-16 h-14 rounded-none bg-secondary text-white text-xl text-center"
                    defaultValue={1}
                    min={1}
                    value={ticketCount}
                    onChange={(e) => setTicketCount(parseInt(e.target.value))}
                  />
                  <button className="w-10 h-14 rounded-r-lg bg-secondary text-white text-2xl" onClick={() => handleIncrease()}>
                    +
                  </button>
                </div>
                {/* <input
                  type="number"
                  className="w-1/4 h-14 rounded-lg bg-secondary text-white text-xl text-center border border-gray-600"
                  placeholder="1"
                /> */}
                <button className="w-2/4 h-14 rounded-lg text-2xl bg-light font-bold text-black" onClick={() => buyTickets()}>Buy Tickets</button>
                <p className="w-1/4 flex items-center text-xl text-white">Your tickets:<span className="ml-1 text-light">{ticketsBought}</span>
                </p>
              </div>
              <div className="flex flex-row justify-end mt-20">
                <p className="text-xl font-bold text-gray-400">Powered by <span className="text-light">Ogronex</span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

    </>
  )
}
