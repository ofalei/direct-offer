import {
    Client,
    ContractCreateTransaction, ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractId,
    FileId,
    TokenId
} from "@hashgraph/sdk";

export class ContractClient {
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
        const transactionId = await contractTransaction.execute(this.client);
        const receipt = await transactionId.getReceipt(this.client);
        const contractId = receipt.contractId;
        console.log(`Contract ID: ${contractId}`);
        return contractId;
    }
    async callContract(contractId: ContractId, functionName: string, gasLimit: number) {
        console.log('Calling contract function', functionName, contractId.toSolidityAddress());
        const response = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(gasLimit)
            .setFunction(functionName)
            .execute(this.client);

        const receipt = await response.getReceipt(this.client);
        console.log("Contract call status:", receipt.status.toString());
        return receipt.status
    }
}