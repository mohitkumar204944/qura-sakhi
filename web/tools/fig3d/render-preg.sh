#!/bin/zsh
# Renders pregnancy yoga's 3D figure (Version 39.54; Mohit, 2 Nov: "pregnancy yoga doesnt have 3d model"): her usual figure (b0)
# for the positions the regular set lacks, and her with a bump for the middle three months (b2, MakeHuman's pregnant stomach
# at 0.6) and the last three (b3, at 1.0), each body's stills and loops as moves.PREG lists them; then the videos.
# render-preg.sh <work dir> [b0 b2 b3]. About 40 minutes on an M2, two bodies at a time. Run render-all.sh first (it builds
# <work>/sakhi.blend, her usual figure); install.py then puts both sets in the app. Stopped part way, it carries on where it
# was: a body's .blend, its stills and each finished loop (its .done) are kept; delete them to make them again.
set -e
W=${1:?work dir}; shift; B=${BLENDER:-$HOME/Applications/Blender.app/Contents/MacOS/Blender}; F=${0:A:h}
BODIES=($@); (( $#BODIES )) || BODIES=(b0 b2 b3); typeset -A BUMP; BUMP=(b2 0.6 b3 1.0)
mkdir -p $W/preg
log() { echo "$(date +%H:%M:%S) $*" | tee -a $W/preg/progress.log; }
# moves.PREG[body][kind], joined by sep (moves.py needs Blender to import, so its PREG table is read as plain Python)
list() { python3 -c "import ast; t = ast.parse(open('$F/moves.py').read()); d = next(ast.literal_eval(n.value) for n in t.body if isinstance(n, ast.Assign) and getattr(n.targets[0], 'id', '') == 'PREG'); print('$3'.join(d['$1']['$2']))"; }
body() {
  local b=$1 blend=$W/sakhi.blend out=$W/preg/final-$1
  if [[ $b != b0 ]]; then
    blend=$W/preg/sakhi-$b.blend
    if [[ ! -f $blend ]]; then
      log "build $b"; FIG_BUMP=$BUMP[$b] $B -b --python $F/char.py -- $blend 2>&1 | grep -E "BUILT|Error" | cut -c1-60 | tee -a $W/preg/progress.log
    fi
  fi
  mkdir -p $out/stills $out/loops
  local todo=(); for n in ${(s:,:)$(list $b stills ,)}; do [[ -f $out/stills/$n.png ]] || todo+=($n); done
  if (( $#todo )); then
    log "stills $b ${(j:,:)todo}"; $B -b $blend --python $F/render.py -- stills $out/stills ${(j:,:)todo} 2>&1 | grep -E "STILL|Error" | tail -1 | tee -a $W/preg/progress.log
  fi
  for m in ${=$(list $b loops ' ')}; do
    [[ -f $out/loops/$m/.done ]] && continue
    rm -rf $out/loops/$m
    log "loop $b $m"; $B -b $blend --python $F/render.py -- loop $out/loops/$m $m 2>&1 | grep -E "LOOP|Error" | tee -a $W/preg/progress.log
  done
  log "encode $b"; python3 $F/encode.py $out 2>&1 | tail -2 | tee -a $W/preg/progress.log
}
# two lanes: the middle three months' body in one, the last three months' and her usual figure's in the other
lanes=(); for b in $BODIES; do [[ $b == b2 ]] && lanes+=(b2); done
other=(); for b in $BODIES; do [[ $b != b2 ]] && other+=($b); done
( for b in $lanes; do body $b; done ) &
( for b in $other; do body $b; done ) &
wait
log done
