// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "hardhat/console.sol";

import {
    ISuperfluid,
    ISuperToken,
    SuperAppDefinitions,
    ISuperAgreement
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    SuperAppBase
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import {
    IInstantDistributionAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

import {
    IDAv1Library
} from "@superfluid-finance/ethereum-contracts/contracts/apps/IDAv1Library.sol";

import {
    LendingCore
} from "./LendingCore.sol";


/// @dev Deploy before LendingCore, deploy LendingCore, then call setLendingCore
contract InterestManager is SuperAppBase {

    /// @notice Setting up Superfluid IDA Library for Solidity convenience
    using IDAv1Library for IDAv1Library.InitData;
    IDAv1Library.InitData public idaLib;

    /// @notice LendingCore that's permissioned to make share updates
    LendingCore public lendingCore;

    /// @notice the Index ID of the IDA Index used to distribute interest accrued
    uint32 public constant INDEX_ID = 0;

    /// @notice owner who can set the lending core
    address public owner;


    constructor(
        ISuperfluid host,
        address _owner,
        string memory registrationKey
    ) {

        idaLib = IDAv1Library.InitData(
            host,
            IInstantDistributionAgreementV1(
            address(host.getAgreementClass(
                    keccak256("org.superfluid-finance.agreements.InstantDistributionAgreement.v1")
                ))
            )
        );

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL |
        SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
        SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
        SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        // Register Super App with registration key or without if testnet deployment
        if(bytes(registrationKey).length > 0) {
            idaLib.host.registerAppWithKey(configWord, registrationKey);
        } else {
            idaLib.host.registerApp(configWord);
        }

        owner = _owner;

    }
    
    /// @notice Set lending core
    function setLendingCore(LendingCore _lendingCore) external {
        require(address(lendingCore) == address(0) && msg.sender == owner, "Lending Core already set");

        lendingCore = _lendingCore;

        idaLib.createIndex(lendingCore.debtToken(), INDEX_ID);
    
    }

    /// @notice Set shares for lender
    function updateShares(uint256 newShareAmount, address lenderAddress) external {
        require(address(lendingCore) == msg.sender, "Not Lending Core");

        idaLib.updateSubscriptionUnits(
            lendingCore.debtToken(),
            INDEX_ID,
            lenderAddress,
            uint128(newShareAmount)
        );

    }

    /// @notice Distribute interest
    function distributeInterest() external {
        console.log(lendingCore.debtToken().balanceOf(address(this)));

        (uint256 actualDistributionAmount, ) = idaLib.calculateDistribution(
            lendingCore.debtToken(),
            address(this),
            INDEX_ID,
            lendingCore.debtToken().balanceOf(address(this))
        );

        console.log(actualDistributionAmount);

        idaLib.distribute(
            lendingCore.debtToken(),
            INDEX_ID,
            actualDistributionAmount
        );

    }

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
        bytes calldata ,//_agreementData,
        bytes calldata ,// _cbdata,
        bytes calldata _ctx
    )
        external override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory)
    {

        if (_isCFAv1(_agreementClass)) {
        
            // get stream initiator address from _agreementData
            address streamStarter = idaLib.host.decodeCtx(_ctx).msgSender;
            console.log("Stream Starter:", streamStarter);

            // only LendingCore should be starting the streams
            require(streamStarter == address(lendingCore), "cannot start stream to LendingCore");

        }

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
        bytes calldata ,// _agreementData
        bytes calldata ,//_cbdata,
        bytes calldata _ctx
    )
        external override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory)
    {

        if (_isCFAv1(_agreementClass)) {
        
            // get stream initiator address from _agreementData
            address streamStarter = idaLib.host.decodeCtx(_ctx).msgSender;
            console.log("Stream Starter:", streamStarter);

            // only LendingCore should be starting the streams
            require(streamStarter == address(lendingCore), "cannot update interest flow");

        }

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
        returns (bytes memory)
    {
        // According to the app basic law, we should never revert in a termination callback
        if (!_isValidToken(_superToken) || !_isCFAv1(_agreementClass)) return _ctx;

        if (_isCFAv1(_agreementClass)) {

            // get borrower address from _agreementData
            (address borrower,) = abi.decode(_agreementData, (address,address));
            
            // use liquidate to unwind loan
            lendingCore.liquidate(borrower);

        }

        // return context
        return _ctx;

    }

    function _isValidToken(ISuperToken superToken) private view returns (bool) {
        return ISuperToken(superToken) == lendingCore.debtToken();
    }

    function _isCFAv1(address agreementClass) private view returns (bool) {
        return ISuperAgreement(agreementClass).agreementType()
            == keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");
    }

    modifier onlyHost() {
        require(msg.sender == address(idaLib.host), "RedirectAll: support only one host");
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isValidToken(superToken), "RedirectAll: not accepted token");
        // require(_isCFAv1(agreementClass), "RedirectAll: only CFAv1 supported");
        _;
    }

}
