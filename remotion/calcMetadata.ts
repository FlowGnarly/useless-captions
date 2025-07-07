import { parseMedia, ParseMediaSrc } from "@remotion/media-parser";
import { VideoMetadata } from "./Root";

export default async function calculateVideoMetadata(
  src: ParseMediaSrc
): Promise<VideoMetadata> {
  const fields = await parseMedia({
    src,
    fields: {
      slowFps: true,
      slowDurationInSeconds: true,
      dimensions: true,
    },
    acknowledgeRemotionLicense: true,
  });

  return {
    fps: fields.slowFps,
    durationInFrames: Math.round(fields.slowDurationInSeconds * fields.slowFps),
    width: fields.dimensions?.width ?? 1080,
    height: fields.dimensions?.height ?? 1920,
  };
}
