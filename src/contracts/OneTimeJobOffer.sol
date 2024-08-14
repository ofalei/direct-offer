// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

import "./HederaResponseCodes.sol";
import "./IHederaTokenService.sol";
import "./HederaTokenService.sol";

contract OneTimeJobEscrow is HederaTokenService {
    // Define an enum for the escrow status
    enum EscrowStatus { NotDeposited, Deposited, Released, Refunded }
    EscrowStatus internal status;
    address internal immutable employer;
    address internal immutable employee;
    address internal immutable token;
    int64 internal immutable amount;

    event Deposited(address employer, int64 amount);
    event Released(address employee, int64 amount);
    event Refunded(address employer, int64 amount);

    modifier onlyEmployer() {
        require(msg.sender == employer, "Only employer can call this function");
        _;
    }

    modifier inStatus(EscrowStatus _status) {
        require(status == _status, "Function cannot be called at this stage");
        _;
    }

    constructor(address _employer, address _employee, address _token, int64 _amount) public {
        require(_employer != address(0), "Employer address cannot be zero");
        require(_employee != address(0), "Employee address cannot be zero");
        require(_amount > 0, "Amount must be greater than zero");

        employer = _employer;
        employee = _employee;
        token = _token;
        amount = _amount;
        status = EscrowStatus.NotDeposited;
    }

    // Function to deposit tokens into escrow by the employer
    function deposit() external onlyEmployer inStatus(EscrowStatus.NotDeposited) returns (int) {
        int response = HederaTokenService.transferToken(token, employer, address(this), amount);
        require(response == HederaResponseCodes.SUCCESS, "Token transfer to escrow failed");

        status = EscrowStatus.Deposited;
        emit Deposited(employer, amount);
        return response;
    }

    // Function to release tokens from escrow to the employee upon successful completion of the work
    function release() external onlyEmployer inStatus(EscrowStatus.Deposited) returns (int) {
        int response = HederaTokenService.transferToken(token, address(this), employee, amount);
        require(response == HederaResponseCodes.SUCCESS, "Token transfer to employee failed");

        status = EscrowStatus.Released;
        emit Released(employee, amount);
        return response;
    }

    // Function to refund tokens back to the employer if the work is not completed
    function refund() external onlyEmployer inStatus(EscrowStatus.Deposited) returns (int) {
        int response = HederaTokenService.transferToken(token, address(this), employer, amount);
        require(response == HederaResponseCodes.SUCCESS, "Token refund to employer failed");

        status = EscrowStatus.Refunded;
        emit Refunded(employer, amount);
        return response;
    }

    function getStatus() external view returns (string memory) {
        if (status == EscrowStatus.Deposited) {
            return "DEPOSITED";
        } else if (status == EscrowStatus.Released) {
            return "RELEASED";
        } else if (status == EscrowStatus.Refunded) {
            return "REFUNDED";
        }
        return "NOT_DEPOSITED";
    }
}