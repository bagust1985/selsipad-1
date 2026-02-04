// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AggregatorV3Interface
 * @notice Chainlink Price Feed Interface
 */
interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
    
    function decimals() external view returns (uint8);
}

/**
 * @title AMAPurchaseRegistry
 * @notice Handles AMA request payments with Chainlink oracle pricing
 * @dev $100 USD payment in BNB, 100% to Treasury, auto-refund on rejection
 * 
 * Flow:
 * 1. Developer calls requestAMA() with payment
 * 2. Contract sends funds to treasury
 * 3. If admin rejects, owner calls refundRequest() to return funds
 */
contract AMAPurchaseRegistry is Ownable, ReentrancyGuard, Pausable {
    // ===================== Constants =====================
    
    /// @notice AMA fee in USD (18 decimals)
    uint256 public constant AMA_FEE_USD = 100 * 1e18; // $100
    
    // ===================== State Variables =====================
    
    /// @notice Treasury address (receives 100% of fees)
    address public treasury;
    
    /// @notice Chainlink BNB/USD price feed
    AggregatorV3Interface public priceFeed;
    
    /// @notice Manual BNB price fallback (18 decimals, e.g., 600e18 = $600/BNB)
    uint256 public manualPriceBNB;
    
    /// @notice Use oracle or manual price
    bool public useOracle;
    
    /// @notice AMA Request struct
    struct AMARequest {
        address developer;
        uint256 amountPaid;
        uint256 timestamp;
        bool refunded;
    }
    
    /// @notice Mapping of requestId => AMARequest
    mapping(bytes32 => AMARequest) public requests;
    
    /// @notice Total requests counter
    uint256 public totalRequests;
    
    /// @notice Total BNB collected
    uint256 public totalBNBCollected;
    
    // ===================== Events =====================
    
    event AMARequested(
        bytes32 indexed requestId,
        address indexed developer,
        uint256 amountPaid,
        uint256 timestamp
    );
    
    event AMARefunded(
        bytes32 indexed requestId,
        address indexed developer,
        uint256 amountRefunded
    );
    
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event PriceFeedUpdated(address indexed oldFeed, address indexed newFeed);
    event ManualPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event OracleToggled(bool useOracle);
    
    // ===================== Errors =====================
    
    error RequestAlreadyExists();
    error RequestNotFound();
    error AlreadyRefunded();
    error InsufficientPayment();
    error InvalidAddress();
    error TransferFailed();
    error StalePrice();
    
    // ===================== Constructor =====================
    
    /**
     * @notice Initialize the contract
     * @param _treasury Treasury address (receives all fees)
     * @param _priceFeed Chainlink BNB/USD price feed address
     * @param _manualPriceBNB Fallback manual price (e.g., 600e18 for $600/BNB)
     */
    constructor(
        address _treasury,
        address _priceFeed,
        uint256 _manualPriceBNB
    ) Ownable(msg.sender) {
        if (_treasury == address(0)) {
            revert InvalidAddress();
        }
        
        treasury = _treasury;
        priceFeed = AggregatorV3Interface(_priceFeed);
        manualPriceBNB = _manualPriceBNB;
        useOracle = true; // Default to oracle
    }
    
    // ===================== Main Functions =====================
    
    /**
     * @notice Request an AMA session with payment
     * @param requestId Unique identifier for this AMA request (hash of form data)
     * @dev Developer pays $100 in BNB, funds go to treasury
     */
    function requestAMA(bytes32 requestId) external payable nonReentrant whenNotPaused {
        // Check request doesn't already exist
        if (requests[requestId].developer != address(0)) {
            revert RequestAlreadyExists();
        }
        
        // Get required BNB amount
        uint256 requiredBNB = getRequiredBNB();
        
        // Check payment
        if (msg.value < requiredBNB) {
            revert InsufficientPayment();
        }
        
        // Store request for potential refund
        requests[requestId] = AMARequest({
            developer: msg.sender,
            amountPaid: requiredBNB,
            timestamp: block.timestamp,
            refunded: false
        });
        
        // Transfer to treasury
        (bool success, ) = treasury.call{value: requiredBNB}("");
        if (!success) {
            revert TransferFailed();
        }
        
        // Refund excess payment
        uint256 excess = msg.value - requiredBNB;
        if (excess > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: excess}("");
            if (!refundSuccess) {
                revert TransferFailed();
            }
        }
        
        // Update counters
        totalRequests++;
        totalBNBCollected += requiredBNB;
        
        emit AMARequested(requestId, msg.sender, requiredBNB, block.timestamp);
    }
    
    /**
     * @notice Get required BNB amount for AMA fee
     * @return Amount in wei (18 decimals)
     */
    function getRequiredBNB() public view returns (uint256) {
        if (useOracle && address(priceFeed) != address(0)) {
            return _getOraclePrice();
        }
        return _getManualPrice();
    }
    
    /**
     * @notice Calculate BNB amount using Chainlink oracle
     * @return Amount in wei
     */
    function _getOraclePrice() internal view returns (uint256) {
        (
            uint80 roundId,
            int256 price,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
        
        // Validate price data
        if (price <= 0) revert StalePrice();
        if (updatedAt == 0) revert StalePrice();
        if (answeredInRound < roundId) revert StalePrice();
        
        // Check staleness (1 hour max)
        if (block.timestamp - updatedAt > 3600) revert StalePrice();
        
        // Price has 8 decimals for BNB/USD
        // Required = AMA_FEE_USD / price
        // = (100 * 1e18) / (price * 1e10)
        // = (100 * 1e18 * 1e8) / (price * 1e18)
        uint8 decimals = priceFeed.decimals();
        
        // Convert price to 18 decimals
        uint256 priceNormalized = uint256(price) * (10 ** (18 - decimals));
        
        // Calculate required BNB: $100 / price_per_bnb
        return (AMA_FEE_USD * 1e18) / priceNormalized;
    }
    
    /**
     * @notice Calculate BNB amount using manual price
     * @return Amount in wei
     */
    function _getManualPrice() internal view returns (uint256) {
        // manualPriceBNB is BNB price in USD (18 decimals)
        // e.g., 600e18 means $600 per BNB
        // Required = $100 / $600 = 0.1667 BNB
        return (AMA_FEE_USD * 1e18) / manualPriceBNB;
    }
    
    // ===================== Admin Functions =====================
    
    /**
     * @notice Refund an AMA request (called when admin rejects)
     * @param requestId The request ID to refund
     * @dev Only owner can call, funds come from treasury or contract balance
     */
    function refundRequest(bytes32 requestId) external onlyOwner nonReentrant {
        AMARequest storage request = requests[requestId];
        
        if (request.developer == address(0)) {
            revert RequestNotFound();
        }
        
        if (request.refunded) {
            revert AlreadyRefunded();
        }
        
        // Mark as refunded
        request.refunded = true;
        
        // Refund to developer
        (bool success, ) = request.developer.call{value: request.amountPaid}("");
        if (!success) {
            revert TransferFailed();
        }
        
        emit AMARefunded(requestId, request.developer, request.amountPaid);
    }
    
    /**
     * @notice Update treasury address
     * @param _newTreasury New treasury address
     */
    function updateTreasury(address _newTreasury) external onlyOwner {
        if (_newTreasury == address(0)) {
            revert InvalidAddress();
        }
        
        address oldTreasury = treasury;
        treasury = _newTreasury;
        
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }
    
    /**
     * @notice Update price feed address
     * @param _newFeed New Chainlink price feed address
     */
    function updatePriceFeed(address _newFeed) external onlyOwner {
        address oldFeed = address(priceFeed);
        priceFeed = AggregatorV3Interface(_newFeed);
        
        emit PriceFeedUpdated(oldFeed, _newFeed);
    }
    
    /**
     * @notice Update manual price fallback
     * @param _newPrice New price in USD (18 decimals, e.g., 600e18)
     */
    function updateManualPrice(uint256 _newPrice) external onlyOwner {
        uint256 oldPrice = manualPriceBNB;
        manualPriceBNB = _newPrice;
        
        emit ManualPriceUpdated(oldPrice, _newPrice);
    }
    
    /**
     * @notice Toggle between oracle and manual pricing
     * @param _useOracle True to use oracle, false for manual
     */
    function setUseOracle(bool _useOracle) external onlyOwner {
        useOracle = _useOracle;
        emit OracleToggled(_useOracle);
    }
    
    /**
     * @notice Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @notice Withdraw any stuck funds (emergency only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        if (!success) {
            revert TransferFailed();
        }
    }
    
    // ===================== View Functions =====================
    
    /**
     * @notice Check if a request exists
     * @param requestId The request ID to check
     */
    function requestExists(bytes32 requestId) external view returns (bool) {
        return requests[requestId].developer != address(0);
    }
    
    /**
     * @notice Get request details
     * @param requestId The request ID
     */
    function getRequest(bytes32 requestId) external view returns (
        address developer,
        uint256 amountPaid,
        uint256 timestamp,
        bool refunded
    ) {
        AMARequest storage req = requests[requestId];
        return (req.developer, req.amountPaid, req.timestamp, req.refunded);
    }
    
    /**
     * @notice Get current BNB/USD price from oracle
     */
    function getOraclePrice() external view returns (int256) {
        if (address(priceFeed) == address(0)) return 0;
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }
    
    // ===================== Receive =====================
    
    /// @notice Allow contract to receive BNB (for refunds from treasury)
    receive() external payable {}
}
