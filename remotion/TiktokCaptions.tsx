import { SxProps, Theme, Typography } from "@mui/material";
import { TikTokPage } from "@remotion/captions";
import { type ParseMediaSrc } from "@remotion/media-parser";
import { useMemo } from "react";
import { OffthreadVideo, useCurrentFrame, useVideoConfig } from "remotion";

export type TiktokCaptionsCompositionProps = {
  videoUrl: string;
  mediaParseUrl?: ParseMediaSrc;
  captionAsPages: TikTokPage[];
  textStyle?: SxProps<Theme>;
};

export const TiktokCaptionsComposition = ({
  videoUrl,
  captionAsPages,
  textStyle,
}: TiktokCaptionsCompositionProps) => {
  const frame = useCurrentFrame();
  const config = useVideoConfig();
  const time = useMemo(() => {
    return (frame / config.fps) * 1000;
  }, [frame, config]);

  const page = useMemo(() => {
    return [...captionAsPages].reverse().find((page) => time >= page.startMs);
  }, [captionAsPages, time]);

  const highlightedTokenIndex = useMemo(() => {
    if (!page) return -1;

    return page.tokens.findIndex(
      (token) => time >= token.fromMs && time < token.toMs
    );
  }, [page, time]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        style={{
          position: "absolute",
          left: config.width / 2,
          top: config.height / 2,
          transform: `translate(-${(config.width * 0.9) / 2}px)`,
          width: config.width * 0.9,
          maxWidth: "100%",
          flexWrap: "wrap",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {page &&
          page.tokens.map((token, index) => {
            return (
              <Typography
                key={index}
                data-highlight={
                  index === highlightedTokenIndex ? "" : undefined
                }
                component="span"
                sx={{
                  color: "white",
                  fontSize: "4em",
                  whiteSpace: "pre",
                  backgroundColor: "transparent",
                  "&[data-highlight]": {
                    backgroundColor: "red",
                  },
                  transition: "all 80ms ease-out",
                  borderRadius: 4,
                  fontFamily: "impact",
                  // eslint-disable-next-line @remotion/slow-css-property
                  textShadow:
                    "0px 0px 50px white,0px 0px 150px white,0px 0px 80px white",
                  ...textStyle,
                }}
              >
                {token.text}
              </Typography>
            );
          })}
      </div>

      <OffthreadVideo
        src={videoUrl}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
