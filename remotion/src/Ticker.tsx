import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';
import {NAVY, WHITE, ACCENT} from './theme';
const {fontFamily} = loadFont('normal', {weights: ['400', '600'], subsets: ['latin']});
const ITEMS = ['Booking & landing pages from $497', 'Reels & monthly content packages', 'AI reply bots that answer in minutes', 'austinaimarketingco.com', 'Demo assistant · runs in your browser'];
// Seamless loop: the strip is duplicated and moves exactly one strip-width per loop.
export const Ticker: React.FC = () => {
  const f = useCurrentFrame(); const {durationInFrames: D} = useVideoConfig();
  const W = 2400; const x = -(f / D) * W;
  const strip = (k: number) => (
    <div key={k} style={{position: 'absolute', left: x + k * W, top: 0, width: W, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
      {ITEMS.map((t) => <span key={t} style={{fontSize: 26, color: WHITE, whiteSpace: 'nowrap'}}><span style={{color: ACCENT, marginRight: 18}}>■</span>{t}</span>)}
    </div>
  );
  return (
    <AbsoluteFill style={{background: NAVY, fontFamily, overflow: 'hidden'}}>
      {strip(0)}{strip(1)}
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 170, background: ACCENT, color: NAVY, fontWeight: 600, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 3}}>LIVE</div>
    </AbsoluteFill>
  );
};
