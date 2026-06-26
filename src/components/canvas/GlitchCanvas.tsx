"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import GlitchScene from "./GlitchScene";

export default function GlitchCanvas() {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      camera={{ position: [0, 0, 1], fov: 75 }}
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
      resize={{ debounce: 0 }}
    >
      <Suspense fallback={null}>
        <GlitchScene />
      </Suspense>
    </Canvas>
  );
}
