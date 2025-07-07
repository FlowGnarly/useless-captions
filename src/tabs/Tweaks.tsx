import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Divider,
  Paper,
  Slider,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import Wheel from "@uiw/react-color-wheel";
import ShadeSlider from "@uiw/react-color-shade-slider";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InputIcon from "@mui/icons-material/Input";
import CaptionIcon from "@mui/icons-material/ClosedCaption";
import EditIcon from "@mui/icons-material/Edit";
import { open } from "@tauri-apps/plugin-dialog";
import { useEffect, useMemo, useState } from "react";
import { Caption } from "@remotion/captions";
import { HsvaColor, hsvaToHex } from "@uiw/color-convert";

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

  const [textColor, setTextColor] = useState<HsvaColor>({
    h: 214,
    s: 43,
    v: 90,
    a: 1,
  });
  const [highlightColor, setHighlightColor] = useState<HsvaColor>({
    h: 214,
    s: 43,
    v: 90,
    a: 1,
  });
  const [textOutline, setTextOutline] = useState(false);
  const [textY, setTextY] = useState<number>(0);

  useEffect(() => {
    let textShadowEffect = `0px 0px 50px ${hsvaToHex(
      textColor
    )},0px 0px 150px white,0px 0px 80px ${hsvaToHex(textColor)}`;

    if (textOutline) {
      textShadowEffect = `-1px -1px 5px black, ${textShadowEffect}`;
    }

    onEditTextStyle({
      textShadow: textShadowEffect,
      color: hsvaToHex(textColor),
    });
  }, [textColor, textOutline]);

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
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflowY: "scroll",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Paper>
              <Typography variant="h5">Primary Color</Typography>
              <Wheel
                color={textColor}
                onChange={(color) => {
                  setTextColor(color.hsva);
                }}
              />
              <ShadeSlider
                hsva={textColor}
                onChange={(newShade) => {
                  const color = { ...textColor, ...newShade };
                  setTextColor(color);
                }}
              />
            </Paper>

            <Paper>
              <Typography variant="h5">Highlight Color</Typography>
              <Wheel
                color={highlightColor}
                onChange={(color) => {
                  setHighlightColor(color.hsva);
                  onEditTextStyle({
                    "&[data-highlight]": {
                      backgroundColor: color.hex,
                    },
                  });
                }}
              />
              <ShadeSlider
                hsva={highlightColor}
                onChange={(newShade) => {
                  const color = { ...highlightColor, ...newShade };
                  setHighlightColor(color);
                  onEditTextStyle({
                    "&[data-highlight]": {
                      backgroundColor: hsvaToHex(color),
                    },
                  });
                }}
              />
            </Paper>
          </Box>

          <Slider
            value={textY}
            onChange={(_, value) => {
              setTextY(value);
              onEditTextStyle({
                transform: `translate(0, ${value}px)`,
              });
            }}
            min={-1000}
            max={1000}
            sx={{
              width: "50%",
            }}
          />
          <Checkbox
            title="Outline"
            value={textOutline}
            onChange={(event) => {
              setTextOutline(event.currentTarget.checked);
            }}
          />
        </Box>
      </Box>
    </>
  );
}
