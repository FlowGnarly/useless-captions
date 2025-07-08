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
} from "@remotion/install-whisper-cpp";
import { type TiktokCaptionsCompositionProps } from "../remotion/TiktokCaptions";
import { renderMedia, selectComposition } from "@remotion/renderer";

const whsiperDir = path.join(process.cwd(), "whisper.cpp");

{
  // todo: only download the model the user wants to use
  await installWhisperCpp({
    to: whsiperDir,
    version: "1.5.5",
  });

  await downloadWhisperModel({
    model: "small.en",
    folder: whsiperDir,
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
    const videoPath = req.body.videoPath as string;

    // ffmpeg -i /path/to/audio.mp4 -ar 16000 /path/to/audio.wav -y
    await exec(`ffmpeg -y -i "${videoPath}" -ar 16000 "out/audio.wav"`);

    const whisperCppOutput = await transcribe({
      model: "small.en",
      whisperPath: whsiperDir,
      whisperCppVersion: "1.5.5",
      inputPath: path.join(process.cwd(), "/out/audio.wav"),
      tokenLevelTimestamps: true,
      splitOnWord: true,
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

  await renderMedia({
    serveUrl: config.remotionBundle,
    composition,
    codec: "h264",
    outputLocation: `out/video.mp4`,
    inputProps: config.videoProps,
    onProgress(render) {
      console.log(`Render Progress ${Math.round(render.progress * 100)}%`);
    },
  });

  res.status(200).end();
});

app.listen(port, () => {
  console.log(`Server is running on 'http://localhost:${port}/'`);
});
