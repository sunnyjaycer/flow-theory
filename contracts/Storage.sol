// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import {
    ISuperToken
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

library Storage {

    /// @notice tracking the collateral and debt amounts of a borrower
    struct BorrowerProfile {
        uint256 collateralAmount;
        uint256 debtAmount;
    }

    struct LendingData {

        /// @notice The precision to which rates, ratios, and prices will be measured
        uint256 GRANULARITY;

        /// @notice Denominated in GRANULARITY. So, 1500 is a 150% collateralization ratio
        uint256 collateralizationRatio;

        /// @notice Denominated in GRANULARITY. So, 10 is a 1% collateralization ratio
        ///         The additional amount of collateral that's taken by owner during liquidation
        uint256 interestRate; 

        /// @notice Denominated in GRANULARITY. So, 100 is a 10% penalty 
        uint256 liquidationPenalty;

        /// @notice Token being borrowed
        ISuperToken debtToken;
        
        /// @notice Price of debt token
        ///         Denominated in GRANULARITY. So, 1000 is $1
        uint256 debtTokenPrice;

        /// @notice Token being used as collateral
        IERC20 collateralToken;
        
        /// @notice Price of collateral token. 
        ///         Denominated in GRANULARITY. So, 1000 is $1
        uint256 collateralTokenPrice;

        /// @notice Owner with admin permissions
        address owner;

        /// @notice mapping addresses to borrower statuses
        mapping(address => BorrowerProfile) borrowerProfiles;

    }
    
}