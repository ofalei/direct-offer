import {
    AccountId, Client, ContractExecuteTransaction, ContractId, PrivateKey, PublicKey, TokenId, TransferTransaction,
} from "@hashgraph/sdk";
import {Divider} from "@mui/material";
import {Stack} from "@mui/system";
import {useWalletInterface} from "../services/wallets/useWalletInterface";
import {useState} from "react";
import {appConfig} from "../config";
import {HSCSClient} from "../services/hscsClient";
import {MirrorNodeClient} from "../services/wallets/mirrorNodeClient";
import {ContractFunctionParameterBuilder} from "../services/wallets/contractFunctionParameterBuilder";
import ReviewProcess from "../components/ReviewProcess";
import JobPosting from "../components/JobPosting";
import CandidateSelection from "../components/CandidateSelection";
import {Candidates} from "../config/data";


function stringToEnum(value: string): Candidates {
    if (Object.values(Candidates).includes(value as Candidates)) {
        return value as Candidates;
    }

    // dev check
    throw new Error('Invalid candidate value');
}


// todo move it to a separate file

function getOperatorClient() {
    const operatorPrivateKey = PrivateKey.fromStringECDSA(appConfig.constants.OPERATOR_PRIVATE_KEY);
    const operatorAccountId = AccountId.fromString(appConfig.constants.OPERATOR_ACCOUNT_ID);
    const client = Client.forTestnet();
    client.setOperator(operatorAccountId, operatorPrivateKey);
    return client;
}

async function transferNonFungibleToken(client: Client, tokenId: string, from: string, to: string, amount: number) {
    const transferTransactionResponse = await new TransferTransaction()
        .addTokenTransfer(TokenId.fromString(tokenId), from, -amount)
        .addTokenTransfer(TokenId.fromString(tokenId), to, amount)
        .execute(client);
    const receipt = await transferTransactionResponse.getReceipt(client);
    console.log("Token transfer status:", receipt.status.toString());
}

async function callContract(client: Client, contractId: ContractId, functionName: string, gasLimit: number) {
    console.log('Calling contract function', functionName, contractId.toSolidityAddress());
    const response = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(gasLimit)
        .setFunction(functionName)
        .execute(client);

    const receipt = await response.getReceipt(client);
    console.log("Contract call status:", receipt.status.toString());
    return receipt.status
}

async function deposit(client: Client, contractId: ContractId) {
    // return await callContract(client, contractId, "deposit", 100_000)
    const response = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(100_000)
        .setFunction("deposit")
        .execute(client);

    const receipt = await response.getReceipt(client);
    return receipt.status
}

// async function release(client: Client, contractId: ContractId) {
//     await callContract(client, contractId, "release", 1_000_000)
// const response = await new ContractExecuteTransaction()
//     .setContractId(contractId)
//     .setGas(1_000_000)
//     .setFunction("release")
//     .execute(client);
//
// const receipt = await response.getReceipt(client);
// return receipt.status
// }

async function refund(client: Client, contractId: ContractId) {
    await callContract(client, contractId, "refund", 1_000_000)
    // const response = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(100_000)
    //     .setFunction("refund")
    //     .execute(client);
    //
    // const receipt = await response.getReceipt(client);
    // return receipt.status
}

export default function Home() {
    const operatorClient = getOperatorClient();
    const mirrorNodeClient = new MirrorNodeClient(appConfig.networks.testnet);
    const hscsClient = new HSCSClient(operatorClient)
    const {walletInterface, accountId} = useWalletInterface();
    const [selectedCandidate, setSelectedCandidate] = useState(Candidates.FRODO);
    const [contractId, setContractId] = useState<ContractId | null>(null);
    const [isDeposited, setIsDeposited] = useState(false);
    const handleCandidateSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedCandidate(stringToEnum(event.target.value)); // Update the state with the selected value
    };

    const handleContractCreation = async () => {
        console.log('Selected candidate', selectedCandidate); // Use the selected value
        if (accountId === null) {
            return;
        }
        // TODO handle errors
        const accountDetails = await mirrorNodeClient.getAccountDetails(AccountId.fromString(accountId))
        console.log('Account details:', accountDetails);
        const _contractId = await hscsClient.deployContract(appConfig.constants.CONTRACT_FILE_ID, accountDetails.evm_address, // TODO!!!!
            PublicKey.fromString(appConfig.constants.FRODO_PUBLIC_KEY).toEvmAddress(), appConfig.constants.TOKEN_ID, appConfig.constants.JOB_OFFER_REWARD);
        if (_contractId === null) {
            return;
        }
        setContractId(_contractId);
        // check if token is associated with account
        if (accountDetails.balance.tokens.find(token => token.token_id === appConfig.constants.TOKEN_ID) === undefined) {
            await walletInterface.associateToken(TokenId.fromString(appConfig.constants.TOKEN_ID));
        }
        // transfer tokens to the signer from operator account
        await transferNonFungibleToken(operatorClient, appConfig.constants.TOKEN_ID, appConfig.constants.OPERATOR_ACCOUNT_ID, accountId, appConfig.constants.JOB_OFFER_REWARD);
        // create allowance for the contract
        await walletInterface.createTokenAllowance(TokenId.fromString(appConfig.constants.TOKEN_ID), _contractId, appConfig.constants.JOB_OFFER_REWARD);
        // deposit tokens to the contract
        await deposit(operatorClient, _contractId);
        setIsDeposited(true);
        console.log('deposit done');
    };

    const handleReleaseReward = async () => {
        if (accountId === null || contractId === null) {
            return;
        }
        console.log('Releasing reward for contract', contractId);
        await walletInterface?.executeContractFunction(contractId, 'release', new ContractFunctionParameterBuilder(), 1_000_000);
    }
    const handleRefund = async () => {
        if (accountId === null || contractId === null) {
            return;
        }
        await refund(operatorClient, contractId);
    }
    return (<Stack alignItems="center" spacing={4}>
        {walletInterface !== null && (<>
            <JobPosting/>
            <Divider sx={{width: '100%'}}/>
          {isDeposited ? (<ReviewProcess
              selectedCandidate={selectedCandidate}
              handleReleaseReward={handleReleaseReward}
              handleRefund={handleRefund}
          />) : (<CandidateSelection
              selectedCandidate={selectedCandidate}
              handleCandidateSelection={handleCandidateSelection}
              handleContractCreation={handleContractCreation}
          />)}
        </>)}
    </Stack>)
}
