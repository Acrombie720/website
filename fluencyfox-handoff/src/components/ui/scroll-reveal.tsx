import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fades + lifts its children into place the first time they scroll into
 * view. Uses `.animate-scroll-reveal` (see tailwind.css). No-ops (renders
 * visible immediately) when IntersectionObserver is unavailable or the user
 * prefers reduced motion.
 */
export const ScrollReveal = ({
  children,
  className = "w-full",
}: ScrollRevealProps): JSX.Element => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? "animate-scroll-reveal" : "opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
};
