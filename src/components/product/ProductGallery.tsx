"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Parallax } from "@/components/media/Parallax";
import { Photo } from "@/components/media/Photo";
import { cn } from "@/lib/cn";
import { EASE_QUIET } from "@/lib/motion/easing";

/** Tuning for the gallery and its full-screen viewer. */
const gallery = {
  /** How far each photograph slides inside its frame while the page scrolls (fraction of frame height). */
  parallax: 0.04,
  /** Seconds for a photograph to travel between the page and the viewer. */
  travel: 0.9,
  /** Magnification when zoomed in. */
  zoom: 2.2,
  /** Pixels a swipe must cover to change photograph. */
  swipe: 70,
};

/** Rendered width of a gallery photograph. The viewer reuses it so both show the same file. */
const GALLERY_SIZES = "(min-width: 768px) 58vw, 100vw";

const sharedId = (id: string) => `product-photo-${id}`;

type ProductGalleryProps = {
  /** Manifest ids, in order. All 4:5, so a photograph keeps its shape as it travels. */
  images: string[];
  name: string;
};

/**
 * The product photographs, stacked in the left column. Each one drifts very
 * slightly inside its frame as the page scrolls. Clicking one opens it in a
 * full-screen viewer: the photograph itself travels from its place on the page
 * to the centre of the screen (shared element, motion `layoutId`) and back
 * again on close, so the viewer never feels like a different page.
 */
export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [open, setOpen] = useState<number | null>(null);
  // Photographs reached by Previous/Next appear in place; only the one that
  // was clicked travels in. Closing always travels back.
  const [stepped, setStepped] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  const show = (index: number, element: HTMLElement) => {
    opener.current = element;
    setStepped(false);
    setOpen(index);
  };

  const close = () => {
    setOpen(null);
    opener.current?.focus({ preventScroll: true });
  };

  const step = (direction: 1 | -1) => {
    setStepped(true);
    setOpen((current) => (current === null ? current : (current + direction + images.length) % images.length));
  };

  return (
    <>
      <ul className="flex flex-col gap-px">
        {images.map((id, index) => (
          <li key={id}>
            <motion.button
              type="button"
              layoutId={sharedId(id)}
              // No cross-fade between the two copies: the page copy is cropped a
              // touch tighter (it slides inside its frame), and blending the two
              // shows as a double image. One copy is visible at a time.
              layoutCrossfade={false}
              transition={{ layout: { duration: gallery.travel, ease: EASE_QUIET } }}
              onClick={(event) => show(index, event.currentTarget)}
              aria-label={`Open photograph ${index + 1} of ${images.length} of the ${name} full screen`}
              data-cursor="view"
              className="block w-full"
            >
              <Parallax inside amount={gallery.parallax} className="aspect-[4/5] bg-sand">
                <Photo
                  id={id}
                  preload={index === 0}
                  sizes={GALLERY_SIZES}
                  className="h-full w-full object-cover"
                />
              </Parallax>
            </motion.button>
          </li>
        ))}
      </ul>

      <Portal>
        <AnimatePresence>
          {open !== null && (
            <Viewer
              key="viewer"
              images={images}
              index={open}
              name={name}
              instant={stepped}
              onStep={step}
              onClose={close}
            />
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}

/** Renders into <body>, above the header. Nothing on the server. */
function Portal({ children }: { children: ReactNode }) {
  // False on the server and during hydration, true afterwards.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return mounted ? createPortal(children, document.body) : null;
}

type ViewerProps = {
  images: string[];
  index: number;
  name: string;
  /** True when the current photograph was reached by stepping, not by the opening click. */
  instant: boolean;
  onStep: (direction: 1 | -1) => void;
  onClose: () => void;
};

function Viewer({ images, index, name, instant, onStep, onClose }: ViewerProps) {
  // Null when not zoomed; otherwise how far the photograph may be dragged
  // each way, so its edge can meet the frame's edge but not pass it.
  const [reach, setReach] = useState<{ left: number; right: number; top: number; bottom: number } | null>(null);
  const zoomed = reach !== null;
  const dialog = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dragged = useRef(false);
  const lenis = useLenis();
  const id = images[index];
  const many = images.length > 1;

  const toggleZoom = () => {
    const box = frame.current;
    if (zoomed || !box) {
      setReach(null);
      return;
    }
    const x = (box.offsetWidth * (gallery.zoom - 1)) / 2;
    const y = (box.offsetHeight * (gallery.zoom - 1)) / 2;
    setReach({ left: -x, right: x, top: -y, bottom: y });
  };

  const step = (direction: 1 | -1) => {
    setReach(null);
    onStep(direction);
  };

  // The page behind must not scroll while the viewer is open.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    lenis?.stop();
    root.style.overflow = "hidden";
    return () => {
      lenis?.start();
      root.style.overflow = previous;
    };
  }, [lenis]);

  useEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
  }, []);

  // Keys: Escape closes, arrows step, Tab stays inside the dialog.
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") onClose();
    else if (event.key === "ArrowRight" && many) step(1);
    else if (event.key === "ArrowLeft" && many) step(-1);
    else if (event.key === "Tab") {
      const buttons = dialog.current?.querySelectorAll<HTMLElement>("button");
      if (!buttons || buttons.length === 0) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    // Let the click that ends a drag pass without toggling zoom.
    window.setTimeout(() => (dragged.current = false), 0);
    if (zoomed || !many) return;
    if (info.offset.x <= -gallery.swipe) step(1);
    else if (info.offset.x >= gallery.swipe) step(-1);
  };

  const control = "min-h-11 font-sans text-label font-medium uppercase tracking-label text-espresso";

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Photographs of the ${name}`}
      // Inside the viewer the system cursor is back: it shows zoom in / out.
      data-cursor="native"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-50"
    >
      <motion.div
        className="absolute inset-0 bg-cream"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: EASE_QUIET }}
      />

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-4 py-16">
        {/* The frame keeps the 4:5 shape and is the shared element. The
            photograph inside it is what zooms and drags. */}
        <motion.div
          key={id}
          ref={frame}
          layoutId={sharedId(id)}
          layoutCrossfade={false}
          transition={{ layout: instant ? { duration: 0 } : { duration: gallery.travel, ease: EASE_QUIET } }}
          // As large as fits both ways while staying 4:5.
          className="relative aspect-[4/5] w-[min(calc(100vw-2rem),calc((100svh-8rem)*0.8))]"
        >
          <motion.div
            className={cn("relative h-full w-full touch-none", zoomed ? "cursor-zoom-out" : "cursor-zoom-in")}
            drag={zoomed ? true : many ? "x" : false}
            dragConstraints={reach ?? { left: 0, right: 0 }}
            dragElastic={zoomed ? 0.05 : 0.35}
            dragMomentum={false}
            onDragStart={() => (dragged.current = true)}
            onDragEnd={onDragEnd}
            onClick={() => {
              if (!dragged.current) toggleZoom();
            }}
            initial={instant ? { opacity: 0 } : false}
            animate={{ opacity: 1, scale: zoomed ? gallery.zoom : 1, ...(zoomed ? {} : { x: 0, y: 0 }) }}
            transition={{ duration: 0.7, ease: EASE_QUIET }}
          >
            {/* Same file as the gallery shows, so it is already loaded and the
                photograph is never blank while it travels. */}
            <Photo id={id} sizes={GALLERY_SIZES} eager className="pointer-events-none h-full w-full select-none object-cover" />
            {/* A larger file over it, for zooming. It simply appears when ready. */}
            <Photo
              id={id}
              sizes="(min-width: 768px) 160vw, 220vw"
              decorative
              eager
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Controls sit on solid cream bars, so they stay legible over any
          photograph, zoomed or not. The photograph passes underneath. */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex flex-col justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE_QUIET }}
      >
        <div className="pointer-events-auto flex h-14 items-center justify-between bg-cream px-page">
          <span className={cn(control, "flex items-center tabular-nums")} aria-live="polite">
            {index + 1} / {images.length}
          </span>
          <div className="flex gap-8">
            <button type="button" className={control} onClick={toggleZoom}>
              {zoomed ? "Zoom out" : "Zoom in"}
            </button>
            <button ref={closeButton} type="button" className={control} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        {many && (
          <div className="pointer-events-auto flex h-14 items-center justify-between bg-cream px-page">
            <button type="button" className={control} onClick={() => step(-1)}>
              Previous
            </button>
            <button type="button" className={control} onClick={() => step(1)}>
              Next
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
