import GlitchCanvasLoader from "@/components/canvas/GlitchCanvasLoader";

export default function Home() {
  return (
    <main>
      {/* Key Visual */}
      <section className="relative h-screen w-full overflow-hidden bg-[#2E1245]">
        <GlitchCanvasLoader />

        {/* Text overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-[8rem] leading-none text-[#FFD700] drop-shadow-[0_0_24px_rgba(255,215,0,0.6)] md:text-[14rem]" style={{ fontFamily: "var(--font-qwigley)" }}>
            Lyrics
          </h1>
          <p className="mt-12 font-mono text-sm tracking-[0.5em] text-[#CCCCCC] uppercase md:mt-16">
            Your Music. Your Words.
          </p>
        </div>
      </section>
    </main>
  );
}
