import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { DynamicWidget } from "@dynamic-labs/sdk-react";
import { useAccount, useBalance } from "wagmi";
import { ethers } from "ethers";
import { Network, Alchemy } from 'alchemy-sdk';
import CountdownComponent from "../Components/Countdown";
import RaffleABI from "../ABI/RaffleG_0.json";
import NftABI from "../ABI/TBT_NFT.json";
import whitelist from '../Whitelist/whitelist.json';
import { PuffLoader } from "react-spinners";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModalPending from "../Modals/ModalPending";
import ModalWinner from "../Modals/ModalWinner";
import ModalLooser from "../Modals/ModalLooser";

const contractNftAddress = "0x367460AF11474809fa33A94C69b7815e68142830"
const contractRaffleAddress = "0x0f6982a6469D3Eacec3B05ca0E663085CF0D8A0e";

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
  const [showModalWinner, setShowModalWinner] = useState(false);
  const [showModalLooser, setShowModalLooser] = useState(false);
  const [showModalPending, setShowModalPending] = useState(false);

  //winner state
  const [isWinnerRaffle, setIsWinnerRaffle] = useState(false);
  const [hasCheckedWinner, setHasCheckedWinner] = useState(false);
  const [winnerNbMint, setWinnerNbMint] = useState(0);

  // useEffect(() => {
  //   window.ethereum.on('accountsChanged', function (accounts) {
  //     if (accounts.length === 0) {
  // L'utilisateur s'est déconnecté. Mettez à jour l'état en conséquence.
  // Ici, vous pouvez réinitialiser l'état de votre application et afficher un message à l'utilisateur.
  // } else {
  // L'utilisateur a changé de compte. Mettez à jour l'état en conséquence.
  // Par exemple, vous pouvez appeler à nouveau `useAccount` et `useBalance` pour obtenir le solde du nouveau compte.
  //   }
  // }); 
  // Nettoyez l'écouteur d'événements lorsque le composant est démonté.
  //   return () => window.ethereum.removeAllListeners();
  // }, []);


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

  const getTicketsBought = useCallback(async () => {
    if (!isConnected) return;
    try {
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
        const tx = await contractRaffle.buyTicket(ticketCount, { value: ethers.utils.parseEther((ticketCount * ticketPrice).toString()) });
        await provider.waitForTransaction(tx.hash);
        toast.success("You're in the game! Good luck with the draw!");
        setWaitingBuy(false);
        getTicketsBought();
        getTicketsSold();
      } catch (error) {
        toast.error("Transaction error! But don't worry, even the best stumble sometimes!");
        setWaitingBuy(false);
      }
    }
  }

  async function whiteListMint() {
    if (!isConnected) return // conditionner aussi a la phase guarranteed Mint
    try {
      setWaitingBuy(true);
      let addressWl;
      let proofWl;
      const result = whitelist.map((data) => {
        if (data.address === address) {
          console.log("ouiiiiiiii");
          addressWl = data.address;
          proofWl = data.proof;
        }
      });
      const tx = await contractNft.whitelistMint(proofWl);
      await provider.waitForTransaction(tx.hash);
      setWaitingBuy(false);
      toast.success("Success Mint !");

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
      setWaitingBuy(true);
      const tx = await contractNft.winnerRaffleSaleMint();
      await provider.waitForTransaction(tx.hash);
      toast.success("Success Mint !");

    } catch (error) {
      setWaitingBuy(false);
      toast.error("Transaction error! But don't worry, even the best stumble sometimes!")
    }
  }

  async function checkWinner() {
    if (!isConnected) return false; // conditionner aussi a la phase winner Mint
    try {
      console.log("Checking winner...");
      setHasCheckedWinner(true);
      const winnerData = await contractNft.winnerByAddress(address);
      console.log("Winner data:", winnerData);
      if (winnerData.addressWinner === address && winnerData.numberOfWin > 0) {
        console.log("User is a winner");
        setIsWinnerRaffle(true);
        setWinnerNbMint(winnerData.numberOfWin.toNumber());
        toast.success("YOU ARE WINNER ! GO MINT");
        return true;
      }
      console.log("User is not a winner");
      // toast.error("YOU ARE NOT WINNER... but dont worry ;) go to Magic Eden to explore collection !");
      return false;
    } catch (error) {
      console.log("Error checking winner:", error);
    }
  }

  // Guaranteed sale status
  // const getGuaranteedSaleStatus = () => {
  //   if (notStartedGuaranteedTimeBool) {
  //     return "Not Started";
  //   } else if (startGuaranteedTimeBool) {
  //     return "Live";
  //   } else if (endGuaranteedTimeBool) {
  //     return "Ended";
  //   }
  // };
  // const saleGuaranteedStatus = getGuaranteedSaleStatus();

  // // Public sale status
  // const getPublicSaleStatus = () => {
  //   if (notStartedTimeBool) {
  //     return "Not Started";
  //   } else if (startTimeBool) {
  //     return "Live";
  //   } else if (endTimeBool) {
  //     return "Ended";
  //   }
  // };
  // const salePublicStatus = getPublicSaleStatus();

  // Liste des dépendances à surveiller
const dependenciesGuaranteedSale = [notStartedGuaranteedTimeBool, startGuaranteedTimeBool, endGuaranteedTimeBool];
const dependenciesPublicSale = [notStartedTimeBool, startTimeBool, endTimeBool];

// État pour le statut de la vente garantie
const [saleGuaranteedStatus, setSaleGuaranteedStatus] = useState("");

// État pour le statut de la vente publique
const [salePublicStatus, setSalePublicStatus] = useState("");

useEffect(() => {
  // Fonction pour vérifier le statut de la vente garantie
  const checkGuaranteedSaleStatus = () => {
    if (notStartedGuaranteedTimeBool) {
      setSaleGuaranteedStatus("Not Started");
    } else if (startGuaranteedTimeBool) {
      setSaleGuaranteedStatus("Live");
    } else if (endGuaranteedTimeBool) {
      setSaleGuaranteedStatus("Ended");
    }
  };

  checkGuaranteedSaleStatus();
}, [dependenciesGuaranteedSale]);

useEffect(() => {
  // Fonction pour vérifier le statut de la vente publique
  const checkPublicSaleStatus = () => {
    if (notStartedTimeBool) {
      setSalePublicStatus("Not Started");
    } else if (startTimeBool) {
      setSalePublicStatus("Live");
    } else if (endTimeBool) {
      setSalePublicStatus("Ended");
    }
  };

  checkPublicSaleStatus();
}, [dependenciesPublicSale]);



  useEffect(() => {
    const checkTime = async () => {
      try {
        const maticProvider = await alchemy.config.getProvider();
        const block = await maticProvider.getBlock();
        const contractRaffleBeforeConnection = new ethers.Contract(contractRaffleAddress, RaffleABI.abi, maticProvider);
        const dateStartNft = await contractNft.saleStartTime();
        const dateEndtNftGuaranteed = await contractNft.endTimeGuarranted(); // to do: change endTimeGuarranted to endTimeGuaranteed
        const startTime = await contractRaffleBeforeConnection.startDate();
        const deadline = await contractRaffleBeforeConnection.deadline();

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

        if (block.timestamp < startTime.toNumber()) {
          setNotStartedTimeBool(true);
          setStartTimeBool(false);
          setEndTimeBool(false);
          setStartTime(startTime.toNumber());
        } else if (block.timestamp >= startTime.toNumber() && block.timestamp <= deadline.toNumber()) {
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
    if (isConnected && endTimeBool) {
      (async function fetchWinnerData() {
        await checkWinner();
      })();
    }
  }, [address]);

  useEffect(() => {
    getTicketsBought();
  }, [getTicketsBought, address]);

  useEffect(() => {
    if (balance.data) {
      const userBalanceInWei = balance.data.value;
      const ticketCostInWei = ethers.utils.parseEther((ticketCount * ticketPrice).toString());
      console.log("User balance:", userBalanceInWei.toString());
      console.log("Ticket cost:", ticketCostInWei.toString());
      setHasBalance(() => ticketCostInWei.lte(userBalanceInWei));
    } else {
      setHasBalance(false);
    }
  }, [balance, ticketCount, address]);



  let buttonText;
  if (waitingBuy) {
    buttonText = (
      <button
        className="lg:py-4  w-full lg:w-2/4 rounded-lg text-xl lg:text-2xl bg-light opacity-50 font-bold text-black col-span-2"
        disabled
      >
        <div className="flex justify-center items-center h-full">
          <PuffLoader color="#000" />
        </div>
      </button>
    );
  } else if (!isConnected) {
    buttonText = (
      <button
        className="lg:py-4 w-full lg:w-2/4 rounded-lg text-xl lg:text-2xl bg-light opacity-50 font-bold text-black col-span-2"
        disabled
      >
        Connect your wallet
      </button>
    );
  }
  else if (!hasBalance && startTimeBool) {
    buttonText = (
      <button
        className="lg:py-4  w-full lg:w-2/4 rounded-lg text-xl lg:text-2xl bg-light opacity-50 font-bold text-black col-span-2"
        disabled
      >
        Insufficient Balance
      </button>
    );
  }
  else if (isWhitelisted(address) && startGuaranteedTimeBool) {
    buttonText = (
      <button
        className="lg:py-4 w-full lg:w-2/4 rounded-lg text-xl lg:text-2xl bg-light font-bold text-black col-span-2"
        onClick={() => whiteListMint()}
      >
        Mint
      </button>
    );
  } else if (startTimeBool) {
    buttonText = (
      <button
        className="lg:py-4 flex items-center justify-center w-full lg:w-2/4 rounded-lg text-xl lg:text-2xl bg-light font-bold text-black col-span-2"
        onClick={() => buyTickets()}
      >
        Buy Tickets
      </button>
    );
  } else if (hasCheckedWinner && isWinnerRaffle) {
    buttonText = (
      <button
        className="lg:py-4 w-full lg:w-2/4 rounded-lg text-xl lg:text-2xl bg-light font-bold text-black col-span-2"
        onClick={() => winnerRaffleMint()}
      >
        Claim
      </button>
    );
  } else if (endTimeBool) {
    buttonText = (
      <>
        <button
          className="lg:py-4 w-full lg:w-2/4 rounded-lg text-xl lg:text-2xl bg-light font-bold text-black col-span-2 max-h-[80px] md:max-h-auto "
          onClick={async () => {
            // const isRaffleOver = await contractNft.isRaffleOver();
            const isRaffleOver = true;
            if (isRaffleOver) {
              const hasChecked = await checkWinner();
              if (hasChecked && isWinnerRaffle) {
                setShowModalWinner(true);
              } else {
                setShowModalLooser(true);
              }
            } else {
              setShowModalPending(true);
            }
          }}
        >
          Verify
        </button>
        {showModalPending && createPortal(<ModalPending closeModal={() => setShowModalPending(false)} />, document.body)}
        {showModalWinner && createPortal(<ModalWinner closeModal={() => setShowModalWinner(false)} winnerNbMint={winnerNbMint} />, document.body)}
        {showModalLooser && createPortal(<ModalLooser closeModal={() => setShowModalLooser(false)} />, document.body)}
      </>
    );
  } else {
    buttonText = (
      <button
        className="lg:py-4 w-full lg:w-2/4 rounded-lg text-xl xl:text-2xl bg-light opacity-50 font-bold text-black col-span-2"
        disabled
      >
        Waiting for next phase
      </button>
    );
  }

  let maxTickets;
  let showInput = true;
  if (startGuaranteedTimeBool) {
    maxTickets = 1;
  } else if (startTimeBool) {
    maxTickets = Infinity;
  } else if (endTimeBool) {
    maxTickets = winnerNbMint;
    showInput = false;
  } else {
    maxTickets = undefined;
  }


  return (
    <>
      <ToastContainer
        position="bottom-center"
        theme="dark"
      />
      <div className="homepage py-10 px-2 md:px-5 lg:px-20 lg:justify-center xl:max-w-[70vw] lg:mx-auto xl:px-0">

        <header className="navbar px-0">
          <nav className="flex justify-center md:justify-between gap-0">
            <div className="d-none">
              <a href="./" className="">
                <span className="sr-only">Ogronex</span>
                <img
                  className="invisible sm:visible h-11 md:h-14 w-auto"
                  src="./Images/logo.png"
                  alt="Ogronex logo"
                />
              </a>
            </div>
            <div className="flex flex-row items-center gap-4 md:gap-8 z-30">
              <a href="./" className="text-sm sm:text-xl font-bold text-gray-400">Terms and conditions</a>
              <div className="">
                <DynamicWidget variant='dropdown' />
              </div>
            </div>
          </nav>
        </header>

        <main className="relative lg:justify-center">

          <div className="flex flex-col-reverse md:flex-row justify-center w-full xl:pl-35">
            <div className="flex flex-col mt-10 w-full gap-6 px-4">
              <div className="flex flex-row p-0 md:p-3 md:pl-0">
                <h1 className="text-6xl font-bold text-white">OG Teddies</h1>
                <div className="flex flex-col md:flex-row items-center ml-5 md:mt-4 gap-3">
                  <a href="https://discord.gg/ogronexnft" target="_blank" rel="noreferrer"><i className="fab fa-discord text-lg text-gray-500"></i></a>
                  <a href="https://twitter.com/Ogronex" target="_blank" rel="noreferrer"><i className="fab fa-twitter text-lg text-gray-500"></i></a>
                  <a href="https://ogronex.com/" target="_blank" rel="noreferrer"><i className="fas fa-globe text-lg text-gray-500"></i></a>
                </div>
              </div>
              <div className="flex flex-row xl:max-w-[70%] xl:px-4">
                <p className="text-justify md:text-lg xl:text-xl font-bold text-gray-500">
                  Introducing the "OG Teddies", a collection of 333 unique and
                  lovable teddy bears. Own a digital representation of these adorable companions,
                  unlock exclusive benefits, and immerse yourself in a vibrant community.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center md:mt-10 overflow-hidden lg:pb-10 xl:pb-12">
            <div className="flex justify-center items-center w-full max-w-[400px] lg:min-w-[500px] xl:max-w-[650px] h-auto">
              <img className="w-full scale-125" src="./Images/prize-maschine-test.png" alt="maschine with a hook to grab prize" />
            </div>
            <div className="flex flex-col mt-10 w-full md:max-w-[500px] gap-6">
              {/* <img className="w-full md:mt-40 lg:mt-5 lg:max-w-[800px] xl:max-w-[650px]" src="./Images/prize-maschine-test.png" alt="maschine with a hook to grab prize" /> */}
              {/* <div className="flex flex-row p-4 md:p-3 md:pl-0">
                <h1 className="text-6xl font-bold text-white">OG Teddies</h1>
                <div className="flex flex-col md:flex-row items-center ml-5 md:mt-4 gap-3">
                  <a href="https://discord.gg/ogronexnft" target="_blank" rel="noreferrer"><i className="fab fa-discord text-lg text-gray-500"></i></a>
                  <a href="https://twitter.com/Ogronex" target="_blank" rel="noreferrer"><i className="fab fa-twitter text-lg text-gray-500"></i></a>
                  <a href="https://ogronex.com/" target="_blank" rel="noreferrer"><i className="fas fa-globe text-lg text-gray-500"></i></a>
                </div>
              </div>
              <div className="flex flex-row xl:px-4">
                <p className="text-justify text-lg xl:text-xl font-bold text-gray-500">Introducing the "OG Teddies", a collection of 333 unique and
                  lovable teddy bears. Own a digital representation of these adorable companions,
                  unlock exclusive benefits, and immerse yourself in a vibrant community.
                </p>
              </div> */}
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
              {endTimeBool && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-four rounded-lg border border-gray-600 justify-center md:justify-between">
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
                    <div className="flex flew-row md:px-2">
                      <p className={"lg:text-lg xl:text-xl font-bold text-white bg-secondary py-2 px-6 lg:px-4 xl:px-6 rounded-lg border border-gray-600 bg-opacity-60 lg:min-w-[110px] xl:min-w-[130px]"}>
                        <i className={`fas fa-circle pr-2 text-light text-sm animate-pulse ${saleGuaranteedStatus === 'Live' ? 'text-green-500' : 'text-red-500'}`}></i>
                        {saleGuaranteedStatus}
                      </p>
                    </div>
                    {!endGuaranteedTimeBool && (
                      <div className="flex flex-col justify-end md:-ml-1.5 lg:ml-2 md:min-w-[110px] lg:min-w-[160px] xl:min-w-[233px]">
                        <div className="flex flex-col text-center text-md text-gray-400 bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60">
                          {notStartedGuaranteedTimeBool &&
                            <>
                              Live in
                              <span className="text-white pl-2 xl:text-xl">
                                <CountdownComponent deadline={dateStartGuaranteed} />
                              </span>
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
                    )}
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
                        <div className="tooltip absolute left-1/2 top-full -translate-x-1/2 transform whitespace-normal md:whitespace-nowrap rounded bg-secondary bg-opacity-80 p-2 text-white text-md min-w-[75vw] md:max-w-[95vw] overflow-hidden text-overflow-ellipsis">
                          All winners will be drawn few minutes after the end.
                        </div>
                      )}
                    </p>
                    <div className="flex ml-3 xl:ml-28">
                      <div className={"lg:text-lg xl:text-xl font-bold text-white bg-secondary py-2 px-6 xl:px-6 rounded-lg border border-gray-600 bg-opacity-60 lg:min-w-[110px] xl:min-w-[130px]"}>
                        <i className={`fas fa-circle pr-2 text-light text-sm animate-pulse ${salePublicStatus === 'Live' ? 'text-green-500' : 'text-red-500'}`}></i>
                        {salePublicStatus}
                      </div>
                    </div>
                    {!endTimeBool && (
                      <div className="flex flex-col justify-end ml-2 sm:ml-5 md:min-w-[110px] lg:min-w-[160px] xl:min-w-[233px]">
                        <div className="flex flex-col text-center text-md text-gray-400 bg-secondary py-2 xl:py-2.5 px-6 rounded-lg border border-gray-600 bg-opacity-60">
                          {notStartedTimeBool &&
                            <>
                              Live in
                              <span className="text-white pl-2 xl:text-xl">
                                <CountdownComponent deadline={startTime} />
                              </span>
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
                    )}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 lg:flex flew-row gap-2 md:gap-4 lg:gap-8 xl:gap-11 w-full min-h-[50px] justify-between">
                {showInput && (
                  <div className="flex justify-around items-center rounded-lg border border-gray-600 bg-secondary">
                    <button className="w-10 h-14 rounded-l-lg text-white text-2xl" onClick={handleDecrease}>
                      -
                    </button>
                    <input
                      type="number"
                      className="w-4 md:w-6 lg:w-16 h-14 rounded-none bg-secondary text-white text-xl text-center"
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
                {buttonText}
                <div className="flex flex-col justify-center">
                  <p className="flex justify-content items-center lg:text-xl text-white leading-tight">Your tickets:{isConnected && <span className="ml-1 text-light pr-4">{ticketsBought}</span>}
                  </p>
                  {isConnected && hasCheckedWinner &&
                    <p className="flex justify-content items-center lg:text-xl text-white sm:mt-3 md:mt-1">Won:<span className="ml-8 md:ml-12 lg:ml-16 text-light ">{winnerNbMint}</span></p>
                  }
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