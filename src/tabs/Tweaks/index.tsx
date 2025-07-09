import {
  Alert,
  AlertTitle,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Switch,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InputIcon from "@mui/icons-material/Input";
import CaptionIcon from "@mui/icons-material/ClosedCaption";
import EditIcon from "@mui/icons-material/Edit";
import { open } from "@tauri-apps/plugin-dialog";
import { useState } from "react";
import TextCustomization from "./TextCustomization";
import { useCaptionStyleCtx } from "../../context/captionStyle";
import { convertFileSrc } from "@tauri-apps/api/core";
import calculateVideoMetadata from "../../../remotion/calcMetadata";
import { useVideoConfigCtx } from "../../context/videoConfig";
import useCaptionPages from "../../useCaptionPages";
import CaptionEditor from "./CaptionEditor";
import {
  availableWhisperModels,
  generateCaptions,
  renderVideo as renderVideoApi,
  WhisperModel,
} from "../../api";

export default function Tweaks() {
  const [tab, setTab] = useState(0);
  const [whisperModel, setWhisperModel] = useState<WhisperModel>("small.en");
  const [fetchAction, setFetchAction] = useState<
    undefined | "transcribing" | "rendering"
  >();
  const [fetchErrors, setFetchErrors] = useState<
    { code: number; reason: string }[]
  >([]);

  const [showRenderDialog, setShowRenderDialog] = useState(false);
  const [renderSettings, setRenderSettings] = useState({
    outputCaptionsOnly: false,
  });

  function pushFetchError({ code, reason }: { code: number; reason: string }) {
    setFetchErrors((prevErrors) => {
      return [
        {
          code,
          reason,
        },
        ...prevErrors,
      ];
    });

    setFetchAction(undefined);
  }

  const { style: captionStyle } = useCaptionStyleCtx();
  const { config: videoConfig, setConfig: setVideoConfig } =
    useVideoConfigCtx();

  const captionPages = useCaptionPages(videoConfig.captions);

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
      setFetchAction("transcribing");

      const selectedAsUrl = convertFileSrc(selected);
      const fields = await calculateVideoMetadata(selectedAsUrl);

      const captions = await generateCaptions({
        videoPath: selected,
        whisperModel,
      });

      if (!captions.ok) {
        pushFetchError({
          code: captions.status,
          reason: captions.statusText,
        });

        return;
      }

      setVideoConfig({
        videoUrl: selectedAsUrl,
        videoPath: selected,
        captions: captions.captions,
        metadata: fields,
      });

      setFetchAction(undefined);
    }
  }

  async function renderVideo() {
    setFetchAction("rendering");
    setShowRenderDialog(false);

    const render = await renderVideoApi({
      videoUrl: videoConfig.videoPath!,
      captionsOnly: renderSettings.outputCaptionsOnly,
      captionAsPages: captionPages!,
      textStyle: captionStyle,
    });

    if (!render.ok) {
      pushFetchError({
        code: render.status,
        reason: render.statusText,
      });

      return;
    }

    setFetchAction(undefined);
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
        <Grid
          spacing={2}
          container
          sx={{
            height: "100%",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Dialog open={fetchAction !== undefined}>
            <div hidden={fetchAction !== "transcribing"}>
              <Paper
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "16rem",
                  width: "24rem",
                }}
              >
                <Typography variant="h6">Generating captions</Typography>
                <LinearProgress variant="indeterminate" sx={{ width: "80%" }} />
              </Paper>
            </div>

            <div hidden={fetchAction !== "rendering"}>
              <Paper
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "16rem",
                  width: "24rem",
                }}
              >
                <Typography variant="h6">Rendering video</Typography>
                <LinearProgress variant="indeterminate" sx={{ width: "80%" }} />
              </Paper>
            </div>
          </Dialog>

          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "end",
            }}
          >
            {fetchErrors.map((err, index) => {
              return (
                <Alert
                  key={index}
                  severity="error"
                  variant="filled"
                  onClose={() =>
                    setFetchErrors((prevErrors) => {
                      const newError = [...prevErrors, null];

                      newError[index] = null;

                      return [...newError.filter((v) => v !== null)];
                    })
                  }
                >
                  <AlertTitle>{err.code}</AlertTitle>
                  {err.reason}
                </Alert>
              );
            })}
          </Box>

          <FormControl>
            <InputLabel>Whisper Model</InputLabel>
            <Select
              value={whisperModel}
              label="Age"
              onChange={(event) => setWhisperModel(event.target.value)}
            >
              {availableWhisperModels.map((model) => {
                return (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            tabIndex={-1}
            startIcon={<CloudUploadIcon />}
            onClick={selectVideo}
          >
            Select Video
          </Button>

          <Dialog open={showRenderDialog}>
            <Typography variant="h5">Render Settings</Typography>
            <Card>
              <CardContent>
                <Typography>Captions only (renders much faster)</Typography>
                <Switch
                  title="Output captions only"
                  value={renderSettings.outputCaptionsOnly}
                  onChange={(event) =>
                    setRenderSettings((prevOptions) => {
                      return {
                        ...prevOptions,
                        outputCaptionsOnly: event.currentTarget.checked,
                      };
                    })
                  }
                />
              </CardContent>
            </Card>

            <Button onClick={renderVideo}>Confirm</Button>
          </Dialog>

          <Button
            variant="contained"
            color="secondary"
            onClick={async () => {
              setShowRenderDialog(true);
            }}
            disabled={videoConfig.captions === undefined}
          >
            Render Video
          </Button>
        </Grid>
      </Box>

      <Box hidden={tab !== 1} style={{ height: "100%", width: "100%" }}>
        <CaptionEditor />
      </Box>

      <Box hidden={tab !== 2} style={{ height: "100%", width: "100%" }}>
        <TextCustomization />
      </Box>
    </>
  );
}
