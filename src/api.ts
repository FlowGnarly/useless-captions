import { Caption } from "@remotion/captions";
import { path } from "@tauri-apps/api";
import { TiktokCaptionsCompositionProps } from "../remotion/TiktokCaptions";

export const availableWhisperModels = [
  "tiny",
  "tiny.en",
  "base",
  "base.en",
  "small",
  "small.en",
  "medium",
  "medium.en",
  "large-v1",
  "large-v2",
  "large-v3",
  "large-v3-turbo",
] as const;

export type WhisperModel = (typeof availableWhisperModels)[number];

export async function generateCaptions(body: {
  videoPath: string;
  whisperModel: WhisperModel;
}): Promise<
  | {
      ok: true;
      status: number;
      statusText: string;
      captions: Caption[];
    }
  | {
      ok: false;
      status: number;
      statusText: string;
    }
> {
  return await fetch("http://localhost:3123/generate-captions", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  })
    .then(async (res) => {
      if (res.ok) {
        return {
          ok: true,
          status: res.status,
          statusText: res.statusText,
          captions: await res.json(),
        };
      } else {
        return {
          ok: false as const,
          status: res.status,
          statusText: res.statusText,
        };
      }
    })
    .catch(() => {
      return {
        ok: false,
        status: 404,
        statusText: "Server didn't respond",
      };
    });
}

export async function renderVideo(
  body: TiktokCaptionsCompositionProps
): Promise<
  | {
      ok: true;
      status: number;
      statusText: string;
    }
  | {
      ok: false;
      status: number;
      statusText: string;
    }
> {
  return await fetch("http://localhost:3123/render-video/", {
    method: "POST",
    body: JSON.stringify({
      remotionBundle: await path.resolveResource("../remotionBundle"),
      videoProps: body,
    }),
    headers: { "Content-Type": "application/json" },
  })
    .then(async (res) => {
      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
      };
    })
    .catch(() => {
      return {
        ok: false,
        status: 404,
        statusText: "Server didn't respond",
      };
    });
}
