import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import logo from "../../assets/logo.svg";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../components/ui/navigation-menu";
import { AssessmentEvidenceSection } from "./sections/AssessmentEvidenceSection";
import { AssessmentWorkflowSection } from "./sections/AssessmentWorkflowSection/AssessmentWorkflowSection";
import { CandidateEvaluationProblemSection } from "./sections/CandidateEvaluationProblemSection/CandidateEvaluationProblemSection";
import { CustomerTestimonialSection } from "./sections/CustomerTestimonialSection/CustomerTestimonialSection";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import { HeroSection } from "./sections/HeroSection";
import { LiveAssessmentCallToActionSection } from "./sections/LiveAssessmentCallToActionSection/LiveAssessmentCallToActionSection";
import { ScoringFrameworkSection } from "./sections/ScoringFrameworkSection/ScoringFrameworkSection";
import { ScrollReveal } from "../../components/ui/scroll-reveal";

const navigationItems = [
  { label: "Testimonials", href: "#testimonials" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "What we Measure", href: "#what-we-measure" },
];

const scrollToTop = (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const Main = (): JSX.Element => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#f0f4f6]" data-model-id="0:1247">
      <header className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-4 sm:px-8 lg:px-[100px]">
        <a
          href="#"
          onClick={scrollToTop}
          aria-label="Home"
          className="shrink-0"
        >
          <img
            className="h-8 w-[151px] sm:h-11 sm:w-[207.57px]"
            alt="Group"
            src={logo}
          />
        </a>
        <div className="flex items-center gap-3 sm:gap-[22px]">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-[22px]">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink
                    href={item.href}
                    className="[font-family:'Poppins',Helvetica] text-base font-normal leading-normal text-[#5f5f5f] transition-colors hover:text-[#5474a1]"
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <Button
            asChild
            className="h-auto rounded-xl bg-[#5474a1] px-[18px] py-2.5 sm:px-[22px] sm:py-3 [font-family:'Poppins',Helvetica] text-sm font-medium leading-normal text-white hover:bg-[#45638b]"
          >
            <a href="https://calendly.com/callum-calyptus/30m">Book a Demo</a>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-[#1e1e1e] hover:bg-[#e4edf1] md:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
        {isMobileMenuOpen && (
          <nav
            aria-label="Mobile"
            className="absolute left-4 right-4 top-full z-30 mt-2 flex flex-col gap-1 rounded-xl border border-[#e4edf1] bg-white p-3 shadow-lg sm:left-8 sm:right-8 md:hidden"
          >
            {navigationItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 [font-family:'Poppins',Helvetica] text-base font-normal text-[#5f5f5f] transition-colors hover:bg-[#f0f4f6] hover:text-[#5474a1]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-[190px] px-4 pt-16 sm:px-8 sm:pt-[190px] lg:px-[100px]">
        <section id="hero" className="w-full">
          <ScrollReveal>
            <HeroSection />
          </ScrollReveal>
        </section>
        <section id="testimonials" className="w-full">
          <ScrollReveal>
            <CustomerTestimonialSection />
          </ScrollReveal>
        </section>
        <section id="candidate-evaluation" className="w-full">
          <ScrollReveal>
            <CandidateEvaluationProblemSection />
          </ScrollReveal>
        </section>
        <section id="how-it-works" className="w-full">
          <ScrollReveal>
            <AssessmentWorkflowSection />
          </ScrollReveal>
        </section>
        <section id="what-we-measure" className="w-full">
          <ScrollReveal>
            <ScoringFrameworkSection />
          </ScrollReveal>
        </section>
        <section id="assessment-evidence" className="w-full">
          <ScrollReveal>
            <AssessmentEvidenceSection />
          </ScrollReveal>
        </section>
        <section id="book-a-demo" className="w-full">
          <ScrollReveal>
            <LiveAssessmentCallToActionSection />
          </ScrollReveal>
        </section>
      </main>
      <FooterSection />
    </div>
  );
};
