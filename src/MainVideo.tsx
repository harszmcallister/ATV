import { Sequence, staticFile, Html5Audio } from 'remotion'; 
import { MicroSceneComp } from './MicroSceneComp';

interface MainVideoProps {
  manifest?: typeof import('../video_manifest.json');
  language?: 'en' | 'te'; // <-- Added language prop
}

export const MainVideo: React.FC<MainVideoProps> = ({ manifest, language = 'te' }) => {
  const fps = 30;

  if (!manifest) return null;

  return (
    <div style={{ flex: 1, backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
      
      {manifest.comparisons.map((comparison, compIdx) => (
        <Html5Audio 
          key={`audio-${compIdx}`} 
          src={staticFile(`audio/narration.mp3`)} 
        />
      ))}

      {manifest.comparisons.map((comparison, compIdx) =>
        comparison.steps.map((step, index) => {
          const startFrame = Math.round(step.start_time_seconds * fps);
          const endFrame = Math.round(step.end_time_seconds * fps);
          const durationInFrames = endFrame - startFrame;

          if (durationInFrames <= 0) return null;

          const isNewAnimal = 
            index === 0 || 
            step.visible_animals.length > comparison.steps[index - 1].visible_animals.length;

          return (
            <Sequence
              key={`${comparison.topic_name}-step-${step.step_id}-${index}`}
              from={startFrame}
              durationInFrames={durationInFrames}
            >
              {isNewAnimal && (
                <Html5Audio src={staticFile('audio/click.mp3')} />
              )}
              
              {/* CRITICAL FIX: Pass comparison and language down to the scene! */}
              <MicroSceneComp 
                step={step} 
                comparison={comparison} 
                language={language} 
              />
            </Sequence>
          );
        })
      )}
    </div>
  );
};