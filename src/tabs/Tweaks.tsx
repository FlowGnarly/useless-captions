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
import { useEffect, useMemo, useReducer, useState } from "react";
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

type TextStyleState = {
  textColor: HsvaColor;
  highlightColor: HsvaColor;
  textOutline: boolean;
  textY: number;
};

type Action =
  | { type: "SET_TEXT_COLOR"; payload: HsvaColor }
  | { type: "SET_HIGHLIGHT_COLOR"; payload: HsvaColor }
  | { type: "SET_TEXT_OUTLINE"; payload: boolean }
  | { type: "SET_TEXT_Y"; payload: number };

function textStyleReducer(
  state: TextStyleState,
  action: Action
): TextStyleState {
  switch (action.type) {
    case "SET_TEXT_COLOR":
      return { ...state, textColor: action.payload };
    case "SET_HIGHLIGHT_COLOR":
      return { ...state, highlightColor: action.payload };
    case "SET_TEXT_OUTLINE":
      return { ...state, textOutline: action.payload };
    case "SET_TEXT_Y":
      return { ...state, textY: action.payload };
    default:
      return state;
  }
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

  const [textStyle, dispatchTextStyle] = useReducer(textStyleReducer, {
    textColor: { h: 214, s: 43, v: 90, a: 1 },
    highlightColor: { h: 214, s: 43, v: 90, a: 1 },
    textOutline: false,
    textY: 0,
  });

  useEffect(() => {
    const shadowBase = `0px 0px 50px ${hsvaToHex(
      textStyle.textColor
    )},0px 0px 150px white,0px 0px 80px ${hsvaToHex(textStyle.textColor)}`;
    const textShadow = textStyle.textOutline
      ? `-1px -1px 5px black, ${shadowBase}`
      : shadowBase;

    onEditTextStyle({
      textShadow,
      color: hsvaToHex(textStyle.textColor),
      "&[data-highlight]": {
        backgroundColor: hsvaToHex(textStyle.highlightColor),
      },
      transform: `translate(0, ${textStyle.textY}px)`,
    });
  }, [textStyle]);

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
                color={textStyle.textColor}
                onChange={(color) => {
                  dispatchTextStyle({
                    type: "SET_TEXT_COLOR",
                    payload: color.hsva,
                  });
                }}
              />
              <ShadeSlider
                hsva={textStyle.textColor}
                onChange={(newShade) => {
                  dispatchTextStyle({
                    type: "SET_TEXT_COLOR",
                    payload: { ...textStyle.textColor, ...newShade },
                  });
                }}
              />
            </Paper>

            <Paper>
              <Typography variant="h5">Highlight Color</Typography>
              <Wheel
                color={textStyle.highlightColor}
                onChange={(color) => {
                  dispatchTextStyle({
                    type: "SET_HIGHLIGHT_COLOR",
                    payload: color.hsva,
                  });
                }}
              />
              <ShadeSlider
                hsva={textStyle.highlightColor}
                onChange={(newShade) => {
                  dispatchTextStyle({
                    type: "SET_HIGHLIGHT_COLOR",
                    payload: { ...textStyle.highlightColor, ...newShade },
                  });
                }}
              />
            </Paper>
          </Box>

          <Slider
            value={textStyle.textY}
            onChange={(_, value) => {
              dispatchTextStyle({
                type: "SET_TEXT_Y",
                payload: value,
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
            value={textStyle.textOutline}
            onChange={(event) => {
              dispatchTextStyle({
                type: "SET_TEXT_OUTLINE",
                payload: event.currentTarget.checked,
              });
            }}
          />
        </Box>
      </Box>
    </>
  );
}
