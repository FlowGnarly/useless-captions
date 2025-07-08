import { SxProps, Theme } from "@mui/material";
import { createContext, useContext, useState } from "react";

type CaptionStyleContextType = {
  style: SxProps<Theme>;
  updateStyle: (patch: SxProps<Theme>) => void;
};

const CaptionStyleCtx = createContext<CaptionStyleContextType | null>(null);

export default function CaptionStyleProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  const [style, setStyle] = useState<SxProps<Theme>>({});

  function updateStyle(patch: SxProps<Theme>) {
    return setStyle((prev: SxProps<Theme>) => ({ ...prev, ...patch }));
  }

  return (
    <CaptionStyleCtx.Provider value={{ style, updateStyle }}>
      {children}
    </CaptionStyleCtx.Provider>
  );
}

export function useCaptionStyleCtx() {
  const ctx = useContext(CaptionStyleCtx);
  if (!ctx)
    throw new Error("useCaptionStyle must be used within CaptionStyleProvider");
  return ctx;
}
