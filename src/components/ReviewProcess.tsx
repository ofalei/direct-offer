import {Button, Stack, Typography, CardMedia} from "@mui/material";
import {Candidates} from "../config/data";
import GollumWorkReview from "../assets/gollum-work-review.jpeg";
import FrodoWorkReview from "../assets/frodo-work-review.jpeg";

interface ReviewProcessProps {
    selectedCandidate: Candidates;
    handleReleaseReward: () => void;
    handleRefund: () => void;
}

export default function ReviewProcess({selectedCandidate, handleReleaseReward, handleRefund}: ReviewProcessProps) {
    let image = FrodoWorkReview;
    if (selectedCandidate === Candidates.GOLLUM) {
        image = GollumWorkReview;
        }
    return (<Stack direction="column" alignItems="center" spacing={2}>
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
            <Button variant='contained' onClick={handleRefund}>
            Refund
        </Button>
    </Stack></Stack>);
}