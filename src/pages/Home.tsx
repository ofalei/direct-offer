import { AccountId, Client, ContractId, PrivateKey, PublicKey, TokenId, } from "@hashgraph/sdk";
import { Divider } from "@mui/material";
import { Stack } from "@mui/system";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
import { useState } from "react";
import { appConfig, Users } from "../config";
import { ContractClient } from "../services/contractClient";
import { MirrorNodeClient } from "../services/mirrorNodeClient";
import { AccountClient } from "../services/accountClient";
import { ContractFunctionParameterBuilder } from "../services/wallets/contractFunctionParameterBuilder";
import ReviewProcess from "../components/ReviewProcess";
import JobPosting from "../components/JobPosting";
import CandidateSelection from "../components/CandidateSelection";


function getOperatorClient() {
  const operatorPrivateKey = PrivateKey.fromStringECDSA(appConfig.constants.OPERATOR_PRIVATE_KEY);
  const operatorAccountId = AccountId.fromString(appConfig.constants.OPERATOR_ACCOUNT_ID);
  const client = Client.forTestnet();
  client.setOperator(
    operatorAccountId,
    operatorPrivateKey
  );
  return client;
}

export default function Home() {
  const operatorClient = getOperatorClient();
  const mirrorNodeClient = new MirrorNodeClient(appConfig.networks.testnet);
  const contractClient = new ContractClient(operatorClient);
  const accountClient = new AccountClient(operatorClient);
  const {walletInterface, accountId} = useWalletInterface();
  const [selectedCandidate, setSelectedCandidate] = useState<Users>('frodo');
  const [contractId, setContractId] = useState<ContractId | null>(null);
  const [isDeposited, setIsDeposited] = useState(false);
  const handleCandidateSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCandidate(event.target.value as Users); // Update the state with the selected value
  };

  const handleContractCreation = async () => {
    console.log(
      'Selected candidate',
      selectedCandidate
    ); // Use the selected value
    if (accountId === null) {
      console.log('Account ID is null')
      return;
    }
    const accountDetails = await mirrorNodeClient.getAccountDetails(AccountId.fromString(accountId))
    console.log(
      'Account details:',
      accountDetails
    );
    const candidateConfigs = appConfig.users[selectedCandidate];
    const _contractId = await contractClient.deployContract(
      appConfig.constants.CONTRACT_FILE_ID,
      accountDetails.evm_address,
      PublicKey.fromString(candidateConfigs.publicKey).toEvmAddress(),
      appConfig.constants.TOKEN_ID,
      appConfig.constants.JOB_OFFER_REWARD
    );
    if (_contractId === null) {
      return;
    }
    setContractId(_contractId);
    // check if token is associated with account
    if (accountDetails.balance.tokens.find(token => token.token_id === appConfig.constants.TOKEN_ID) === undefined) {
      await walletInterface.associateToken(TokenId.fromString(appConfig.constants.TOKEN_ID));
    }
    // transfer tokens to the signer from operator account
    await accountClient.transferNonFungibleToken(
      operatorClient,
      appConfig.constants.TOKEN_ID,
      appConfig.constants.OPERATOR_ACCOUNT_ID,
      accountId,
      appConfig.constants.JOB_OFFER_REWARD
    );
    // create allowance for the contract
    await walletInterface.createTokenAllowance(
      TokenId.fromString(appConfig.constants.TOKEN_ID),
      _contractId,
      appConfig.constants.JOB_OFFER_REWARD
    );
    // deposit tokens to the contract
    await walletInterface?.executeContractFunction(
      _contractId,
      'deposit',
      new ContractFunctionParameterBuilder(),
      100_000
    );
    setIsDeposited(true);
  };


  return (<Stack alignItems="center" spacing={4}>
    {walletInterface !== null && (<>
      <JobPosting/>
      <Divider sx={{width: '100%'}}/>
      {isDeposited ? (<ReviewProcess
        selectedCandidate={selectedCandidate}
        contractId={contractId}
        walletInterface={walletInterface}
        contractClient={contractClient}
      />) : (<CandidateSelection
        selectedCandidate={selectedCandidate}
        handleCandidateSelection={handleCandidateSelection}
        handleContractCreation={handleContractCreation}
      />)}
    </>)}
  </Stack>)
}
