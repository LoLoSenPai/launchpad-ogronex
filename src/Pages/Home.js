import { DynamicWidget } from "@dynamic-labs/sdk-react";


export default function Home() {

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
            <div className="flex flex-col justify-center items-center w-[900px] h-auto pt-7">
              <img className="" src="./Images/prize-maschine.png" alt="" />
            </div>
            <div className="flex flex-col mt-10 max-w-[700px] gap-6">
              <div className="flex flex-row p-4">
                <h1 className="text-6xl font-bold text-white">OG Teddies</h1>
                <div className="flex items-center ml-5 mt-4 gap-3">
                  <a href="https://discord.gg/fRgWtfj2wd" target="_blank" rel="noreferrer"><i className="fab fa-discord text-lg text-gray-500"></i></a>
                  <a href="https://twitter.com/OryonMerch" target="_blank" rel="noreferrer"><i className="fab fa-twitter text-lg text-gray-500"></i></a>
                  <a href="https://twitter.com/OryonMerch" target="_blank" rel="noreferrer"><i className="fas fa-globe text-lg text-gray-500"></i></a>
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
                <p className="text-xl font-bold text-white">Mint price:<span className="ml-1 text-light">FREE</span><span className="ml-1 text-gray-400 text-sm">+ 1 MATIC ticket fee</span>
                </p>
                <p className="text-xl font-bold text-white">Winners:<span className="ml-1 text-light">333</span>
                </p>
                <p className="text-xl font-bold text-white">Tickets sold:<span className="ml-1 text-light">1520</span><span className="ml-1 text-gray-400 text-sm">/ &#8734;</span>
                </p>
              </div>
              <div className="flex flex-row items-center p-4 bg-four rounded-lg border border-gray-600 justify-between">
                <p className="text-xl font-bold text-white">Guaranteed mint<span className="ml-3 text-light border border-light rounded-full px-2 text-sm">i</span>
                </p>
                <div className="flex flex-col justify-end ml-5">
                  <p className="text-xl font-bold text-white bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60"><i className="fas fa-circle pr-2 text-light text-sm"></i>Live</p>
                </div>
              </div>
              <div className="flex flex-row items-center p-4 bg-four rounded-lg border border-gray-600 justify-between">
                <p className="text-xl font-bold text-white">Public<span className="ml-3 text-light border border-light rounded-full px-2 text-sm">i</span>
                </p>
                <div className="flex flex-col justify-end ml-5">
                  <p className="text-md text-gray-400 bg-secondary py-2 px-6 rounded-lg border border-gray-600 bg-opacity-60">Live in<span className="text-white pl-2 text-xl">2:15:32</span></p>
                </div>
              </div>
              <div className="flex flew-row gap-11 w-full justify-between">
                <input
                  type="number"
                  className="w-1/4 h-14 rounded-lg bg-secondary text-white text-xl text-center border border-gray-600"
                  placeholder="1"
                />
                <button className="w-2/4 h-14 rounded-lg text-2xl bg-light font-bold text-black">Buy Tickets</button>
                <p className="w-1/4 flex items-center text-xl text-white">Your tickets:<span className="ml-1 text-light">150</span>
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
