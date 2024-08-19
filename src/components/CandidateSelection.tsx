import { Avatar, Button, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import { appConfig, Users } from "../config";

interface CandidateSelectionProps {
  selectedCandidate: Users;
  handleCandidateSelection: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleContractCreation: () => void;
}

export default function CandidateSelection({
                                             selectedCandidate,
                                             handleCandidateSelection,
                                             handleContractCreation
                                           }: CandidateSelectionProps) {
  return (
    <Stack direction="column" alignItems="center" spacing={2}>
      <Typography variant="h4">Available candidates</Typography>
      <RadioGroup onChange={handleCandidateSelection} defaultValue={selectedCandidate}>
        {Object.entries(appConfig.users).map(([key, userConfig]) => (
          <FormControlLabel
            value={key}
            control={<Radio/>}
            label={
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar src={userConfig.avatarImagePath}/>
                <Typography>{userConfig.name}</Typography>
              </Stack>
            }
          />
        ))}
        <Button variant='contained' onClick={handleContractCreation}>
          Create Contract
        </Button>
      </RadioGroup>
    </Stack>
  );
}