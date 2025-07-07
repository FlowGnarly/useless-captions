import { Box, SxProps, Theme } from "@mui/material";
import VideoPlayer from "../VideoPlayer";
import { VideoMetadata } from "../../remotion/src/Root";
import { TikTokPage } from "@remotion/captions";

export interface VisualsProps {
  videoUrl?: string;
  videoMetadata?: VideoMetadata;
  captionsAsPages?: TikTokPage[];
  textStyle: SxProps<Theme>;
}

export default function Visuals({
  videoUrl,
  videoMetadata,
  captionsAsPages,
  textStyle,
}: VisualsProps) {
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
      <VideoPlayer
        src={videoUrl}
        metadata={videoMetadata}
        captionsAsPages={captionsAsPages}
        textStyle={textStyle}
      />
    </Box>
  );
}
