import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';
import {NAVY, WHITE, ACCENT} from './theme';
const {fontFamily} = loadFont('normal', {weights: ['400', '700'], subsets: ['latin']});
// Animates in over ~1.5 s then holds (play once, keep last frame).
export const LowerThird: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const a = spring({frame: f, fps, config: {damping: 200}}), b = spring({frame: f - 8, fps, config: {damping: 200}}), c = spring({frame: f - 16, fps, config: {damping: 200}});
  return (
    <AbsoluteFill style={{fontFamily}}>
      <div style={{position: 'absolute', left: 0, top: 22, height: 74, width: 900 * a, background: WHITE, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: ACCENT}} />
        <div style={{position: 'absolute', left: 34, top: 12, fontSize: 44, fontWeight: 700, color: NAVY, letterSpacing: 1, opacity: b, whiteSpace: 'nowrap'}}>LEO</div>
      </div>
      <div style={{position: 'absolute', left: 0, top: 96, height: 46, width: 900 * b, background: NAVY, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 34, top: 9, fontSize: 24, color: WHITE, opacity: c, whiteSpace: 'nowrap'}}>Virtual Assistant, Austin AI Marketing</div>
      </div>
    </AbsoluteFill>
  );
};
