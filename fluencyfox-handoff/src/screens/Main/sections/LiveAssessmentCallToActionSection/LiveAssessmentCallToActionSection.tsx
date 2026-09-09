import { useRef } from "react";
import { Button } from "../../../../components/ui/button";
import ctaBackground from "../../../../assets/images/hero-mountains.webp";
import ctaOverlapFlowers from "../../../../assets/images/hero-flowers-overlap.webp";
import { Card, CardContent } from "../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";

const assessmentColumns = ["CORE WORK", "COMMS", "SYSTEMS", "ADMIN", "AVG"];

const teamMembers = [
  {
    name: "Priya K.",
    role: "Team Lead",
    image: "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/ellipse-441.png",
    scores: [
      { value: "8.9", color: "bg-adddark-blue" },
      { value: "5.1", color: "bg-mainlight-blue" },
      { value: "7.2", color: "bg-[#7b9cc9]" },
      { value: "7.0", color: "bg-[#7b9cc9]" },
      { value: "7.0", color: "bg-mainmilk text-maindark-grey" },
    ],
  },
  {
    name: "Marcus D.",
    role: "Account exec",
    image:
      "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/ellipse-441-1.png",
    scores: [
      { value: "7.4", color: "bg-[#7b9cc9]" },
      { value: "3.2", color: "bg-[#c5dae8]" },
      { value: "5.5", color: "bg-[#92bad5]" },
      { value: "5.8", color: "bg-[#92bad5]" },
      { value: "5.5", color: "bg-mainmilk text-maindark-grey" },
    ],
  },
  {
    name: "Hannah W.",
    role: "Ops manager",
    image:
      "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/ellipse-441-2.png",
    scores: [
      { value: "6.8", color: "bg-[#7b9cc9]" },
      { value: "8.6", color: "bg-[#5474a1]" },
      { value: "8.1", color: "bg-[#5474a1]" },
      { value: "9.0", color: "bg-[#5474a1]" },
      { value: "8.1", color: "bg-mainmilk text-maindark-grey" },
    ],
  },
  {
    name: "Tom R.",
    role: "Engineer",
    image:
      "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/ellipse-441-3.png",
    scores: [
      { value: "8.2", color: "bg-adddark-blue" },
      { value: "2.9", color: "bg-[#c6dbe8]" },
      { value: "4.4", color: "bg-[#7b9cc9]" },
      { value: "4.9", color: "bg-[#7b9cc9]" },
      { value: "5.1", color: "bg-mainmilk text-maindark-grey" },
    ],
  },
];

const fluencyLegend = [
  { label: "Not yet using AI", color: "bg-[#c6dbe8]" },
  { label: "Basic use", color: "bg-[#92bad5]" },
  { label: "Confident", color: "bg-[#7b9cc9]" },
  { label: "Fluent", color: "bg-[#5474a1]" },
];

export const LiveAssessmentCallToActionSection = (): JSX.Element => {
  const ctaPanelRef = useRef<HTMLDivElement | null>(null);

  return (
    <section className="w-full bg-[#f0f4f6]">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-[56px] px-4 pt-4 sm:px-8 lg:px-0">
        <header className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
          <h2 className="max-w-[576px] [font-family:'Ovo',Helvetica] text-[36px] font-normal leading-[1.12] tracking-[0] text-[#1e1e1e] sm:text-[50px]">
            Find out how AI-fluent <br className="hidden sm:block" />
            your company really is.
          </h2>
          <p className="max-w-[630px] [font-family:'Poppins',Helvetica] text-lg font-normal leading-normal tracking-[0] text-[#5f5f5f]">
            <strong className="font-semibold">
              Fluencyfox isn&apos;t just for hiring.
            </strong>{" "}
            Turn the same immersive assessment inward and map AI fluency across
            the team you already have so you can see exactly where the strengths
            are, where the gaps are, and what to do next.
          </p>
        </header>
        <Card className="mx-auto w-full max-w-[1140px] rounded-[15px] border-0 bg-white shadow-none">
          <CardContent className="p-5 sm:p-8">
            <div className="overflow-x-auto">
              <Table className="min-w-[880px] border-collapse">
                <TableHeader>
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableHead className="h-auto w-[31%] px-0 pb-[19px] pt-[9px] text-left [font-family:'Poppins',Helvetica] text-lg font-medium leading-[25.2px] text-grey-scale500">
                      PERSON
                    </TableHead>
                    {assessmentColumns.map((column) => (
                      <TableHead
                        key={column}
                        className="h-auto px-[10px] pb-[19px] pt-[9px] text-center [font-family:'Poppins',Helvetica] text-lg font-medium leading-[25.2px] text-grey-scale500"
                      >
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow
                      key={member.name}
                      className="border-0 hover:bg-transparent"
                    >
                      <TableCell className="w-[31%] px-0 py-[14px]">
                        <div className="flex h-[70px] items-center gap-3">
                          <img
                            className="h-[43px] w-[43px] shrink-0 rounded-full object-cover"
                            alt=""
                            src={member.image}
                          />
                          <div className="flex flex-col">
                            <span className="[font-family:'Poppins',Helvetica] text-[22px] font-medium leading-[30.8px] text-maindark-grey">
                              {member.name}
                            </span>
                            <span className="[font-family:'Poppins',Helvetica] text-lg font-normal leading-[25.2px] text-grey-scale300">
                              {member.role}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      {member.scores.map((score, index) => (
                        <TableCell
                          key={`${member.name}-${assessmentColumns[index]}`}
                          className="px-[10px] py-[14px]"
                        >
                          <div
                            className={`flex h-[63px] min-w-[112px] items-center justify-center rounded-[10.49px] ${score.color}`}
                          >
                            <span
                              className={`[font-family:'Poppins',Helvetica] text-xl font-medium leading-7 ${index === assessmentColumns.length - 1 ? "text-[#1e1e1e]" : "text-white"}`}
                            >
                              {score.value}
                            </span>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ul className="mt-[9px] flex flex-wrap gap-x-[33px] gap-y-3 py-[9px]">
              {fluencyLegend.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`h-[22px] w-[22px] rounded-[10.49px] ${item.color}`}
                  />
                  <span className="[font-family:'Poppins',Helvetica] text-lg font-medium leading-[25.2px] text-grey-scale500">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <section className="relative left-1/2 -mt-20 flex w-[100vw] max-w-[100vw] -translate-x-1/2 justify-center overflow-visible pb-[260px] pt-[208px]">
        <img
          className="absolute inset-0 h-full w-[100vw] max-w-none rounded-b-[12px] object-cover object-top"
          alt="Landscape"
          src={ctaBackground}
        />
        <div
          id="live-assessment-blue-panel"
          ref={ctaPanelRef}
          className="relative z-10 mx-5 flex w-full max-w-[1060px] items-center justify-center rounded-xl bg-[#92bad5] px-5 py-[88px] sm:mx-0 sm:px-10"
        >
          <div
            id="live-assessment-cta-content"
            className="mx-auto flex w-full max-w-[800px] flex-col items-center justify-center gap-[22px] text-center"
          >
            <h2 className="[font-family:'Ovo',Helvetica] text-[44px] font-normal leading-normal tracking-[0] text-white sm:text-[62px]">
              See a live assessment.
            </h2>
            <p className="max-w-[717px] [font-family:'Poppins',Helvetica] text-lg font-normal leading-normal tracking-[0] text-white">
              Watch a real candidate session end-to-end and the dashboard your
              team would review it in. Half an hour, no slides.
            </p>
            <Button
              asChild
              className="h-auto w-[164px] rounded-xl bg-white px-[22px] py-3 [font-family:'Poppins',Helvetica] text-sm font-medium text-[#92bad5] hover:bg-white/90"
            >
              <a href="https://calendly.com/callum-calyptus/30m">
                Book a Demo
              </a>
            </Button>
          </div>
        </div>
        <img
          id="live-assessment-flower"
          className="pointer-events-none absolute bottom-0 left-0 z-20 block h-[320px] w-[100vw] max-w-none rounded-b-[12px] object-cover object-bottom [clip-path:inset(0_round_0_0_12px_12px)] sm:h-[380px] md:h-auto"
          alt="Flower meadow"
          src={ctaOverlapFlowers}
        />
      </section>
    </section>
  );
};
