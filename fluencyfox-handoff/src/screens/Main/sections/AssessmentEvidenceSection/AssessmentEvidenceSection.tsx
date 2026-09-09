import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "../../../../components/ui/card";

const TYPEWRITER_TEXT =
  "An hour of tomorrow's work\nproves yesterday's interview.";

/** Types TYPEWRITER_TEXT out a character at a time, starting the moment the
 * quote scrolls into view. Falls back to showing the full text immediately
 * when reduced motion is preferred. */
const useTypewriter = (text: string, speed = 32) => {
  const ref = useRef<HTMLElement | null>(null);
  const [output, setOutput] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setOutput(text);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setOutput(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [started, text, speed]);

  return { ref, output, done: output.length >= text.length };
};

const evidenceCards = [
  {
    type: "screen-capture",
    title: (
      <>
        Full screen capture,
        <br />
        no sandbox.
      </>
    ),
    description:
      "The whole session. Every tool and tab. Not a locked environment, and not a webcam guess.",
    asset: "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/frame-423414.svg",
  },
  {
    type: "camera",
    title: "Camera on, identity verified",
    description:
      "It's really them, in the moment - every session is authentic, on the record, and fair to every candidate.",
    asset:
      "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/frame-423408-1.png",
  },
  {
    type: "voice",
    title: "Voice throughout, transcribed",
    description:
      "Candidates think aloud for the whole build. You get every word, searchable, next to the video.",
    asset: "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/group.png",
  },
  {
    type: "replay",
    title: "Every minute replayable",
    description:
      "Chaptered video takes you straight to the decisions, no scrubbing through an hour of footage.",
    asset: "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/frame.svg",
  },
] as const;

export const AssessmentEvidenceSection = (): JSX.Element => {
  const { ref: quoteRef, output, done } = useTypewriter(TYPEWRITER_TEXT);

  return (
    <section
      aria-labelledby="assessment-evidence-heading"
      className="flex w-full max-w-[1238px] flex-col items-center gap-[72px]"
    >
      <div className="flex w-full flex-col gap-[42px]">
        <header className="flex w-full flex-col items-start justify-between gap-6 sm:flex-row">
          <h2
            id="assessment-evidence-heading"
            className="[font-family:'Ovo',Helvetica] text-[36px] font-normal leading-[normal] tracking-[0] text-[#1e1e1e] sm:text-[50px]"
          >
            Evidence, not claims.
          </h2>
          <p className="order-first shrink-0 [font-family:'Poppins',Helvetica] text-[22px] font-normal leading-[normal] tracking-[0] text-[#5474a1] sm:order-none">
            AUTHENTICITY
          </p>
        </header>
        <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-4">
          {evidenceCards.map((card) => {
            if (card.type === "camera") {
              return (
                <Card
                  key={card.type}
                  className="grid min-h-[395px] overflow-hidden rounded-xl border-0 bg-transparent shadow-none"
                >
                  <CardContent
                    className="col-start-1 row-start-1 flex min-h-[395px] flex-col px-[22px] pb-[22px] pt-[189px] text-white"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(26, 26, 26, 0) 0%, rgba(26, 26, 26, 1) 73%), url(${card.asset})`,
                      backgroundPosition: "50% 50%",
                      backgroundSize: "cover",
                    }}
                  >
                    <h3 className="[font-family:'Poppins',Helvetica] text-[22px] font-medium leading-[normal] tracking-[0]">
                      {card.title}
                    </h3>
                    <p className="mt-2.5 [font-family:'Poppins',Helvetica] text-lg font-normal leading-[normal] tracking-[0]">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card
                key={card.type}
                className="min-h-[395px] rounded-xl border-0 bg-[#92bad5] shadow-none"
              >
                <CardContent className="flex min-h-[395px] flex-col justify-between p-[22px] text-white">
                  {card.type === "screen-capture" && (
                    <img
                      className="w-full"
                      alt="Full screen capture illustration"
                      src={card.asset}
                    />
                  )}

                  {card.type === "voice" && (
                    <img
                      className="h-[25.95px] w-[146.76px]"
                      alt="Voice transcription"
                      src={card.asset}
                    />
                  )}

                  {card.type === "replay" && (
                    <div className="flex items-center gap-[7.64px]">
                      <img
                        className="h-[12.74px] w-[12.74px]"
                        alt=""
                        src={card.asset}
                      />
                      <span className="[font-family:'Poppins',Helvetica] text-[17.8px] font-normal leading-[25px] tracking-[0] text-[#f0f4f6]">
                        41:20
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5">
                    <h3 className="[font-family:'Poppins',Helvetica] text-[22px] font-medium leading-[normal] tracking-[0]">
                      {card.title}
                    </h3>
                    <p className="[font-family:'Poppins',Helvetica] text-lg font-normal leading-[normal] tracking-[0]">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <blockquote
        ref={quoteRef}
        className="max-w-[1000px] whitespace-pre-line [font-family:'Ovo',Helvetica] text-center text-[62px] font-normal leading-[normal] tracking-[0] text-[#92bad5]"
      >
        “{output}
        {!done && (
          <span className="animate-pulse" aria-hidden="true">
            |
          </span>
        )}
        ”
      </blockquote>
    </section>
  );
};
