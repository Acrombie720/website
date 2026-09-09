import { useEffect, useRef, useState } from "react";

interface AnimatedFrameProps {
  src: string;
  title: string;
  naturalWidth: number;
  naturalHeight: number;
  fit?: "contain" | "cover";
  className?: string;
  /** Fades the left/right edges of the box so content that scrolls or
   * overflows horizontally (e.g. an infinite logo marquee) never shows a
   * hard-cropped element at the boundary. */
  edgeFade?: boolean;
}

/**
 * Embeds a self-contained animated HTML demo (served from /static/animations)
 * inside a fixed-height box, scaling it responsively so it always fits the
 * box regardless of the container's rendered width. Uses a ResizeObserver
 * so the scale recalculates on breakpoint changes / window resizes.
 */
export const AnimatedFrame = ({
  src,
  title,
  naturalWidth,
  naturalHeight,
  fit = "contain",
  className = "",
  edgeFade = false,
}: AnimatedFrameProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const scaleW = width / naturalWidth;
      const scaleH = height / naturalHeight;
      setScale(fit === "cover" ? Math.max(scaleW, scaleH) : Math.min(scaleW, scaleH));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalWidth, naturalHeight, fit]);

  return (
    <div
      ref={containerRef}
      className={`relative flex h-[352px] w-full max-w-[546px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ${className}`}
      style={
        edgeFade
          ? {
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)",
              maskImage:
                "linear-gradient(to right, transparent 0, black 64px, black calc(100% - 64px), transparent 100%)",
            }
          : undefined
      }
    >
      <iframe
        title={title}
        src={src}
        scrolling="no"
        style={{
          width: naturalWidth,
          height: naturalHeight,
          border: 0,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          pointerEvents: "none",
          flexShrink: 0,
        }}
      />
    </div>
  );
};
