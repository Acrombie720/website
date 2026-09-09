import { Button } from "../../../../components/ui/button";
import heroBackground from "../../../../assets/images/hero-mountains.webp";
import heroOverlapFlowers from "../../../../assets/images/hero-flowers-overlap.webp";
import aiTestsDefault from "../../../../assets/ai-tests-default.svg";
import candidateScreenshareVideo from "../../../../assets/video/candidate-screenshare.mp4";

const heroActions = [
  {
    label: "Book a Demo",
    href: "https://calendly.com/callum-calyptus/30m",
    className:
      "h-auto w-[164px] rounded-xl bg-[#92bad5] px-[22px] py-3 [font-family:'Poppins',Helvetica] text-sm font-medium text-white shadow-none hover:bg-[#7da8bf]",
  },
  {
    label: "See How It Works",
    href: "#how-it-works",
    className:
      "h-auto w-[164px] rounded-xl border border-solid border-[#7da8bf] bg-[#f0f4f6] px-[22px] py-3 [font-family:'Poppins',Helvetica] text-sm font-medium text-[#7da8bf] shadow-none hover:bg-[#e4edf1]",
  },
];

export const HeroSection = (): JSX.Element => {
  return (
    <section className="w-full">
      <header className="relative z-10 mx-auto flex h-auto w-full max-w-[864px] flex-col items-center justify-center gap-4 px-2.5 pt-4 pb-2.5 sm:gap-[22px]">
        <h1 className="w-full max-w-[781.23px] [font-family:'Ovo',Helvetica] text-center text-[44px] font-normal leading-[1.14] tracking-[0] text-[#1e1e1e] sm:text-[54px] sm:leading-[1.12] md:text-[62px] md:leading-[1.08]">
          Reveal the candidates
          <br />
          who are brilliant with AI.
        </h1>
        <p className="w-full max-w-[716.72px] [font-family:'Poppins',Helvetica] text-center text-base font-normal leading-[normal] tracking-[0] text-[#5f5f5f] md:text-lg">
          See the work, not the CV. Fluencyfox gives candidates a real-world
          task using the AI tools they&apos;d use on day one, and hands you
          three things: a full session recording, the solution they shipped, and
          scores on how they built, used AI, and communicated.
        </p>
        <nav
          aria-label="Hero actions"
          className="flex flex-wrap justify-center gap-3"
        >
          {heroActions.map((action) => (
            <Button key={action.label} asChild className={action.className}>
              <a href={action.href}>{action.label}</a>
            </Button>
          ))}
        </nav>
      </header>
      <div className="relative left-1/2 grid w-[100vw] max-w-[100vw] -translate-x-1/2 grid-cols-1">
        <img
          className="col-start-1 row-start-1 -mt-[80px] h-auto w-[100vw] max-w-none rounded-t-none rounded-b-[12px] object-top"
          alt="Rectangle"
          src={heroBackground}
        />
        <div className="relative z-10 col-start-1 row-start-1 mt-[4.8%] w-[83.47%] justify-self-center self-start">
          <img
            className="block w-full"
            alt="Ai tests default"
            src={aiTestsDefault}
          />
          {/* Candidate screenshare window: positioned to match the rounded
              rect baked into ai-tests-default.svg (x:319.536 y:188.676
              w:120.201 h:72.1582 within a 1202x682 viewBox). Percentages
              are relative to this wrapper, which shares the graphic's
              aspect ratio, so the video stays aligned at every width. */}
          <video
            className="absolute rounded-[6px] object-cover"
            style={{
              left: "26.583%",
              top: "27.665%",
              width: "10.000%",
              height: "10.581%",
            }}
            autoPlay
            loop
            muted
            playsInline
            src={candidateScreenshareVideo}
          />
        </div>
        <img
          className="relative z-20 col-start-1 row-start-1 mt-[calc(16.42%_-_80px)] w-[99.86%] rounded-b-[12px] justify-self-center"
          alt="Overlap img"
          src={heroOverlapFlowers}
        />
      </div>
    </section>
  );
};
