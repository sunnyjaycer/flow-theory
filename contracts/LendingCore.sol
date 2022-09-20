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
    ISuperToken public debtToken;
    
    /// @notice Price of debt token
    ///         Denominated in GRANULARITY. So, 1000 is $1
    uint256 public debtTokenPrice;

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
    mapping(address => BorrowerProfile) public borrowerProfiles;

    /// @notice when someone does a first-time borrow
    event NewLoan(address borrower);

    /// @notice when someone fully repays debt
    event FullyRepaid(address borrower);


    constructor (
        ISuperfluid host,
        string memory registrationKey,
        address _owner,
        uint256 _interestRate,
        uint256 _collateralizationRatio,
        uint256 _liquidationPenalty,
        ISuperToken _debtToken,
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
        debtToken = _debtToken;
        collateralToken = _collateralToken;

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        // Register Super App with registration key or without if testnet deployment
        if(bytes(registrationKey).length > 0) {
            cfaLib.host.registerAppWithKey(configWord, registrationKey);
        } else {
            cfaLib.host.registerApp(configWord);
        }

    }

    /// @notice Allows borrower to increase debt and adjusts interest payment
    /// @dev Borrow must have given LendingCore ACL permissions
    function borrow(uint256 borrowAmount) public {

        // update borrower state 
        borrowerProfiles[msg.sender].debtAmount += borrowAmount;

        // get interest per-second flow rate as debt * apr / 365 days 
        int96 interestFlowRate = int96(
            ( (int( uint(borrowerProfiles[msg.sender].debtAmount) ) * int( uint(interestRate) )) / int( uint(GRANULARITY) ) ) / 365 days
        );
        console.log("Interest Flow Rate:");
        console.logInt(interestFlowRate);

        (,int96 flowRate,,) = cfaLib.cfa.getFlow(
            debtToken,
            msg.sender,
            address(this)
        );

        // if no current interest payment flow exists...
        if( flowRate == 0 ) {

            // create appropriate interest payment flow
            cfaLib.createFlowByOperator(
                msg.sender,     // borrower
                address(this),  // lending contract 
                debtToken,
                interestFlowRate
            );

            emit NewLoan(msg.sender);

        } else {

            // update to new appropriate interest payment flow
            cfaLib.updateFlowByOperator(
                msg.sender,     // borrower
                address(this),  // lending contract 
                debtToken,
                interestFlowRate
            );

        }

        // provide loan
        debtToken.transfer(msg.sender, borrowAmount);

    }

    /// @notice Allows borrower to repay loan and updates interest payment
    function repay(uint256 repayAmount) public {
        // pull tokens to repay loan
        debtToken.transferFrom(msg.sender, address(this), repayAmount);

        // update borrower state
        borrowerProfiles[msg.sender].debtAmount -= repayAmount;

        // get interest flow rate
        int96 interestFlowRate = int96(
            ( (int( uint(borrowerProfiles[msg.sender].debtAmount) ) * int( uint(interestRate) )) / int( uint(GRANULARITY) ) ) / 365 days
        );
        console.log("Interest Flow Rate:");
        console.logInt(interestFlowRate);

        // if new interest payment should be zero...
        if ( interestFlowRate == 0 ) {

            // delete payment flow
            cfaLib.deleteFlowByOperator(
                msg.sender,    // borrower
                address(this), // lending contract
                debtToken
            );

            emit FullyRepaid(msg.sender);

        } else {

            // update to new appropriate interest payment flow
            cfaLib.updateFlowByOperator(
                msg.sender,     // borrower
                address(this),  // lending contract 
                debtToken,
                interestFlowRate
            );

        }

    }
    // random: ask Josh about how he learned about comp sci principles


    /// @notice Allows borrower to deposit collateral
    function depositCollateral(uint256 depositAmount) public {
        // Pull collateral from borrower
        collateralToken.transferFrom(msg.sender, address(this), depositAmount);

        // update borrower state
        borrowerProfiles[msg.sender].collateralAmount += depositAmount;
    }

    /// @notice Allows borrower to withdraw collateral
    function withdrawCollateral(uint256 withdrawAmount) public {
        // update borrower state
        borrowerProfiles[msg.sender].collateralAmount -= withdrawAmount;

        // must not be withdrawing into undercollateralization
        require(getCollateralizationRatio(msg.sender) >= collateralizationRatio, "would be undercollateralized");

        // Transfer collateral back to borrower
        collateralToken.transferFrom(msg.sender, address(this), withdrawAmount);

    }

    /// @notice Lets anyone liquidate a borrower who has fallen below permitted collateralization ratio
    function liquidate(address borrower) public {

        // must be undercollateralized
        require(getCollateralizationRatio(msg.sender) < collateralizationRatio, "not undercollateralized");

        // Get amount of collateral that will be liquidated...
        // Debt denominated in collateral token = debt * (collateral price / debt price)
        uint256 debtAmountDenominatedInCollateralToken = (borrowerProfiles[borrower].debtAmount * collateralTokenPrice) / debtTokenPrice;
        // Amount to be liquidated = Debt denominated in collateral token * liquidation penalty
        uint256 liquidationAmountDenominatedInCollateralToken = (debtAmountDenominatedInCollateralToken * liquidationPenalty) / GRANULARITY;

        // TODO: find what proper msg.sender is here in identifying liquidate being triggered in callback
        // if liquidation is being triggered in deletion because of interest calculation, we just want to unwind loan and not penalize
        if (msg.sender == address(this)) {
            liquidationAmountDenominatedInCollateralToken = debtAmountDenominatedInCollateralToken;
        } 

        // if there's less collateral than required...
        if (borrowerProfiles[borrower].collateralAmount < liquidationAmountDenominatedInCollateralToken) {
            // transfer all the borrower collateral to the owner
            collateralToken.transfer(owner, borrowerProfiles[borrower].collateralAmount);
        
        } else {
            // transfer the collateral liquidation amount to the owner
            collateralToken.transfer(owner, liquidationAmountDenominatedInCollateralToken);

        }

        // update borrower state
        borrowerProfiles[borrower].collateralAmount = 0;
        borrowerProfiles[borrower].debtAmount = 0;
    }

    // --------------------------------------------------------------
    // Setters
    // --------------------------------------------------------------

    /// @notice Set the price of the debt token
    /// @dev To be implemented with Tellor Oracle
    function setDebtTokenPrice(uint256 newDebtTokenPrice) public {
        debtTokenPrice = newDebtTokenPrice;
    }

    /// @notice Set the price of the collateral token
    /// @dev To be implemented with Tellor Oracle
    function setCollateralTokenPrice(uint256 newCollateralTokenPrice) public {
        collateralTokenPrice = newCollateralTokenPrice;
    }

    // --------------------------------------------------------------
    // Getters
    // --------------------------------------------------------------

    /// @notice Get collateralization ratio of borrower
    function getCollateralizationRatio(address borrower) public view returns (uint256) {
        return (collateralTokenPrice * borrowerProfiles[borrower].collateralAmount * GRANULARITY) / (debtTokenPrice * borrowerProfiles[borrower].debtAmount);
    }

    /// @notice yo mama

    // --------------------------------------------------------------
    // Super Agreement Callbacks
    // --------------------------------------------------------------

    /**
     * @dev Super App callback responding the creation of a CFA to the app
     *
     * Response logic in _createFlow
     */
    function afterAgreementCreated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, // _agreementId,
        bytes calldata _agreementData,
        bytes calldata ,// _cbdata,
        bytes calldata _ctx
    )
        external override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory)
    {
        
        // get stream initiator address from _agreementData
        address streamStarter = cfaLib.host.decodeCtx(_ctx).msgSender;
        console.log("Stream Starter:", streamStarter);

        // only LendingCore should be starting the streams
        require(streamStarter == address(this), "cannot start stream to LendingCore");

        return _ctx;
    
    }

    /**
     * @dev Super App callback responding to the update of a CFA to the app
     * 
     * Response logic in _updateFlow
     */
    function afterAgreementUpdated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32 ,//_agreementId,
        bytes calldata _agreementData,
        bytes calldata ,//_cbdata,
        bytes calldata _ctx
    )
        external override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory)
    {

        // get stream initiator address from _agreementData
        address streamStarter = cfaLib.host.decodeCtx(_ctx).msgSender;
        console.log("Stream Starter:", streamStarter);

        // only LendingCore should be starting the streams
        require(streamStarter == address(this), "cannot update interest flow");

        return _ctx;
        
    }

    /**
     * @dev Super App callback responding the ending of a CFA to the app
     * 
     * Response logic in _deleteFlow
     */
    function afterAgreementTerminated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32 ,//_agreementId,
        bytes calldata _agreementData,
        bytes calldata ,//_cbdata,
        bytes calldata _ctx
    )
        external override
        onlyHost
        returns (bytes memory newCtx)
    {
        // According to the app basic law, we should never revert in a termination callback
        if (!_isValidToken(_superToken) || !_isCFAv1(_agreementClass)) return _ctx;

        // get borrower address from _agreementData
        (address borrower,) = abi.decode(_agreementData, (address,address));
        
        // use liquidate to unwind loan
        liquidate(borrower);
        
        // return context
        return _ctx;

    }

    function _isValidToken(ISuperToken superToken) private view returns (bool) {
        return ISuperToken(superToken) == debtToken;
    }

    function _isCFAv1(address agreementClass) private view returns (bool) {
        return ISuperAgreement(agreementClass).agreementType()
            == keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");
    }

    modifier onlyHost() {
        require(msg.sender == address(cfaLib.host), "RedirectAll: support only one host");
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isValidToken(superToken), "RedirectAll: not accepted token");
        require(_isCFAv1(agreementClass), "RedirectAll: only CFAv1 supported");
        _;
    }

}