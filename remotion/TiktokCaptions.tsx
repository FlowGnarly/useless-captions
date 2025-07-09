import { SxProps, Theme, Typography } from "@mui/material";
import { TikTokPage } from "@remotion/captions";
import { useMemo } from "react";
import { OffthreadVideo, useCurrentFrame, useVideoConfig } from "remotion";

export type TiktokCaptionsCompositionProps = {
  videoUrl: string;
  captionsOnly: boolean;
  captionAsPages: TikTokPage[];
  textStyle?: SxProps<Theme>;
};

export const TiktokCaptionsComposition = ({
  videoUrl,
  captionsOnly,
  captionAsPages,
  textStyle,
}: TiktokCaptionsCompositionProps) => {
  const frame = useCurrentFrame();
  const config = useVideoConfig();
  const time = useMemo(() => {
    return (frame / config.fps) * 1000;
  }, [frame, config]);

  const pageIndex = useMemo(() => {
    let pageIndex = -1;

    for (let i = captionAsPages.length - 1; i >= 0; i--) {
      if (time >= captionAsPages[i].startMs) {
        pageIndex = i;
        break;
      }
    }

    return pageIndex;
  }, [captionAsPages, time]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        key={pageIndex}
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
        {pageIndex > -1 &&
          captionAsPages[pageIndex].tokens.map((token, index) => {
            const higlight = token.fromMs <= time && token.toMs > time;

            return (
              <Typography
                key={index}
                data-highlight={higlight ? "" : undefined}
                component="span"
                sx={{
                  color: "white",
                  fontSize: "4em",
                  whiteSpace: "pre",
                  backgroundColor: "transparent",
                  "&[data-highlight]": {
                    backgroundColor: "red",
                  },
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

      {captionsOnly ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "black",
          }}
        />
      ) : (
        <OffthreadVideo
          src={videoUrl}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
};
