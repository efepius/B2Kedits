import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Video, Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import {
  NeonGlitchOverlay,
  NeonWhiteFlashOverlay,
  LightLeakSweep,
  ColorBurnOverlay,
  ZoomOutWipe,
  ZoomPunchIn,
  FadeFromBlack,
  IrisCloseOverlay,
} from "./transitions";

const AUDIO_URL =
  "https://drive.google.com/uc?export=download&id=1D2YNXZfc56xwACUw_bHvfFfVrVIiSitH";

const AudioTrack: React.FC = () => {
  return <Audio src={AUDIO_URL} volume={1} />;
};

const CLIP_DURATION = 150;

type ClipData = {
  url: string;
  bgColor: string;
};

const CLIPS: ClipData[] = [
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260314_230340_1cef6999-09c0-4924-85b5-71a6fab9dbd1.mp4",
    bgColor: "#0a0015",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260314_225647_94fc4849-76a1-4533-a092-80f62dc63127.mp4",
    bgColor: "#0a0015",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260314_225647_b6b0c731-2230-4260-8556-1b18a575b9d0.mp4",
    bgColor: "#00101e",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260314_225400_4674e311-b093-4247-b0ec-07634d63fac7.mp4",
    bgColor: "#00101e",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260313_122608_b7508544-982b-446f-9dd8-e7b9d3cd3699.mp4",
    bgColor: "#1a0e00",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260313_122528_d6fe124d-2bcc-4af5-b6a6-9990d402c49e.mp4",
    bgColor: "#1a0e00",
  },
  {
    url: "https://d8j0ntlcm91z4.cloudfront.net/user_39oDrSE80qe4nIexEV0pEMS2PAj/hf_20260313_122402_aa27aac3-6ff9-43a0-8ef0-4a4393f4f446.mp4",
    bgColor: "#1a0e00",
  },
];

const ClipSegment: React.FC<{ clip: ClipData }> = ({ clip }) => {
  const frame = useCurrentFrame();

  // Ken Burns: scale from 1.04 down to 1.0
  const scale = interpolate(frame, [0, CLIP_DURATION], [1.04, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Watermark: pulsing opacity
  const watermarkOpacity = 0.6 + 0.4 * Math.abs(Math.sin(frame / 18));

  return (
    <AbsoluteFill style={{ backgroundColor: clip.bgColor }}>
      <AbsoluteFill
        style={{
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
      <AudioTrack />

      <TransitionSeries>
        {/* ── Clip 1 — Studio (fade in from black) ── */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[0]} />
          <FadeFromBlack durationFrames={15} />
        </TransitionSeries.Sequence>

        {/* T1: Neon Glitch Cut (Studio 1 → Studio 2) */}
        <TransitionSeries.Overlay durationInFrames={8}>
          <NeonGlitchOverlay />
        </TransitionSeries.Overlay>

        {/* ── Clip 2 — Studio ── */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[1]} />
        </TransitionSeries.Sequence>

        {/* T2: Neon White Flash (Studio → Apartment scene change) */}
        <TransitionSeries.Overlay durationInFrames={24}>
          <NeonWhiteFlashOverlay />
        </TransitionSeries.Overlay>

        {/* ── Clip 3 — Apartment ── */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[2]} />
        </TransitionSeries.Sequence>

        {/* T3: Light Leak Sweep (Apartment 1 → Apartment 2) */}
        <TransitionSeries.Overlay durationInFrames={12}>
          <LightLeakSweep />
        </TransitionSeries.Overlay>

        {/* ── Clip 4 — Apartment (zoom-out wipe at end) ── */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ZoomOutWipe activateFrame={120} durationFrames={30}>
            <ClipSegment clip={CLIPS[3]} />
          </ZoomOutWipe>
        </TransitionSeries.Sequence>

        {/* Hard cut — ZoomOutWipe handles the visual exit */}

        {/* ── Clip 5 — Beach ── */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[4]} />
        </TransitionSeries.Sequence>

        {/* T5: Color Burn (Beach 1 → Beach 2) */}
        <TransitionSeries.Overlay durationInFrames={12}>
          <ColorBurnOverlay />
        </TransitionSeries.Overlay>

        {/* ── Clip 6 — Beach ── */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[5]} />
        </TransitionSeries.Sequence>

        {/* Hard cut — ZoomPunchIn handles the visual entry */}

        {/* ── Clip 7 — Beach (zoom punch in + iris close) ── */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ZoomPunchIn durationFrames={12}>
            <ClipSegment clip={CLIPS[6]} />
          </ZoomPunchIn>
          <IrisCloseOverlay activateFrame={120} durationFrames={30} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
