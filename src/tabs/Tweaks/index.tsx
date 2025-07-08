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
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InputIcon from "@mui/icons-material/Input";
import CaptionIcon from "@mui/icons-material/ClosedCaption";
import EditIcon from "@mui/icons-material/Edit";
import { open } from "@tauri-apps/plugin-dialog";
import { useMemo, useState } from "react";
import { Caption } from "@remotion/captions";
import TextCustomization from "./TextCustomization";

export interface TweaksProps {
  onVideoSelected: (selected: string) => void;
  onEditCaption: (index: number, edited: Caption) => void;
  onEditTextStyle: (edits: SxProps<Theme>) => void;
  onRenderRequested: () => void;
  captions?: Caption[];
  textStyle: SxProps<Theme>;
}

export default function Tweaks({
  onVideoSelected,
  captions,
  onEditCaption,
  onEditTextStyle,
  onRenderRequested,
}: TweaksProps) {
  const [tab, setTab] = useState(0);
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(0);
  const selectedCaption = useMemo(() => {
    if (captions) {
      return captions[selectedCaptionIndex];
    }
  }, [captions, selectedCaptionIndex]);

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
      onVideoSelected(selected);
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
            disabled={captions === undefined}
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
            onClick={onRenderRequested}
            disabled={captions === undefined}
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
            {captions &&
              captions.map((caption, index) => {
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
                  onEditCaption(selectedCaptionIndex, {
                    ...selectedCaption,
                    text: event.currentTarget.value,
                  });
                  setSelectedCaptionIndex(selectedCaptionIndex);
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      <Box hidden={tab !== 2} style={{ height: "100%", width: "100%" }}>
        <TextCustomization onEditTextStyle={onEditTextStyle} />
      </Box>
    </>
  );
}
