import { Sequence, staticFile, Html5Audio, useCurrentFrame } from 'remotion'; 
import { MicroSceneComp } from './MicroSceneComp';

interface MainVideoProps {
  manifest?: typeof import('../video_manifest.json');
  language?: 'en' | 'te';
}

// Updated Progress Bar: Shifted lower for breathing room + distinct track/container styling
const TopicProgressBar: React.FC<{ durationInFrames: number }> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const progress = Math.min(1, frame / durationInFrames); // Cap at 1 (100%)

  return (
    <div style={{
      position: 'absolute', 
      top: '1000px', // Pushed lower to leave comfortable space below multi-line captions
      left: '10%',  
      width: '80%', 
      height: '24px', // Slightly thicker pill style
      backgroundColor: '#e5e7eb', // Distinct track color
      border: '2px solid #cbd5e1', // Outline to define the track shape
      borderRadius: '12px',
      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.08)', // Inset shadow gives depth to the container slot
      zIndex: 100,
      overflow: 'hidden' 
    }}>
      <div style={{
        width: `${progress * 100}%`, 
        height: '100%',
        backgroundColor: '#FF2A5F', // Vibrant engagement fill color
        borderRadius: '10px'
      }} />
    </div>
  );
};

export const MainVideo: React.FC<MainVideoProps> = ({ manifest, language = 'te' }) => {
  const fps = 30;

  if (!manifest) return null;

  return (
    <div style={{ flex: 1, backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
      
      {/* Dynamic Audio Source Tracks */}
      {manifest.comparisons.map((comparison, compIdx) => (
        <Html5Audio 
          key={`audio-${compIdx}`} 
          src={staticFile(`audio/narration.mp3`)} 
        />
      ))}

      {/* Sequential Composition Timeline Layout Rendering */}
      {manifest.comparisons.map((comparison, compIdx) => {
        // Calculate the absolute start and end frames for the ENTIRE comparison topic
        const compStartFrame = Math.round(comparison.steps[0].start_time_seconds * fps);
        const compEndFrame = Math.round(comparison.steps[comparison.steps.length - 1].end_time_seconds * fps);
        const compDurationFrames = compEndFrame - compStartFrame;

        return (
          // Group the topic into a master Sequence to scope the progress bar
          <Sequence key={`comp-${compIdx}`} from={compStartFrame} durationInFrames={compDurationFrames}>
            
            <TopicProgressBar durationInFrames={compDurationFrames} />

            {comparison.steps.map((step, index) => {
              const stepStartFrame = Math.round(step.start_time_seconds * fps);
              const stepEndFrame = Math.round(step.end_time_seconds * fps);
              const durationInFrames = stepEndFrame - stepStartFrame;
              
              const relativeStartFrame = stepStartFrame - compStartFrame;

              if (durationInFrames <= 0) return null;

              const isNewAnimal = 
                index === 0 || 
                step.visible_animals.length > comparison.steps[index - 1].visible_animals.length;

              return (
                <Sequence
                  key={`${comparison.topic_name}-step-${step.step_id}`}
                  from={relativeStartFrame}
                  durationInFrames={durationInFrames}
                >
                  {isNewAnimal && (
                    <Html5Audio src={staticFile('audio/click.mp3')} />
                  )}
                  
                  <MicroSceneComp 
                    step={step} 
                    comparison={comparison} 
                    language={language} 
                  />
                </Sequence>
              );
            })}
          </Sequence>
        );
      })}
    </div>
  );
};