const fs = require('node:fs');
const path = require('node:path');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const {
    Client,
    AccountId,
    PrivateKey,
    ContractCreateTransaction,
    ContractExecuteTransaction,
    AccountAllowanceApproveTransaction,
    FileId,
    TokenId,
    ContractId,
} = require("@hashgraph/sdk");

const {
    CONTRACT_ID,
    TOKEN_ID
} = require('./consts');

async function configureClient() {
    try {
        const operatorPrivateKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_PRIVATE_KEY);
        const operatorAccountId = AccountId.fromString(process.env.OPERATOR_ACCOUNT_ID);
        const client = Client.forTestnet();
        client.setOperator(operatorAccountId, operatorPrivateKey);
        return client;
    } catch (error) {
        console.error("Error configuring the client:", error);
        process.exit(1);
    }
}

// NOTE it will not be nessesary to approve the token allowance if the contract is the token owner
// async function allowSpending(client, contractId, tokenId) {
//     //Approve the token allowance
//     const transactionAllowance = new AccountAllowanceApproveTransaction()
//         .approveTokenAllowance(tokenId, client.operatorAccountId, contractId, 1000)
//         .freezeWith(client);
//
//     //Sign the transaction with the owner account key
//     const signTxAllowance = await transactionAllowance.sign(PrivateKey.fromStringECDSA(process.env.OPERATOR_PRIVATE_KEY));
//
//     //Sign the transaction with the client operator private key and submit to a Hedera network
//     const txResponseAllowance = await signTxAllowance.execute(client);
//
//     //Request the receipt of the transaction
//     const receiptAllowance = await txResponseAllowance.getReceipt(client);
//
//     //Get the transaction consensus status
//     const transactionStatusAllowance = receiptAllowance.status;
//
//     console.log(
//         "The transaction consensus status for the allowance function is " +
//         transactionStatusAllowance.toString()
//     );
// }

async function callContract(client, contractId) {
    // Create the transaction
    const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(300_000)
        .setFunction("deposit")
        .freezeWith(client);

    //Sign the transaction with the client operator private key
    const signTx = await transaction.sign(PrivateKey.fromStringECDSA(process.env.OPERATOR_PRIVATE_KEY));

    //Sign with the client operator private key to pay for the transaction and submit the query to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status;

    console.log("The transaction consensus status is " +transactionStatus);
}

async function main() {
    const client = await configureClient();
    // console.log(CONTRACT_ID)
    // return
    const contractId = ContractId.fromString(CONTRACT_ID);
    // const tokenId = TokenId.fromString(TOKEN_ID);
    // await allowSpending(client, contractId, tokenId)
    await callContract(client, contractId);
    client.close()
}

main();

