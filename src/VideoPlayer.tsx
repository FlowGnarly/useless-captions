import { Skeleton } from "@mui/material";
import { Player } from "@remotion/player";
import { TiktokCaptionsComposition } from "../remotion/TiktokCaptions";
import { useCaptionStyleCtx } from "./context/captionStyle";
import { useVideoConfigCtx } from "./context/videoConfig";
import useCaptionPages from "./useCaptionPages";

export default function VideoPlayer() {
  const { config } = useVideoConfigCtx();

  const { style: captionStyle } = useCaptionStyleCtx();
  const captionPages = useCaptionPages(config.captions);

  if (config.videoUrl === undefined || captionPages === undefined) {
    return (
      <Skeleton
        variant="rectangular"
        style={{
          aspectRatio: "9/16",
          height: "80%",
          maxWidth: "100%",
        }}
      />
    );
  }

  return (
    <Player
      controls
      loop
      acknowledgeRemotionLicense
      style={{
        aspectRatio: "9/16",
        height: "80%",
        maxWidth: "100%",
      }}
      component={TiktokCaptionsComposition}
      inputProps={{
        videoUrl: config.videoUrl,
        captionsOnly: false,
        captionAsPages: captionPages,
        textStyle: captionStyle,
      }}
      compositionWidth={config.metadata.width}
      compositionHeight={config.metadata.height}
      durationInFrames={config.metadata.durationInFrames}
      fps={config.metadata.fps}
    />
  );
}
