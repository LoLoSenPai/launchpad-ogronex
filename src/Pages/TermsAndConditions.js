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
                            <h2 className="md:text-xl font-bold text-gray-300 mt-4">Phase 1: Guaranteed Mint</h2>
                            <p>All whitelisted individuals who have provided their wallet addresses have the opportunity to mint 1 NFT. This phase ends with the commencement of the public raffle. Note that whitelisted individuals who have not minted their NFT by the end of this phase will no longer have the opportunity to do so. All sales during this phase are final and non-refundable.</p>
                            <h2 className="md:text-xl font-bold text-gray-300 mt-4">Phase 2: Public Raffle</h2>
                            <p>During this phase, everyone is allowed to purchase as many tickets as they wish. Winners will be selected through our smart contract, which ensures fair randomization using Chainlink VRF. This phase ends with the announcement of winners. All ticket purchases are final and non-refundable.</p>
                            <h2 className="md:text-xl font-bold text-gray-300 mt-4">Claiming of NFTs</h2>
                            <p>Winners have 24 hours to claim their NFTs after the public raffle phase. Please note that all won NFTs will be claimed at once to save on transaction fees. After the 24-hour window, unclaimed NFTs will no longer be available for claiming. We are not responsible for any unclaimed NFTs.</p>
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
