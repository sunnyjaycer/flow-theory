// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "hardhat/console.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {
    ISuperfluid,
    ISuperToken,
    SuperAppDefinitions,
    ISuperAgreement
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {
    SuperAppBase
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import {
    CFAv1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

contract LendingCore is SuperAppBase {

   /// @notice Setting up Superfluid CFA Library for Solidity convenience 
    using CFAv1Library for CFAv1Library.InitData;
    CFAv1Library.InitData public cfaLib;

    /// @notice The precision to which rates, ratios, and prices will be measured
    uint256 public constant GRANULARITY = 1000;

    /// @notice Denominated in GRANULARITY. So, 1500 is a 150% collateralization ratio
    uint256 public collateralizationRatio;

    /// @notice Denominated in GRANULARITY. So, 10 is a 1% collateralization ratio
    ///         The additional amount of collateral that's taken by owner during liquidation
    uint256 public interestRate; 

    /// @notice Denominated in GRANULARITY. So, 100 is a 10% penalty 
    uint256 public liquidationPenalty;

    /// @notice Token being borrowed
    ISuperToken public borrowToken;
    /// @notice Price of borrow token
    ///         Denominated in GRANULARITY. So, 1000 is $1
    uint256 public borrowTokenPrice;

    /// @notice Token being used as collateral
    IERC20 public collateralToken;
    /// @notice Price of collateral token. 
    ///         Denominated in GRANULARITY. So, 1000 is $1
    uint256 public collateralTokenPrice;

    /// @notice Owner with admin permissions
    address public owner;

    /// @notice tracking the collateral and debt amounts of a borrower
    struct BorrowerProfile {
        uint256 collateralAmount;
        uint256 debtAmount;
    }

    /// @notice mapping addresses to borrower statuses
    mapping(address => BorrowerProfile) public borrowerStatus;



    constructor (
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        string memory registrationKey,
        address _owner,
        uint256 _interestRate,
        uint256 _collateralizationRatio,
        uint256 _liquidationPenalty,
        ISuperToken _borrowToken,
        IERC20 _collateralToken
    ) {

        cfaLib = CFAv1Library.InitData(
            host,
            IConstantFlowAgreementV1(
            address(host.getAgreementClass(
                    keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")
                ))
            )
        );

        owner = _owner;
        interestRate = _interestRate;
        collateralizationRatio = _collateralizationRatio;
        liquidationPenalty = _liquidationPenalty;
        borrowToken = _borrowToken;
        collateralToken = _collateralToken;
    }

    /// @notice Set the price of the borrow token
    /// @dev To be implemented with Tellor Oracle
    function setBorrowTokenPrice(uint256 newBorrowTokenPrice) public {
        borrowTokenPrice = newBorrowTokenPrice;
    }

    /// @notice Set the price of the collateral token
    /// @dev To be implemented with Tellor Oracle
    function setCollateralTokenPrice(uint256 newCollateralTokenPrice) public {
        collateralTokenPrice = newCollateralTokenPrice;
    }

    /// @notice Allows borrower to take out loan and starts interest payment
    function borrow(uint256 borrowAmount) public {

    }

    /// @notice Allows borrower to repay loan and updates interest payment
    function repay(uint256 repayAmount) public {

    }

    /// @notice Allows borrower to deposit collateral
    function depositCollateral(uint256 depositAmount) public {

    }

    /// @notice Allows borrower to withdraw collateral
    function withdrawCollateral(uint256 withdrawAmount) public {

    }

    /// @notice Lets anyone liquidate a borrower who has fallen below permitted collateralization ratio
    function liquidate(address borrower) public {

    }

    // --------------------------------------------------------------
    // Getters
    // --------------------------------------------------------------

    /// @notice Get collateral-to-debt ratio of borrower
    function getCollateralizationRatio(address borrower) public view {

    }

    /// @notice Get how much a borrower has borrowed 
    function getBorrowAmount(address borrower) public view {

    }

    /// @notice Get how much collateral a borrower has deposited
    function getCollateralAmount(address borrower) public view {

    }

}