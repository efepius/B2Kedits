# B2Kedits

Remotion project — video creation in React for the **444 Monochrome** project.

## Repository

- **Repo**: github.com/efepius/B2Kedits
- **Main branch**: main

## Project: 444 Monochrome Production Workflow

This is an AI video production pipeline for the 444 Monochrome project.

### Key Research Findings

- **Higgsfield AI** is a multi-model orchestration platform (not a single model) integrating Sora 2, Veo 3.1, Kling, and others. Serves 20M+ users generating 4M videos/day. Real-world testing shows aggressive credit consumption — a 1,200-credit Ultimate plan produces only ~15 quality videos per month.

- **Image-to-video workflow** is the 2025-2026 industry best practice: generate and perfect still images first, then animate them. Character consistency across shots is the #1 challenge, addressed through reference image systems, character bibles, and tools like Runway's Reference feature and Sora 2's Character Cameos.

- **Film grain** is the single most effective technique for unifying visually disparate AI-generated clips into cohesive final films.

- **FFmpeg techniques** for the pipeline: cinematic transitions, animated text overlays, color grading with LUTs, Ken Burns effect, speed ramps, audio ducking, picture-in-picture, and complex filter chains.

### Production Workflow Summary

1. Generate/perfect still images (character consistency via reference systems)
2. Animate stills using AI video models (Sora 2, Veo 3.1, Kling, Runway)
3. Post-process with FFmpeg (transitions, color grading, text overlays)
4. Unify clips with film grain for visual cohesion
5. Final assembly with Remotion (React-based video composition)

## Skills

Remotion best practices skill is installed at `.agents/skills/remotion-best-practices/`.
Read `SKILL.md` there for rule lookup when working with Remotion code (animations, audio, captions, charts, fonts, transitions, etc.).
