import {Client, ContractCreateTransaction, ContractFunctionParameters, FileId, TokenId} from "@hashgraph/sdk";

export class HSCSClient {
    client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async deployContract(fileId: string, employerAddress: string, employeeAddress: string, tokenId: string, amount: number, gas: number = 1_000_000) {
        const contractTransaction = new ContractCreateTransaction()
            .setBytecodeFileId(FileId.fromString(fileId))
            .setGas(gas)
            .setConstructorParameters(new ContractFunctionParameters()
                .addAddress(this.client.operatorPublicKey!.toEvmAddress())
                .addAddress(employerAddress)
                .addAddress(employeeAddress)
                .addAddress(TokenId.fromString(tokenId).toSolidityAddress())
                .addInt64(amount)
            );

        try {
            const transactionId = await contractTransaction.execute(this.client);
            const receipt = await transactionId.getReceipt(this.client);
            const contractId = receipt.contractId;
            console.log(`Contract ID: ${contractId}`);
            return contractId;
        } catch (error) {
            console.error("Error deploying contract:", error);
            throw error;
        }
    }
}