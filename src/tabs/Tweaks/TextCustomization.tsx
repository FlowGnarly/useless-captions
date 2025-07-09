import {
  Card,
  CardContent,
  Checkbox,
  Paper,
  Slider,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { HsvaColor, hsvaToHex } from "@uiw/color-convert";
import ShadeSlider from "@uiw/react-color-shade-slider";
import Wheel from "@uiw/react-color-wheel";
import { useEffect, useReducer } from "react";
import { useCaptionStyleCtx } from "../../context/captionStyle";

type StyleState = {
  color: HsvaColor;
  highlightColor: HsvaColor;
  textOutline: boolean;
  textGlow: boolean;
  textGlowStrength: number;
  y: number;
  fontSize: number;
};

type StyleDispatchAction =
  | { type: "SET_TEXT_COLOR"; payload: HsvaColor }
  | { type: "SET_HIGHLIGHT_COLOR"; payload: HsvaColor }
  | { type: "SET_TEXT_OUTLINE"; payload: boolean }
  | { type: "SET_TEXT_GLOW"; payload: boolean }
  | { type: "SET_TEXT_GLOW_STRENGTH"; payload: number }
  | { type: "SET_TEXT_Y"; payload: number }
  | { type: "SET_FONT_SIZE"; payload: number };

function styleReducer(
  state: StyleState,
  action: StyleDispatchAction
): StyleState {
  switch (action.type) {
    case "SET_TEXT_COLOR":
      return { ...state, color: action.payload };
    case "SET_HIGHLIGHT_COLOR":
      return { ...state, highlightColor: action.payload };
    case "SET_TEXT_OUTLINE":
      return { ...state, textOutline: action.payload };
    case "SET_TEXT_GLOW":
      return { ...state, textGlow: action.payload };
    case "SET_TEXT_GLOW_STRENGTH":
      return {
        ...state,
        textGlowStrength: action.payload,
      };
    case "SET_TEXT_Y":
      return { ...state, y: action.payload };
    case "SET_FONT_SIZE":
      return { ...state, fontSize: action.payload };
    default:
      return state;
  }
}

export default function TextCustomization() {
  const { updateStyle } = useCaptionStyleCtx();

  const [style, dispatchStyle] = useReducer(styleReducer, {
    color: { h: 214, s: 43, v: 90, a: 1 },
    highlightColor: { h: 214, s: 43, v: 90, a: 1 },
    textOutline: true,
    textGlow: true,
    textGlowStrength: 50,
    y: 0,
    fontSize: 4,
  });

  useEffect(() => {
    const textShadow: (string | undefined)[] = [
      style.textOutline ? "-1px -1px 5px black" : undefined,
      style.textGlow
        ? `0px 0px ${style.textGlowStrength}px ${hsvaToHex(
            style.color
          )},0px 0px ${style.textGlowStrength * 2}px ${hsvaToHex(
            style.color
          )},0px 0px ${style.textGlowStrength * 3}px ${hsvaToHex(style.color)}`
        : undefined,
    ];

    updateStyle({
      textShadow: textShadow.filter((v) => v !== undefined).join(", "),
      color: hsvaToHex(style.color),
      "&[data-highlight]": {
        backgroundColor: hsvaToHex(style.highlightColor),
      },
      transform: `translate(0, ${style.y}px)`,
      fontSize: `${style.fontSize}em`,
    });
  }, [style]);

  return (
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
      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          width: "50%",
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h5">Primary Color</Typography>
            <Wheel
              color={style.color}
              onChange={(color) => {
                dispatchStyle({
                  type: "SET_TEXT_COLOR",
                  payload: color.hsva,
                });
              }}
            />
            <ShadeSlider
              hsva={style.color}
              onChange={(newShade) => {
                dispatchStyle({
                  type: "SET_TEXT_COLOR",
                  payload: { ...style.color, ...newShade },
                });
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h5">Highlight Color</Typography>
            <Wheel
              color={style.highlightColor}
              onChange={(color) => {
                dispatchStyle({
                  type: "SET_HIGHLIGHT_COLOR",
                  payload: color.hsva,
                });
              }}
            />
            <ShadeSlider
              hsva={style.highlightColor}
              onChange={(newShade) => {
                dispatchStyle({
                  type: "SET_HIGHLIGHT_COLOR",
                  payload: { ...style.highlightColor, ...newShade },
                });
              }}
            />
          </CardContent>
        </Card>
      </Paper>

      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          width: "50%",
        }}
      >
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography variant="h5">Y Position</Typography>
            <Slider
              title="Y Position"
              value={style.y}
              onChange={(_, value) => {
                dispatchStyle({
                  type: "SET_TEXT_Y",
                  payload: value,
                });
              }}
              min={-1000}
              max={1000}
              sx={{
                width: "100%",
              }}
            />
          </CardContent>
        </Card>

        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography variant="h5">Font Size</Typography>
            <Slider
              title="Font Size"
              value={style.fontSize}
              onChange={(_, value) => {
                dispatchStyle({
                  type: "SET_FONT_SIZE",
                  payload: value,
                });
              }}
              min={2}
              max={12}
              sx={{
                width: "100%",
              }}
            />
          </CardContent>
        </Card>
      </Paper>

      <Paper
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          width: "50%",
        }}
      >
        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography variant="h5">Outline</Typography>
            <Checkbox
              title="Outline"
              checked={style.textOutline}
              onChange={(event) => {
                dispatchStyle({
                  type: "SET_TEXT_OUTLINE",
                  payload: event.currentTarget.checked,
                });
              }}
            />
          </CardContent>
        </Card>

        <Card sx={{ width: "100%" }}>
          <CardContent>
            <Typography variant="h5">Glow</Typography>
            <Checkbox
              title="Glow"
              checked={style.textGlow}
              onChange={(event) => {
                dispatchStyle({
                  type: "SET_TEXT_GLOW",
                  payload: event.currentTarget.checked,
                });
              }}
            />
            <Slider
              title="Font Size"
              value={style.textGlowStrength}
              onChange={(_, value) =>
                dispatchStyle({
                  type: "SET_TEXT_GLOW_STRENGTH",
                  payload: value,
                })
              }
              min={10}
              max={100}
              sx={{
                width: "100%",
              }}
            />
          </CardContent>
        </Card>
      </Paper>
    </Box>
  );
}
