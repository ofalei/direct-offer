const fs = require('node:fs');
const path = require('node:path');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const {
    Client,
    AccountId,
    PrivateKey,
    FileCreateTransaction,
    TokenCreateTransaction,
    TokenAssociateTransaction,
    AccountCreateTransaction,
    FileAppendTransaction,
    FileContentsQuery,
    TransferTransaction
} = require("@hashgraph/sdk");

const CONTRACT_DIR = path.join(__dirname, '../contracts');

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


async function uploadFile(client, content) {
    try {
        // from docs: Note that the total size for a given transaction is limited to 6KiB (as of March 2020) by the network.
        const transactionId = await new FileCreateTransaction().setKeys([client.operatorPublicKey]).execute(client);
        const transactionReceipt = await transactionId.getReceipt(client);
        const fileId = transactionReceipt.fileId.toString();
        await new FileAppendTransaction()
            .setFileId(fileId)
            .setContents(content)
            .execute(client);

        const uploadedFileContent = await new FileContentsQuery()
            .setFileId(fileId)
            .execute(client);

        if (uploadedFileContent.toString() !== content) {
            console.error("Error uploading bytecode: The uploaded bytecode does not match the original bytecode");
            process.exit(1);
        }
        return fileId;
    } catch (error) {
        console.error("Error uploading file:", error);
        process.exit(1);
    }
}

async function createToken(client) {
    try {
        const tokenCreateTransaction = new TokenCreateTransaction()
            .setTokenName('Castar')
            .setTokenSymbol('CASTAR')
            .setTreasuryAccountId(client.operatorAccountId)
            .setInitialSupply(1_000_000);
        const transactionResponse = await tokenCreateTransaction.execute(client);
        const transactionReceipt = await transactionResponse.getReceipt(client);
        return transactionReceipt.tokenId;
    } catch (error) {
        console.error("Error creating token:", error);
        process.exit(1);
    }
}

async function associateToken(client, tokenId, accountId) {
    try {
        const tokenAssociateTransaction = new TokenAssociateTransaction()
            .setAccountId(accountId)
            .setTokenIds([tokenId]);
        await tokenAssociateTransaction.execute(client);
    } catch (error) {
        console.error(`Error associating token ID ${tokenId} with account ID ${accountId}:`, error);
        process.exit(1);
    }
}

async function createAccount(client) {
    try {
        const privateKey = PrivateKey.generateECDSA();
        const publicKey = privateKey.publicKey;
        const transactionResponse = await new AccountCreateTransaction()
            .setKey(publicKey)
            .execute(client);
        const transactionReceipt = await transactionResponse.getReceipt(client);
        return {
            accountId: transactionReceipt.accountId,
            privateKey: privateKey,
            publicKey: publicKey
        };
    } catch (error) {
        console.error("Error creating account:", error);
        process.exit(1);
    }
}

async function transferFunds(client, fromAccountId, toAccountId, amount) {
    try {
        const transactionResponse = await new TransferTransaction()
            .addHbarTransfer(fromAccountId, -amount)
            .addHbarTransfer(toAccountId, amount)
            .execute(client);
        await transactionResponse.getReceipt(client);
    } catch (error) {
        console.error(`Error transferring ${amount} hbar from account ID ${fromAccountId} to account ID ${toAccountId}:`, error);
        process.exit(1);
    }
}

async function main() {
    const client = await configureClient();
    const bytecodePath = path.join(CONTRACT_DIR, 'build/OneTimeJobOffer_sol_OneTimeJobOffer.bin');
    const bytecode = fs.readFileSync(bytecodePath);
    const bytecodeFileId = await uploadFile(client, bytecode.toString());
    console.log("The smart contract bytecode file ID is", bytecodeFileId);

    const tokenId = await createToken(client);
    console.log("The token ID is", tokenId.toString());

    const operatorAccount = await createAccount(client);
    await associateToken(client, tokenId, operatorAccount.accountId);
    console.log("Operator account ID is", operatorAccount.accountId.toString());
    console.log("Operator private key is", operatorAccount.privateKey.toString());

    await transferFunds(client, client.operatorAccountId, operatorAccount.accountId, 500)

    const gollumAccount = await createAccount(client);
    await associateToken(client, tokenId, gollumAccount.accountId);
    console.log("Gollum account ID is", gollumAccount.accountId.toString());
    console.log("Gollum public key is", gollumAccount.publicKey.toString());

    const frodoAccount = await createAccount(client);
    await associateToken(client, tokenId, frodoAccount.accountId);
    console.log("Frodo account ID is", frodoAccount.accountId.toString());
    console.log("Frodo public key is", frodoAccount.publicKey.toString());

    client.close()
}

main();
