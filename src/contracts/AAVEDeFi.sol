// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import './ILendingPoolAddressesProvider.sol';
import './ILendingPool.sol';
import './IWETHGateway.sol';
import './IPriceOracle.sol';

contract AAVEDeFi {
    string public name = "AAVE DeFi";

    mapping(address => uint256) public totalETHDeposits;
    mapping(address => uint256) public totalDAIBorrows;

    ILendingPoolAddressesProvider public provider;
    ILendingPool public lendingPool;
    IWETHGateway public wethGateway;
    IPriceOracle public priceOracle;

    address addressLendingPool;
    address daiTokenAddress;
    address aWETHTokenAddress;

    uint256 public daiEthprice;

     /// @notice DepositBorrow event emitted on success
    event DepositBorrow(
        uint256 ethAmountDeposited, 
        uint256 totalETHDeposits,
        uint256 priceDAI, 
        uint256 safeMaxDAIBorrow, 
        uint256 totalDAIBorrows
    );

    constructor() {
        provider = ILendingPoolAddressesProvider(0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5);
        addressLendingPool = provider.getLendingPool();
        lendingPool = ILendingPool(addressLendingPool);

        wethGateway = IWETHGateway(0xcc9a0B7c43DC2a5F023Bb9b738E45B0Ef6B06E04);
        
        priceOracle = IPriceOracle(0xA50ba011c48153De246E5192C8f9258A2ba79Ca9);

        daiTokenAddress = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
        aWETHTokenAddress = 0x030bA81f1c18d280636F32af80b9AAd02Cf0854e;
    }

    /// @notice Function to deposit ETH collateral into Aave and immediately borrow maximum safe amount of DAI  
    /// @dev DepositBorrow event emitted if successfully borrows 
    function borrowDAIAgainstETH(uint safeMaxDAIBorrow) external payable {
        totalETHDeposits[msg.sender] = totalETHDeposits[msg.sender] + msg.value;
        // input variables
        uint16 referralCode = 0; 
        uint256 variableRate = 2; 
        address onBehalfOf = address(this);

        // Deposit the ETH sent with msg.value transfering aWETH to onBehalfOf 
        wethGateway.depositETH{value: msg.value}(addressLendingPool, onBehalfOf, referralCode);

        // Use Oracle to DAI/ETH 
        uint priceDAI = priceOracle.getAssetPrice(daiTokenAddress);
        assert(priceDAI != 0);
        daiEthprice = priceDAI;

        // Borrow the safeMaxDAIBorrow amount from protocol(calculated in frontend)
        lendingPool.borrow(daiTokenAddress, safeMaxDAIBorrow, variableRate, referralCode, onBehalfOf);
        totalDAIBorrows[msg.sender] = totalDAIBorrows[msg.sender] + safeMaxDAIBorrow;

        IERC20 daiToken = IERC20(daiTokenAddress);
        require(daiToken.transfer(msg.sender, safeMaxDAIBorrow));

        emit DepositBorrow(
            msg.value, 
            totalETHDeposits[msg.sender],
            priceDAI, 
            safeMaxDAIBorrow, 
            totalDAIBorrows[msg.sender]
        );
    } 
}