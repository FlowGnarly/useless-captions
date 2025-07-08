import { Box, Divider } from "@mui/material";
import Preview from "./tabs/Visuals";
import Tweaks from "./tabs/Tweaks";
import CaptionStyleProvider from "./context/captionStyle";
import VideoConfigProvider from "./context/videoConfig";

export default function App() {
  return (
    <VideoConfigProvider>
      <CaptionStyleProvider>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            height: "calc(100dvh - 56px)",
            width: "100%",
          }}
        >
          <Box
            sx={{
              bgcolor: "AppWorkspace",
              height: "100%",
              width: "60%",
            }}
          >
            <Tweaks />
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box
            sx={{
              bgcolor: "AppWorkspace",
              height: "100%",
              width: "40%",
            }}
          >
            <Preview />
          </Box>
        </Box>
      </CaptionStyleProvider>
    </VideoConfigProvider>
  );
}
