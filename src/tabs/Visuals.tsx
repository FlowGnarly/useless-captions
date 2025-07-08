import { Box } from "@mui/material";
import VideoPlayer from "../VideoPlayer";

export default function Visuals() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <VideoPlayer />
    </Box>
  );
}
