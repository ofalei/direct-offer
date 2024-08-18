import {Stack, Typography} from "@mui/material";
import {appConfig} from "../config";

export default function JobPosting() {
    return (
        <Stack direction="column" alignItems="center" spacing={2}>
            <Typography variant="h3">Job Posting</Typography>
            <Typography variant="h4">Ring Bearer for Mission to Mount Doom</Typography>
            <Typography variant="body1" sx={{maxWidth: '70%'}}>
                I am looking for a courageous and trustworthy individual to carry the One Ring across Middle-earth to
                Mount Doom in Mordor. The selected candidate must resist the corrupting influence of the Ring and ensure
                it is destroyed by casting it into the volcanic fires.
            </Typography>
            <Typography variant="h5">Reward: {appConfig.constants.JOB_OFFER_REWARD} Castar</Typography>
        </Stack>
    );
}