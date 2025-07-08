import { Checkbox, Paper, Slider, Typography } from "@mui/material";
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
  y: number;
  fontSize: number;
};

type StyleDispatchAction =
  | { type: "SET_TEXT_COLOR"; payload: HsvaColor }
  | { type: "SET_HIGHLIGHT_COLOR"; payload: HsvaColor }
  | { type: "SET_TEXT_OUTLINE"; payload: boolean }
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
    textOutline: false,
    y: 0,
    fontSize: 4,
  });

  useEffect(() => {
    const shadowBase = `0px 0px 50px ${hsvaToHex(
      style.color
    )},0px 0px 150px white,0px 0px 80px ${hsvaToHex(style.color)}`;
    const textShadow = style.textOutline
      ? `-1px -1px 5px black, ${shadowBase}`
      : shadowBase;

    updateStyle({
      textShadow,
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Paper>
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
        </Paper>

        <Paper>
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
        </Paper>
      </Box>

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
          width: "50%",
        }}
      />
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
          width: "50%",
        }}
      />
      <Checkbox
        title="Outline"
        value={style.textOutline}
        onChange={(event) => {
          dispatchStyle({
            type: "SET_TEXT_OUTLINE",
            payload: event.currentTarget.checked,
          });
        }}
      />
    </Box>
  );
}
