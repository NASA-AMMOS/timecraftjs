<p align="center">
  <img
    alt="TimeCraftJS"
    src="./images/logo.png"
    width="100"
  />
</p>

# TimeCraftJS

[![npm version](https://img.shields.io/npm/v/timecraftjs.svg?style=flat-square)](https://www.npmjs.com/package/timecraftjs)
![Node.js CI](https://github.com/NASA-AMMOS/timecraftjs/workflows/Node.js%20CI/badge.svg)

<!--[![lgtm code quality](https://img.shields.io/lgtm/grade/javascript/g/NASA-AMMOS/timecraftjs.svg?style=flat-square&label=code-quality)](https://lgtm.com/projects/g/NASA-AMMOS/timecraftjs/)-->

TimeCraftJS is a time conversion library that uses [NAIF's CSPICE](https://naif.jpl.nasa.gov/naif/). It exposes functions to execute operations to convert [SCET](https://en.wikipedia.org/wiki/Spacecraft_Event_Time), ET, SCT, furnish Kernels, among others, on the client side. This avoid unnecessary trips to the backend and allows for important time operations to happen if network connectivity is not immediately available. Multiple variants of the built CSPICE library are provided, including a limited, low-memory "lite" version with lesser functionality which is loaded by default. See [Constants](#Constants) section and [init](#init) function description for more information on the options.

Some basic kernels are provided in this repo for performing time conversions. More kernels for other missions can be found [here](https://naif.jpl.nasa.gov/pub/naif/pds/data/).

## Quick Start

### Installation via NPM

```shell
npm install timecraftjs
```

### Use with Webpack

The compiled emscripten blob includes `require( 'fs' )` which can cause Webpack to fail to compile for the web. In this case add the following options to the root of your Webpack config:

```js
node: {
    fs: "empty";
}
```

### Time Conversion

```js
import { Spice } from "timecraftjs";

const spiceInstance = await new Spice().init();

// Load the kernels
const kernelBuffers = await Promise.all([
    fetch("../kernels/lsk/naif0012.tls").then((res) => res.buffer()),
    fetch("../kernels/spk/de425s.bsp").then((res) => res.buffer()),
    fetch("../kernels/pck/pck00008.tpc").then((res) => res.buffer()),
]);

// Load the kernels into Spice
for (let i = 0; i < kernelBuffers.length; i++) {
    spiceInstance.loadKernel(kernelBuffers[i]);
}

// Time conversion!
const utc = new Date().toISOString().slice(0, -1);

const et = spiceInstance.utc2et(utc);

const lst = spiceInstance.et2lst(et, 499, 0, "planetocentric");
```

### Loading a Metakernel

```js
import { Spice, parseMetakernel } from "timecraftjs";

const spiceInstance = await new Spice().init();

// load the kernel contents
const metaKernel = await fetch(
    "../kernels/extras/mk/msl_chronos_v07.tm"
).then((res) => res.text());

// parse the kernel
const kernelPaths = parseMetakernel(metaKernel).paths;

// load the kernels in the meta kernel
const kernelPromises = kernelPaths.map((p) => {
    return fetch(p)
        .then((res) => res.buffer())
        .then((buffer) => spiceInstance.loadKernel(buffer));
});

await Promise.all(kernelPromises);

// ready for time conversion!
```

### Using the Chronos Function

```js
spiceInstance.chronos("617885388.6646054", "-from et -to utc -fromtype SECONDS");
```

### Running the Example

1.  Clone the Repository

```sh
git clone https://github.com/NASA-AMMOS/timecraftjs.git
```

2.  Run the following on the base directory:

```sh
npm install
npm start
```

This will start a static server so you can visit the example page at `localhost:9080/example/`.

### Table Of Contents

#### [What Is TimeCraftJS?](#what-is-timecraftjs-1)

#### [Included Files](#included-files-1)

#### [API](#api-1)

#### [Loading Kernels](#loading-kernels-1)

#### [Recompiling cspice.js](#recompiling-cspicejs-1)

### What Is TimeCraftJS?

TimecraftJS is a time conversion library that uses [NAIF's CSPICE](https://naif.jpl.nasa.gov/naif/). In order to accomplish this, we automatically converted the C source code into Javascript via [Emscripten](http://kripken.github.io/emscripten-site/index.html). In order for them to work in a much more user friendly and Javascript-like way, we have created wrapper functions that interact with the resulting simulated C program, allocating and deallocating memory as necessary. This project only includes wrappers for the functions relevant to time conversion and some light time calculations. This project is an offshoot of spice.js.

A great deal below deals with the loading and furnishing of kernels. If you do not wish to do any time conversions involving specific spacecraft or planets, the default included kernels are sufficient and you may ignore these sections. The default kernels are enough to refer to most NAIF ID's, a planetary constants kernel, and a leap seconds kernel.
See example-timecraftjs.html for a simple demo of TimeCraftJS working.

### Included Files

This section lists the files included in this package and describes what each of them does. This section is mainly for people who wish to modify this package, if you simply wish to use it you can likely skip this section.

#### src/cspice/*.js

These files contain the emscripten-converted CSPICE source code. It is extremely large and should not be modified. Both a "full" and "lite" version of converted CSPICE is provided. See the [Constants](#Constants) section for more information on the variants.

#### src/spice.js

This file contains the wrapper class that allows access to the functionality in cspice.js. The version of spice.js here is focused on time conversions, but the rest of the CSPICE functionality could be exposed if needed.

## API

### Constants

Constants for use in the [Spice.init](#init) function to intialize the library to use either a full or lite version of the SPICE library.

#### ASM_SPICE_FULL

Use this constant to load and use the full asm.js version of the SPICE library with full functionality. Run time memory requirement is around 100 MB.

#### ASM_SPICE_LITE

Use this constant to load and use an asm.js version of an unofficial "lite" version of the SPICE library with some missing functonality to improve memory requirements. Specifically all `ek*` functions have been removed and various internal constants have been lowered to reduce memory use. Not all NAIF kernels can be guaranteed to function when using this reduced memory of the package. If an error occurs due to overrunning memory use the "full" version, instead. Run time memory requirement is around 20 MB.

### Spice

Class used to instantiate an instance of Spice. Multiple instances can be created to load different kernels if desired. [init](#init) must be called before use.

_Note that due to the memory requirements of CSpice each instance of this class will take around 100MB of memory._

#### .ready

```js
ready : Boolean
```

Whether the class has been fully initialized after [init](#init) has been called.

#### .whenReady

```js
whenReady : Promise<this>
```

Resolves when the class has been fully initialized after [init](#init) has been called.

#### .onStdOut

```js
onStdOut : ( log : String ) => void
```

Callback that gets fired whenever CSpice logs to stdout. Defaults to log to console.

#### .onStdErr

```js
onStdErr : ( log : String ) => void
```

Callback that gets fired whenever CSpice logs to stderr. Defaults to log error to console.

#### .module

```js
module : Object = null
```

This is the raw Emscripten compiled module that is used to call CSpice functions and interact with the virtual file system. There is typically no need to use this object but unexposed CSpice functions can be called here using `ccall`.

`Module` and `FS` are created by Emscripten to interact directly with the ported C code and with the simulated C file system. Avoid using them unless you have read the [Interacting With Code](http://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html) and [preamble.js](http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html#ccall) sections of the Emscripten documentation.

`module` is null until [init](#init) has fully resolved.

#### .init

```js
init( type : ( ASM_SPICE_LITE | ASM_SPICE_FULL ) = ASM_SPICE_LITE ) : Promise<this>
```

Loads and initializes the CSpice module. The class is ready to use once the promise has resolved.

The "type" parameter can be used to dictate which version of the compiled CSPICE module to use. See the [Constants](#Constants) section for available options and more information. Defaults to using the "lite" version of the module.

#### .loadKernel

```js
loadKernel( buffer : ArrayBuffer | Uint8Array, key : String = null ) : void
```

Load the provided buffer into Spice as a kernel. The provided key can be used to unload the kernel using [unloadKernel](#unloadKernel). Throws an error if the key has already been used. Details of kernel management can be found in the [Kernel Management](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/req/kernel.html#Section%205%20--%20Kernel%20Management) section of the SPICE docs.

#### .unloadKernel

```js
unloadKernel( key : String ) : void
```

Unload the kernel that was loaded with the given key. Throws an error if a kernel has not been loaded with the given key.

#### .chronos

```js
chronos( inptim : String, cmdlin : String ) : String
```

Wrapper for the CSpice command line utility that calls the `cronos_` function internally. `inptim` is the input time to convert while `cmdlin` is the list of command line arguments as a string. See the [chronos](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/ug/chronos.html) docs for more information.

#### Spice Functions

Most of the functions made available in this library are functions from CSPICE called in a more Javascript-like way. Please see [differences between cspice and spice.js](https://github.com/NASA-AMMOS/timecraftjs.js#differences-between-cspice-and-spicejs) for specifics.

While the ported C code technically contains all CSPICE functionality, the following functions have been exposed in this class. The [CSPICE documentation](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/cspice/index.html) for each of these functions is correct, but below you can see their more Javascript-like call format supported here. All documented CSpice function inputs are passed into the Javascript equivelants below while all outputs are returned as a dictionary indexed by parameter name or as a single value if there is only a single output.

```
b1900()
b1950()
bodc2n( code )
bodc2s( code )
boddef( name, code )
bodfnd( body, item )
bodn2c( name )
bods2c( name )
bodvcd( bodyid, item, maxn )
bodvrd( body, item, maxn )
convrt( x, in_var, out )
deltet( epoch, eptype )
erract( op, action )
errprt( op, list )
et2lst( et, body, lon, type )
et2utc( et, format, prec )
etcal( et )
failed()
furnsh( kernelPaths )
getmsg( options )
j1900()
j1950()
j2000()
j2100()
jyear()
ltime( etobs, obs, dir, targ )
reset()
scdecd( sc, sclkdp )
sce2c( sc, et )
sce2s( sc, et )
sce2t( sc, et )
scencd( sc, sclkch )
scfmt( sc, ticks )
scpart( sc )
scs2e( sc, sclkch )
sct2e( sc, sclkdp )
sctiks( sc, clkstr )
spd()
spkpos( targ, et, ref, abcorr, obs )
str2et( str )
timdef( action, item, value )
timout( et, pictur )
tparse( string )
tpictr( sample )
tsetyr( year )
tyear()
unitim( epoch, insys, outsys )
unload( file )
utc2et( utcstr )
```

### Functions

#### isMetakernel

```js
isMetakernel( contents : String | ArrayBuffer | Uint8Array ) : Boolean
```

Takes the contents of a kernel file and returns `true` if it is a metakernal and `false` otherwise. This function looks for the `KERNELS_TO_LOAD` token in the file.

#### parseMetakernel

```js
parseMetakernel( contents : String | ArrayBuffer | Uint8Array ) : { fields: Object, paths: Array<String> }
```

Parses the contents of a metakernel `.tm` file and returns all the key value pairs in the file as `fields` and all preprocessed referenced metakernal paths as `paths`.

## Loading Kernels

In order to load an read kernels the data must be loaded into the virtual Emscripten file system as a binary buffer.

### In the Browser

Files must be downloaded asynchronously as array buffers before being loaded into the app.

```js
import { Spice } from "timecraftjs";

const spiceInstance = await new Spice().init();
const kernelBuffer = await fetch("../path/to/kernel").then((res) => res.buffer);
spiceInstance.loadKernel(buffer);
```

### In Node

In node files can be loaded from the filesystem directly.

```js
import fs from "fs";
import { Spice } from "timecraftjs";

const spiceInstance = await new Spice().init();
const kernelBuffer = fs.readFileSync("../path/to/kernel");
spiceInstance.loadKernel(buffer);
```

## Recompiling cspice.js

The files in `src/cspice/` are the massive Javascript files resulting from the automatic porting via Emscripten. As such, if CSPICE updates, these files will need to be recompiled. In order to recompile any of the JS CSPICE files, follow these steps:

### Setting Up Emscripten

1. Download relevant toolkit from [the NAIF website](https://naif.jpl.nasa.gov/naif/toolkit_C.html).
1. Download [emsdk](https://github.com/emscripten-core/emsdk) to download and manage "emscripten" versions.
1. Install the latest version of emscripten and source the emsdk environment variables from `emsdk_env.sh`.

### CSPICE Full (asm_full.js)

The current version was created from the [Mac/OSX 64 Bit Toolkit](https://naif.jpl.nasa.gov/naif/toolkit_C_MacIntel_OSX_AppleC_64bit.html) on April 12, 2021 with emscripten version 2.0.17.

1. Unzip the CSPICE source folder and put the contents into the `generation/cspice-full` folder.
1. Ensure the `LITE_BUILD` variable is set to `False` in `generation/generate-cspice.sh`.
1. Run `generation/generate-cspice.sh` to generate the js library file in the folder.
1. Move the newly generated `asm_full.js` file into the `src/cspice` folder.

### CSPICE Lite (asm_lite.js)

_INTERNAL ONLY_

The modified lite version of the CSPICE used was dervied from the latest version of CSPICE on April 27, 2021 with emscripten version 2.0.17. The CSPICE lite code only provides modified `src/cspice` functions so necessary chronos functionality is copied from the latest public version.

1. Unzip the latest CSPICE source folder (see above) and put the contents into the `generation/cspice-full` folder.
1. Unzip the CSPICE lite source folder and put the contents into the `generation/cspice-lite` folder. Modified CSPICE lite source available [here](https://github.jpl.nasa.gov/gkjohnso/cspice-lite) (internal only).
1. Ensure the `LITE_BUILD` variable is set to `True` in `generation/generate-cspice.sh`.
1. Run `generation/generate-cspice.sh` to generate the js library file in the folder.
1. Move the newly generated `asm_lite.js` file into the `src/cspice` folder.

## License

Copyright 2020, by the California Institute of Technology.
ALL RIGHTS RESERVED.
United States Government Sponsorship acknowledged. Any commercial use must be negotiated with the Office of Technology Transfer at the California Institute of Technology.
This software may be subject to U.S. export control laws. By accepting this software, the user agrees to comply with all applicable U.S. export laws and regulations. User has the responsibility to obtain export licenses, or other export authority as may be required before exporting such information to foreign countries or providing access to foreign persons.
