import {Avatar, Button, FormControlLabel, Radio, RadioGroup, Stack, Typography} from "@mui/material";
import FrodoAvatar from "../assets/frodo.jpeg";
import GollumAvatar from "../assets/gollum.jpeg";
import {Candidates} from "../config/data";

interface CandidateSelectionProps {
    selectedCandidate: Candidates;
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
                <FormControlLabel
                    value={Candidates.FRODO}
                    control={<Radio/>}
                    label={
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar src={FrodoAvatar}/>
                            <Typography>Frodo Baggins</Typography>
                        </Stack>
                    }
                />
                <FormControlLabel
                    value={Candidates.GOLLUM}
                    control={<Radio/>}
                    label={
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar src={GollumAvatar}/>
                            <Typography>Gollum (Sméagol)</Typography>
                        </Stack>
                    }
                />
                <Button variant='contained' onClick={handleContractCreation}>
                    Create Contract
                </Button>
            </RadioGroup>
        </Stack>
    );
}