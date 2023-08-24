// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

//@author ENERJYS
//@title Launchpad Raffle

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract RaffleLaunchpad is ReentrancyGuard, VRFConsumerBaseV2, ConfirmedOwner {
    using Counters for Counters.Counter;
    Counters.Counter public idCounter;

    address[] public addressPlayers;
    address[] public winners;
    uint256 public numWinners;
    uint256 public deadline;
    uint256 public startDate;
    bool public lotteryClosed;
    uint256 public ticketPrice;

    event TicketsPurchased(address addressPlayer, uint256 nbTicket);
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus)
        public s_requests; /* requestId --> requestStatus */
    VRFCoordinatorV2Interface COORDINATOR;

    // Your subscription ID.
    uint64 s_subscriptionId;

    // past requests Id.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    bytes32 keyHash =
        0xcc294a196eeeb44da2888d17c0625cc88d70d9760a69d58d853ba6581a9ab0cd;

    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    uint256 public nbTicketSell;

    struct Player {
        uint256 idPlayer;
        address addressPlayer;
        uint256 ticketsBought;
        uint256 nbOfWin;
        bool isWinner;
        bool playerExist;
    }

    mapping(address => uint256) public idByAddress;
    Player[] public playersList;

    constructor(
        uint256 _startDate,
        uint256 _durationInMinutes,
        uint256 _ticketPrice,
        uint64 subscriptionId
    )
        VRFConsumerBaseV2(0xAE975071Be8F8eE67addBC1A82488F1C24858067)
        ConfirmedOwner(msg.sender)
    {
        require(_startDate > block.timestamp, "Invalide value of startDate");
        require(_durationInMinutes > 0, "Invalide value of duration");
        require(_ticketPrice > 0, "Invalide value of ticket price");
        COORDINATOR = VRFCoordinatorV2Interface(
            0xAE975071Be8F8eE67addBC1A82488F1C24858067
        );
        s_subscriptionId = subscriptionId;
        startDate = _startDate;
        deadline = startDate + (_durationInMinutes * 1 minutes);
        lotteryClosed = false;
        ticketPrice = _ticketPrice * 1 wei;
        nbTicketSell = 0;
    }

    function setStartDate(
        uint256 _startDate,
        uint256 _durationInMinutes
    ) public onlyOwner {
        require(_durationInMinutes > 0, "Invalide value of duration");
        require(_startDate > 0, "Invalide value of startDate");
        deadline = _startDate + (_durationInMinutes * 1 minutes);
        startDate = _startDate;
    }

    function requestRandomWords() internal returns (uint256 requestId) {
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function buyTicket(uint256 _nbTickets) public payable nonReentrant {
        require(!lotteryClosed, "Lottery is closed");
        require(_nbTickets > 0, "Invalide value of nb tickets");
        require(block.timestamp >= startDate, "Lottery hasn't started");
        require(
            msg.value >= _nbTickets * ticketPrice,
            "Minimum ticket price is not met"
        );
        require(block.timestamp <= deadline, "Lottery deadline has passed");

        bool playerExists = false;
        uint256 existingPlayerIndex;
        for (uint256 i = 0; i < idCounter.current(); i++) {
            if (
                playersList[i].addressPlayer == msg.sender &&
                playersList[i].playerExist
            ) {
                playerExists = true;
                existingPlayerIndex = playersList[i].idPlayer;
            }
        }
        if (playerExists) {
            playersList[existingPlayerIndex].ticketsBought += _nbTickets;
        } else {
            Player memory newPlayer = Player({
                idPlayer: idCounter.current(),
                addressPlayer: msg.sender,
                nbOfWin: 0,
                ticketsBought: _nbTickets,
                isWinner: false,
                playerExist: true
            });
            idByAddress[msg.sender] = idCounter.current();
            idCounter.increment();
            playersList.push(newPlayer);
        }
        nbTicketSell += _nbTickets;
        for (uint256 i = 0; i < _nbTickets; i++) {
            addressPlayers.push(msg.sender);
        }
        emit TicketsPurchased(msg.sender, _nbTickets);
    }

    function setWinners(uint256 _numberOfWinners) public onlyOwner {
        require(lotteryClosed, "Lottery is still open");
        require(_numberOfWinners > 0, "Invalid value of number of winners");
        require(winners.length < _numberOfWinners, "All winners already drawn");
        require(
            _numberOfWinners <= addressPlayers.length,
            "Number of winners exceeds total players"
        );
        require(
            s_requests[lastRequestId].fulfilled,
            "Error with chainlink request"
        );
        selectWinners(_numberOfWinners);
    }

    uint256 public winnersDrawn = 0;

    function selectWinners(uint256 _numberOfWinners) internal {
        require(
            _numberOfWinners + winnersDrawn <= numWinners,
            "Exceeds total number of winners"
        );

        uint256 _randomNum = s_requests[lastRequestId].randomWords[0];
        for (uint i = 0; i < _numberOfWinners; i++) {
            uint256 newRandomNum = uint256(
                keccak256(abi.encodePacked(_randomNum, i))
            );
            uint256 index = newRandomNum % addressPlayers.length;
            winners.push(addressPlayers[index]);
            address addressWinner = addressPlayers[index];
            addressPlayers[index] = addressPlayers[addressPlayers.length - 1];
            addressPlayers.pop();
            uint256 idWinner = idByAddress[addressWinner];
            playersList[idWinner].isWinner = true;
            playersList[idWinner].nbOfWin++;
        }
        winnersDrawn += _numberOfWinners;
    }

    function closeLottery() public onlyOwner returns (uint256) {
        lotteryClosed = true;
        uint256 requestRaffle = requestRandomWords();
        return requestRaffle;
    }

    function withdrawFunds() public onlyOwner {
        require(lotteryClosed, "Lottery is still open");
        uint256 totalAmount = address(this).balance;
        (bool send2, ) = payable(msg.sender).call{value: totalAmount}("");
        require(send2, "Withdraw fail");
    }

    function getPlayers() public view returns (address[] memory) {
        return addressPlayers;
    }

    function getWinners() public view returns (address[] memory) {
        return winners;
    }

    function getPlayersList() public view returns (Player[] memory) {
        return playersList;
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }
}
