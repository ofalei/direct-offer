const fs = require('node:fs');
const path = require('node:path');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const {
    Client,
    AccountId,
    PrivateKey,
    ContractCreateTransaction,
    ContractFunctionParameters,
    FileId,
    TokenId
} = require("@hashgraph/sdk");

const {
    TOKEN_ID,
    CONTRACT_FILE_ID,
    GOLLUM_ACCOUNT_ID,
    FRODO_ACCOUNT_ID
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

async function deployContract(client, fileId, employerId, employeeId, tokenId, amount) {
    const contractTransaction =  new ContractCreateTransaction()
        .setBytecodeFileId(FileId.fromString(fileId))
        .setGas(200_000)
        .setConstructorParameters(new ContractFunctionParameters()
            .addAddress(client.operatorAccountId.toSolidityAddress())
            .addAddress(AccountId.fromString(employerId).toSolidityAddress())
            .addAddress(AccountId.fromString(employeeId).toSolidityAddress())
            .addAddress(TokenId.fromString(tokenId).toSolidityAddress())
            .addInt64(amount)
    );

    try {
        const transactionId = await contractTransaction.execute(client);
        const receipt = await transactionId.getReceipt(client);
        const contractId = receipt.contractId;
        console.log(`Contract ID: ${contractId}`);
        return contractId;
    } catch (error) {
        console.error("Error deploying contract:", error);
        process.exit(1);
    }
}


async function main() {
    const client = await configureClient();
    console.log(CONTRACT_FILE_ID, GOLLUM_ACCOUNT_ID)
    await deployContract(client,
        CONTRACT_FILE_ID,
        client.operatorAccountId.toString(),
        GOLLUM_ACCOUNT_ID,
        TOKEN_ID,
        100
    );
    client.close()
}

main();

