import { Caption } from "@remotion/captions";
import { createContext, useContext, useState } from "react";
import { VideoMetadata } from "../../remotion/Root";

type VideoConfigProps =
  | {
      videoPath: undefined;
      videoUrl: undefined;
      captions: undefined;
      metadata: undefined;
    }
  | {
      videoPath: string;
      videoUrl: string;
      captions: Caption[];
      metadata: VideoMetadata;
    };

type VideoConfigContextType = {
  config: VideoConfigProps;
  setConfig: (config: VideoConfigProps) => void;
};

const VideoConfigCtx = createContext<VideoConfigContextType | null>(null);

export default function VideoConfigProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  const [config, setConfig] = useState<VideoConfigProps>({
    videoPath: undefined,
    videoUrl: undefined,
    captions: undefined,
    metadata: undefined,
  });

  return (
    <VideoConfigCtx.Provider value={{ config, setConfig }}>
      {children}
    </VideoConfigCtx.Provider>
  );
}

export function useVideoConfigCtx() {
  const ctx = useContext(VideoConfigCtx);
  if (!ctx)
    throw new Error(
      "useVideoConfigCtx must be used within VideoConfigProvider"
    );
  return ctx;
}
