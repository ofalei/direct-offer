import { Button, CardMedia, Stack, Typography } from "@mui/material";
import { ContractFunctionParameterBuilder } from "../services/wallets/contractFunctionParameterBuilder";
import { ContractId } from "@hashgraph/sdk";
import { appConfig, Users } from "../config";

interface ReviewProcessProps {
  selectedCandidate: Users;
  contractId: ContractId | null;
  walletInterface: any;
  contractClient: any;
}

export default function ReviewProcess({ selectedCandidate, contractId, walletInterface, contractClient }: ReviewProcessProps) {
  const candidateConfigs = appConfig.users[selectedCandidate];
  const handleReleaseReward = async () => {
    if (contractId === null) {
      return;
    }
    await walletInterface?.executeContractFunction(contractId, 'release', new ContractFunctionParameterBuilder(), 1_000_000);
  }

  const handleDispute = async () => {
    if (contractId === null) {
      return;
    }
    try {
      await contractClient.callContract(contractId, candidateConfigs.isDisputeWon ? 'refund' : 'release', 1_000_000);
    } catch (error) {
      console.error('Error calling contract', error);
      return;
    }
  }

  return (
    <Stack direction="column" alignItems="center" spacing={2}>
      <Typography variant="h4">Review process</Typography>
      <CardMedia
        component="img"
        image={candidateConfigs.workReviewImagePath}
        alt="Work Review"
        sx={{ width: 500 }}
      />
      <Stack direction="row" spacing={2}>
        <Button variant='contained' onClick={handleReleaseReward}>
          Release Reward
        </Button>
        <Button variant='contained' onClick={handleDispute}>
          Initiate Dispute
        </Button>
      </Stack>
    </Stack>
  );
}