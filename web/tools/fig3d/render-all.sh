#!/bin/zsh
# Builds the woman and renders every move the app shows, then makes videos (WebM for the app, MP4 for sharing) and looping
# WebPs (for previews): render-all.sh <work dir>. About 30 minutes on an M2. Needs Blender 4.5 with MPFB and the CC0 packs
# (see README.md here) and ffmpeg.
set -e
W=${1:?work dir}; B=${BLENDER:-$HOME/Applications/Blender.app/Contents/MacOS/Blender}; F=${0:A:h}
mkdir -p $W/final/{stills,loops,sun,video,webp}
log() { echo "$(date +%H:%M:%S) $*" | tee -a $W/final/progress.log; }
log build; $B -b --python $F/char.py -- $W/sakhi.blend 2>&1 | grep -E "BUILT|Error" | tee -a $W/final/progress.log
log portrait; $B -b $W/sakhi.blend --python $F/look.py -- $W/final/face.png 2>&1 | grep -E "RENDERED|Error" | tee -a $W/final/progress.log
log stills; $B -b $W/sakhi.blend --python $F/render.py -- stills $W/final/stills 2>&1 | grep -E "STILL|Error" | tail -2 | tee -a $W/final/progress.log
for m in chair wall step bridge cobra locust camel march walk calf armsup triangle butterfly twist knees warmup chairfwd; do
  log "loop $m"; $B -b $W/sakhi.blend --python $F/render.py -- loop $W/final/loops/$m $m 2>&1 | grep -E "LOOP|Error" | tee -a $W/final/progress.log
done
log sun; $B -b $W/sakhi.blend --python $F/render.py -- sun $W/final/sun 2>&1 | grep -E "SUN|Error" | tail -3 | tee -a $W/final/progress.log
log encode; python3 $F/encode.py $W/final 2>&1 | tail -3 | tee -a $W/final/progress.log
log done
