// SPDX-License-Identifier: MIT

pragma solidity >=0.8.13 <0.9.0;

import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import "operator-filter-registry/src/DefaultOperatorFilterer.sol";
import "./raffleLaunchpad.sol";

contract DB is
    ERC721AQueryable,
    Ownable,
    ReentrancyGuard,
    ERC2981,
    DefaultOperatorFilterer
{
    using Strings for uint256;

    bytes32 public merkleRootHolders;
    bytes32 public merkleRootOG;
    bytes32 public merkleRootWhitelist;
    /* mapping(address => bool) public whitelistClaimed; */
    mapping(address => uint) public alreadyMintedWhitelist;
    mapping(address => uint) public alreadyMintedOG;
    mapping(address => uint) public alreadyMintedHolders;

    string public uriPrefix = "";
    string public uriSuffix = ".json";
    string public hiddenMetadataUri;

    uint256 public cost;
    uint256 public maxSupply;
    uint256 public maxMintAmountPerTx;

    // Whitelist Supply
    uint256 public whitelistMinted;
    uint256 public whitelistSupply;

    bool public paused = true;

    uint public constant START_TIMESTAMP = 1690977600; //     Wed Aug 02 2023 12:00:00 GMT+0 START HOLDERS PHASE
    uint public constant OG_START_TIMESTAMP = 1690988400; //     Wed Aug 02 2023 15:00:00 GMT+0 START OG PHASE;
    uint public constant WL_START_TIMESTAMP = 1690992000; //     Wed Aug 02 2023 16:00:00 GMT+0 START WL PHASE
    uint public constant WL_END_TIMESTAMP = 1690995600; //    Wed Aug 02 2023 17:00:00 GMT+0 START PUBLIC PHASE
    bool public revealed = false;

    address treasury;

    struct WinnerRaffle {
        address addressWinner;
        uint256 numberOfWin;
        bool notMinted;
    }

    mapping(address => WinnerRaffle) public winnerByAddress;

    RaffleLaunchpad public raffleContract;

    bool public isRaffleOver;

    uint public endTimeWinnerMint;

    constructor(
        string memory _tokenName,
        string memory _tokenSymbol,
        uint256 _cost,
        uint256 _maxSupply,
        uint256 _whitelistSupply,
        uint256 _maxMintAmountPerTx,
        string memory _hiddenMetadataUri,
        address _royaltyReceiver,
        uint96 _royaltyNumerator,
        address _treasury,
        RaffleLaunchpad _raffleContract
    ) ERC721A(_tokenName, _tokenSymbol) {
        setCost(_cost);
        maxSupply = _maxSupply;
        whitelistSupply = _whitelistSupply;
        treasury = _treasury;
        setMaxMintAmountPerTx(_maxMintAmountPerTx);
        setHiddenMetadataUri(_hiddenMetadataUri);
        _setDefaultRoyalty(_royaltyReceiver, _royaltyNumerator);
        raffleContract = _raffleContract;
        isRaffleOver = false;
    }

    modifier mintCompliance(uint256 _mintAmount) {
        require(
            _mintAmount > 0 && _mintAmount <= maxMintAmountPerTx,
            "Invalid mint amount!"
        );
        require(
            totalSupply() + _mintAmount <= maxSupply,
            "Max supply exceeded!"
        );
        _;
    }

    modifier mintPriceCompliance(uint256 _mintAmount) {
        require(msg.value >= cost * _mintAmount, "Insufficient funds!");
        _;
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "The caller is another contract");
        _;
    }

    /**
     * @dev Sets up the winners from the raffle for minting.
     * @param _endTimeWinnerMint {uint} - Time until which winners can mint.
     */
    function setWinnerStructViaRaffle(
        uint _endTimeWinnerMint
    ) external onlyOwner {
        require(
            block.timestamp < _endTimeWinnerMint,
            "invalid endTimeWinnerMint"
        );
        require(raffleContract.lotteryClosed(), "Raffle already open");
        require(
            raffleContract.getWinners().length > 0,
            "Winners not set in raffle contract"
        );
        endTimeWinnerMint = _endTimeWinnerMint;
        isRaffleOver = true;
        RaffleLaunchpad.Player[] memory rafflePlayersList = raffleContract
            .getPlayersList();
        for (uint i = 0; i < rafflePlayersList.length; i++) {
            if (
                rafflePlayersList[i].isWinner &&
                rafflePlayersList[i].nbOfWin > 0
            ) {
                WinnerRaffle memory newWinner = WinnerRaffle({
                    addressWinner: rafflePlayersList[i].addressPlayer,
                    numberOfWin: rafflePlayersList[i].nbOfWin,
                    notMinted: true
                });
                winnerByAddress[rafflePlayersList[i].addressPlayer] = newWinner;
            }
        }
    }

    /**
     * @dev Sets the end time for winners to mint.
     * @param _endTimeWinnerMint {uint} - End time for winners to mint.
     */
    function setEndTimeWinnerMint(uint _endTimeWinnerMint) external onlyOwner {
        endTimeWinnerMint = _endTimeWinnerMint;
    }

    /**
     * @dev Sets the raffle contract.
     * @param _raffleContract {RaffleG_0} - Address of the raffle contract.
     */
    function setRaffleContract(
        RaffleLaunchpad _raffleContract
    ) external onlyOwner {
        raffleContract = _raffleContract;
    }

    /**
     * @dev Allows a raffle winner to mint their won NFTs.
     */
    function winnerRaffleSaleMint() external callerIsUser {
        require(
            block.timestamp > WL_END_TIMESTAMP,
            "The winner sale is not enabled!"
        );
        require(isRaffleOver, "Raffle is not Over!");
        require(block.timestamp < endTimeWinnerMint, "Winner Mint is finish");
        require(
            winnerByAddress[msg.sender].addressWinner == msg.sender,
            "winner not exist"
        );
        require(winnerByAddress[msg.sender].notMinted, "Already mint");
        require(winnerByAddress[msg.sender].numberOfWin > 0, "Nothing to mint");
        require(
            totalSupply() + winnerByAddress[msg.sender].numberOfWin <=
                maxSupply,
            "Max supply exceeded"
        );
        winnerByAddress[msg.sender].notMinted = false;
        _safeMint(msg.sender, winnerByAddress[msg.sender].numberOfWin);
    }

    function verifyWhitelistMint(
        uint256 _availableToMint,
        bytes32[] calldata _merkleProof
    ) internal {
        // Verify whitelist requirements
        require(
            START_TIMESTAMP <= block.timestamp &&
                block.timestamp <= WL_END_TIMESTAMP,
            "The whitelist sale is not enabled!"
        );
        require(
            whitelistMinted + _mintAmount <= whitelistSupply,
            "Minting Phase Supply reached!"
        );
        bytes32 leaf = keccak256(
            bytes.concat(keccak256(abi.encode(msg.sender, _availableToMint)))
        );

        if (block.timestamp < OG_START_TIMESTAMP) {
            require(
                MerkleProof.verify(_merkleProof, merkleRootHolders, leaf) &&
                    _mintAmount <=
                    _availableToMint - alreadyMintedHolders[_msgSender()],
                "Invalid proof or mint amount limit exceeded."
            );
            alreadyMintedHolders[_msgSender()] += _mintAmount;
        } else if (block.timestamp < WL_START_TIMESTAMP) {
            require(
                MerkleProof.verify(_merkleProof, merkleRootOG, leaf) &&
                    _mintAmount <=
                    _availableToMint - alreadyMintedOG[_msgSender()],
                "Invalid proof or mint amount limit exceeded."
            );
            alreadyMintedOG[_msgSender()] += _mintAmount;
        } else if (block.timestamp < WL_END_TIMESTAMP) {
            require(
                MerkleProof.verify(_merkleProof, merkleRootWhitelist, leaf) &&
                    _mintAmount <=
                    _availableToMint - alreadyMintedWhitelist[_msgSender()],
                "Invalid proof or mint amount limit exceeded."
            );
            alreadyMintedWhitelist[_msgSender()] += _mintAmount;
        }
    }

    function whitelistMint(
        uint256 _availableToMint,
        bytes32[] calldata _merkleProof,
        uint256 _mintAmount
    )
        public
        payable
        mintCompliance(_mintAmount)
        mintPriceCompliance(_mintAmount)
    {
        require(
            whitelistMinted + _mintAmount <= whitelistSupply,
            "Minting Phase Supply reached!"
        );
        require(
            START_TIMESTAMP <= block.timestamp &&
                block.timestamp <= WL_END_TIMESTAMP,
            "The whitelist sale is not enabled!"
        );
        verifyWhitelistMint(_availableToMint, _merkleProof);
        whitelistMinted += _mintAmount;
        _safeMint(_msgSender(), _mintAmount);
    }

    function setwhitelistSupply(uint _whitelistSupply) external onlyOwner {
        whitelistSupply = _whitelistSupply;
    }

    function mint(
        uint256 _mintAmount
    )
        public
        payable
        mintCompliance(_mintAmount)
        mintPriceCompliance(_mintAmount)
    {
        require(!paused, "The contract is paused!");

        _safeMint(_msgSender(), _mintAmount);
    }

    function mintForAddress(
        uint256 _mintAmount,
        address _receiver
    ) public mintCompliance(_mintAmount) onlyOwner {
        _safeMint(_receiver, _mintAmount);
    }

    function mintForAddresses(
        uint256[] calldata _mintAmount,
        address[] calldata _receiver,
        uint _totalAmount
    ) public mintCompliance(_totalAmount) onlyOwner {
        require(
            _mintAmount.length == _receiver.length,
            "Different size arrays."
        );
        for (uint i = 0; i < _mintAmount.length; i++) {
            _safeMint(_receiver[i], _mintAmount[i]);
        }
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    function tokenURI(
        uint256 _tokenId
    ) public view virtual override(IERC721A, ERC721A) returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        if (revealed == false) {
            return hiddenMetadataUri;
        }

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        _tokenId.toString(),
                        uriSuffix
                    )
                )
                : "";
    }

    function setRevealed(bool _state) public onlyOwner {
        revealed = _state;
    }

    function setCost(uint256 _cost) public onlyOwner {
        cost = _cost;
    }

    function setMaxMintAmountPerTx(
        uint256 _maxMintAmountPerTx
    ) public onlyOwner {
        maxMintAmountPerTx = _maxMintAmountPerTx;
    }

    function setHiddenMetadataUri(
        string memory _hiddenMetadataUri
    ) public onlyOwner {
        hiddenMetadataUri = _hiddenMetadataUri;
    }

    function setUriPrefix(string memory _uriPrefix) public onlyOwner {
        uriPrefix = _uriPrefix;
    }

    function setUriSuffix(string memory _uriSuffix) public onlyOwner {
        uriSuffix = _uriSuffix;
    }

    function setPaused(bool _state) public onlyOwner {
        paused = _state;
    }

    function setMerkleRoot(
        bytes32 _merkleRootHolders,
        bytes32 _merkleRootWhitelist
    ) public onlyOwner {
        merkleRootHolders = _merkleRootHolders;
        merkleRootWhitelist = _merkleRootWhitelist;
    }

    /*   function setWhitelistMintEnabled(bool _state) public onlyOwner {
    whitelistMintEnabled = _state;
    if (_state) whitelistMinted = 0;
  } */

    function setTreasuryWallet(address _wallet) public onlyOwner {
        treasury = _wallet;
    }

    function withdraw() public onlyOwner nonReentrant {
        // This will transfer the remaining contract balance to the treasury wallet.
        // Do not remove this otherwise you will not be able to withdraw the funds.
        // =============================================================================
        (bool os, ) = payable(treasury).call{value: address(this).balance}("");
        require(os);
        // =============================================================================
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return uriPrefix;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC721A, ERC721A, ERC2981) returns (bool) {
        return
            ERC721A.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
    }

    function setDefaultRoyalty(
        address receiver,
        uint96 feeNumerator
    ) public onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    //@dev following functions overrides the ERC721A methods in order to comply with OpenSea Standards:
    //https://github.com/ProjectOpenSea/operator-filter-registry

    function setApprovalForAll(
        address operator,
        bool approved
    ) public override(IERC721A, ERC721A) onlyAllowedOperatorApproval(operator) {
        super.setApprovalForAll(operator, approved);
    }

    function approve(
        address operator,
        uint256 tokenId
    )
        public
        payable
        override(IERC721A, ERC721A)
        onlyAllowedOperatorApproval(operator)
    {
        super.approve(operator, tokenId);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override(IERC721A, ERC721A) onlyAllowedOperator(from) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public payable override(IERC721A, ERC721A) onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public payable override(IERC721A, ERC721A) onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId, data);
    }
}
