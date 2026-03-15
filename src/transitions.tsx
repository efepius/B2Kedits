import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

// ═══════════════════════════════════════════════════════════════
// OVERLAY EFFECTS — used inside <TransitionSeries.Overlay>
// useCurrentFrame() returns local frame (0 to durationInFrames)
// ═══════════════════════════════════════════════════════════════

/**
 * T1 — NEON GLITCH CUT (8 frames)
 * RGB channel split + neon purple flash at the cut point.
 */
export const NeonGlitchOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const offsetR = interpolate(frame, [0, 4, 8], [0, -8, 0], {
    extrapolateRight: "clamp",
  });
  const offsetB = interpolate(frame, [0, 4, 8], [0, 8, 0], {
    extrapolateRight: "clamp",
  });
  const skewY = interpolate(frame, [0, 2, 5, 8], [0, 2, -1, 0], {
    extrapolateRight: "clamp",
  });
  const flashOp = interpolate(frame, [0, 1, 7, 8], [0, 0.7, 0.7, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${offsetR}px) skewY(${skewY}deg)`,
          mixBlendMode: "screen",
          opacity: 0.6,
          backgroundColor: "rgba(255,0,80,0.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${offsetB}px)`,
          mixBlendMode: "screen",
          opacity: 0.6,
          backgroundColor: "rgba(0,100,255,0.15)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#bf00ff",
          opacity: flashOp,
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * T2 — NEON WHITE FLASH (24 frames)
 * Radial gradient flash that shifts purple → white for scene changes.
 */
export const NeonWhiteFlashOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = 24;
  const opacity = interpolate(frame, [0, 4, 12, duration], [0, 1, 1, 0], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const hue = interpolate(frame, [0, 8, duration], [280, 200, 0]);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse at center, hsl(${hue},100%,98%) 0%, hsl(${hue},80%,60%) 60%, transparent 100%)`,
        opacity,
      }}
    />
  );
};

/**
 * T3 — LIGHT LEAK SWEEP (12 frames)
 * Diagonal amber light streak sweeping left to right.
 */
export const LightLeakSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = 12;
  const progress = interpolate(frame, [0, duration], [0, 1], {
    easing: Easing.inOut(Easing.sine),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [0, 4, 8, duration], [0, 0.85, 0.85, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(progress, [0, 1], [-50, 120]);

  return (
    <AbsoluteFill
      style={{ pointerEvents: "none", overflow: "hidden", opacity }}
    >
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: `${x}%`,
          width: "80%",
          height: "140%",
          background:
            "linear-gradient(135deg, rgba(255,200,80,0.7) 0%, rgba(255,140,0,0.5) 40%, transparent 70%)",
          transform: "rotate(-20deg)",
          filter: "blur(18px)",
        }}
      />
    </AbsoluteFill>
  );
};

/**
 * T5 — COLOR BURN (12 frames)
 * Orange radial burn with brightness flash.
 */
export const ColorBurnOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const duration = 12;
  const opacity = interpolate(frame, [0, 3, 8, duration], [0, 1, 1, 0], {
    easing: Easing.out(Easing.quad),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const brightness = interpolate(frame, [0, 5, duration], [1, 2.5, 1.2]);

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at center, rgba(255,160,0,0.95) 0%, rgba(255,80,0,0.7) 50%, rgba(180,40,0,0.3) 100%)",
        opacity,
        filter: `brightness(${brightness})`,
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════
// CLIP WRAPPER EFFECTS — wrap ClipSegment inside a Sequence
// useCurrentFrame() returns local frame within the clip (0 to CLIP_DURATION)
// ═══════════════════════════════════════════════════════════════

/**
 * T4 — ZOOM-OUT SCALE WIPE (30 frames)
 * Outgoing clip scales up, blurs, and fades to nothing.
 * Wrap around ClipSegment for the last clip before a scene change.
 */
export const ZoomOutWipe: React.FC<{
  activateFrame: number;
  durationFrames?: number;
  children: React.ReactNode;
}> = ({ activateFrame, durationFrames = 30, children }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - activateFrame;

  if (localFrame < 0 || localFrame > durationFrames) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const scale = interpolate(localFrame, [0, durationFrames], [1, 1.35], {
    easing: Easing.in(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(
    localFrame,
    [0, durationFrames * 0.6, durationFrames],
    [1, 0.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const blur = interpolate(localFrame, [0, durationFrames], [0, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/**
 * T6 — ZOOM PUNCH (12 frames)
 * Incoming clip punches in with a scale overshoot, then settles.
 * Wrap around ClipSegment for the first clip after a hard cut.
 */
export const ZoomPunchIn: React.FC<{
  durationFrames?: number;
  children: React.ReactNode;
}> = ({ durationFrames = 12, children }) => {
  const frame = useCurrentFrame();

  if (frame >= durationFrames) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const scale = interpolate(frame, [0, 5, durationFrames], [1.25, 1.08, 1.0], {
    easing: Easing.out(Easing.back(1.5)),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        overflow: "hidden",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════
// IN-CLIP EFFECTS — rendered as siblings inside a Sequence
// ═══════════════════════════════════════════════════════════════

/**
 * Fade from black — renders a black overlay that fades out.
 * Place as sibling after ClipSegment in the first clip's Sequence.
 */
export const FadeFromBlack: React.FC<{
  durationFrames?: number;
}> = ({ durationFrames = 15 }) => {
  const frame = useCurrentFrame();
  if (frame >= durationFrames) return null;

  const opacity = interpolate(frame, [0, durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{ backgroundColor: "#000", opacity, pointerEvents: "none" }}
    />
  );
};

/**
 * T7 — IRIS CLOSE (30 frames)
 * Circular mask closing to black at the end of the video.
 * Place as sibling after ClipSegment in the last clip's Sequence.
 */
export const IrisCloseOverlay: React.FC<{
  activateFrame: number;
  durationFrames?: number;
}> = ({ activateFrame, durationFrames = 30 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - activateFrame;
  if (localFrame < 0) return null;

  const radius = interpolate(localFrame, [0, durationFrames], [150, 0], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(circle at 50% 50%, transparent ${radius}%, black ${radius + 0.5}%)`,
      }}
    />
  );
};
