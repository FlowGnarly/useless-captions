import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useVideoConfigCtx } from "../../context/videoConfig";

export default function CaptionEditor() {
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(0);

  const { config: videoConfig, setConfig: setVideoConfig } =
    useVideoConfigCtx();

  const selectedCaption = useMemo(() => {
    if (videoConfig.captions) {
      return videoConfig.captions[selectedCaptionIndex];
    }
  }, [videoConfig.captions, selectedCaptionIndex]);

  return (
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
                  data-active={selectedCaptionIndex === index ? "" : undefined}
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
  );
}
