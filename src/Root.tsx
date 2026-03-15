import { Composition } from "remotion";
import { WE2FLYVideo } from "./WE2FLYVideo";

export const RemotionRoot = () => {
  return (
    <Composition
      id="WE2FLYVideo"
      component={WE2FLYVideo}
      durationInFrames={910}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
