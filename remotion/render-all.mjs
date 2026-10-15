// Renders every composition to ../media as small web-friendly MP4s.
import {execSync} from 'node:child_process';
const ids = ['services','booking','reels','bots','examples','contact'].map(k=>`slide-${k}`).concat(['lower-third','ticker']);
for (const id of ids) execSync(`npx remotion render src/index.ts ${id} ../media/${id}.mp4 --codec=h264 --crf=28 --log=error`, {stdio:'inherit'});
