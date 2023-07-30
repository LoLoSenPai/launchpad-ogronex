import { TwitterShareButton, TwitterIcon } from 'react-share'

export default function ShareButton() {
  return (
    <div className='ml-20'>
        <TwitterShareButton url={'https://launchpad.ogronex.com'} title={'NFT just minted!'} via={'I just mint my NFT on this new raffle system!'} hashtags={['NFTFUNAGAIN', 'FREEMINT']} related={['ogronex', 'boxbies']}>
            <TwitterIcon size={32} round={true} />
        </TwitterShareButton>
    </div>
  )
}
