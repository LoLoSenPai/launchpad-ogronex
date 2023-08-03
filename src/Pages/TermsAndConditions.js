import React, { useState } from "react";

function TermsAndConditions() {

    const [modalVisible, setModalVisible] = useState(false);

    return (
        <div>
            <button onClick={() => setModalVisible(true)}>Terms & Conditions</button>

            {modalVisible && (
                <div
                    className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40'
                    onClick={() => setModalVisible(false)}
                >
                    <div
                        className='bg-four rounded-lg p-8 relative w-full max-w-[85vw] md:max-w-2xl max-h-[92vh] overflow-auto mx-auto shadow-lg z-40'
                        onClick={e => e.stopPropagation()}
                    >
                        <h1 className="md:text-2xl font-bold text-gray-300 mb-4">Terms and Conditions</h1>
                        <div className="prose max-w-none text-gray-500">
                            <p>Welcome to our NFT collection minting website. Before you proceed, please read the following terms and conditions:</p>

                            <h2 className="md:text-xl font-bold text-gray-300 mt-4">Rewards for Dalmatians and Boxbies Holders</h2>
                            <p>For every 3 Dalmatians you hold, you are entitled to 1 free mint (no limit, e.g., if you hold 300 Dalmatians, you can get 100 free mints). For Boxbies holders, the free mints are as follows: 1+ Boxbies = 1 Free Mint, 5+ Boxbies = 5 Free Mints, 10+ Boxbies = 11 Free Mints, 30+ Boxbies = 34 Free Mints, 50+ Boxbies = 58 Free Mints. Sale duration of 3 hour.</p>

                            <h2 className="md:text-xl font-bold text-gray-300 mt-4">OG (Boxbies, Dalmatians, Dead Birds) Sale</h2>
                            <p>First-come, first-served (FCFS) sale with a duration of 1 hour. Each person can get 1 free mint.</p>

                            <h2 className="md:text-xl font-bold text-gray-300 mt-4">Whitelist</h2>
                            <p>First-come, first-served (FCFS) sale with a duration of 1 hour. Each person can get 1 free mint.</p>

                            <h2 className="md:text-xl font-bold text-gray-300 mt-4">Public Sale - Ticket Raffle</h2>
                            <p>The duration is 3 hours. The ticket price is 1 Matic. The 1500 winners will be drawn from this raffle. 15+ ticket buyers will be snapshotted for future benefits. There are extra giveaways depending on how many tickets you buy (announcement soon).</p>

                            <h2 className="md:text-xl font-bold text-gray-300 mt-4">Fees for the free mint</h2>
                            <p>The fee for the free mint is 0.5 Matic. Alt accounts or same IP accounts for the whitelist are not allowed. The public sale has no fee.</p>

                            <h2 className="md:text-xl font-bold text-gray-300 mt-4">Acceptance of Risk</h2>
                            <p>By participating in the minting process, you acknowledge that you are aware of the inherent risks associated with blockchain and NFT transactions, including but not limited to fluctuations in the value of Matic and NFTs, and technological difficulties that could prevent the minting process.</p>
                        </div>
                        <button
                            onClick={() => setModalVisible(false)}
                            className="absolute top-1 right-1 bg-light hover:bg-opacity-75 text-black px-4 py-2 md:text-xl items-center justify-center rounded font-bold"
                        >
                            X
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TermsAndConditions;
