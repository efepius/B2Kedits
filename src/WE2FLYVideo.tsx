import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
} from "remotion";
import { Video, Audio } from "@remotion/media";

const AUDIO_URL =
  "https://drive.google.com/uc?export=download&id=1D2YNXZfc56xwACUw_bHvfFfVrVIiSitH";

const AudioTrack: React.FC = () => {
  return <Audio src={AUDIO_URL} volume={1} />;
};

const CLIP_DURATION = 150;
const WITHIN_SCENE_OVERLAP = 20;
const SCENE_CHANGE_OVERLAP = 30;
const LABEL_FADE_IN = 20;
const LABEL_FADE_OUT_START = 130;

type ClipData = {
  url: string;
  sceneLabel: string;
  bgColor: string;
};

const CLIPS: ClipData[] = [
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260314_230340_1cef6999-09c0-4924-85b5-71a6fab9dbd1.mp4",
    sceneLabel: "SCENE 1 - THE STUDIO",
    bgColor: "#0a0015",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260314_225647_94fc4849-76a1-4533-a092-80f62dc63127.mp4",
    sceneLabel: "SCENE 1 - THE STUDIO",
    bgColor: "#0a0015",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260314_225647_b6b0c731-2230-4260-8556-1b18a575b9d0.mp4",
    sceneLabel: "SCENE 2 - THE APARTMENT",
    bgColor: "#00101e",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260314_225400_4674e311-b093-4247-b0ec-07634d63fac7.mp4",
    sceneLabel: "SCENE 2 - THE APARTMENT",
    bgColor: "#00101e",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260313_122608_b7508544-982b-446f-9dd8-e7b9d3cd3699.mp4",
    sceneLabel: "SCENE 3 - THE BEACH",
    bgColor: "#1a0e00",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260313_122528_d6fe124d-2bcc-4af5-b6a6-9990d402c49e.mp4",
    sceneLabel: "SCENE 3 - THE BEACH",
    bgColor: "#1a0e00",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260313_122402_aa27aac3-6ff9-43a0-8ef0-4a4393f4f446.mp4",
    sceneLabel: "SCENE 3 - THE BEACH",
    bgColor: "#1a0e00",
  },
];

// Overlap between each pair of clips
// Scene changes get longer dissolves, within-scene get shorter
const OVERLAPS = [
  WITHIN_SCENE_OVERLAP, // Studio 1→2
  SCENE_CHANGE_OVERLAP, // Studio→Apartment
  WITHIN_SCENE_OVERLAP, // Apartment 1→2
  SCENE_CHANGE_OVERLAP, // Apartment→Beach
  WITHIN_SCENE_OVERLAP, // Beach 1→2
  WITHIN_SCENE_OVERLAP, // Beach 2→3
];

const IS_SCENE_CHANGE = [false, true, false, true, false, false];

// Calculate start frame for each clip accounting for overlaps
function getClipStartFrames(): number[] {
  const starts = [0];
  for (let i = 1; i < CLIPS.length; i++) {
    starts.push(starts[i - 1] + CLIP_DURATION - OVERLAPS[i - 1]);
  }
  return starts;
}

const CLIP_STARTS = getClipStartFrames();

// A single clip with Ken Burns, scene label, and watermark
const ClipSegment: React.FC<{
  clip: ClipData;
  clipIndex: number;
  globalFrame: number;
}> = ({ clip, clipIndex, globalFrame }) => {
  const frame = useCurrentFrame();

  // Determine overlap amounts for this clip's entry and exit
  const entryOverlap = clipIndex > 0 ? OVERLAPS[clipIndex - 1] : 0;
  const exitOverlap =
    clipIndex < CLIPS.length - 1 ? OVERLAPS[clipIndex] : 0;
  const isEntrySceneChange =
    clipIndex > 0 ? IS_SCENE_CHANGE[clipIndex - 1] : false;
  const isExitSceneChange =
    clipIndex < CLIPS.length - 1 ? IS_SCENE_CHANGE[clipIndex] : false;

  // --- OPACITY: cinematic crossfade ---
  // Fade in during overlap period (or first 12 frames if first clip)
  const fadeInDuration = clipIndex === 0 ? 12 : entryOverlap;
  const fadeIn = interpolate(frame, [0, fadeInDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Fade out during overlap period (or last 12 frames if last clip)
  const fadeOutDuration =
    clipIndex === CLIPS.length - 1 ? 12 : exitOverlap;
  const fadeOutStart = CLIP_DURATION - fadeOutDuration;
  const fadeOut = interpolate(
    frame,
    [fadeOutStart, CLIP_DURATION],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  // --- KEN BURNS: scale from 1.04 to 1.0, with acceleration during exit ---
  let scale: number;
  if (frame >= fadeOutStart && clipIndex < CLIPS.length - 1) {
    // During exit overlap, accelerate the zoom slightly for energy
    const exitProgress = interpolate(
      frame,
      [fadeOutStart, CLIP_DURATION],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const baseScale = interpolate(frame, [0, CLIP_DURATION], [1.04, 1.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    scale = baseScale - exitProgress * 0.01; // Slight extra zoom during exit
  } else {
    scale = interpolate(frame, [0, CLIP_DURATION], [1.04, 1.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // During entry, start slightly more zoomed for "breathing" motion
  if (frame < fadeInDuration && clipIndex > 0) {
    const entryProgress = interpolate(frame, [0, fadeInDuration], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
    scale = interpolate(entryProgress, [0, 1], [1.06, 1.04]);
  }

  // --- SCENE LABEL ---
  const labelFadeIn = interpolate(frame, [0, LABEL_FADE_IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const labelFadeOut = interpolate(
    frame,
    [LABEL_FADE_OUT_START, CLIP_DURATION],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const labelOpacity = Math.min(labelFadeIn, labelFadeOut);

  // --- WATERMARK ---
  const watermarkOpacity = 0.6 + 0.4 * Math.abs(Math.sin(globalFrame / 18));

  return (
    <AbsoluteFill style={{ backgroundColor: clip.bgColor }}>
      {/* Video with Ken Burns zoom */}
      <AbsoluteFill
        style={{
          opacity,
          transform: `scale(${scale})`,
          overflow: "hidden",
        }}
      >
        <Video
          src={clip.url}
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </AbsoluteFill>

      {/* Scene label - top left */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 36,
          color: "white",
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: 16,
          letterSpacing: 5,
          textTransform: "uppercase",
          opacity: labelOpacity * opacity,
          textShadow: "0 2px 8px rgba(0,0,0,0.9)",
        }}
      >
        {clip.sceneLabel}
      </div>

      {/* B26.VFX watermark - bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 28,
          color: "#FFD700",
          fontFamily: "Arial Black, Arial, sans-serif",
          fontSize: 20,
          fontWeight: 900,
          letterSpacing: 3,
          opacity: watermarkOpacity,
          textShadow:
            "0 0 10px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4)",
        }}
      >
        B26.VFX
      </div>
    </AbsoluteFill>
  );
};

// White flash overlay that appears at transition midpoints
const FlashOverlay: React.FC<{
  overlap: number;
  isSceneChange: boolean;
}> = ({ overlap, isSceneChange }) => {
  const frame = useCurrentFrame();
  const mid = overlap / 2;
  const peakOpacity = isSceneChange ? 0.25 : 0.15;
  const flashWidth = isSceneChange ? 8 : 4;

  const flashOpacity = interpolate(
    frame,
    [mid - flashWidth, mid, mid + flashWidth],
    [0, peakOpacity, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "white",
        opacity: flashOpacity,
        pointerEvents: "none",
      }}
    />
  );
};

export const WE2FLYVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Audio track — drop Baby Nepo.mp3 into public/ folder */}
      <AudioTrack />

      {/* Video clips with overlapping sequences */}
      {CLIPS.map((clip, i) => (
        <Sequence
          key={`clip-${i}`}
          from={CLIP_STARTS[i]}
          durationInFrames={CLIP_DURATION}
        >
          <ClipSegment clip={clip} clipIndex={i} globalFrame={frame} />
        </Sequence>
      ))}

      {/* Flash overlays at each transition point */}
      {OVERLAPS.map((overlap, i) => {
        const flashStart = CLIP_STARTS[i] + CLIP_DURATION - overlap;
        return (
          <Sequence
            key={`flash-${i}`}
            from={flashStart}
            durationInFrames={overlap}
          >
            <FlashOverlay
              overlap={overlap}
              isSceneChange={IS_SCENE_CHANGE[i]}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
