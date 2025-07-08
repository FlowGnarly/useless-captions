import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InputIcon from "@mui/icons-material/Input";
import CaptionIcon from "@mui/icons-material/ClosedCaption";
import EditIcon from "@mui/icons-material/Edit";
import { open } from "@tauri-apps/plugin-dialog";
import { useMemo, useState } from "react";
import TextCustomization from "./TextCustomization";
import { useCaptionStyleCtx } from "../../context/captionStyle";
import { convertFileSrc } from "@tauri-apps/api/core";
import calculateVideoMetadata from "../../../remotion/calcMetadata";
import { useVideoConfigCtx } from "../../context/videoConfig";
import useCaptionPages from "../../useCaptionPages";

export type FetchAction = undefined | "transcribing" | "rendering";

export type FetchFailedResponse = { code: number; reason: string };

export default function Tweaks({
  onStartedFetch,
  onFailedFetch,
}: {
  onStartedFetch: (info: FetchAction) => void;
  onFailedFetch: (info: FetchFailedResponse) => void;
}) {
  const [tab, setTab] = useState(0);
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(0);

  const { style: captionStyle } = useCaptionStyleCtx();
  const { config: videoConfig, setConfig: setVideoConfig } =
    useVideoConfigCtx();
  const captionPages = useCaptionPages(videoConfig.captions);

  const selectedCaption = useMemo(() => {
    if (videoConfig.captions) {
      return videoConfig.captions[selectedCaptionIndex];
    }
  }, [videoConfig.captions, selectedCaptionIndex]);

  async function selectVideo() {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Video",
          extensions: ["mp4"],
        },
      ],
    });

    if (selected) {
      onStartedFetch("transcribing");

      const selectedAsUrl = convertFileSrc(selected);
      const fields = await calculateVideoMetadata(selectedAsUrl);

      const captions = await fetch("http://localhost:3123/generate-captions", {
        method: "POST",
        body: JSON.stringify({
          videoPath: selected,
        }),
        headers: { "Content-Type": "application/json" },
      }).catch(() => {
        return null;
      });

      if (!captions) {
        onFailedFetch({
          code: 404,
          reason: "Fetch request didn't get a response",
        });

        return;
      }

      if (!captions.ok) {
        onFailedFetch({
          code: captions.status,
          reason: captions.statusText,
        });

        return;
      }

      setVideoConfig({
        videoUrl: selectedAsUrl,
        videoPath: selected,
        captions: await captions.json(),
        metadata: fields,
      });

      onStartedFetch(undefined);
    }
  }

  return (
    <>
      <Paper
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={tab}
          onChange={(_, newValue) => {
            setTab(newValue);
          }}
        >
          <BottomNavigationAction label="Input" icon={<InputIcon />} />
          <BottomNavigationAction
            label="Edit Captions"
            icon={<CaptionIcon />}
            disabled={videoConfig.captions === undefined}
          />
          <BottomNavigationAction label="Customize Text" icon={<EditIcon />} />
        </BottomNavigation>
      </Paper>

      <Box hidden={tab !== 0} style={{ height: "100%", width: "100%" }}>
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
          <Button
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            onClick={selectVideo}
          >
            Select Video
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={async () => {
              onStartedFetch("rendering");

              const render = await fetch(
                "http://localhost:3123/render-video/",
                {
                  method: "POST",
                  body: JSON.stringify({
                    videoUrl: videoConfig.videoPath,
                    captionAsPages: captionPages,
                    textStyle: captionStyle,
                  }),
                  headers: { "Content-Type": "application/json" },
                }
              ).catch(() => {
                return null;
              });

              if (!render) {
                onFailedFetch({
                  code: 404,
                  reason: "Fetch request didn't get a response",
                });

                return;
              }

              if (!render.ok) {
                onFailedFetch({
                  code: render.status,
                  reason: render.statusText,
                });

                return;
              }

              onStartedFetch(undefined);
            }}
            disabled={videoConfig.captions === undefined}
          >
            Render Video
          </Button>
        </Box>
      </Box>

      <Box hidden={tab !== 1} style={{ height: "100%", width: "100%" }}>
        <Box
          sx={{
            height: "100%",
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "70%",
              overflowY: "scroll",
            }}
          >
            {videoConfig.captions &&
              videoConfig.captions.map((caption, index) => {
                return (
                  <Card key={index}>
                    <CardActionArea
                      data-active={
                        selectedCaptionIndex === index ? "" : undefined
                      }
                      onClick={() => setSelectedCaptionIndex(index)}
                      sx={{
                        height: "100%",
                        "&[data-active]": {
                          backgroundColor: "action.selected",
                          "&:hover": {
                            backgroundColor: "action.selectedHover",
                          },
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="h5">{caption.text}</Typography>
                        <Typography>
                          {caption.startMs}ms ~ {caption.endMs}ms
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
          </Box>

          <Divider />

          {selectedCaption && (
            <Box
              sx={{
                bgcolor: "Window",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "30%",
              }}
            >
              <TextField
                helperText="Edit caption"
                variant="filled"
                value={selectedCaption.text}
                onChange={(event) => {
                  if (!videoConfig.videoUrl) return;

                  const newCaptions = [...videoConfig.captions];
                  newCaptions[selectedCaptionIndex].text =
                    event.currentTarget.value;

                  setVideoConfig({
                    ...videoConfig,
                    captions: newCaptions,
                  });
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      <Box hidden={tab !== 2} style={{ height: "100%", width: "100%" }}>
        <TextCustomization />
      </Box>
    </>
  );
}
