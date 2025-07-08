import { Checkbox, Paper, Slider, SxProps, Typography } from "@mui/material";
import { Box, Theme } from "@mui/system";
import { HsvaColor, hsvaToHex } from "@uiw/color-convert";
import ShadeSlider from "@uiw/react-color-shade-slider";
import Wheel from "@uiw/react-color-wheel";
import { useEffect, useReducer } from "react";

type TextStyleState = {
  textColor: HsvaColor;
  highlightColor: HsvaColor;
  textOutline: boolean;
  textY: number;
};

type TextStyleDispatchAction =
  | { type: "SET_TEXT_COLOR"; payload: HsvaColor }
  | { type: "SET_HIGHLIGHT_COLOR"; payload: HsvaColor }
  | { type: "SET_TEXT_OUTLINE"; payload: boolean }
  | { type: "SET_TEXT_Y"; payload: number };

function textStyleReducer(
  state: TextStyleState,
  action: TextStyleDispatchAction
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

export default function TextCustomization({
  onEditTextStyle,
}: {
  onEditTextStyle: (changes: SxProps<Theme>) => void;
}) {
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
  );
}
