import { Avatar, Button, CardMedia, Stack, Typography } from "@mui/material";
import { ContractFunctionParameterBuilder } from "../services/wallets/contractFunctionParameterBuilder";
import { ContractId } from "@hashgraph/sdk";
import { appConfig, Users } from "../config";
import { useState } from "react";
import GandalfAvatar from "../assets/gandalf.jpg";
import GaladrielAvatar from "../assets/galadriel.jpeg";
import ElronAvatar from "../assets/elrond.jpeg";

interface ReviewProcessProps {
  selectedCandidate: Users;
  contractId: ContractId | null;
  walletInterface: any;
  contractClient: any;
}

export default function ReviewProcess({
                                        selectedCandidate,
                                        contractId,
                                        walletInterface,
                                        contractClient
                                      }: ReviewProcessProps) {
  const candidateConfigs = appConfig.users[selectedCandidate];
  const [disputeFiled, setDisputeFiled] = useState(false);
  const [rewardReleased, setRewardReleased] = useState(false);

  const handleReleaseReward = async () => {
    if (contractId === null) {
      return;
    }
    await walletInterface?.executeContractFunction(
      contractId,
      'release',
      new ContractFunctionParameterBuilder(),
      1_000_000
    );
    setRewardReleased(true);
  }

  const handleDispute = async () => {
    if (contractId === null) {
      console.log('Contract ID is null');
      return;
    }
    try {
      await contractClient.callContract(
        contractId,
        candidateConfigs.isDisputeWon ? 'release' : 'refund',
        1_000_000
      );
      setDisputeFiled(true);
    } catch (error) {
      console.error(
        'Error calling contract',
        error
      );
      return;
    }
  }

  return (
    <Stack direction="column" alignItems="center" spacing={2}>
      {rewardReleased ? (
        <Typography variant="h6">Reward has been successfully released</Typography>
      ) : disputeFiled ? (
        <>
          <Stack direction={"row"} alignItems='center' spacing={2}>
            <Avatar src={GaladrielAvatar}/>
            <Avatar src={GandalfAvatar}/>
            <Avatar src={ElronAvatar}/>
          </Stack>
          <Typography variant="h6">
            The council has decided
            to {candidateConfigs.isDisputeWon ? `release the reward to ${candidateConfigs.name}` : "refund your deposited reward"}
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h4">Review process</Typography>
          <CardMedia
            component="img"
            image={candidateConfigs.workReviewImagePath}
            alt="Work Review"
            sx={{width: 500}}
          />
          <Stack direction="row" spacing={2}>
            <Button variant='contained' onClick={handleReleaseReward}>
              Release Reward
            </Button>
            <Button variant='contained' onClick={handleDispute}>
              Initiate Dispute
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}