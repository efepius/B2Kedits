import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { Video } from "@remotion/media";

const CLIP_DURATION = 150; // 5 seconds at 30fps
const FADE_FRAMES = 12;
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

const ClipSegment: React.FC<{ clip: ClipData }> = ({ clip }) => {
  const frame = useCurrentFrame();

  // Fade in/out opacity
  const fadeIn = interpolate(frame, [0, FADE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [CLIP_DURATION - FADE_FRAMES, CLIP_DURATION],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  // Ken Burns: scale from 1.04 to 1.0
  const scale = interpolate(frame, [0, CLIP_DURATION], [1.04, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Scene label opacity: fade in 0-20, fade out 130-150
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

  // B26.VFX watermark pulsing opacity
  const watermarkOpacity = 0.6 + 0.4 * Math.abs(Math.sin(frame / 18));

  return (
    <AbsoluteFill style={{ backgroundColor: clip.bgColor }}>
      {/* Video with Ken Burns zoom and fade */}
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
          opacity: labelOpacity,
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

export const WE2FLYVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {CLIPS.map((clip, i) => (
        <Sequence
          key={i}
          from={i * CLIP_DURATION}
          durationInFrames={CLIP_DURATION}
        >
          <ClipSegment clip={clip} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
