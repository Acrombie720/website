import { Button } from "../../../../components/ui/button";
import linkedinIcon from "../../../../assets/linkedin.svg";
import socialIcon from "../../../../assets/social-icon.svg";

const footerColumns = [
  {
    title: "Menu",
    links: [
      { label: "Testimonials", href: "#testimonials" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "What we Measure", href: "#what-we-measure" },
      { label: "Grad Shemes", href: "#book-a-demo" },
    ],
  },
  {
    title: "Docs",
    links: [
      { label: "Privacy Policy", href: "https://fluencyfox.ai/privacy" },
      { label: "Terms & Conditions", href: "https://fluencyfox.ai/terms" },
    ],
    className: "md:w-[212.9px]",
  },
  {
    title: "Adress",
    links: [
      {
        label: "71-75 Shelton Street, London, UK WC2H 9JQ",
        href: undefined,
      },
    ],
    className: "md:w-[212.9px]",
  },
] as const;

const socialLinks = [
  {
    alt: "Linkedin",
    src: linkedinIcon,
    href: "https://www.linkedin.com/company/fluencyfox/",
  },
  {
    alt: "Social icon",
    src: socialIcon,
    href: undefined,
  },
] as const;

const scrollToTop = (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const FooterSection = (): JSX.Element => {
  return (
    <footer className="mt-[190px] flex w-full flex-col items-center justify-center gap-[21px] px-4 pb-8 pt-10 sm:px-6 lg:px-0">
      <div className="flex w-full max-w-[1238px] items-start justify-between gap-6">
        <a
          href="#"
          onClick={scrollToTop}
          aria-label="Fluencyfox"
          className="flex h-11 items-center gap-[7px]"
        >
          <img
            className="h-8 w-auto shrink-0 sm:h-11"
            alt="Fluencyfox"
            src="https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/group-3-1788791216374-9.svg"
          />
        </a>
        <Button
          asChild
          className="h-auto rounded-xl bg-[#5474a1] px-[22px] py-3 [font-family:'Poppins',Helvetica] text-sm font-medium leading-normal text-white hover:bg-[#5474a1]/90"
        >
          <a href="https://calendly.com/callum-calyptus/30m">Book a Demo</a>
        </Button>
      </div>
      <img
        className="h-px w-full max-w-[1310px]"
        alt="Vector"
        src="https://c.animaapp.com/yGg8IOminYwS72tWPnieSQ/img/vector-162.svg"
      />
      <div className="flex w-full max-w-[1238px] flex-wrap items-start justify-between gap-x-8 gap-y-10 rounded-xl py-4">
        {footerColumns.map((column) => (
          <nav
            key={column.title}
            aria-label={column.title}
            className={`flex flex-col items-start gap-[22px] ${column.className ?? ""}`}
          >
            <h2 className="[font-family:'Poppins',Helvetica] text-base font-normal leading-normal tracking-[0] text-[#959494]">
              {column.title}
            </h2>
            <ul className="flex flex-col items-start gap-[22px]">
              {column.links.map((link) =>
                link.href ? (
                  <li key={link.label}>
                    <Button
                      asChild
                      variant="ghost"
                      className="h-auto justify-start whitespace-normal p-0 [font-family:'Poppins',Helvetica] text-left text-base font-normal leading-normal tracking-[0] text-[#5f5f5f] hover:bg-transparent hover:text-[#5f5f5f]"
                    >
                      <a href={link.href}>{link.label}</a>
                    </Button>
                  </li>
                ) : (
                  <li
                    key={link.label}
                    className="[font-family:'Poppins',Helvetica] text-base font-normal leading-normal tracking-[0] text-[#5f5f5f]"
                  >
                    {link.label}
                  </li>
                ),
              )}
            </ul>
          </nav>
        ))}

        <section
          className="flex flex-col items-start gap-[22px]"
          aria-labelledby="socials-heading"
        >
          <h2
            id="socials-heading"
            className="[font-family:'Poppins',Helvetica] text-base font-normal leading-normal tracking-[0] text-[#959494]"
          >
            Socials
          </h2>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) =>
              social.href ? (
                <Button
                  key={social.alt}
                  asChild
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent"
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.alt}
                  >
                    <img className="h-6 w-6" alt="" src={social.src} />
                  </a>
                </Button>
              ) : (
                <Button
                  key={social.alt}
                  type="button"
                  variant="ghost"
                  className="h-auto cursor-default p-0 hover:bg-transparent"
                  aria-label={social.alt}
                  tabIndex={-1}
                >
                  <img className="h-6 w-6" alt="" src={social.src} />
                </Button>
              ),
            )}
          </div>
        </section>
      </div>
    </footer>
  );
};
