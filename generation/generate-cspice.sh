#!/bin/bash
HERE=`pwd`

EMCC_OPTIONS="
	-Oz
	-s TOTAL_MEMORY=117440512
	-s ALLOW_MEMORY_GROWTH=1
	-s EXPORTED_FUNCTIONS=@$HERE/exports.json
    -s EXTRA_EXPORTED_RUNTIME_METHODS=['FS','ccall','getValue','setValue','UTF8ToString','stringToUTF8']
	-s NO_EXIT_RUNTIME=1
	-s ASSERTIONS=1
	-s WASM=0
	--memory-init-file 0
	--closure 1
	-flto
	-ansi
	-m32
	-Wno-implicit-function-declaration
	"

# Move the required chronos files into cspice so that they will be complied in
cd ./cspice/src/chrnos_c
cp crcnst.c ../cspice/crcnst.c
cp cronos.c ../cspice/cronos.c
cp dsplay.c ../cspice/dsplay.c
cp ls.c ../cspice/ls.c
cp lstmid.c ../cspice/lstmid.c
cp signal1.h ../cspice/signal1.h
cp speakr.c ../cspice/speakr.c

cd ../csupport
cp parcml.c ../cspice/parcml.c

# Turn cspice into a javascript file
cd $HERE
emcc $EMCC_OPTIONS cspice/src/cspice/*.c -o cspice.js

# Add the funal required line to the new cspice.js
echo "
/* eslint-disable */

const Module = {};
$(cat cspice.js)

// appended
export default Module;
" > cspice.js

