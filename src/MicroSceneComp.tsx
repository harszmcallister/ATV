import React from 'react';
import { staticFile } from 'remotion';

interface MicroSceneProps {
  step: {
    step_id: number;
    spoken_phrase: string;
    visible_animals: string[]; 
    selected_stickman_pose: string;
    text_overlay: string;
  };
  comparison: {
    item_a_title_en: string;
    item_a_title_te: string;
    item_b_title_en: string;
    item_b_title_te: string;
  };
  language: 'en' | 'te';
}

export const MicroSceneComp: React.FC<MicroSceneProps> = ({ step, comparison, language }) => {
  
  // Resolve the correct titles based on the selected language
  const titleA = language === 'en' ? comparison.item_a_title_en : comparison.item_a_title_te;
  const titleB = language === 'en' ? comparison.item_b_title_en : comparison.item_b_title_te;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#ffffff', padding: '60px 40px' }}>
      
      {/* 1. TOP PORTION: Animals Side-by-Side Placement */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', width: '100%', height: '580px', marginTop: '140px', gap: '30px' }}>
        
        {/* Left Slot: Animal 1 */}
        <div style={{ width: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {step.visible_animals[0] && (
            <>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#111', marginBottom: '24px', textAlign: 'center' }}>
                {titleA}
              </div>
              <img
                src={staticFile(`animals/${step.visible_animals[0]}`)}
                style={{ width: '100%', height: '450px', objectFit: 'contain', borderRadius: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                alt={titleA}
              />
            </>
          )}
        </div>

        {/* Right Slot: Animal 2 */}
        <div style={{ width: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {step.visible_animals[1] && (
            <>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#111', marginBottom: '24px', textAlign: 'center' }}>
                {titleB}
              </div>
              <img
                src={staticFile(`animals/${step.visible_animals[1]}`)}
                style={{ width: '100%', height: '450px', objectFit: 'contain', borderRadius: '36px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                alt={titleB}
              />
            </>
          )}
        </div>
      </div>

      {/* 2. MIDDLE PORTION: Short Character-Friendly Captions */}
      <div style={{ textAlign: 'center', fontSize: '56px', fontWeight: '900', color: '#000000', fontFamily: 'System-UI, sans-serif', margin: '20px auto', lineHeight: '1.4', maxWidth: '90%', wordBreak: 'break-word' }}>
        {step.text_overlay}
      </div>

      {/* 3. BOTTOM PORTION: Centered Stickman Figure */}
      {step.selected_stickman_pose && (
        <div style={{ position: 'absolute', bottom: '200px', left: '0', right: '0', textAlign: 'center' }}>
          <img
            src={staticFile(`stickman/${step.selected_stickman_pose}`)}
            style={{ height: '680px', objectFit: 'contain' }}
            alt="stickman pose"
          />
        </div>
      )}
    </div>
  );
};