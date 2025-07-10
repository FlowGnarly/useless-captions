import {
  Card,
  CardContent,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Slider,
  Typography,
} from "@mui/material";
import { Box, Grid } from "@mui/system";
import { HsvaColor, hsvaToHex } from "@uiw/color-convert";
import ShadeSlider from "@uiw/react-color-shade-slider";
import Wheel from "@uiw/react-color-wheel";
import { useEffect, useReducer, useState } from "react";
import { useCaptionStyleCtx } from "../../context/captionStyle";
import { invoke } from "@tauri-apps/api/core";

type StyleState = {
  color: HsvaColor;
  highlightColor: HsvaColor;
  textOutline: boolean;
  textGlow: boolean;
  textGlowStrength: number;
  fontIndex: number;
  y: number;
  fontSize: number;
};

type Font = { family: string; style: string };

type StyleDispatchAction =
  | { type: "SET_TEXT_COLOR"; payload: HsvaColor }
  | { type: "SET_HIGHLIGHT_COLOR"; payload: HsvaColor }
  | { type: "SET_TEXT_OUTLINE"; payload: boolean }
  | { type: "SET_TEXT_GLOW"; payload: boolean }
  | { type: "SET_TEXT_GLOW_STRENGTH"; payload: number }
  | { type: "SET_FONT_INDEX"; payload: number }
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
    case "SET_FONT_INDEX":
      return {
        ...state,
        fontIndex: action.payload,
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
    fontIndex: 0,
    y: 0,
    fontSize: 4,
  });

  const [installedFonts, setInstalledFonts] = useState<Font[]>();

  useEffect(() => {
    const font: Font = installedFonts
      ? installedFonts[style.fontIndex]
      : {
          family: "",
          style: "",
        };

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
      font: `${font.style} ${style.fontSize}em ${font.family}`,
      transform: `translate(0, ${style.y}px)`,
    });
  }, [style]);

  useEffect(() => {
    invoke("list_installed_fonts").then((value) => {
      setInstalledFonts(value as Font[]);
    });
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflowY: "auto",
      }}
    >
      <Grid container spacing={5} sx={{ width: "90%", height: "90%" }}>
        <Box>
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
        </Box>

        <Box>
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
        </Box>

        <Box sx={{ width: "50%" }}>
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
        </Box>

        <Box sx={{ width: "50%" }}>
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
        </Box>

        <Box>
          {installedFonts ? (
            <FormControl sx={{ width: "18rem" }}>
              <InputLabel>Font</InputLabel>
              <Select
                value={style.fontIndex}
                onChange={(event) =>
                  dispatchStyle({
                    type: "SET_FONT_INDEX",
                    payload: event.target.value,
                  })
                }
              >
                {installedFonts.map((font, index) => {
                  return (
                    <MenuItem key={index} value={index}>
                      {`${font.family}, ${font.style}`}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          ) : (
            <Skeleton variant="rectangular" width={"18rem"} height={"50px"} />
          )}
        </Box>

        <Box sx={{ width: "50%" }}>
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
        </Box>

        <Box>
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
        </Box>
      </Grid>
    </Box>
  );
}
