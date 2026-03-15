import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { Video, Audio } from "@remotion/media";
import {
  TransitionSeries,
  linearTiming,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { flip } from "@remotion/transitions/flip";
import { LightLeak } from "@remotion/light-leaks";

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

const BlackScreen: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000000" }} />
);

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
        {/* Fade in from black */}
        <TransitionSeries.Sequence durationInFrames={15}>
          <BlackScreen />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Clip 1 — Studio */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[0]} />
        </TransitionSeries.Sequence>

        {/* Wipe: Studio 1 → Studio 2 */}
        <TransitionSeries.Transition
          presentation={wipe()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 10,
          })}
        />

        {/* Clip 2 — Studio */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[1]} />
        </TransitionSeries.Sequence>

        {/* Light leak: Studio → Apartment (warm amber) */}
        <TransitionSeries.Overlay durationInFrames={30}>
          <LightLeak seed={1} hueShift={30} />
        </TransitionSeries.Overlay>

        {/* Clip 3 — Apartment */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[2]} />
        </TransitionSeries.Sequence>

        {/* Slide up: Apartment 1 → Apartment 2 */}
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Clip 4 — Apartment */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[3]} />
        </TransitionSeries.Sequence>

        {/* Light leak: Apartment → Beach (cool blue) */}
        <TransitionSeries.Overlay durationInFrames={30}>
          <LightLeak seed={3} hueShift={200} />
        </TransitionSeries.Overlay>

        {/* Clip 5 — Beach */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[4]} />
        </TransitionSeries.Sequence>

        {/* Slide left: Beach 1 → Beach 2 */}
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 12 })}
        />

        {/* Clip 6 — Beach */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[5]} />
        </TransitionSeries.Sequence>

        {/* Flip: Beach 2 → Beach 3 */}
        <TransitionSeries.Transition
          presentation={flip()}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: 10,
          })}
        />

        {/* Clip 7 — Beach */}
        <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
          <ClipSegment clip={CLIPS[6]} />
        </TransitionSeries.Sequence>

        {/* Fade out to black */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={15}>
          <BlackScreen />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
