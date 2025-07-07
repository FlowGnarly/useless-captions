import React from "react";
import { Composition } from "remotion";
import { TiktokCaptionsComposition } from "./TiktokCaptions";
import calculateVideoMetadata from "./calcMetadata";

export interface VideoMetadata {
  fps: number;
  durationInFrames: number;
  width: number;
  height: number;
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="TiktokCaptions"
        component={TiktokCaptionsComposition}
        durationInFrames={60}
        defaultProps={{ videoUrl: "", captionAsPages: [] }}
        fps={60}
        width={1080}
        height={1920}
        calculateMetadata={({ props }) => {
          return calculateVideoMetadata(props.mediaParseUrl ?? props.videoUrl);
        }}
      />
    </>
  );
};
