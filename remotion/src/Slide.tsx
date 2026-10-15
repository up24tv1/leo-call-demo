import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Inter';
import {NAVY, NAVY2, WHITE, ACCENT, MUTED, SLIDES, SlideKey} from './theme';
const {fontFamily} = loadFont('normal', {weights: ['400', '600', '800'], subsets: ['latin']});
// 6 s seamless loop: content builds in, holds, background drifts on a full sine period so frame 0 == frame N.
export const Slide: React.FC<{slide: SlideKey}> = ({slide}) => {
  const f = useCurrentFrame(); const {fps, durationInFrames: D} = useVideoConfig();
  const s = SLIDES[slide];
  const phase = (f / D) * Math.PI * 2;
  const inn = (d: number) => spring({frame: f - d, fps, config: {damping: 200}});
  const out = interpolate(f, [D - 14, D], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 140% at ${50 + Math.sin(phase) * 12}% ${40 + Math.cos(phase) * 8}%, ${NAVY2} 0%, ${NAVY} 60%, #050b1a 100%)`, fontFamily, color: WHITE}}>
      <AbsoluteFill style={{opacity: 0.18, backgroundImage: 'linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '64px 64px', transform: `translateX(${(f / D) * 64}px)`}} />
      <div style={{position: 'absolute', left: 120, top: 96, opacity: out}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14, opacity: inn(0), transform: `translateY(${(1 - inn(0)) * 20}px)`}}>
          <div style={{width: 6, height: 26, background: ACCENT}} />
          <div style={{fontSize: 24, letterSpacing: 6, fontWeight: 600, color: ACCENT}}>{s.kicker}</div>
        </div>
        <div style={{fontSize: 76, fontWeight: 800, marginTop: 14, letterSpacing: -1.5, opacity: inn(6), transform: `translateY(${(1 - inn(6)) * 28}px)`}}>{s.title}</div>
        <div style={{height: 3, width: 140 * inn(12), background: WHITE, margin: '22px 0 26px', opacity: 0.85}} />
        {s.items.map((it, i) => (
          <div key={it} style={{fontSize: 32, fontWeight: 400, color: i === 0 ? WHITE : MUTED, margin: '10px 0', opacity: inn(18 + i * 7), transform: `translateX(${(1 - inn(18 + i * 7)) * -30}px)`}}>{it}</div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 110, bottom: 70, fontSize: 18, letterSpacing: 4, color: MUTED, opacity: 0.8 * out}}>AUSTIN AI MARKETING</div>
    </AbsoluteFill>
  );
};
