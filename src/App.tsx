import {
  Box,
  Dialog,
  Divider,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import Preview from "./tabs/Visuals";
import Tweaks from "./tabs/Tweaks";
import { useState } from "react";
import CaptionStyleProvider from "./context/captionStyle";
import VideoConfigProvider from "./context/videoConfig";

type CaptionGenerationStage = "transcribing" | "rendering";

export default function App() {
  const [captionGenerationStage, setCaptionGenerationStage] =
    useState<CaptionGenerationStage>();

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
            <Dialog open={captionGenerationStage !== undefined}>
              <div hidden={captionGenerationStage !== "transcribing"}>
                <Paper
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "16rem",
                    width: "24rem",
                  }}
                >
                  <Typography variant="h6">Generating captions</Typography>
                  <LinearProgress
                    variant="indeterminate"
                    sx={{ width: "80%" }}
                  />
                </Paper>
              </div>

              <div hidden={captionGenerationStage !== "rendering"}>
                <Paper
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "16rem",
                    width: "24rem",
                  }}
                >
                  <Typography variant="h6">Rendering video</Typography>
                  <LinearProgress
                    variant="indeterminate"
                    sx={{ width: "80%" }}
                  />
                </Paper>
              </div>
            </Dialog>

            <Tweaks onUsingFetch={setCaptionGenerationStage} />
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
