# ÉLARA — premium womenswear sample site

Portfolio/sample project. "ÉLARA" is a placeholder: read it from `src/lib/site.ts`, never hard-code the name elsewhere. The brand is fictional and the footer says so.

References:
- **Loro Piana** for home and brand pages: quiet luxury, warm, craft-led, a lot of empty space.
- **Zara** for the catalog: tight editorial grid, full-bleed photos, large sans type.

Design decisions: the user wants the `ui-ux-pro-max` skill consulted when it is available (it was not installed on 2026-11-13). Where the skill and this file disagree, this file wins.

## Visual direction (revised 2026-11-13)

The first version put a procedural 3D set (arch wall, pedestals, a carved sphere) behind the brand pages. The user rejected it: it looked generic and AI-made. Do not bring it back, and do not replace it with other invented 3D objects.

What replaces it:
1. **Real footage is the background** of the brand pages: short clips with no people and no text (sunlight through curtains, cloth moving in wind, shadows on a plaster wall, a warm minimal interior, fabric close-ups). Scroll drives it.
2. **WebGL is only a thin effect layer over the footage**: fine grain, soft displacement, vignette. It never draws objects.
3. **`/lookbook` is the one real 3D scene**: a downloaded studio or corridor model (GLB) lit by a real HDRI, with a scroll-driven camera.
4. Product and model photographs stay sharp DOM images, as before.

Migration status (keep this list current)
- Home hero: footage found, verified and viewed; waiting for the user to confirm the choice before anything is used. Candidates and verdicts are in `.video-staging/CANDIDATES.md`. The page still shows the old set.
- Home statement and featured, `/about`: still on the old set.
- `/lookbook`: still the procedural corridor. Model and HDRI not chosen yet.
- When nothing uses it any more: delete `src/three/set/`, `src/three/rig/`, the studio and corridor presets and the `set/` stills, and remove the "Legacy" section below.

## Stack

- Next.js 16.4 App Router, React 19, TypeScript (strict), Tailwind CSS 4 (tokens in `@theme`)
- three (pinned `~0.182`), @react-three/fiber 9, @react-three/drei 10
- gsap + ScrollTrigger (use `@gsap/react` `useGSAP` for cleanup)
- motion: always `import { motion } from "motion/react"`, never `framer-motion`
- lenis (React wrapper from `lenis/react`)
- sharp (dev) for image processing
- ffmpeg and ffprobe on PATH for video work (installed through winget on the user's machine). Not an npm dependency.
- Nothing else for UI, animation or state without asking. No component kits.

Check current docs before using an API: Next's bundled docs in `node_modules/next/dist/docs/` (see AGENTS.md), Context7 or the installed type definitions for the rest. Don't code from memory.

Version notes
- three stays on r182: R3F 9.8 creates a `THREE.Clock`, which r183+ deprecates with a console warning on every load. Revisit when R3F 10 is stable.
- Next has `cacheComponents` on. `usePathname` in the root layout can suspend and fail the build on dynamic routes, so the layout never reads the pathname: pages declare their own state with `<PageSetup>`.
- Next keeps up to 3 visited pages mounted but hidden in `<Activity>`. Effects clean up when a page hides and run again when it shows. Register page-level things in `useLayoutEffect` with a cleanup, and reset transient UI (open menus) on hide.
- Never use `new Date()`, `Math.random()` or similar in server components: prerendering with `cacheComponents` rejects them.
- Awaiting `params` (or `searchParams`) at the top of a page is flagged by partial prefetching as a console error, because the route's shell is shared across links. Two valid answers: read them in a child wrapped in `<Suspense>`, or, when every param is prerendered with `generateStaticParams`, add `export const instant = false` and await at the top. Use the second whenever the page can call `notFound()`: behind Suspense the response has already started and an unknown slug returns 200 instead of 404 (see `src/app/collection/[slug]/page.tsx`). `dynamicParams` does not exist with Cache Components.

Commands: `npm run dev`, `npm run build`, `npm run lint`, `npx tsc --noEmit`, `npm run images:verify -- [--min=1600] <files>`, `npm run images:accept -- <staged-file> <group>/<id> [--aspect=4:5] [--focus=x,y]`, `npm run video:verify -- [--min=1080] [--frames=<dir>] <files>`.

Next allows one dev server per project folder. If the user already runs one, use it (check which port answers) instead of starting another, and don't run `npm run build` while it is up.

## Routes

| Route | Reference | WebGL |
|---|---|---|
| `/` | Loro Piana | effect layer over footage |
| `/collection` | Zara | no |
| `/collection/[slug]` | Zara grid + calm detail | no |
| `/lookbook` | Loro Piana | yes, the one 3D scene (downloaded model, HDRI) |
| `/about` | Loro Piana | effect layer over footage, header only |

This table is the target. Until a page is reworked it still runs the old procedural set (see "Migration status").

All routes are static (`generateStaticParams` for product slugs).

## Design system

Tokens live in `src/app/globals.css`. Tailwind's default colours, radii, shadows, blurs, easings and animations are reset there, so only brand tokens exist. Components use tokens, never raw hex. WebGL reads the same values from `src/lib/palette.ts`; change both together.

Base components in `src/components/ui/`: `Container`, `Heading` (sizes display/title/section/catalog), `Label`, `Button` (1px outline, fill rises on hover), `AnimatedLink` (1px rule draws in on hover), `LineReveal`, `ScrubText`.

Page tint: `--haze` (0 cream to 1 sand) is written to `<html>` by `ScrollSync` from the current shot's `haze`. Use the `page` colour token (`bg-page`) for anything that must match the page behind it, such as the header. Two Tailwind traps found here: custom properties declared on `:root` inside `@layer base` were dropped from the output, so live variables go in a plain top-level `:root` block; and `bg-(--some-var)` did not generate a rule, so register the variable as a colour in `@theme inline` and use the named utility.

Colour
- `cream #F4EFE8`: page background
- `sand #E6DDD0`: secondary surfaces, 1px rules on cream
- `taupe #8A7B6A`: rules and large text (24px and up) only. About 3.6:1 on cream, so it fails AA for small text.
- `taupe-ink #6B5E50`: derived tone for small secondary text and labels (about 5.5:1 on cream, 4.7:1 on sand)
- `espresso #2B2622`: primary text, filled buttons
- `white #FFFFFF`: text on photos, product image surrounds

Type
- Cormorant Garamond, light weights (300/400, plus italic): headings only. Never below about 28px, never body text.
- Inter (400/500): UI, body, catalog headings.
- Labels: Inter 11–12px, uppercase, letter-spacing 0.16–0.2em, weight 500, `taupe-ink` or `espresso`.
- Catalog titles: Inter, large (clamp up to about 120px), tight tracking.
- Load both with `next/font/google` as CSS variables.

Form
- `border-radius: 0` everywhere: buttons, inputs, images, swatches, menus.
- 1px lines. No shadows.
- 12-column grid, page margin `clamp(16px, 4vw, 64px)`.
- Brand pages: large vertical spacing between sections. Catalog: dense, 1px gaps.
- When in doubt, remove it. Empty space is intended.
- No `href="#"` or dead links. Only link to pages that exist.

## Anti-AI-slop rules (hard)

Never use:
- purple/blue gradients or decorative gradients of any colour, glassmorphism or backdrop blur, blobs, neon, glow. One exception, asked for by the user: the soft cream-to-sand gradient behind the fallback poster in `SetPoster`.
- invented 3D scenery: procedural arches, pedestals, carved spheres, floating forms. Rejected by the user on 2026-11-13 as generic.
- footage that looks rendered or AI-made, footage with people, body parts, text, logos or screens
- emoji, lorem ipsum, leftover placeholder text
- rounded cards, card-everything layouts, drop shadows
- decorative icons (an icon per feature, icon bullets). Use words: "Menu", "Close", "Bag 0". A functional mark drawn with 1px strokes (a close cross, a plus/minus) is the only exception.
- cliché copy: elevate, unleash, unlock, timeless elegance, effortless, redefine, curated, iconic, must-have, journey, embrace, indulge, exquisite, "Discover the…", "for the modern woman"
- bouncy springs or overshoot, marquees, magnetic buttons, custom cursors (one exception, asked for by the user: the small circle in `Cursor.tsx`, desktop only, which is also the only round shape on the site), parallax on everything, horizontal scroll-jacking. One exception, asked for by the user: the pinned "Complete the look" row on the product page (desktop only; phones, touch screens and reduced motion get an ordinary sideways strip)

## Copy

- English. Short, calm, specific: fibre, weight, weave, cut, finish, process, origin.
- Good: "Double-faced cashmere, 620 g/m². Unlined, so it holds its shape without weight."
- Bad: "A luxurious coat for the modern woman."
- Sentence case for headings. Uppercase only through CSS on labels.
- Numerals with units: "620 g/m²", "17.5 µm", "Model is 177 cm and wears size S".

## Motion

Every animation needs a reason you can state in one line (orientation, pacing, feedback, continuity). No reason, no animation.

- One easing, "quiet": `cubic-bezier(0.16, 1, 0.3, 1)`. Define it once in `src/lib/motion/easing.ts` and expose it to CSS (`--ease-quiet`), GSAP (`CustomEase` named "quiet") and motion (`[0.16, 1, 0.3, 1]`).
- Durations: UI feedback 300–500ms, reveals 900–1400ms. Slow, never bouncy.
- Lenis is the only smooth scroller, one instance at the root, driven from `gsap.ticker` (Lenis's own RAF off) and calling `ScrollTrigger.update` on scroll.
- GSAP handles scroll-linked work and the scroll-to-3D bridge. motion handles component enter/exit/state. Never animate the same property with both.
- Entrance reveals use `LineReveal` (one text line rising from behind its baseline; stagger with `delay`) and `RevealImage` (clip-path opening from the bottom edge). Both mark their animated element with `data-reveal`.
- motion renders the hidden start state inline on the server, so the layout has a `<noscript>` style that resets every `[data-reveal]`. Any new reveal must carry `data-reveal`, or it stays hidden without JS.
- Scroll-linked pieces (all GSAP scrub, all off under reduced motion): `ScrubText` lights a paragraph word by word; `Parallax` drifts an element against the page, or with `inside` slides a picture within a fixed frame. Keep `amount` at 0.15 or less.
- `RevealImage` takes `inView` for pictures below the fold. The clip-path sits on a child of the observed frame: browsers report a fully clipped element as not intersecting, so observing the clipped element itself never fires.
- `prefers-reduced-motion: reduce`: Lenis off (native scroll), no scrubbed or pinned sequences, no footage scrub (the poster frame stays), no camera movement, no particle drift. Transitions become opacity-only (200ms or less) or instant.

## Background footage

- Clips are local files: `public/video/<id>.mp4` and `.webm` with a poster `public/video/<id>.jpg`, listed in `src/data/video-manifest.json`. No external video URLs in `src/`.
- Scroll moves the footage through GSAP ScrollTrigger (scrub): it sets the clip's `currentTime`, adds a slow scale or drift (8% at most), and cross-dissolves from one clip to the next between sections. A scrubbed clip never plays on its own clock: `muted`, `playsInline`, no `autoPlay`, no `loop`.
- The poster is the first paint and stays if the video cannot load, on `saveData`, and under reduced motion.
- At most two clips are decoding at once: the current one and the one it dissolves into.
- Text over footage must pass AA on the lightest and the darkest frame of the clip, not only on the poster.
- Add what is learned while building it here (seek behaviour, keyframe spacing, mobile quirks).

## WebGL effect layer

- Still one `<Canvas>` at most: `src/three/SceneCanvas.tsx`, loaded through `SceneLayer` (client-only, lazy, `pointer-events: none`, `aria-hidden`). On footage pages it draws one full-screen pass: fine grain, a soft displacement of the footage, a vignette. No meshes, no lights, no objects.
- Displacement needs the footage inside the shader, so where WebGL runs the pass draws the clip from a video texture and the DOM `<video>` and poster underneath are the fallback. Product and model photographs never go through WebGL.
- Keep it quiet: in a still frame it should be hard to tell whether the effect is on. If it reads as an effect, it is too strong.
- The page must look finished without it. The fallback rules below (reduced motion, weak devices, low frame rate, `?scene=on|off`, `data-scene-mode`) still decide whether the canvas exists.

## Lookbook 3D scene (not built yet)

- A downloaded model of a studio or corridor: GLB, licence CC0 or CC BY, from Poly Haven or Sketchfab, Draco-compressed, 5 MB at most. Lit by a real 2K HDRI from Poly Haven. Both are local files (`public/models/`, `public/hdri/`) and credited in `public/models/CREDITS.md` (author, page, licence; CC BY needs the attribution text).
- Serve the Draco decoder from `public/draco/` (copied from three's `examples/jsm/libs/draco/`). Check what decoder path drei's `useGLTF` uses in the installed version: it has defaulted to a Google CDN, which this project does not allow.
- drei `Environment` with `files` pointing at the local HDRI only. Never a `preset` (they fetch remote HDRs).
- The camera is scroll-driven along a path through the model; one look per stop, as DOM photographs over the canvas.
- Never in 3D: products, garments, mannequins, human figures, product photos as textures.
- The same rules as for photos apply to the model: view it before accepting it, and reject anything that looks like a game asset or a template scene.

## Legacy: the procedural set (being removed)

Everything in this section describes the first version, which still runs on pages that have not been reworked. Do not extend it. The canvas, fallback and performance notes stay true for the new effect layer and the lookbook scene.

3D is set design, not product. A minimal procedural studio: a cyclorama wall with a curved cove, a wall with an arched opening, columns, pedestals and abstract carved forms in matte plaster and travertine. One soft key light whose angle and warmth follow scroll, so the set passes through one day (morning to late afternoon) and the shadows move with it. A few dust motes are visible in the light. The camera moves through the set between sections.

Hard rules
- Never in 3D: products, garments, mannequins, human figures, photos as textures. Product and model photos are always DOM (`next/image`), sharp, layered above the canvas.
- (Old set only: the lookbook scene now uses a downloaded model and a real HDRI.) Procedural only. Geometry from three/drei primitives, Lathe/Extrude/Shape. Materials from code (shader noise or runtime-generated DataTextures). No .glb/.gltf/.hdr/.exr, no external textures. No drei `Environment` presets (they fetch remote HDRs); a Lightformer-only environment is fine.
- Exactly one `<Canvas>` in the app: `src/three/SceneCanvas.tsx`, loaded by `src/three/SceneLayer.tsx` (fixed layer behind content, `pointer-events: none`, `aria-hidden`) which is mounted once in the root layout and persists across routes. Pages never create a Canvas. Routes without 3D hide it and render no frames. The canvas (and the three.js bundle) is created the first time a page asks for a scene (`canvasWanted` in the scene store), so a visit that starts on a catalog page has no WebGL at all.
- The Canvas is client-only: `next/dynamic` with `ssr: false`, called from a client component.
- How pages drive the set:
  - `<PageSetup scene="home" header="overlay" />` picks the preset (or none) and the header tone for that page.
  - `<SceneSection chapter={n} occludes?>` wraps a section. Chapter n's camera shot is exact when that section's top meets the viewport top. `occludes` pauses rendering while an opaque section covers the viewport.
  - Shots per preset live in `src/three/presets.ts`. `src/lib/motion/ScrollSync.tsx` writes scroll state; `src/lib/scene-store.ts` holds it (discrete state via `useSceneState`, per-frame values in `sceneFrame`). `src/three/rig/Rig.tsx` reads `sceneFrame` in `useFrame`. No React state updates per scroll frame.
- Tuning lives in `src/three/config.ts` (DPR, fov, fade-in, scrub, light, idle sway, pointer parallax, dust, sphere or torus) and `src/three/presets.ts` (camera stops, time of day and light level per shot). Don't scatter magic numbers elsewhere.
- Scrub: GSAP eases `sceneFrame.chapter` towards the scroll position over `scroll.scrub` seconds (`moveChapter` in `src/lib/scene-sections.ts`). Navigation and resize snap instead. The camera reads the chapter and sits on the shot path, so it can't cut through the arch wall on a fast scroll. Consecutive shots on either side of the wall (z 2.2) must cross it inside the opening (|x| < 1.4, y < 4.4).
- Light: one soft directional sun plus fill from a procedural drei `Environment` (a colour and one `Lightformer`, rendered once, no file). Each shot can dim both with `light`. Tone mapping is Neutral; background and fog are not tone-mapped and match `--color-cream` exactly.
- Shadows are variance shadow maps (`shadows="variance"`); never plain `shadows` or `"soft"`, which select the deprecated PCFSoftShadowMap. With VSM, a mesh with `receiveShadow` is also drawn into the shadow map, so it casts whether or not `castShadow` is set. To stop a mesh casting, turn off both.
- Haze: a shot with `haze: 1` turns background and fog from cream to sand and pulls the fog in (`haze.near/far` in config), so the set recedes to silhouettes behind product sections. The same value drives `--haze` for the DOM and the sand veil in `SetPoster`. This is how the home page moves from cream to sand; don't add a separate background to the section.
- The forms turn with scroll (`forms.turn` radians per chapter), never with time. The centrepiece sphere is split in two because a plain sphere shows no rotation.
- Composition: from the hero camera the arch shows only the form on its round pedestal; everything else stands wider than the opening reveals. Interior shots hold the forms at about half the frame height, on the side away from the page text.
- Shader compile logs are off (`render.checkShaders`): Direct3D on Windows attaches harmless numeric warnings to three's own shadow shaders. Turn it on while editing a shader.
- Budget: DPR capped at 1.5 (stepping down to 1 and 0.75 when slow), one shadow-casting light, shadow map 1024, about 150k triangles or less, 300 dust motes or less.

Fallback (no Canvas)
- Used when: reduced motion, no WebGL2, coarse pointer under 1024px wide, `saveData`, low `deviceMemory` or `hardwareConcurrency`, or a frame rate that stays low.
- Low frame rate (`performance` in config): the canvas first steps its resolution down (max DPR, then 1, then 0.75). Only when it is still under `slowFps` at the lowest step for `patience` measurements in a row does the site switch to the fallback, once. The count is kept in `SceneCanvas`. Never use drei `PerformanceMonitor`'s `flipflops`/`onFallback` for this: that counter rises on every `onIncline` too, so a machine at a steady 60 fps "fell back" after about ten seconds and every 3D page silently became the still version. That was a real bug here.
- The layer carries `data-scene-mode` (`webgl`, `poster`, `pending`). When someone reports that the 3D "does nothing", check it first.
- Detection lives in `src/lib/capabilities.ts` and runs once after mount; SSR shows plain cream first. `?scene=on|off` forces and locks either mode for testing (headless browsers need `?scene=on`, and the lock stops the FPS fallback from kicking in).
- `src/three/SetPoster.tsx` shows a still of our own set over a soft cream-to-sand gradient. The home hero and the lookbook's opening shot have stills (`set/home-hero-*.jpg`, `set/lookbook-*.jpg`); the about page shows the gradient alone. One still per chapter, crossfading, is not built.
- Recapturing the stills (after changing the set, the light or the hero shot): load `/?scene=on` in headless Chrome, hide `header, main, footer` with CSS, wait about 7 s, screenshot at 1600x1000 and 800x1600 with device scale 1.5, then run `images:verify` and `images:accept` into `set/`. Next caches optimised images by URL, so save under a new file name (or clear `.next/dev/cache/images`) or the old still keeps showing.

## Image assets (strict)

Sources: Unsplash and Pexels, free licence only. Exclude Unsplash+ (`plus.unsplash.com`), which is not free.

1. Find: use only URLs actually returned in the current session by search, API or fetch. Never write a photo URL or ID from memory. API keys, if used, go in `.env.local` (`UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`) and are never committed. Without keys, what works: WebSearch limited to unsplash.com or pexels.com, then fetch the photo page for the photographer, licence and the `images.unsplash.com/photo-…` URL, then plain `curl` on that URL. Unsplash's internal search endpoint needs authorisation; never fake a browser user agent to get round a block.
2. Download into `.image-staging/` (gitignored), not straight into `public/`.
3. Verify with `scripts/images/verify.mjs`: HTTP 200, `content-type: image/*`, magic bytes match, file decodes. Minimum long edge: 2400px for full-bleed/hero, 1600px for product and lookbook.
4. View every file (Read tool) and check: a woman, fashion, warm neutral tones, clean background, no visible logos, text or watermarks. Anything that doesn't fit is deleted.
5. Accept: resize to 2800px long edge at most, save as `public/images/<group>/<id>.jpg`, add an entry to `src/data/image-manifest.json` and a line to `public/images/CREDITS.md` (photographer, profile link, photo page, licence).
6. Code uses local paths only, through `src/lib/images.ts`. No external image URLs anywhere in `src/`, and no `images.remotePatterns` in `next.config`.

So far every photograph is by MANITO SILK on Unsplash, from one warm, wood-panelled shoot (uploaded 2025-09-30), which keeps the site coherent. That profile's newer uploads are patterned sleepwear and don't fit. Photo pages' `/download` links return 404 to curl; use the `images.unsplash.com/photo-…` id from the fetched page with `w=6000&fit=max` to get the original size (3000 to 3500 px wide).

Reject frames with legible text (book spines, signage) or all-over monograms, or crop them out.

Product galleries: every image of a product must show the same garment, so take them from one photographer's single shoot. Each product has its `-01` frame plus one or two detail crops (`-02`, `-03`) made with `images:accept --zoom`. Two products (slip dress, wrap robe) come from 2592 px originals and have only two images: a third crop would fall under the 1600 px minimum. If only one frame exists, the extra gallery images are detail crops of it, marked `derivedFrom` in the manifest.

Manifest entry fields: `id`, `file`, `group` (products | lookbook | editorial | set), `width`, `height`, `source` (unsplash | pexels | generated), `sourcePage`, `photographer`, `photographerUrl`, `license`, `alt`, `derivedFrom?`, `checkedAt`, `usedBy`.

The footer and CREDITS state that the brand is fictional, the photos belong to the credited photographers, and the people pictured do not endorse ÉLARA.

## Video assets (strict)

Sources: Pexels and Pixabay, free licence only. Same discipline as images: never write a video URL or id from memory, download to staging, verify, look, credit.

1. Find: WebSearch limited to pexels.com, or fetch a Pexels search page (`pexels.com/search/videos/<query>/?orientation=landscape`), which lists result pages and thumbnails. Then fetch each video page for the creator, licence label, size and file URL. The only direct file URL on a page is inside its "Edit in Canva" link (`file-url=https%3A%2F%2Fvideos.pexels.com%2Fvideo-files%2F…mp4`, 2560x1440 at most); plain `curl` on it works. The "Free download" link (`/download/video/<id>/`) returns nothing to curl. Pixabay has not been tried yet.
2. Screen on the page's preview image first (`images.pexels.com/videos/<id>/…`), then download the clip into `.video-staging/` (gitignored).
3. Verify with `scripts/video/verify.mjs`: MP4 or WebM header, ffprobe finds a video stream, every frame decodes, short edge at least 1080px. `--frames=<dir>` writes five frames of each clip side by side.
4. View the frames (Read tool), and a denser grid for anything shortlisted: no people or body parts at any point (a finger enters one fabric clip in its last seconds), no text, logos or screens, warm neutral tones, nothing that looks rendered. Reject, or note the safe range to cut.
5. Report the candidates and a recommendation to the user before using any (asked for on 2026-11-13).
6. Accept: encode with ffmpeg to `public/video/<id>.mp4` (H.264, `yuv420p`, `+faststart`) and `<id>.webm` (VP9), 1080p at most, no audio, under 3 MB each, plus a poster `<id>.jpg`. Scrubbed clips need a keyframe every 8 frames or so, which costs size. Measured on 8 s at 1080p and 24 fps: a soft clip is 3.2 MB in H.264 at CRF 27 and 2.1 MB in VP9 at CRF 38; detailed cloth is 5.6 MB and 4.6 MB, so it needs a shorter cut, 900p or a higher CRF.
7. Record each clip in `src/data/video-manifest.json` and credit it in `public/video/CREDITS.md` (creator, profile, page, licence). Pexels does not require attribution; this project credits anyway.

An accept script (`scripts/video/accept.mjs`) is still to be written, with the first accepted clip.

## Site-wide chrome

- `PageTransition.tsx`: a cream panel wipes up over the old page, the route changes under it, and it carries on up off the new one (AnimatePresence, `EASE_QUIET_IN_OUT`). It catches internal link clicks in the capture phase on `window`, covers, then calls `router.push`. Back/forward, modified clicks, same-path links and forms are left alone, and it is off under reduced motion. It reads `usePathname`, so it sits in its own `<Suspense>` in the layout.
- `Cursor.tsx`: desktop with a mouse only (`hover: hover`, `pointer: fine`, motion allowed). A dot, a ring over anything clickable, a "View" disc over a photograph that opens something: mark that link or button `data-cursor="view"`. Mark zones that need the system cursor `data-cursor="native"` (the photo viewer). The rules that hide the system cursor are in `globals.css` under `html.has-cursor`. Keep those selectors simple: a rule using a complex `:not(a, b *)` list was silently dropped from the built CSS.
- `NewsletterForm.tsx` (footer): its own validation with `noValidate`, messages in the page tied to the field with `aria-describedby`, re-checked on every change once an error is showing. Nothing is sent; the confirmation says so.

## About (`/about`)

To be reworked: footage behind the header instead of the set. What follows describes the page as it runs now.

The 3D set shows behind the header section only (chapter 0 of the `about` preset). Everything below is one opaque `SceneSection occludes`, so the canvas stops rendering once it is covered: the story, one full-bleed photograph sliding inside its frame, the three values (Fabric, Fit, Longevity), and links on.

## Catalog (`/collection`)

No WebGL: CSS 3D and motion only, on a plain cream page. Dense and clean, in the manner of Zara.

- `src/components/collection/Catalog.tsx`: compact bar (title, count, text filters with a sliding 1px rule) that sticks under the header, then an edge-to-edge grid, 4 columns on desktop and 2 on phones, 1px column gap, 3:4 frames (the 4:5 product crops are shown with `object-cover`).
- `CatalogCard.tsx`: three nested layers, each owning one transform so they never fight. Outside: `motion.li` with `layout` (filter reflow, `AnimatePresence mode="popLayout"`). Middle: a plain div leaning with scroll speed. Inside: the entrance reveal (`whileInView`, staggered by column).
- Scroll lean: `useScrollTilt` writes `--scroll-v` (-1 to 1) on the grid from the scroll position; cards use it in `rotateX`/`skewY`. Tune in the `tilt` object. It must stay under about 2 degrees.
- Quick add: the size row is a sibling of the photo link, never inside it (buttons inside a link are invalid). It shows on hover and on keyboard focus within the card, and not on touch screens, where a tap opens the product.
- The filter lives in the URL (`?category=knitwear`) through `useUrlParam` (`src/lib/url-param.ts`), which reads `location` on the client. Don't switch it to `useSearchParams`: with Cache Components that suspends during prerender and takes the whole grid out of the static HTML.
- Bag: `src/lib/bag-store.ts`, an external store saved in localStorage (`addToBag`, `removeFromBag`, `useBagCount`, `useBagLines`). The header shows the count and lists the lines. There is no checkout.

## Lookbook (`/lookbook`)

To be reworked: a downloaded model and HDRI instead of the procedural corridor (see "Lookbook 3D scene"). The page structure below (pinned walk, index, stack fallback) stays; the set behind it changes.

A pinned walk through a second 3D set, the gallery corridor: eight rooms divided by arched walls, one look and one carved form per room.

- Sets: a preset names its set (`set: "studio" | "corridor"` in `presets.ts`); `SceneCanvas` builds one at a time. The corridor's size (`corridor`: rooms, depth, width) is shared by its geometry (`set/Corridor.tsx`) and its camera path (`corridorShots`). The number of rooms must equal the number of looks in `src/data/lookbook.ts`.
- A corridor preset sets `lightFollowsCamera`: the key light and the 26 m its shadow map covers travel with the camera. It also sets its own `fog`, closer than the studio's, so the corridor has no visible end.
- The floor (`setMaterials.floor`) is the only non-matte surface: roughness 0.4, a sheen and a sun highlight, no mirror pass.
- `LookbookWalk.tsx`: the pin is plain CSS `position: sticky` (a stage the height of the screen) beside a column of invisible `SceneSection` markers, one chapter per room. A GSAP ticker reads `sceneFrame.chapter`, the same eased value the camera uses, and sets each look's opacity and scale, so the photograph and the camera can never drift apart. Photographs are DOM images over the canvas.
- `LookbookIndex.tsx`: the grid of all looks, opened by a scrubbed clip-path (a slot widening to the full page), marked `occludes` so the canvas stops rendering under it.
- `LookbookStack.tsx`: the version without WebGL, a stack of full-screen photographs with `scroll-snap-type: y proximity` on the page (set only while mounted) and a fade per screen. Lenis wheel smoothing is switched off while it is mounted because it fights CSS snap.
- `LookbookExperience.tsx` picks between the two from the scene mode. The server always renders the stack; the swap to the walk happens below the fold, under an intro that both share.

## Product page (`/collection/[slug]`)

A quiet page, no WebGL. Photographs on the left, a panel on the right that stays in view, a pinned row below.

- `ProductGallery.tsx`: the stacked photographs (each slides 4% inside its frame) and the full-screen viewer. A photograph travels between the page and the viewer as a shared element (`layoutId`). Things that make this work, all learned the hard way:
  - Both copies are 4:5, so the box only moves and scales.
  - The viewer first shows the same file the gallery already loaded (`GALLERY_SIZES`), with a larger file layered over it for zoom. A different `sizes` alone means a new download and a blank frame in flight.
  - `layoutCrossfade={false}` on both copies. The page copy is cropped slightly tighter, and cross-fading the two shows a double image.
  - Photographs reached with Previous/Next mount with a zero-length layout transition, or they would fly in from their place on the page.
  - The viewer is portaled to `<body>` (the page content sits in a `z-10` stacking context under the header). Controls sit on solid cream bars so they stay legible over a zoomed photograph.
- `StickyPanel.tsx`: measures its own `top`. Plain `sticky; top: <header>` hides the bottom of the panel whenever it is taller than the screen (an open accordion section is enough).
- `PurchasePanel.tsx`: colour swatch, sizes as a real radio group, Add to bag (`Button variant="solid"`, the one filled button on a page). Without a size it asks for one.
- `Accordion` (`src/components/ui/`): single-open, built on motion with no headless library. Panels stay in the document and are `inert` when closed; the root layout's `<noscript>` rule opens them all without JS.
- `CompleteTheLook.tsx`: GSAP pin + scrub inside `gsap.matchMedia`, so it only exists on wide, hover-capable, motion-allowed screens.

## Data

- `src/data/products.ts`: typed `Product[]`. Images are manifest ids (first is primary, second is the hover image). Kebab-case slugs that don't change. Eight products in four categories (`categories`), each cut in `sizes` XS to XL with a `soldOut` list. Prices are whole euros, shown with `formatPrice` from `src/lib/format.ts`. Fibre, weight and origin are invented for the sample and must not be presented as facts about the photographed garments.
- `src/data/lookbook.ts`: the looks in order, one product each; a look's photograph is that product's main image.
- `src/data/image-manifest.json`: the single source of truth for images.

## Code conventions

- Server Components by default. `"use client"` only for interaction, motion, scroll and WebGL.
- All WebGL code lives in `src/three/`. Nothing in `src/three/` imports page components.
- GSAP plugins are registered once in `src/lib/motion/gsap.ts`; import `gsap` and `ScrollTrigger` from there.
- Lenis runs as a global instance (`src/lib/motion/SmoothScroll.tsx`), driven by `gsap.ticker`. Use `useLenis()` from `lenis/react` to reach it (for example `stop()` while a full-screen menu is open).
- Responsive visibility (`hidden md:block`) goes on a wrapper, not on an element that already sets `display` (`inline-flex`): the two conflict and the wrong one wins.
- Accessibility: semantic landmarks, skip link, visible focus (1px espresso outline with offset), keyboard-operable filters, size selector and accordions, alt text from the manifest, AA contrast, touch targets of at least 44px.

## Target structure

```
public/images/             CREDITS.md, editorial/, products/, set/ (lookbook/ not yet)
public/video/              not yet: <id>.mp4, <id>.webm, <id>.jpg, CREDITS.md
public/models/, hdri/, draco/   not yet: lookbook model, HDRI, local Draco decoder
scripts/images/            verify.mjs, accept.mjs
scripts/video/             verify.mjs (accept.mjs not yet)
.image-staging/, .video-staging/   gitignored downloads awaiting review
src/app/                   routes, layout (fonts, providers, SceneLayer, Navbar, Footer), globals.css
src/components/layout/     Navbar, Footer, NewsletterForm, PageTransition, Cursor
src/components/ui/         Container, Heading, Label, Button, AnimatedLink, LineReveal, ScrubText, Accordion
src/components/media/      Photo (manifest id to next/image), RevealImage, Parallax
src/components/scene/      PageSetup, SceneSection
src/components/home/       Hero, Statement, Featured (materials, lookbook teaser not yet)
src/components/product/    ProductTile, ProductGallery (with viewer), PurchasePanel, StickyPanel, CompleteTheLook
src/components/collection/ Catalog, CatalogCard, useScrollTilt
src/components/lookbook/   LookbookExperience, LookbookWalk, LookbookStack, LookbookIndex
src/three/                 SceneLayer, SceneCanvas, SetPoster, config, presets, rig/ (Rig, path), set/ (Studio, Corridor, Cyclorama, ArchWall, Forms, Dust, materials)
src/lib/                   site, palette, cn, images, format, bag-store, url-param, capabilities, scene-store, scene-sections, motion/ (easing, gsap, SmoothScroll, ScrollSync, MotionProvider)
src/data/                  image-manifest.json, products.ts, lookbook.ts
```

## Before calling something done

Browser checks: headless Chrome through puppeteer-core. Two things the default headless setup hides, both of which let bugs through here:

- The software renderer (`--use-angle=swiftshader`) runs this scene at about 10 fps and is not Direct3D. Run at least one pass on the real GPU, `--enable-gpu --use-angle=d3d11`, at the user's screen size (1366x768), without `?scene=on`, for more than 30 seconds: that is the only way to see frame-rate fallbacks and driver shader warnings.
- Scroll with real wheel events (`page.mouse.wheel`), not only `window.scrollTo`, and reach pages through links as well as by direct load. `?scene=on` locks the mode, so it cannot show a wrong fallback.


- `npm run build` and `npm run lint` pass, with no browser console errors.
- Checked at 375px, 768px and 1440px, with reduced motion on, and with `?scene=off`.
- No hotlinked images, video, models or decoders: no image-host, video-host or CDN URLs in `src/`.
- Footage: each clip under 3 MB, no audio track, poster present, scrub checked with real wheel events on the real GPU, and the page checked with the video blocked (poster only).
- Copy checked against the banned list above.
