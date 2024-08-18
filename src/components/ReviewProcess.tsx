import {Button, Stack, Typography} from "@mui/material";
import {Candidates} from "../config/data";


interface ReviewProcessProps {
    selectedCandidate: Candidates;
    handleReleaseReward: () => void;
    handleRefund: () => void;
}

export default function ReviewProcess({selectedCandidate, handleReleaseReward, handleRefund}: ReviewProcessProps) {
    return (<Stack direction="column" alignItems="center" spacing={2}>
        <Typography variant="h4">Review process</Typography>
        {selectedCandidate === Candidates.FRODO ? (
            <Button variant='contained' onClick={handleReleaseReward}>
                Release Reward
            </Button>) : (<Button variant='contained' onClick={handleRefund}>
            Refund
        </Button>)}
    </Stack>);
}