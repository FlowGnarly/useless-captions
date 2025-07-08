import {
  Alert,
  AlertTitle,
  Box,
  Dialog,
  Divider,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import Preview from "./tabs/Visuals";
import Tweaks, { FetchAction, FetchFailedResponse } from "./tabs/Tweaks";
import { useState } from "react";
import CaptionStyleProvider from "./context/captionStyle";
import VideoConfigProvider from "./context/videoConfig";

export default function App() {
  const [fetchAction, setFetchAction] = useState<FetchAction>();
  const [fetchErrors, setFetchErrors] = useState<FetchFailedResponse[]>([]);

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
            <Dialog open={fetchAction !== undefined}>
              <div hidden={fetchAction !== "transcribing"}>
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

              <div hidden={fetchAction !== "rendering"}>
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

            <Box
              sx={{
                position: "absolute",
                bottom: 56,
                right: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "end",
              }}
            >
              {fetchErrors.map((err, index) => {
                return (
                  <Alert
                    key={index}
                    severity="error"
                    variant="filled"
                    onClose={() =>
                      setFetchErrors((prevErrors) => {
                        const newError: (FetchFailedResponse | null)[] = [
                          ...prevErrors,
                        ];

                        newError[index] = null;

                        return [...newError.filter((v) => v !== null)];
                      })
                    }
                  >
                    <AlertTitle>{err.code}</AlertTitle>
                    {err.reason}
                  </Alert>
                );
              })}
            </Box>

            <Tweaks
              onStartedFetch={setFetchAction}
              onFailedFetch={(err) => {
                setFetchErrors([err, ...fetchErrors]);
                setFetchAction(undefined);
              }}
            />
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
