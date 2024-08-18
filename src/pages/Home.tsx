import {
    AccountId, Client, ContractId, PrivateKey, PublicKey, TokenId, TransferTransaction,
} from "@hashgraph/sdk";
import {Divider} from "@mui/material";
import {Stack} from "@mui/system";
import {useWalletInterface} from "../services/wallets/useWalletInterface";
import {useState} from "react";
import {appConfig} from "../config";
import {ContractClient} from "../services/contractClient";
import {MirrorNodeClient} from "../services/mirrorNodeClient";
import {AccountClient} from "../services/accountClient";
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

function getOperatorClient() {
    const operatorPrivateKey = PrivateKey.fromStringECDSA(appConfig.constants.OPERATOR_PRIVATE_KEY);
    const operatorAccountId = AccountId.fromString(appConfig.constants.OPERATOR_ACCOUNT_ID);
    const client = Client.forTestnet();
    client.setOperator(operatorAccountId, operatorPrivateKey);
    return client;
}



// async function callContract(client: Client, contractId: ContractId, functionName: string, gasLimit: number) {
//     console.log('Calling contract function', functionName, contractId.toSolidityAddress());
//     const response = await new ContractExecuteTransaction()
//         .setContractId(contractId)
//         .setGas(gasLimit)
//         .setFunction(functionName)
//         .execute(client);
//
//     const receipt = await response.getReceipt(client);
//     console.log("Contract call status:", receipt.status.toString());
//     return receipt.status
// }

// async function deposit(client: Client, contractId: ContractId) {
//     // return await callContract(client, contractId, "deposit", 100_000)
//     const response = await new ContractExecuteTransaction()
//         .setContractId(contractId)
//         .setGas(100_000)
//         .setFunction("deposit")
//         .execute(client);
//
//     const receipt = await response.getReceipt(client);
//     return receipt.status
// }

// async function refund(client: Client, contractId: ContractId) {
//     return await callContract(client, contractId, "refund", 1_000_000)
    // const response = await new ContractExecuteTransaction()
    //     .setContractId(contractId)
    //     .setGas(100_000)
    //     .setFunction("refund")
    //     .execute(client);
    //
    // const receipt = await response.getReceipt(client);
    // return receipt.status
// }

export default function Home() {
    const operatorClient = getOperatorClient();
    const mirrorNodeClient = new MirrorNodeClient(appConfig.networks.testnet);
    const contractClient = new ContractClient(operatorClient);
    const accountClient = new AccountClient(operatorClient);
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
        const accountDetails = await mirrorNodeClient.getAccountDetails(AccountId.fromString(accountId))
        console.log('Account details:', accountDetails);
        const _contractId = await contractClient.deployContract(appConfig.constants.CONTRACT_FILE_ID, accountDetails.evm_address,
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
        await accountClient.transferNonFungibleToken(operatorClient, appConfig.constants.TOKEN_ID, appConfig.constants.OPERATOR_ACCOUNT_ID, accountId, appConfig.constants.JOB_OFFER_REWARD);
        // create allowance for the contract
        await walletInterface.createTokenAllowance(TokenId.fromString(appConfig.constants.TOKEN_ID), _contractId, appConfig.constants.JOB_OFFER_REWARD);
        // deposit tokens to the contract
        await contractClient.callContract(_contractId, 'deposit', 100_000);
        setIsDeposited(true);
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
        await contractClient.callContract(contractId, 'refund', 1_000_000);
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
