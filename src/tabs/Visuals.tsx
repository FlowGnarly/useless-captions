import { Box } from "@mui/material";
import VideoPlayer from "../VideoPlayer";
import { VideoMetadata } from "../../remotion/Root";
import { TikTokPage } from "@remotion/captions";
import { useCaptionStyleCtx } from "../context/captionStyle";

export interface VisualsProps {
  videoUrl?: string;
  videoMetadata?: VideoMetadata;
  captionsAsPages?: TikTokPage[];
}

export default function Visuals({
  videoUrl,
  videoMetadata,
  captionsAsPages,
}: VisualsProps) {
  const { style: captionStyle } = useCaptionStyleCtx();

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
        textStyle={captionStyle}
      />
    </Box>
  );
}
