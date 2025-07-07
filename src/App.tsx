import {
  Box,
  Dialog,
  Divider,
  LinearProgress,
  Paper,
  SxProps,
  Theme,
  Typography,
} from "@mui/material";
import Preview from "./tabs/Visuals";
import Tweaks from "./tabs/Tweaks";
import { useMemo, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import { VideoMetadata } from "../remotion/Root";
import calculateVideoMetadata from "../remotion/calcMetadata";

type CaptionGenerationStage = "transcribing";

export default function App() {
  const [videoUrl, setVideoUrl] = useState<string>();
  const [videoPath, setVideoPath] = useState<string>();
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>();

  const [captionGenerationStage, setCaptionGenerationStage] =
    useState<CaptionGenerationStage>();
  const [captions, setCaptions] = useState<Caption[]>();
  const [textStyle, setTextStyle] = useState<SxProps<Theme>>({});

  const captionsAsPages = useMemo(() => {
    if (captions) {
      return createTikTokStyleCaptions({
        captions: captions,
        combineTokensWithinMilliseconds: 780,
      }).pages;
    }
  }, [captions]);

  async function generateCaptions(videoPath: string) {
    setCaptionGenerationStage("transcribing");

    const result = await fetch("http://localhost:3123/generate-captions", {
      method: "POST",
      body: JSON.stringify({
        videoPath,
      }),
      headers: { "Content-Type": "application/json" },
    });

    setCaptions(await result.json());
    setCaptionGenerationStage(undefined);
  }

  return (
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
              <LinearProgress variant="indeterminate" sx={{ width: "80%" }} />
            </Paper>
          </div>
        </Dialog>

        <Tweaks
          textStyle={textStyle}
          captions={captions}
          onVideoSelected={async (selected) => {
            const selectedAsUrl = convertFileSrc(selected);
            const fields = await calculateVideoMetadata(selectedAsUrl);

            setVideoUrl(selectedAsUrl);
            setVideoPath(selected);
            setVideoMetadata(fields);

            await generateCaptions(selected);
          }}
          onEditTextStyle={(textStyleEdits) => {
            setTextStyle((prevTextStyle: SxProps<Theme>) => {
              return { ...prevTextStyle, ...textStyleEdits };
            });
          }}
          onEditCaption={(captionIndex, editedCaption) => {
            setCaptions((prevCaptions) => {
              const updated = [...prevCaptions!];
              updated[captionIndex] = { ...editedCaption };
              return updated;
            });
          }}
          onRenderRequested={() => {
            fetch("http://localhost:3123/render-video/", {
              method: "POST",
              body: JSON.stringify({
                videoUrl: videoPath,
                captionAsPages: captionsAsPages,
                textStyle: textStyle,
              }),
              headers: { "Content-Type": "application/json" },
            });
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
        <Preview
          videoUrl={videoUrl}
          videoMetadata={videoMetadata}
          captionsAsPages={captionsAsPages}
          textStyle={textStyle}
        />
      </Box>
    </Box>
  );
}
