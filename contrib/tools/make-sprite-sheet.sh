#!/bin/bash

if [ $# -lt 1 ] ; then
   echo "Make a sprite sheet from images"
   echo "Usage: make-sprite-sheet.sh *.png"
   exit
fi

now=$(date +"%Y%m%d-%H%M%S")
montage -mode concatenate -background transparent "$@" sprite-sheet-${now}.png
