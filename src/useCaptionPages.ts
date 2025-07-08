import {
  Caption,
  createTikTokStyleCaptions,
  TikTokPage,
} from "@remotion/captions";
import { useMemo } from "react";

export default function useCaptionPages(captions: Caption[]): TikTokPage[];

export default function useCaptionPages(
  captions?: Caption[]
): TikTokPage[] | undefined;

export default function useCaptionPages(captions?: Caption[]) {
  return useMemo(() => {
    if (captions) {
      return createTikTokStyleCaptions({
        captions: captions,
        combineTokensWithinMilliseconds: 780,
      }).pages;
    }
  }, [captions]);
}
