import React, { useState, useEffect, useContext } from "react";
import { DynamicWidget } from "@dynamic-labs/sdk-react";
import { useAccount, useBalance } from "wagmi";
import { ethers } from "ethers";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SaleStatusContext } from "../Context/SaleStatusContext";
import SaleButton from "../Components/SaleButton";
import TermsAndConditions from "../Modals/TermsAndConditions";
import useContracts from "../Hooks/useContracts";
import useTicketManagement from "../Hooks/useTicketManagement";
import useWhitelistManagement from "../Hooks/useWhitelistManagement";
import useRaffleWinnerManagement from "../Hooks/useRaffleWinnerManagement";
import TicketCounter from "../Components/TicketCounter";
import PhaseCard from "../Components/PhaseCard";
// import CardTilt from "../Components/CardTilt";

export default function Home() {

  const { address, isConnected } = useAccount();
  const balance = useBalance({ address: address });

  const [ticketCount, setTicketCount] = useState(1);
  const [availableToMint, setAvailableToMint] = useState(0);


  const [hasBalance, setHasBalance] = useState(false);
  const [showModalWinner, setShowModalWinner] = useState(false);
  const [showModalLooser, setShowModalLooser] = useState(false);
  const [showModalPending, setShowModalPending] = useState(false);

  //winner state
  const [hasCheckedWinner, setHasCheckedWinner] = useState(false);

  const { holder, guaranteed, whitelistFCFS, publicSale } = useContext(SaleStatusContext);

  const { getTicketsBought, getTicketsSold, buyTickets, ticketsBought, ticketsSold, triggerAnimation, resetTriggerAnimation } = useTicketManagement();
  const { whiteListMint, isWhitelisted, remainingTickets, totalRemainingTickets, checkWhitelistedForPhase } = useWhitelistManagement();
  const { winnerRaffleMint, checkWinner, waitingBuy, winnerNbMint, isWinnerRaffle, appIsRaffleOver } = useRaffleWinnerManagement();
  const { nftSupply, loading } = useContracts();

  const whitelistStatus = checkWhitelistedForPhase(address);
  const ticketPrice = 1;



  const handleIncrease = () => {
    const numericTicketCount = parseInt(ticketCount, 10);
    setTicketCount((numericTicketCount || 0) + 1);
  };

  const handleDecrease = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  useEffect(() => {
    getTicketsSold();
  }, [getTicketsSold]);

  useEffect(() => {
    getTicketsBought();
  }, [getTicketsBought]);

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


  useEffect(() => {
    if (!isConnected) return;
    if (balance.data && typeof ticketCount === 'number' && typeof ticketPrice === 'number') {
      const userBalanceInWei = balance.data.value;
      const ticketCostInWei = ethers.utils.parseEther((ticketCount * ticketPrice).toString());
      setHasBalance(() => ticketCostInWei.lte(userBalanceInWei));
    } else {
      setHasBalance(false);
    }
  }, [address, ticketCount, ticketPrice, balance.data, isConnected]);


  let maxTickets = 1;
  let showInput = true;
  if (holder.status === 'Live') {
    maxTickets = remainingTickets;
  }
  else if (publicSale.status === 'Live') {
    maxTickets = 100000;
  }
  else if (publicSale.status === 'Ended') {
    maxTickets = winnerNbMint;
    showInput = false;
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

            <div className="flex flex-col md:flex-row justify-center lg:mt-10 sm:max-md:overflow-hidden lg:pb-10 xl:pb-12 xl:gap-10">
              <div className="flex justify-center items-center w-full max-w-[400px] lg:min-w-[500px] xl:max-w-[600px] h-auto overflow-hidden md:overflow-visible pt-8 pb-12 lg:pb-8">
                <img className="w-full scale-125" src="./Images/prize-maschine-infected-dalmatians.png" alt="maschine with a hook to grab prize" />
                {/* <CardTilt /> */}
              </div>
              <div className="flex flex-col md:mt-10 w-full md:max-w-[420px] lg:max-w-[510px] xl:max-w-[680px] z-10 gap-6">

                <div className="flex flex-row py-4 px-2 md:p-4 xl:px-0 bg-secondary rounded-lg justify-around gap-3 md:gap-7 lg:gap-0 border border-gray-600 bg-opacity-60">
                  <div className="flex flex-col xl:flex-row text-md lg:text-lg xl:text-xl font-bold text-white">
                    Mint price:
                    <div className="relative flex flex-col">
                      <span className=" text-sm md:text-md lg:text-lg xl:text-xl text-light">FREE</span>
                      <span className=" text-gray-400 text-xs lg:text-sm xl:absolute xl:-top-4 xl:w-[200px] xl:ml-2">+ 1 MATIC ticket fee</span>
                    </div>
                  </div>
                  <p className="flex flex-col xl:flex-row text-md lg:text-lg xl:text-xl font-bold text-white">
                    Supply:
                    <span className="text-center text-light"> {nftSupply} / 5000</span>
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
                  <div className="flex flex-col gap-2 md:gap-4 lg:gap-6 w-full justify-between">
                    <PhaseCard title="Holders" status={holder.status} isAccessible={whitelistStatus.holder} start={holder.start} end={holder.end} tooltipText={'Boxbies and Dalmatians Holders'} />
                    <PhaseCard title="OG FCFS" status={guaranteed.status} isAccessible={whitelistStatus.guaranteed} start={guaranteed.start} end={guaranteed.end} tooltipText={'1 mint per wallet'} />
                    <PhaseCard title="WL FCFS" status={whitelistFCFS.status} isAccessible={whitelistStatus.whitelistFCFS} start={whitelistFCFS.start} end={whitelistFCFS.end} tooltipText={'1 min per wallet'} />
                    <PhaseCard title="Public Raffle" status={publicSale.status} isAccessible={whitelistStatus.publicSale} start={publicSale.start} end={publicSale.end} tooltipText={'All winners will be drawn few minutes after the end'} />

                    <div className="flex flew-row gap-4 lg:gap-6 xl:gap-11 w-full max-h-[70px] justify-between">
                      {showInput && (
                        <div className="flex justify-around items-center rounded-lg border border-gray-600 bg-secondary z-10">
                          <button
                            className="min-w-[25px] md:w-10 h-14 rounded-l-lg text-white text-2xl transition-colors duration-300 ease-in-out hover:bg-[#10282db0] active:bg-[#10282d93]"
                            onClick={handleDecrease}
                          >
                            <div className="transition-all transform active:scale-150 duration-300 ease-in-out">-</div>
                          </button>
                          <input
                            type="number"
                            className="md:w-6 lg:w-10 h-14 rounded-none bg-secondary text-white text-xl text-center"
                            min={1}
                            max={maxTickets}
                            value={ticketCount || 1}
                            onChange={(e) => {
                              if (!isNaN(e.target.value)) {
                                setTicketCount(parseInt(e.target.value));
                              }
                            }}
                          />
                          <button
                            className="min-w-[25px] md:w-10 h-14 rounded-r-lg text-white text-2xl transition-colors duration-300 ease-in-out hover:bg-[#10282db0] active:bg-[#10282d93]"
                            onClick={handleIncrease}
                          >
                            <div className="transition-all transform active:scale-150 duration-300 ease-in-out">+</div>
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
                        remainingTickets={remainingTickets}
                      />
                      <TicketCounter
                        isConnected={isConnected}
                        availableToMint={availableToMint}
                        ticketsBought={ticketsBought}
                        publicSale={publicSale}
                        hasCheckedWinner={hasCheckedWinner}
                        winnerNbMint={winnerNbMint}
                        totalRemainingTickets={totalRemainingTickets}
                        triggerAnimation={triggerAnimation}
                        resetTriggerAnimation={resetTriggerAnimation}
                      />
                    </div>
                    <div className="flex flex-row justify-end mt-10 lg:mt-7 mr-2 md:mr-5">
                      <p className="text-xl font-bold text-gray-400">Powered by
                        <span className="text-light">Ogronex</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  )
}