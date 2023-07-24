import React from 'react'

export default function ModalWinner({ closeModal, winnerNbMint }) {
    return (
        <div
            className='fixed inset-0 bg-four/80 flex items-center justify-center'
            onClick={closeModal}
        >
            <div
                className='bg-secondary/90 rounded-lg p-8 relative lg:min-h-[40vh] lg:max-w-[40vw]'
                onClick={e => e.stopPropagation()}
            >
                <button
                    className='absolute top-1 right-1 bg-light hover:bg-opacity-75 text-black px-4 py-2 items-center justify-center rounded'
                    onClick={closeModal}
                >
                    X
                </button>
                <img className='max-h-[15vh]' src="https://img-11.stickers.cloud/packs/afbd6624-c541-41b0-a4de-3d3b1c74c74d/webp/e1769de1-a927-4722-a0a8-c309e6847f9d.webp" alt="pepe meme happy" />
                <h1 className='text-gray-400 text-2xl font-bold mb-4'>LUCKYYYY</h1>
                <p className='text-gray-400'>Jackpot! You've ridden the crypto wave and landed straight into the winners' circle. Click below to claim your exclusive NFT. Welcome to the OG club!</p><br />
                <p className='text-gray-400'>You have won {winnerNbMint} tickets, so you can mint {winnerNbMint} Teddies!</p>
            </div>
        </div>
    )
}
