import { Card, CardContent } from "../../../../components/ui/card";

const scoringCategories = [
  {
    title: "Solution 70%",
    titleClassName: "text-[#5474a1]",
    imageSrc:
      "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/frame-423333.svg",
    descriptionLead: "What they shipped.",
    description:
      "The file your team would actually receive, judged against the objective you set.",
  },
  {
    title: "Communication 20%",
    titleClassName: "text-[#5c54a1]",
    imageSrc:
      "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/frame-423333-2.svg",
    descriptionLead: "How they think out loud.",
    description:
      "The full session is voiced and transcribed. You are sitting in on the work, not a follow-up chat after it.",
  },
  {
    title: "AI collaboration 10%",
    titleClassName: "text-[#7ea57a]",
    imageSrc:
      "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/frame-423333-1.svg",
    descriptionLead: "How they direct the machine.",
    description:
      "Any tools they like: Claude, GrokBot, n8n, Zapier. What matters is how well they drive them.",
  },
];

export const ScoringFrameworkSection = (): JSX.Element => {
  return (
    <section
      className="flex w-full max-w-[1238px] flex-col items-start justify-center gap-[42px]"
      aria-labelledby="scoring-framework-heading"
    >
      <header className="flex w-full flex-col items-start justify-between gap-6 md:flex-row md:gap-10">
        <div className="flex max-w-[802px] flex-col items-start gap-[22px]">
          <h2
            id="scoring-framework-heading"
            className="[font-family:'Ovo',Helvetica] text-[36px] font-normal leading-[1.08] tracking-[0] text-[#1e1e1e] sm:text-[50px]"
          >
            Three scores.
            <br />
            You set the weights.
          </h2>
          <p className="[font-family:'Poppins',Helvetica] max-w-[802px] text-lg font-normal leading-[normal] tracking-[0] text-[#5f5f5f]">
            Every session is scored on the three things a hiring team actually buys weighted the way you set them.
          </p>
        </div>
        <p className="order-first shrink-0 [font-family:'Poppins',Helvetica] text-[22px] font-normal leading-[normal] tracking-[0] text-[#5474a1] md:order-none">
          WHAT WE MEASURE
        </p>
      </header>
      <div className="grid w-full grid-cols-1 items-start gap-3 md:grid-cols-3">
        {scoringCategories.map((category) => (
          <Card
            key={category.title}
            className="min-h-[420px] rounded-xl border-0 bg-white shadow-none"
          >
            <CardContent className="flex min-h-[420px] flex-col justify-between p-[18px]">
              <div className="flex h-4 w-full max-w-[340px] items-center">
                <img
                  className="h-full w-auto max-w-full object-contain"
                  alt="Frame"
                  src={category.imageSrc}
                />
              </div>
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full flex-col items-start gap-2">
                  <h3
                    className={`[font-family:'Poppins',Helvetica] w-full text-[22px] font-medium leading-[normal] tracking-[0] ${category.titleClassName}`}
                  >
                    {category.title}
                  </h3>
                  <p className="[font-family:'Poppins',Helvetica] min-h-[108px] text-lg font-normal leading-[normal] tracking-[0] text-[#5f5f5f]">
                    <strong className="font-medium">
                      {category.descriptionLead}
                    </strong>{" "}
                    {category.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
