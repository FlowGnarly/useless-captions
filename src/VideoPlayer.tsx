import { Skeleton, SxProps, Theme } from "@mui/material";
import { Player } from "@remotion/player";
import { TiktokCaptionsComposition } from "../remotion/TiktokCaptions";
import { VideoMetadata } from "../remotion/Root";
import { TikTokPage } from "@remotion/captions";

export interface VideoPlayerProps {
  src?: string;
  metadata?: VideoMetadata;
  captionsAsPages?: TikTokPage[];
  textStyle?: SxProps<Theme>;
}

export default function VideoPlayer({
  src,
  metadata,
  captionsAsPages,
  textStyle,
}: VideoPlayerProps) {
  return src && metadata && captionsAsPages ? (
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
        videoUrl: src,
        captionAsPages: captionsAsPages,
        textStyle: textStyle,
      }}
      compositionWidth={metadata.width}
      compositionHeight={metadata.height}
      durationInFrames={metadata.durationInFrames}
      fps={metadata.fps}
    />
  ) : (
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
