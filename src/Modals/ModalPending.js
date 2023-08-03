import React from 'react'

export default function ModalPending({ closeModal }) {
    return (
        <div
            className='fixed inset-0 bg-four/80 flex items-center justify-center z-50'
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
                <img className='max-h-[15vh]' src="https://img-16.stickers.cloud/packs/f5e083f9-8598-45a2-a1c5-d0f63728d6eb/webp/c1d3b819-3916-4f73-a266-56f5b36d22a1.webp" alt="pepe meme praying" />
                <h1 className='text-gray-400 text-2xl font-bold mb-4'>Winners are still unknowed</h1>
                <p className='text-gray-400'>Patience, crypto warrior! The blockchain gods are still determining the victors. Check back later to see if you're joining the ranks of the NFT elite. Good luck, and remember - HODL on!</p>
            </div>
        </div>
    )
}
