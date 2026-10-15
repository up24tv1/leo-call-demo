import React from 'react';
import {Composition} from 'remotion';
import {Slide} from './Slide';
import {LowerThird} from './LowerThird';
import {Ticker} from './Ticker';
import {SLIDES} from './theme';
export const Root: React.FC = () => (
  <>
    {Object.keys(SLIDES).map((k) => (
      <Composition key={k} id={`slide-${k}`} component={Slide as any} defaultProps={{slide: k}} width={1536} height={512} fps={30} durationInFrames={180} />
    ))}
    <Composition id="lower-third" component={LowerThird} width={1280} height={160} fps={30} durationInFrames={75} />
    <Composition id="ticker" component={Ticker} width={1920} height={64} fps={30} durationInFrames={600} />
  </>
);
