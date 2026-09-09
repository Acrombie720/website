import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import interviewCardBg from "../../../../assets/images/interview-card-bg.webp";

const problemCards = [
  {
    title: "CVs can't show fluency",
    description:
      'Two candidates write the same two letters - "AI". One is masterful, one is just getting started. On paper, they are exactly the same person.',
    type: "cv",
  },
  {
    title: "Interviews skim the surface",
    description:
      "Talking about how you work with AI and actually doing it are two different skills. A conversation can only ever test the first one.",
    type: "interview",
  },
  {
    title: "Most assessments ban AI",
    description:
      "Assessment platforms that try to sandbox or ban AI usage have become outdated. Future-proof skills are not cheating, don't lose out on top talent.",
    type: "assessment",
  },
] as const;

export const CandidateEvaluationProblemSection = (): JSX.Element => {
  return (
    <section
      aria-labelledby="candidate-evaluation-problem-title"
      className="relative flex w-full flex-col items-start justify-center gap-[42px]"
    >
      <header className="flex w-full flex-col items-start justify-between gap-6 lg:flex-row">
        <div className="flex max-w-[802px] flex-col items-start gap-[22px]">
          <h2
            id="candidate-evaluation-problem-title"
            className="[font-family:'Ovo',Helvetica] text-[36px] font-normal leading-[1.08] tracking-[0] text-[#1e1e1e] sm:text-[50px]"
          >
            A master and a beginner look identical on paper.
          </h2>
          <p className="[font-family:'Poppins',Helvetica] text-lg font-normal leading-[normal] tracking-[0] text-[#5f5f5f]">
            The gap between a candidate who&apos;s masterful with AI and one
            who&apos;s only just opened it is enormous and none of your old
            assessment tools can tell them apart.
          </p>
        </div>
        <p className="order-first shrink-0 [font-family:'Poppins',Helvetica] text-[22px] font-normal leading-[normal] tracking-[0] text-[#5474a1] lg:order-none">
          THE PROBLEM
        </p>
      </header>
      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
        {problemCards.map((card) => {
          const isInterview = card.type === "interview";

          return (
            <Card
              key={card.title}
              className={
                isInterview
                  ? "min-h-[345px] overflow-hidden border-0 bg-cover bg-center shadow-none"
                  : "min-h-[345px] border-0 bg-white shadow-none"
              }
              style={
                isInterview
                  ? {
                      backgroundImage: `linear-gradient(180deg, rgba(26,26,26,0) 0%, rgba(26,26,26,1) 73%), url(${interviewCardBg})`,
                    }
                  : undefined
              }
            >
              {isInterview ? (
                <>
                  <CardHeader className="sr-only">
                    <CardTitle>{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex min-h-[345px] flex-col justify-end p-[22px]">
                    <div className="flex flex-col items-start gap-2.5">
                      <CardTitle className="[font-family:'Poppins',Helvetica] text-[22px] font-medium leading-[normal] tracking-[0] text-white">
                        {card.title}
                      </CardTitle>
                      <p className="[font-family:'Poppins',Helvetica] text-lg font-normal leading-[normal] tracking-[0] text-[#dfdfdf]">
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader className="p-[22px] pb-0">
                    {card.type === "cv" ? (
                      <div
                        aria-hidden="true"
                        className="relative h-14 w-[127px]"
                      >
                        <span className="absolute left-0 top-px whitespace-nowrap [font-family:'Reenie_Beanie',Helvetica] text-[53.6px] font-normal leading-[normal] tracking-[0] text-[#e4e4e4]">
                          AI
                        </span>
                        <span className="absolute left-[67px] top-0 whitespace-nowrap [font-family:'Waterfall',Helvetica] text-[53.6px] font-normal leading-[normal] tracking-[0] text-[#e4e4e4]">
                          AI
                        </span>
                      </div>
                    ) : (
                      <div
                        aria-hidden="true"
                        className="relative h-14 w-[127px]"
                      >
                        <span className="absolute left-0 top-px [font-family:'Shalimar',Helvetica] text-[53.6px] font-normal leading-[normal] tracking-[0] text-[#e4e4e4]">
                          X
                        </span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex min-h-[245px] flex-col justify-end p-[22px] pt-0">
                    <div className="flex flex-col items-start gap-2.5">
                      <CardTitle className="[font-family:'Poppins',Helvetica] text-[22px] font-medium leading-[normal] tracking-[0] text-[#1e1e1e]">
                        {card.title}
                      </CardTitle>
                      <p className="[font-family:'Poppins',Helvetica] text-lg font-normal leading-[normal] tracking-[0] text-[#5f5f5f]">
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
};
