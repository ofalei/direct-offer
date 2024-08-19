import { Button, CardMedia, Stack, Typography } from "@mui/material";
import { Candidates } from "../config/data";
import GollumWorkReview from "../assets/gollum-work-review.jpeg";
import FrodoWorkReview from "../assets/frodo-work-review.jpeg";
import { ContractFunctionParameterBuilder } from "../services/wallets/contractFunctionParameterBuilder";
import { ContractId } from "@hashgraph/sdk";

interface ReviewProcessProps {
  selectedCandidate: Candidates;
  contractId: ContractId | null;
  walletInterface: any;
  contractClient: any;
}

export default function ReviewProcess({ selectedCandidate, contractId, walletInterface, contractClient }: ReviewProcessProps) {
  let image = FrodoWorkReview;
  if (selectedCandidate === Candidates.GOLLUM) {
    image = GollumWorkReview;
  }

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
    let contractFunction = 'refund'
    if (selectedCandidate !== Candidates.FRODO) {
      contractFunction = 'release';
    }

    try {
      await contractClient.callContract(contractId, contractFunction, 1_000_000);
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
        image={image}
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