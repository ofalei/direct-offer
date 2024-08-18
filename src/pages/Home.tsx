import {
  AccountId,
  TokenId,
  Client,
  PrivateKey,
  PublicKey,
  TransferTransaction,
} from "@hashgraph/sdk";
import {Button, FormControlLabel,Divider, Radio, RadioGroup, Avatar, Typography} from "@mui/material";
import { Stack } from "@mui/system";
import FrodoAvatar from "../assets/frodo.jpeg";
import GollumAvatar from "../assets/gollum.jpeg";
import { useWalletInterface } from "../services/wallets/useWalletInterface";
import { useState } from "react";
import { appConfig } from "../config";
import {HSCSClient} from "../services/hscsClient";
import {MirrorNodeClient} from "../services/wallets/mirrorNodeClient";
// TODO
enum Candidates {
  FRODO = 'frodo',
  GOLLUM = 'gollum'
}

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



export default function Home() {
  const operatorClient = getOperatorClient();
  const mirrorNodeClient = new MirrorNodeClient(appConfig.networks.testnet);
  const hscsClient = new HSCSClient(operatorClient)

  const { walletInterface, accountId } = useWalletInterface();
  const [selectedCandidate, setSelectedCandidate] = useState(Candidates.FRODO);
  const handleCandidateSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCandidate(stringToEnum(event.target.value)); // Update the state with the selected value
  };

  const handleContractCreation = async () => {
    console.log('Selected value:', selectedCandidate); // Use the selected value
    if (accountId === null) {
      return;
    }
    // TODO handle errors
    const accountDetails = await mirrorNodeClient.getAccountDetails(AccountId.fromString(accountId))
    console.log('Account details:', accountDetails);
    const contractId = await hscsClient.deployContract(
        appConfig.constants.CONTRACT_FILE_ID,
        accountDetails.evm_address,
        // TODO!!!!
        PublicKey.fromString(appConfig.constants.FRODO_PUBLIC_KEY).toEvmAddress(),
        appConfig.constants.TOKEN_ID,
        appConfig.constants.JOB_OFFER_REWARD
    );
    if (contractId === null) {
        return;
    }

    // check if token is associated with account
    if (accountDetails.balance.tokens.find(token => token.token_id === appConfig.constants.TOKEN_ID) === undefined) {
      await walletInterface.associateToken(TokenId.fromString(appConfig.constants.TOKEN_ID));
    }
    await transferNonFungibleToken(operatorClient, appConfig.constants.TOKEN_ID, appConfig.constants.OPERATOR_ACCOUNT_ID, accountId, appConfig.constants.JOB_OFFER_REWARD);
    await walletInterface.createTokenAllowance(TokenId.fromString(appConfig.constants.TOKEN_ID), contractId, appConfig.constants.JOB_OFFER_REWARD);
  };

  return (
    <Stack alignItems="center" spacing={4}>
      {walletInterface !== null && (
        <>
          <Stack direction="column" alignItems="center" spacing={2}>
            <Typography variant="h3">Job Posting</Typography>
            <Typography variant="h4">Ring Bearer for Mission to Mount Doom</Typography>
            <Typography variant="body1" sx={{ maxWidth: '70%' }}>I am looking for a courageous and trustworthy individual to carry the One Ring across Middle-earth to Mount Doom in Mordor. The selected candidate must resist the corrupting influence of the Ring and ensure it is destroyed by casting it into the volcanic fires.</Typography>
            <Typography variant="h5">Reward: {appConfig.constants.JOB_OFFER_REWARD} Castar</Typography>
          </Stack>
          <Divider sx={{ width: '100%' }} />
          <Stack direction="column" alignItems="center" spacing={2}>
            <Typography variant="h4">Available candidates</Typography>
            <RadioGroup onChange={handleCandidateSelection} defaultValue={selectedCandidate}>
            <FormControlLabel
                value={Candidates.FRODO}
                control={<Radio />}
                label={
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar src={FrodoAvatar}  />
                    <Typography>Frodo Baggins</Typography>
                  </Stack>
                }
            />
            <FormControlLabel
                value={Candidates.GOLLUM}
                control={<Radio />}
                label={
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar src={GollumAvatar} />
                    <Typography>Gollum (Sméagol)</Typography>
                  </Stack>
                }
            />
            <Button
                variant='contained'
                onClick={handleContractCreation}
            >
              Create Contract
            </Button>
          </RadioGroup>
          </Stack>
        </>
      )}
    </Stack>
  )
}