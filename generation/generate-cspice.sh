#!/bin/bash
HERE=`pwd`

LITE_BUILD=False
if $LITE_BUILD
then
    TOTAL_MEMORY="21364736"
    EXPORTED_FUNCTIONS="@$HERE/exports-lite.json"
    FILE_NAME="asm_lite.js"
    COPY_SOURCE="./cspice-full"
    BUILD_DIR="./cspice-lite"
else
    TOTAL_MEMORY="106168320"
    EXPORTED_FUNCTIONS="@$HERE/exports.json"
    FILE_NAME="asm_full.js"
    COPY_SOURCE="./cspice-full"
    BUILD_DIR="./cspice-full"
fi

# debug options
# -s ASSERTIONS=1
# -s SAFE_HEAP=1
EMCC_OPTIONS="
	-Oz
	-s TOTAL_MEMORY=$TOTAL_MEMORY
	-s ALLOW_MEMORY_GROWTH=1
    -s MEMORY_GROWTH_GEOMETRIC_STEP=0.01
	-s EXPORTED_FUNCTIONS=$EXPORTED_FUNCTIONS
    -s EXTRA_EXPORTED_RUNTIME_METHODS=['FS','ccall','getValue','setValue','UTF8ToString','stringToUTF8']
	-s NO_EXIT_RUNTIME=1
	-s WASM=0
    -s MODULARIZE=1
	--memory-init-file 0
	--closure 1
	-flto
	-ansi
	-m32
	-Wno-implicit-function-declaration
	"

# Move the required chronos files into cspice so that they will be complied in
CHRNOS_SOURCE=$COPY_SOURCE/src/chrnos_c
CHRNOS_TARGET=$BUILD_DIR/src/cspice
cp $CHRNOS_SOURCE/crcnst.c $CHRNOS_TARGET/crcnst.c
cp $CHRNOS_SOURCE/cronos.c $CHRNOS_TARGET/cronos.c
cp $CHRNOS_SOURCE/dsplay.c $CHRNOS_TARGET/dsplay.c
cp $CHRNOS_SOURCE/ls.c $CHRNOS_TARGET/ls.c
cp $CHRNOS_SOURCE/lstmid.c $CHRNOS_TARGET/lstmid.c
cp $CHRNOS_SOURCE/signal1.h $CHRNOS_TARGET/signal1.h
cp $CHRNOS_SOURCE/speakr.c $CHRNOS_TARGET/speakr.c

CSUPPORT_SOURCE=$COPY_SOURCE/src/csupport
CSUPPORT_TARGET=$BUILD_DIR/src/cspice
cp $CSUPPORT_SOURCE/parcml.c $CSUPPORT_TARGET/parcml.c

# Turn cspice into a javascript file
emcc $EMCC_OPTIONS $BUILD_DIR/src/cspice/*.c -o $FILE_NAME

# Add the funal required line to the new cspice.js
echo "
/* eslint-disable */

$(cat $FILE_NAME)

// appended
export default Module;
" > $FILE_NAME
