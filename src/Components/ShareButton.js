import { TwitterShareButton, TwitterIcon } from 'react-share'

export default function ShareButton() {
  return (
    <div className='ml-20'>
        <TwitterShareButton url={'https://launchpad.ogronex.com'} title={'I just minted my NFT ! @ogronex'} via={'Ogronex'} hashtags={['NFTFUNAGAIN', 'FREEMINT']}>
            <TwitterIcon size={32} round={true} />
        </TwitterShareButton>
    </div>
  )
}
