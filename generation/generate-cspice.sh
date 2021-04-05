#!/bin/bash
HERE=`pwd`

EMCC_OPTIONS=" \
	-Oz \
  -s TOTAL_MEMORY=104857600 \
  -s ALLOW_MEMORY_GROWTH=1 \
	-s EXPORTED_FUNCTIONS=@$HERE/exports.json \
	-s NO_EXIT_RUNTIME=1 \
	-s ASSERTIONS=1 \
  -s WASM=0 \
	--memory-init-file 0 \
	--closure 1
	--gc-sections
	-flto
	"

# ENVs for cspice's mkprodct.csh
TKCOMPILER="emcc"
TKCOMPILEOPTIONS=" -c -ansi -m32 -Wno-implicit-function-declaration -Os -ffunction-sections -fdata-sections -flto"
export TKCOMPILER
export TKCOMPILEOPTIONS

# Move the required chronos files into cspice so that they will be complied in
cd ../cspice/src/chrnos_c
cp crcnst.c ../cspice/crcnst.c 
cp cronos.c ../cspice/cronos.c
cp dsplay.c ../cspice/dsplay.c
cp ls.c ../cspice/ls.c
cp lstmid.c ../cspice/lstmid.c
cp signal1.h ../cspice/signal1.h
cp speakr.c ../cspice/speakr.c
cd ../csupport
cp parcml.c ../cspice/parcml.c

# Compile cspice
cd $HERE/cspice/src/cspice
/bin/csh ./mkprodct.csh

# Turn cspice into a javascript file
cd $HERE
emcc $EMCC_OPTIONS cspice/lib/cspice.a -o cspice.js

# Add the funal required line to the new cspice.js
echo "



Module.get_fs = function(){
	return FS;
}" >> cspice.js