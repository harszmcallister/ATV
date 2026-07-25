import { Composition, getInputProps } from 'remotion';
import { MainVideo } from './MainVideo';
import manifestData from '../video_manifest.json';

export const Root: React.FC = () => {
  const fps = 30;
  let maxDurationSeconds = 0;

  manifestData.comparisons.forEach((comp) => {
    comp.steps.forEach((step) => {
      if (step.end_time_seconds > maxDurationSeconds) {
        maxDurationSeconds = step.end_time_seconds;
      }
    });
  });

  const durationInFrames = Math.ceil(maxDurationSeconds * fps) || 300;
  
  // Capture the language from CLI props, defaulting to 'te' (Telugu)
  const { language = 'te' } = getInputProps();

  return (
    <>
      <Composition
        id="AnimalComparisonVideo"
        component={MainVideo}
        durationInFrames={durationInFrames}
        fps={fps}
        width={1080}
        height={1920}
        defaultProps={{
          manifest: manifestData as any,
          language: language as 'en' | 'te', // Pass language down to MainVideo
        }}
      />
    </>
  );
};