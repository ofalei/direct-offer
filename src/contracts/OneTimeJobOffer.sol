// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

import "./system-contracts/HederaResponseCodes.sol";
import "./system-contracts/IHederaTokenService.sol";
import "./system-contracts/HederaTokenService.sol";

contract OneTimeJobOffer is HederaTokenService {
    // Define an enum for the escrow status
    enum PaymentStatus { NotDeposited, Deposited, Released, Refunded }
    PaymentStatus internal status;
    address internal immutable operator;
    address internal immutable employer;
    address internal immutable employee;
    address internal immutable token;
    int64 internal immutable amount;

    event Deposited(address employer, int64 amount);
    event Released(address employee, int64 amount);
    event Refunded(address employer, int64 amount);
    
    modifier inStatus(PaymentStatus _status) {
        require(status == _status, "Function cannot be called at this stage");
        _;
    }

    constructor(address _operator, address _employer, address _employee, address _token, int64 _amount) {
        require(_operator != address(0), "Operator address cannot be zero");
        require(_employer != address(0), "Employer address cannot be zero");
        require(_employee != address(0), "Employee address cannot be zero");
        require(_amount > 0, "Amount must be greater than zero");
        operator = _operator;
        employer = _employer;
        employee = _employee;
        token = _token;
        amount = _amount;
        status = PaymentStatus.NotDeposited;
    }

    // Function to deposit tokens into escrow by the employer
    function deposit() external inStatus(PaymentStatus.NotDeposited) returns (int) {
        require(msg.sender == employer, "Only employer can call this function");
        int response = HederaTokenService.transferToken(token, employer, address(this), amount);
        require(response == HederaResponseCodes.SUCCESS, "Token transfer to escrow failed");

        status = PaymentStatus.Deposited;
        emit Deposited(employer, amount);
        return response;
    }

    // Function to release tokens from escrow to the employee upon successful completion of the work
    function release() external inStatus(PaymentStatus.Deposited) returns (int) {
        require(msg.sender == operator || msg.sender == employer, "Only operator or employer can call this function");
        int response = HederaTokenService.transferToken(token, address(this), employee, amount);
        require(response == HederaResponseCodes.SUCCESS, "Token transfer to employee failed");

        status = PaymentStatus.Released;
        emit Released(employee, amount);
        return response;
    }

    // Function to refund tokens back to the employer if the work is not completed
    function refund() external inStatus(PaymentStatus.Deposited) returns (int) {
        require(msg.sender == operator, "Only operator or employer can call this function");
        int response = HederaTokenService.transferToken(token, address(this), employer, amount);
        require(response == HederaResponseCodes.SUCCESS, "Token refund to employer failed");

        status = PaymentStatus.Refunded;
        emit Refunded(employer, amount);
        return response;
    }

    function getStatus() external view returns (string memory) {
        if (status == PaymentStatus.Deposited) {
            return "DEPOSITED";
        } else if (status == PaymentStatus.Released) {
            return "RELEASED";
        } else if (status == PaymentStatus.Refunded) {
            return "REFUNDED";
        }
        return "NOT_DEPOSITED";
    }
}