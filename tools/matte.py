# Builds a side-by-side "color | alpha" MP4 so the browser can key Leo over the LED wall (works in every browser).
import sys,subprocess,os,glob,numpy as np
from PIL import Image
from rembg import remove,new_session
src,out=sys.argv[1],sys.argv[2]; d='/tmp/matte_'+os.path.basename(out); os.makedirs(d,exist_ok=True)
for f in glob.glob(d+'/*'): os.remove(f)
subprocess.run(['ffmpeg','-loglevel','error','-i',src,'-vf','scale=960:720',d+'/f%03d.png'],check=True)
s=new_session('u2net_human_seg')
for f in sorted(glob.glob(d+'/f*.png')):
    im=Image.open(f).convert('RGB'); m=remove(im,session=s,only_mask=True,post_process_mask=True)
    a=np.asarray(m).astype(np.float32)/255; a=np.clip((a-0.08)/0.84,0,1)
    w=Image.new('RGB',(1920,720)); w.paste(im,(0,0)); w.paste(Image.fromarray((a*255).astype(np.uint8)).convert('RGB'),(960,0)); w.save(f.replace('/f','/s'))
subprocess.run(['ffmpeg','-loglevel','error','-y','-framerate','25','-i',d+'/s%03d.png','-c:v','libx264','-crf','24','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart',out],check=True)
print(out,os.path.getsize(out))
