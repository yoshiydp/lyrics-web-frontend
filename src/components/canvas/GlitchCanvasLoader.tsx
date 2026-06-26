"use client";

import dynamic from "next/dynamic";

const GlitchCanvas = dynamic(() => import("./GlitchCanvas"), { ssr: false });

export default function GlitchCanvasLoader() {
  return <GlitchCanvas />;
}
