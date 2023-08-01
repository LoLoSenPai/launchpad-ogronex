import React from 'react'

export default function ModalLooser({ closeModal }) {
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
                <img className='max-h-[15vh]' src="https://img-16.stickers.cloud/packs/f622f526-ac45-41f8-ac83-6b5ccdcee42c/webp/39791b45-79a8-4c16-9799-b50c7f569c46.webp" alt="pepe meme crying" />
                <h1 className='text-gray-400 text-2xl font-bold mb-4'>Nooo</h1>
                <p className='text-gray-400'>Damn, you didn't snag an NFT this time. But remember, in the world of blockchain, every 'no' is just a 'not yet.' Head over to the secondary market and grab your NFT. Who knows, you might even find a diamond in the rough!</p>
            </div>
        </div>
    )
}
