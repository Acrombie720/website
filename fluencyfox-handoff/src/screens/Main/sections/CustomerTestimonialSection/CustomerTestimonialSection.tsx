import { useState } from "react";
import { Card, CardContent } from "../../../../components/ui/card";
import arrowLeftIcon from "../../../../assets/icons/arrow-left.svg";
import arrowRightIcon from "../../../../assets/icons/arrow-right.svg";

const testimonials = [
  {
    quote:
      "When somebody is applying for a role and they don't have 20 years of experience in their CV, it's very hard to stand out. Thanks to Calyptus you can actually get a glimpse at how the person actually thinks, and how they work. And that makes the process a lot more personable.",
    name: "Eleonora Shepel",
    role: "Talent Lead, HIVED",
    photo:
      "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/rectangle-40152.png",
    logo: "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/image--1--1.png",
    logoAlt: "HIVED logo",
  },
  {
    quote:
      "We used the fluency assessor to screen candidates for our graduate forward deployed engineering scheme, helping us find 6 tier 1 hires out of an initial pool of 700.",
    name: "Romil Depala",
    role: "SilverTree Equity",
    photo:
      "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/uploaded-asset-1788790596028-0.png",
    logo: "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/uploaded-asset-1788790596028-1.png",
    logoAlt: "SilverTree Equity logo",
  },
  {
    quote:
      "The test was unique and unlike anything I have ever had to do for job applications. I really liked how it gave us the freedom to approach a problem as we wished using whatever AI tool we want. I like how it was recorded, and we got to show our personality rather than just the results. It was a very fun experience.",
    name: "Jay Cushen",
    role: "",
    photo:
      "https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/uploaded-asset-1788790596038-2.jpeg",
    logo: "",
    logoAlt: "",
  },
];

export const CustomerTestimonialSection = (): JSX.Element => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonial = testimonials[activeTestimonial];

  const showNextTestimonial = () => {
    setActiveTestimonial((current) => (current + 1) % testimonials.length);
  };

  const showPreviousTestimonial = () => {
    setActiveTestimonial(
      (current) => (current - 1 + testimonials.length) % testimonials.length,
    );
  };

  return (
    <section
      className="flex w-full flex-col items-start justify-center gap-[42px]"
      aria-labelledby="customer-testimonials-heading"
    >
      <h2
        id="customer-testimonials-heading"
        className="[font-family:'Ovo',Helvetica] text-[36px] font-normal leading-[normal] tracking-[0] text-[#1e1e1e] sm:text-[50px]"
      >
        From the Teams
        <br />
        Running FluencyFox
      </h2>
      <div
        key={activeTestimonial}
        className="grid w-full animate-fade-in grid-cols-1 items-stretch gap-[22px] rounded-xl lg:grid-cols-[minmax(0,467.79fr)_minmax(0,748.21fr)]"
      >
        <img
          className="order-2 h-full min-h-[360px] w-full rounded-xl object-cover lg:order-1 lg:min-h-[575.75px]"
          alt="Rectangle"
          src={testimonial.photo}
        />
        <Card className="order-1 min-h-[575.75px] rounded-xl border-0 bg-white shadow-none lg:order-2">
          <CardContent className="flex min-h-[575.75px] flex-col p-[30px]">
            <header className="flex min-h-14 justify-end">
              {testimonial.logo ? (
                <img
                  className="h-14 w-auto max-w-[220px] object-contain"
                  alt={testimonial.logoAlt}
                  src={testimonial.logo}
                />
              ) : null}
            </header>
            <blockquote className="my-auto flex max-w-[688px] flex-col gap-[34px] px-[22px] py-[22px]">
              <p className="[font-family:'Poppins',Helvetica] text-base font-normal leading-[normal] tracking-[0] text-maingrey sm:text-[22px]">
                &quot;{testimonial.quote}&quot;
              </p>
              <footer className="flex items-center gap-4">
                <div className="flex flex-col items-start justify-center gap-1.5">
                  <cite className="[font-family:'Ovo',Helvetica] text-lg font-normal not-italic leading-[normal] tracking-[0] text-maingrey sm:text-[22px]">
                    {testimonial.name}
                  </cite>
                  {testimonial.role ? (
                    <p className="[font-family:'Poppins',Helvetica] text-sm font-normal leading-[normal] tracking-[0] text-[#5f5f5f]">
                      {testimonial.role}
                    </p>
                  ) : null}
                </div>
              </footer>
            </blockquote>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
                onClick={showPreviousTestimonial}
                aria-label="Show previous testimonial"
              >
                <img className="h-10 w-10" src={arrowLeftIcon} alt="" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95"
                onClick={showNextTestimonial}
                aria-label="Show next testimonial"
              >
                <img className="h-10 w-10" src={arrowRightIcon} alt="" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
