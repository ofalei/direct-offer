# Hello Future Hackathon

## Project name: Direct Offer

### Project Overview: Job Marketplace on Hedera Hashgraph

This project is focused on building a job marketplace that leverages the power of Hedera Hashgraph. Hedera's fast, reliable, 
and cost-effective distributed ledger technology (DLT) provides the ideal foundation for creating a seamless, efficient, 
and secure platform.

At the heart of this marketplace will be a suite of smart contracts designed to manage the interactions between employers and employees.
These smart contracts ensure that all operations, from job creation to payment processing, are handled transparently and 
automatically.

One of the primary use cases being explored in this project is the OneTimeJobOffer smart contract. This contract facilitates 
a straightforward and secure transaction between an employer and an employee, ensuring that funds are held in escrow until 
the job is completed and approved. By harnessing the capabilities of Hedera Hashgraph, the project aims to provide a robust, 
scalable solution for decentralized job management.


## Usage

1. Install the dependencies ```npm install```
2. Start the development server ```npm run start```
3. Open the browser at [http://localhost:3000/direct-offer](http://localhost:3000/direct-offer)
4. Deploy to GitHub Pages ```npm run deploy```

### Smart Contracts

The smart contracts are located in the `contracts` directory. To compile the contracts and generate the ABI and Bytecode, use the following Makefile command:
```shell
make compile-contract
```

### Scripts

The `scripts/setup.js` script is designed to set up resources on the Hedera Hashgraph network. It creates accounts, issues a token, and uploads the smart contract to the network. *NOTE*: For demo purposes, the created resource IDs and keys are hardcoded and can be found in the `src/config` directory.

## Technologies

* Hedera SDK
* Solidity
* WalletConnect
* TypeScript
* React

## References

This project was built using the [Create React App Hedera Dapp Template](https://github.com/hedera-dev/cra-hedera-dapp-template).

## License

MIT


