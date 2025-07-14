import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import util from "node:util";
import child_process from "node:child_process";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
  type WhisperModel,
} from "@remotion/install-whisper-cpp";
import { type TiktokCaptionsCompositionProps } from "../remotion/TiktokCaptions";
import { renderMedia, selectComposition } from "@remotion/renderer";

const whsiperDir = path.join(process.cwd(), "whisper.cpp");

{
  await installWhisperCpp({
    to: whsiperDir,
    version: "1.5.5",
  });
}

const exec = util.promisify(child_process.exec);
const app = express();
const port = 3123;

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.use(express.static("public"));

app.post(
  "/generate-captions",
  express.raw({ type: "application/octet-stream" }),
  async (req, res) => {
    const { videoPath, whisperModel } = req.body as {
      videoPath: string;
      whisperModel: WhisperModel;
    };

    await downloadWhisperModel({
      model: whisperModel,
      folder: whsiperDir,
    });

    // ffmpeg -i /path/to/audio.mp4 -ar 16000 /path/to/audio.wav -y
    await exec(`ffmpeg -y -i "${videoPath}" -ar 16000 "out/audio.wav"`);

    const whisperCppOutput = await transcribe({
      model: whisperModel,
      whisperPath: whsiperDir,
      whisperCppVersion: "1.5.5",
      inputPath: path.join(process.cwd(), "/out/audio.wav"),
      tokenLevelTimestamps: true,
      splitOnWord: true,
      translateToEnglish: true,
    });

    res.status(200).json(
      toCaptions({
        whisperCppOutput,
      }).captions
    ).end;
  }
);

app.post("/render-video", async (req, res) => {
  const config = req.body as {
    remotionBundle: string;
    videoProps: TiktokCaptionsCompositionProps;
  };

  fs.writeFileSync(
    "./public/video.mp4",
    fs.readFileSync(config.videoProps.videoUrl)
  );

  config.videoProps.videoUrl = `http://localhost:${port}/video.mp4`;

  const composition = await selectComposition({
    serveUrl: config.remotionBundle,
    id: "TiktokCaptions",
    inputProps: config.videoProps,
  });

  let lastProgress = 0;

  await renderMedia({
    serveUrl: config.remotionBundle,
    composition,
    colorSpace: "bt709",
    outputLocation: `out/video.mp4`,
    inputProps: config.videoProps,

    imageFormat: "png",
    pixelFormat: config.videoProps.captionsOnly ? "yuva444p10le" : undefined,
    codec: config.videoProps.captionsOnly ? "prores" : "h264",
    proResProfile: config.videoProps.captionsOnly ? "4444" : undefined,

    videoBitrate: "2M",
    encodingMaxRate: "2M",
    encodingBufferSize: "1M",

    onStart({ frameCount, parallelEncoding, resolvedConcurrency }) {
      console.log(`Beginning to render ${frameCount}.`);

      if (parallelEncoding) {
        console.log("Parallel encoding is enabled.");
      }

      console.log(`Using concurrency: ${resolvedConcurrency}`);
    },

    onProgress(render) {
      const progress = Math.round(render.progress * 100);
      if (lastProgress === progress) return;

      lastProgress = progress;
      console.log(`Rendering ${progress}%`);
    },
  });

  res.status(200).end();
});

app.listen(port, () => {
  console.log(`Server is running on 'http://localhost:${port}/'`);
});
