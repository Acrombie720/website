import { Card, CardContent } from "../../../../components/ui/card";
import { AnimatedFrame } from "./AnimatedFrame";

const workflowSteps = [
  {
    title: "Design it with us",
    description:
      "We work with your team to customise the task around your bar: the objective, the brief, and the weightings that reflect a real-world scenario at your company.",
    imagePosition: "right",
    animation: "./animations/design-it-with-us.html",
    naturalWidth: 1040,
    naturalHeight: 731,
    fit: "contain",
  },
  {
    title: "Deploy from your ATS",
    description:
      "Move a candidate into the assessment stage and they get a single-use link. Scores and feedback come straight back into the ATS. Scheduling and email sit in the same flow. No invigilators.",
    emphasis: "Fully integrated with your ATS.",
    imagePosition: "left",
    animation: "./animations/deploy-from-ats.html",
    naturalWidth: 1100,
    naturalHeight: 216,
    fit: "contain",
    edgeFade: true,
  },
  {
    title: "Decide with evidence",
    description:
      "Every candidate lands in one dashboard, ranked by three scores weighted your way. Read the full transcript. Jump the chaptered video straight to the moments that matter - where they diagnosed the problem, briefed the AI, caught its mistake, shipped the file.",
    imagePosition: "right",
    animation: "./animations/decide-with-evidence.html",
    naturalWidth: 1260,
    naturalHeight: 900,
    fit: "contain",
  },
] as const;

export const AssessmentWorkflowSection = (): JSX.Element => {
  return (
    <section
      aria-labelledby="assessment-workflow-title"
      className="flex w-full flex-col items-start justify-center gap-[42px] rounded-xl bg-white p-[22px]"
    >
      <header className="flex w-full flex-col items-start justify-between gap-6 sm:flex-row">
        <div className="flex max-w-[802px] flex-col items-start gap-[22px]">
          <h2
            id="assessment-workflow-title"
            className="[font-family:'Ovo',Helvetica] text-[36px] font-normal leading-[normal] tracking-[0] text-[#1e1e1e] sm:text-[50px]"
          >
            Design. Deploy. Decide.
          </h2>
          <p className="[font-family:'Poppins',Helvetica] text-lg font-normal leading-[normal] tracking-[0] text-[#5f5f5f]">
            One consultative build with our team then it runs itself, at any
            volume.
          </p>
        </div>
        <p className="order-first shrink-0 [font-family:'Poppins',Helvetica] text-[22px] font-normal leading-[normal] tracking-[0] text-[#5474a1] sm:order-none">
          HOW IT WORKS
        </p>
      </header>
      <div className="flex w-full flex-col gap-[42px]">
        {workflowSteps.map((step) => {
          const imageIsLeftOnDesktop = step.imagePosition === "left";

          const textContent = (
            <div
              className={`flex w-full min-w-0 max-w-[542px] flex-col items-start gap-2.5 px-3 py-0 ${imageIsLeftOnDesktop ? "order-1 md:order-2" : ""}`}
            >
              <h3 className="[font-family:'Poppins',Helvetica] text-[22px] font-medium leading-[normal] tracking-[0] text-[#1e1e1e]">
                {step.title}
              </h3>
              <p className="[font-family:'Poppins',Helvetica] text-lg font-normal leading-[normal] tracking-[0] text-[#5f5f5f]">
                {step.emphasis && (
                  <>
                    <strong className="font-medium">
                      {step.emphasis}
                    </strong>{" "}
                  </>
                )}
                {step.description}
              </p>
            </div>
          );

          const imageContent = (
            <div
              className={`min-w-0 ${imageIsLeftOnDesktop ? "order-2 md:order-1" : ""}`}
            >
              <AnimatedFrame
                src={step.animation}
                title={step.title}
                naturalWidth={step.naturalWidth}
                naturalHeight={step.naturalHeight}
                fit={step.fit}
                edgeFade={"edgeFade" in step ? step.edgeFade : false}
              />
            </div>
          );

          return (
            <Card
              key={step.title}
              className="w-full overflow-hidden rounded-xl border border-dashed border-[#92bad5] bg-transparent shadow-none"
            >
              <CardContent className="grid items-center gap-6 px-8 py-6 md:grid-cols-2 md:gap-8 md:py-1.5">
                {textContent}
                {imageContent}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
