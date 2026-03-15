# B2Kedits

Remotion project — AI video production pipeline for the **444 Monochrome** project.

## Repository

- **Repo**: github.com/efepius/B2Kedits
- **Main branch**: main

## Skills

Remotion best practices skill is installed at `.agents/skills/remotion-best-practices/`.
Read `SKILL.md` there for rule lookup when working with Remotion code (animations, audio, captions, charts, fonts, transitions, etc.).

---

## 444 Monochrome Production Workflow — Full Reference

### Pipeline Architecture (3 layers)

1. **Generation** — Multi-model orchestrators (Higgsfield, Adobe Firefly) with image-to-video workflow
2. **Processing** — FFmpeg for transitions, LUT grading, text overlays, speed ramps, audio ducking
3. **Scaling** — Under 100 vids/month: FFmpeg + Python. At scale: Creatomate ($0.06/min) or Remotion Lambda (~$0.01/render)

### Production Workflow

1. Generate/perfect still images (Midjourney, DALL·E, Stable Diffusion)
2. Refine composition, lighting, character consistency in image domain (cheap iteration)
3. Animate stills using AI video models (Sora 2, Veo 3.1, Kling, Runway)
4. Batch upscale to target resolution (Topaz Video AI Astra — use 2× not 4×)
5. Frame interpolation if needed (Topaz Chronos or RIFE open-source)
6. Rough assembly in NLE (Premiere, Resolve, or Descript)
7. Color matching (Colourlab AI → DaVinci Resolve Color page)
8. Apply unified LUT + film grain overlay (film grain = #1 cohesion technique)
9. Sound design (ElevenLabs for VO, Suno for music, ambient layers)
10. Final audio mix, export

### Higgsfield AI

- Multi-model orchestrator (not single model): Sora 2, Veo 3.1, Kling 2.6/3.0, WAN 2.5, MiniMax/Hailuo, Seedance + proprietary models
- 20M+ users, 4M videos/day. Uses GPT-4.1/GPT-5 for planning
- **Cinema Studio 2.0**: 6 camera bodies, 11 lens types, 15+ camera movements (dolly, crash zoom, 360 orbit, FPV drone, bullet time, crane). Stack up to 3 simultaneous movements
- Resolution: 480p–4K depending on model/plan. Kling 2.6 = native 4K, Veo 3.1 = 1080p@24fps, Sora 2 = 1080p Pro
- Duration: 3–15s per clip (Kling 3.0 = 15s longest, Veo 3.1 = 8s max)
- Aspect ratios: 16:9, 9:16, 3:4, 2:3, 3:2, 1:1
- **Credit burn is aggressive**: Sora 2 = 50+ credits/video, Veo 3.1 w/ sound = 70+. Ultimate plan (1,200 credits/$49/mo) = ~15 quality videos/month
- **API**: cloud.higgsfield.ai, Python SDK: `pip install higgsfield-client` (Apache-2.0, GitHub: higgsfield-ai/higgsfield-client)
- API docs are sparse (4hrs to reverse-engineer auth). No native NLE integrations. Third-party via Make.com, Segmind, Unifically

#### Higgsfield API example

```python
from higgsfield_client import HiggsFieldClient
result = higgsfield_client.subscribe(
    'bytedance/seedream/v4/text-to-image',
    arguments={
        'prompt': 'A serene lake at sunset',
        'resolution': '2K',
        'aspect_ratio': '16:9',
    }
)
```

#### Prompt engineering for Higgsfield

- Separate image, identity, and motion into 3 distinct prompt jobs (mixing causes drift)
- Lead with style: "cinematic," "photorealistic," "shot on full-frame cinema camera"
- Use specific camera verbs: "dolly in," "orbit around subject" — never "dynamic"
- Describe action with strong verbs, not categories (not "Marvel movie" → "a man in futuristic armor walks through fire")
- Keep prompts short and command-like
- Reference images: 4 optimized refs — hero portrait, environment, object/product, mood/lighting

#### Platform comparison

| Feature | Higgsfield | Runway Gen-4 | Kling AI | Sora 2 | Pika |
|---|---|---|---|---|---|
| Approach | Multi-model orchestrator | Single model | Standalone | Single model | Fast ideation |
| Max res | 4K (upscale) | 4K (Pro) | 4K (Kling 2.6) | 1080p (Pro) | 1080p |
| Max duration | 15s (Kling 3.0) | 10s | 15s | 20s (Pro) | 10s |
| Starting price | $9/mo | $12/mo | $10/mo | $20/mo | $8/mo |

### Character Consistency Strategies

Character drift = #1 challenge in AI filmmaking.

- **Runway Gen-4**: Upload 6-10 reference images per character, increase guidance weight on first pass
- **Sora 2**: "Character Cameos" (Oct 2025) — tag and reuse characters
- **LTX Studio**: "Elements" system — persistent reusable assets with @ mentions
- **Google Flow**: Asset grid with @ references
- Build a **character bible**: face, hair, clothing, accessories, posture. Use identical prompt language every generation
- Generate hero close-up first (highest scrutiny), then match medium/wide shots
- Keep single dominant light direction per scene — flipping key light causes identity wobble

### Color Matching Across AI Clips

- **Colourlab AI 3.5**: On-device, 22× faster, AI Auto-Balance, integrates with DaVinci Resolve
- **Color.io**: Free online tool — analyzes reference image, creates 3D color mapping, exports .cube LUTs
- **fylm.ai**: Browser-based AI grading, one-click sync to Premiere Pro
- Workflow: Pick hero frame → grade to desired look → export as LUT → apply across all clips → add film grain as final layer

### FFmpeg Command Reference

#### Cinematic transitions (xfade)

35+ built-in transitions: fade, wipeleft, circlecrop, dissolve, pixelize, radial, smoothleft, diagtl, hblur, circleopen, circleclose...

```bash
# Basic transition
ffmpeg -i first.mp4 -i second.mp4 \
  -filter_complex "xfade=transition=circlecrop:duration=2:offset=5" \
  output.mp4

# Multi-clip slideshow (offset = prev_offset + clip_duration - transition_duration)
ffmpeg -loop 1 -t 3 -i img1.jpg -loop 1 -t 3 -i img2.jpg -loop 1 -t 3 -i img3.jpg \
  -filter_complex \
  "[0][1]xfade=transition=circlecrop:duration=0.5:offset=2.5[f0]; \
   [f0][2]xfade=transition=smoothleft:duration=0.5:offset=5[f1]" \
  -map "[f1]" -r 25 -pix_fmt yuv420p output.mp4

# Custom glitch transition
ffmpeg -i first.mp4 -i second.mp4 \
  -filter_complex "xfade=transition=custom:duration=1:offset=4:\
  expr='if(gt(random(1)*20,P*20),A,B)'" output.mp4
```

xfade-easing GitHub project adds easing curves and 100+ ported GLSL transitions.

#### Animated text overlays

```bash
# Fade-in/hold/fade-out text
ffmpeg -y -i input.mp4 -vf \
  "drawtext=text='Speaker Name':fontsize=64:fontcolor=white:\
  x=(w-text_w)/2:y=(h-text_h)/2:\
  alpha=if(lt(t\,1.0)\,0\,if(lt(t\,1.3)\,(t-1.0)/0.3\,if(lt(t\,4.7)\,1\,if(lt(t\,5.0)\,((5.0-t)/0.3)\,0)))):\
  enable='between(t,1.0,5.0)'" -c:a copy output.mp4

# Two-line lower third with background
ffmpeg -i input.mp4 -vf \
  "drawtext=text='Jane Doe':x=50:y=(h-100):fontsize=42:fontcolor=white:\
   box=1:boxcolor=0x003366@0.7:boxborderw=12:enable='between(t,3,10)', \
   drawtext=text='VP of Marketing':x=50:y=(h-55):fontsize=28:fontcolor=yellow:\
   box=1:boxcolor=0x003366@0.7:boxborderw=8:enable='between(t,3,10)'" \
  -c:a copy output.mp4
```

#### Ken Burns (zoompan)

```bash
# Upscale input first to prevent pixelation during zoom
ffmpeg -loop 1 -framerate 60 -i image.jpg \
  -vf "scale=8000:-1,zoompan=z='zoom+0.001':\
  x=iw/2-(iw/zoom/2):y=ih/2-(ih/zoom/2):\
  d=5*60:s=1920x1080:fps=60" \
  -t 5 -c:v libx264 -pix_fmt yuv420p output.mp4
```

z='zoom+0.001' = zoom speed/frame. Corners: x=0:y=0 (top-left), x=iw-(iw/zoom):y=ih-(ih/zoom) (bottom-right). Zoom-out: z='if(lte(zoom,1.0),1.5,max(1.001,zoom-0.0015))'.

#### Color grading with LUTs

```bash
# LUT + eq fine-tuning
ffmpeg -i input.mp4 \
  -vf "lut3d=cinematic.cube:interp=tetrahedral,\
  eq=saturation=0.8:contrast=1.2:brightness=0.1:gamma=1.2" \
  -c:v libx264 -crf 18 output.mp4

# With color temperature
ffmpeg -i input.mp4 \
  -vf "lut3d=my_lut.cube,eq=saturation=0.8:contrast=1.15,\
  colortemperature=temperature=8000" \
  -c:v libx264 -crf 18 output.mp4
```

#### Speed ramps

```bash
# First 5s at 8× then normal
ffmpeg -i input.mp4 -filter_complex \
  "[0:v]trim=start=0:end=5,setpts=0.125*PTS[v1];\
   [0:v]trim=start=5,setpts=PTS-STARTPTS[v2];\
   [0:a]atrim=start=0:end=5,atempo=2,atempo=2,atempo=2[a1];\
   [0:a]atrim=start=5,asetpts=PTS-STARTPTS[a2];\
   [v1][a1][v2][a2]concat=n=2:v=1:a=1[out]" \
  -map "[out]" output.mp4

# Smooth slow-mo with frame interpolation
ffmpeg -i input.mp4 \
  -vf "setpts=2*PTS,minterpolate='mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=60'" \
  output.mp4
```

#### Audio ducking (sidechain compression)

```bash
ffmpeg -i music.mp3 -i voiceover.mp3 -filter_complex \
  "[1:a]asplit=2[sc][mix];\
   [0:a][sc]sidechaincompress=threshold=0.003:ratio=20:attack=200:release=1000[compr];\
   [compr][mix]amerge[out]" \
  -map "[out]" output.mp3
```

threshold=0.003 (~-50dB trigger), ratio=20 (aggressive duck), attack=200/release=1000 (dip/recover speed).

#### Picture-in-picture (animated slide-in)

```bash
ffmpeg -i main.mp4 -i pip.mp4 -filter_complex \
  "[1:v]scale=320:240[pip];\
   [0:v][pip]overlay='min(W-w-10,W-(W-w-10)*(t-1)/1)':10:enable='gte(t,1)'" \
  output.mp4
```

#### Watermarks

```bash
# Resolution-independent semi-transparent watermark (bottom-right, 15% height, 30% opacity)
ffmpeg -i input.mp4 -i logo.png -filter_complex \
  "[1]format=rgba,colorchannelmixer=aa=0.3[logo]; \
   [logo][0]scale2ref=oh*mdar:ih*0.15[logo][video]; \
   [video][logo]overlay=(W-w-10):(H-h-10)" \
  -c:a copy output.mp4
```

#### Intro/outro concatenation

```bash
# Lossless (matching codecs) via concat demuxer
# playlist.txt: file 'intro.mp4' / file 'main.mp4' / file 'outro.mp4'
ffmpeg -f concat -safe 0 -i playlist.txt -c copy output.mp4

# With resolution normalization (different codecs)
ffmpeg -i intro.mp4 -i main.mp4 -i outro.mp4 -filter_complex \
  "[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,\
   pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[v0]; \
   [1:v]scale=1920:1080:force_original_aspect_ratio=decrease,\
   pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[v1]; \
   [2:v]scale=1920:1080:force_original_aspect_ratio=decrease,\
   pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[v2]; \
   [v0][0:a][v1][1:a][v2][2:a]concat=n=3:v=1:a=1[outv][outa]" \
  -map "[outv]" -map "[outa]" output.mp4
```

#### Chapter metadata

```
;FFMETADATA1
[CHAPTER]
TIMEBASE=1/1000
START=0
END=120000
title=Introduction
[CHAPTER]
TIMEBASE=1/1000
START=120000
END=300000
title=Main Content
```

```bash
ffmpeg -i input.mp4 -i chapters.txt -map_metadata 1 -c copy output.mp4
```

### Python Batch Branding Pipeline

```python
import os, subprocess

BRAND = {
    "logo": "assets/logo.png",
    "intro": "assets/intro.mp4",
    "outro": "assets/outro.mp4",
    "opacity": 0.3,
    "scale": 0.15,
}

def brand_video(input_path, output_path):
    watermarked = output_path.replace('.mp4', '_wm.mp4')
    subprocess.run([
        'ffmpeg', '-i', input_path, '-i', BRAND['logo'],
        '-filter_complex',
        f"[1]format=rgba,colorchannelmixer=aa={BRAND['opacity']}[logo];"
        f"[logo][0]scale2ref=oh*mdar:ih*{BRAND['scale']}[logo][video];"
        f"[video][logo]overlay=(W-w-10):(H-h-10)",
        '-c:a', 'copy', watermarked
    ], check=True)

    with open('/tmp/playlist.txt', 'w') as f:
        f.write(f"file '{BRAND['intro']}'\nfile '{watermarked}'\nfile '{BRAND['outro']}'")
    subprocess.run([
        'ffmpeg', '-f', 'concat', '-safe', '0',
        '-i', '/tmp/playlist.txt', '-c', 'copy', output_path
    ], check=True)
    os.remove(watermarked)

for f in os.listdir('raw_videos'):
    if f.endswith('.mp4'):
        brand_video(f'raw_videos/{f}', f'branded/{f}')
```

### Automation Stack Comparison

| Use Case | Best Tool | Why |
|---|---|---|
| Data-driven personalized videos | Remotion + Lambda | Full code control, React ecosystem, scalable |
| Marketing variations at scale | Creatomate | Lowest cost ($0.06/min), visual editor + API |
| High-end AE motion graphics | Plainly or Nexrender | Leverages existing AE skills |
| Custom developer pipeline | Shotstack | JSON timeline, flexible, asset-agnostic |
| Color grading automation | DaVinci Resolve scripting | Industry-best color tools |
| Budget-conscious startup | Revideo (open-source, YC S23) or Rendervid | Zero licensing fees |

### Remotion specifics

- 21k+ GitHub stars, treats video as React components rendered frame-by-frame
- useCurrentFrame() and interpolate() for animation
- Cloud: Remotion Lambda (AWS) ~$0.001–0.02/render
- Pricing: Free ≤3 team members, $25/mo/seat Creators, $0.01/render + $100/mo min for Automators

### Key GitHub Repos

| Repo | Stars | Purpose |
|---|---|---|
| remotion-dev/remotion | 21k+ | React programmatic video |
| redotvideo/revideo | ~4k | TypeScript video framework (YC S23) |
| inlife/nexrender | ~1.6k | Data-driven AE render automation |
| scriptituk/xfade-easing | — | 100+ FFmpeg transitions with easing |
| higgsfield-ai/higgsfield-client | — | Official Higgsfield Python SDK |
| pedrolabonia/pydavinci | — | Pythonic DaVinci Resolve API |
| saud-learning-services/automated-video-brander | — | End-to-end video branding pipeline |
| heristop/ffmpeg-video-composer | — | JSON-template video compilation (Node.js) |
| Zulko/moviepy | 12k+ | Python video editing library |
| NatronGitHub/Natron | — | Open-source VFX compositor |
