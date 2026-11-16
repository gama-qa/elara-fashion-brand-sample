import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DURATION, EASE_QUIET } from "./easing";

// Plugins are registered once, here. Import gsap and ScrollTrigger from this
// module (client components only) so registration always runs first.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);
  CustomEase.create("quiet", EASE_QUIET.join(","));
  gsap.defaults({ ease: "quiet", duration: DURATION.reveal });
}

export { gsap, ScrollTrigger, useGSAP };
