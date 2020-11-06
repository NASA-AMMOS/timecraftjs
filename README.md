
![TimeCraftJS Logo](./images/timecraftLogo.png)

Copyright 2019, by the California Institute of Technology.
ALL RIGHTS RESERVED.

United States Government Sponsorship acknowledged. Any commercial use must be negotiated with the Office of Technology Transfer at the California Institute of Technology.
This software may be subject to U.S. export control laws. By accepting this software, the user agrees to comply with all applicable U.S. export laws and regulations. User has the responsibility to obtain export licenses, or other export authority as may be required before exporting such information to foreign countries or providing access to foreign persons.

# TimeCraftJS
TimeCraftJS is a time conversion library that uses [NAIF's CSPICE](https://naif.jpl.nasa.gov/naif/).

It is of extreme importance for different systems to understand time and calculate operations consistently. TimeCraftJS exposes functions to execute operations to convert SCET, ET, SCT, furnish Kernels, among others, in the client side. This avoid unnecessary trips to the backend and makes allows for important time operations to happen if network connectivity is not immediately available.  

## Quick Start

### Installation via NPM

```shell
npm install timecraftjs
```

### Time Conversion

```js
import * as TimeCraft from 'timecraftjs';

// Load the kernels
const kernelBuffers = await Promise.all( [
    
    fetch( '../kernels/lsk/naif0012.tls' ).then( res => res.buffer() ),
    fetch( '../kernels/spk/de425s.bsp' ).then( res => res.buffer() ),
    fetch( '../kernels/pck/pck00008.tpc' ).then( res => res.buffer() ),

] );

// Load the kernels into Spice
for ( let i = 0; i < kernelBuffers.length; i ++ ) {

    TimeCraft.loadKernelFromBuffer( kernelBuffers[ i ] );

}

// Time conversion!
const utc = new Date().toISOString().slice( 0, - 1 );

const et = Timecraft.Spice.utc2et( utc );

const lst = Timecraft.Spice.et2lst( et, 499, 0, 'planetocentric' );
```

### Browser testing

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

## TimeCraftJS

### Table Of Contents

#### [What Is TimeCraftJS?](https://github.com/NASA-AMMOS/timecraftjs#what-is-timecraftjs-1)
#### [Included Files](https://github.com/NASA-AMMOS/timecraftjs#included-files-1)
#### [Downloading](https://github.com/NASA-AMMOS/timecraftjs#downloading-1)
#### [How To Use And Supported Functions](https://github.com/NASA-AMMOS/timecraftjs#how-to-use-and-supported-functions-1)
#### [Loading Kernels](https://github.com/NASA-AMMOS/timecraftjs#loading-kernels-1)
#### [Recompiling cspice.js](https://github.com/NASA-AMMOS/timecraftjs#recompiling-cspicejs-1)
#### [example-timecraftjs.html](https://github.com/NASA-AMMOS/timecraftjs#timecraftjs_examplehtml-1)

### What Is TimeCraftJS?

TimecraftJS is a time conversion library that uses [NAIF's CSPICE](https://naif.jpl.nasa.gov/naif/). In order to accomplish this, we automatically converted the C source code into Javascript via [Emscripten](http://kripken.github.io/emscripten-site/index.html). In order for them to work in a much more user friendly and Javascript-like way, we have created wrapper functions that interact with the resulting simulated C program, allocating and deallocating memory as necessary. This project only includes wrappers for the functions relevant to time conversion and some light time calculations. This project is an offshoot of spice.js.

A great deal below deals with the loading and furnishing of kernels. If you do not wish to do any time conversions involving specific spacecraft or planets, the default included kernels are sufficient and you may ignore these sections. The default kernels are enough to refer to most NAIF ID's, a planetary constants kernel, and a leap seconds kernel.
See example-timecraftjs.html for a simple demo of TimeCraftJS working.

### Included Files

This section lists the files included in this package and describes what each of them does. This section is mainly for people who wish to modify this package, if you simply wish to use it you can likely skip this section.

### Main Files

#### cspice.js

This file contains the ported CSPICE source code. It is extremely large and should not be modified. This file must begin executing after spice.js and timecraft.js, so make sure to include it last. If running in Node, import timecraft.js, not this file.

#### spice.js

This file contains the wrapper functions that allow access to the functionality in cspice.js. The version of spice.js here is focused on time conversions, but the rest of the CSPICE functionality could be exposed if needed.

#### timecraft.js

This file handles detecting if running in Node or a browser, making requests for and furnishing kernels, setting up the timecraft object, setting values and calling events once setup has finished, and outputting CSPICE errors. The first line of this file must be array of kernels to request and furnish, and that first line is edited by other scripts in this file (kernel_setup.py and/or postinstall.js, specifically). If running in Node, this is the file to import.

## API

### Functions

### Spice

Most of the functions made available in this library are functions from CSPICE called in a more Javascript-like way. Please see [differences between cspice and spice.js](https://github.com/NASA-AMMOS/timecraftjs.js#differences-between-cspice-and-spicejs) for specifics.

While the ported C code technically contains all CSPICE functionality, the following functions have been exposed in this library. The [CSPICE documentation](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/cspice/index.html) for each of these functions is correct, but below you can see their more Javascript-like call format supported here. All documented CSpice function inputs are passed into the Javascript equivelants below while all outputs are returned as a dictionary indexed by parameter name or as a single value if there is only a single output.

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

### CSpice

This is the raw Emscripten compiled module that is used to call CSpice functions and interact with the virtual file system. There is typically no need to use this object but unexposed CSpice functions can be called here using `ccall`.

`Module` and `FS` are created by Emscripten to interact directly with the ported C code and with the simulated C file system. Avoid using them unless you have read the [Interacting With Code](http://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/Interacting-with-code.html) and [preamble.js](http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html#ccall) sections of the Emscripten documentation.

###### If you wish to have access to Local Mean Solar Time, you will need to load a relevant kernel. [This kernel](https://naif.jpl.nasa.gov/pub/naif/pds/data/msl-m-spice-6-v1.0/mslsp_1000/data/sclk/msl_lmst_ops120808_v1.tsc), for example, implements LMST in relation to MSL.


##### chronos_call(cmdlin,inptim)
In order to have access to conversions to and from local true solar time, the [chronos](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/ug/chronos.html) utility has been complied into Javascript as well. This function makes a direct call to the `cronos_` function. Please read the chronos [user's guide](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/ug/chronos.html). It also helps to look directly at the source from cronos.c which can be found by downloading a toolkit and looking in the src directory.
##### convert(x,in_var,out)
This is the same as CSPICE's [convrt](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/cspice/convrt_c.html) but under a different name.
##### date2et(date)
Convert a Javascript Date object to an ET in seconds past J2000.
##### et2date(et)
Convert an ET in seconds past J2000 into a Javascript Date object.
##### et2lsun(et,landingtime,body,scid,sol1index)
Convert an ET in seconds past J2000 into a LSUN string. This is similar to computing the 'season' on another body. The time of landing, NAIF ID of the body in question, NAIF ID of the spacecraft, and value of of the first SOL (typically 0 or 1) must be provided. A landing location and enough ephemeris data must be provided by loaded kernels. See the [chronos user's guide](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/ug/chronos.html#LST Time Types) for more information. There is no support for converting for lsun to et.
##### et2ltst(et,landingtime,body,scid,sol1index)
Convert an ET in seconds past J2000 into a Local True Solar Time string. This is essentially the same as calculating where the sun actually is in the sky and display that on a 24-hour clock. This function is only accurate to the nearest second. The time of landing, NAIF ID of the body in question, NAIF ID of the spacecraft, and value of of the first SOL (typically 0 or 1) must be provided. A landing location and enough ephemeris data must be provided by loaded kernels. See the [chronos user's guide](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/ug/chronos.html) for more information.
##### et2str(et)
Convert an ET in seconds past J2000 into a calendar format.
##### furnish(kernelPaths)
This is the same as CSPICE's [furnsh](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/cspice/furnsh_c.html) but under a different name.
##### furnish_via_preload_file_data(path,buffer)
If a synchronous preloading file has been created (see Loading Kernels below), this function is called on startup to load these files. Users are not expected to use this function. Regardless, `path` is the absolute path to save to within Emscripten's file system and `buffer` is an array containing the file data to be saved.
##### furnish_via_xhr_request(kernelPaths,xhr_callback,callback)
This function is used to request, save to Emscripten's file system, and then furnish additional kernels. This is the recommended way to load kernels in a browser and will be called on startup for all kernels needed on startup. See Loading Kernels below for details. You only need to use this function yourself if you wish to load additional kernels after startup. This function constructs an xhr request that your server must handle and send the correct file to be loaded in to the file system. Only functions in a browser. `kernelPaths` is a string or array of strings that are the paths to the required kernel files (if an array, a separate request will be made for each). The request is a 'GET' request for the path(s) specified. `xhr_callback` is called after every request is answered and is passed the status and any errors. If `xhr.onload` received a status 200, this function first saves what it received into the Emscripten file system and then calls `furnish(kernelPath[i])` on it before calling xhr_callback. `callback` is called at the very end after the final `xhr_callback` call.
##### ltst2et(ltst,landingtime,body,scid,sol1index)
Convert a Local True Solar Time string to an ET in seconds past J2000. The time of landing, NAIF ID of the body in question, NAIF ID of the spacecraft, and value of of the first SOL (typically 0 or 1) must be provided. A landing location and enough ephemeris data must be provided by loaded kernels. See the [chronos user's guide](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/ug/chronos.html) for more information.
##### node_furnish(path)
When running in node, this function saves a file to Emscripten's file system and then furnishes it. This function will be called on startup for all kernels needed on startup. See Loading Kernels below for details. You only need to use this function yourself if you wish to load additional kernels after startup. `path` is the relative or absolute path to the kernel.
##### set_error_report_then_reset()
Call this function to set the error behavior of SPICE to a special, more Javascript-like behavior. See `unset_error_report_then_reset(action)` below for alternatives. This function sets the CSPICE error behavior to "REPORT" and makes it so that when an error occurs, timecraft will first print out the reported error and then call `timecraft.reset()` to allow the underling C code to continue functioning properly. If neither this function nor `timecraft.erract` are called, the default error behavior will be used. See [erract](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/cspice/erract_c.html) for more details.
##### unset_error_report_then_reset(action)
Changes CSPICE error behavior from the special Javascript-like error behavior added here to `action`. `action` can be "ABORT", "REPORT", "RETURN", "IGNORE", or "DEFAULT". See [erract](https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/cspice/erract_c.html) for more details.

## Loading Kernels

TODO

#### Advanced
If necessary, for example if you do not expect the user to have a `kernel_list.json` present in a parent of `timecraft` before they install npm packages, `postinstall.js` may be called manually or by a script. The default behavior
```
node postinstall.js
```
will search for a kernel_list.json first in the `timecraft` directory and then recursively higher. If a path is passed as a third command line argument
```
node postinstall.js <path to kernel_list.json>

Example:
node postinstall.js ../my_package/kernel_list.json
```
the script will first search for a kernel_list.json as before, and, if it does not find one, will use the provided path. If the user has provided their own kernel_list.json, the one passed in on the command line will be ignored. This behavior can be overridden using
```
node postinstall.js <path to kernel_list.json> override

Example:
node postinstall.js ../my_package/kernel_list.json override
```
which will immediately use the provided kernel_list.json and not allow users to specify their own. If, for whatever reason, postinstall.js is called multiple times on the same kernel_list.json, kernels will only be downloaded once.
**In all cases, when using this method of kernel setup, a `kernels` directory must exist within and be served from `/node_modules/timecraftjs`. If this is not desired, see Manually below.**
### Manually
To set which kernels should be loaded on startup, download the required kernels from [NAIF's website](https://naif.jpl.nasa.gov/pub/naif/) and keep them somewhere in the kernels directory. Then run `python kernel_setup.py <File containing list of kernels> <Path to the kernels directory>`.
`<File containing list of kernels>` is the name of a file containing a new-line separated list of kernels to load on startup. `kernels_to_load.txt` is an example. You can alternatively use `-all` here to including all kernels in (or in a subdirectory of) the kernels directory.
`<Path to the kernels directory>` is a path to the directory which contains kernels directory (`./node_modules/timecraftjs`, for example). XHR `GET` requests will be made for specified files in the kernels directory within this path when loading asynchronously. If this is left blank it will default to `/node_modules/timecraftjs`.
Kernels set for loading on startup this way will be loaded and furnished before calls to TimeCraftJS may be made. This is a synchronous process in node (via `node_furnish`) and, by default, an asynchronous process in the browser (via `furnish_via_xhr_request`). If asynchronous loading is used in a browser, once all furnishes are finished, `timecraft.is_ready` will change from `false` or `undefined` to `true`. Additionally, the `timecraftready` event will be dispatched to the `window` object. Note that, when using manual kernel setup, a `kernels` directory is required to exist but it need not necessarily exist at `/node_modules/timecraftjs/kernels`. As long as you point `timecraft.js` to the correct location with `kernel_setup.py`, the  `kernels` directory can be anywhere.
### Browser
#### Asynchronously (Recommended)
The default method for loading kernels on startup is asynchronously. See `furnish_via_xhr_request` to load additional files after startup.
#### Synchronously
In order to make sure kernels will be loaded synchronously and will be in place before any other functions can be run, after running `python kernel_setup.py`, also run `node preload.js`. This will create a massive Javascript file called `preload_file_data.js` containing a representation of each of the required kernels that Emscripten's file system can understand. This js file must be included in a script tag before the other three, such as:
```
<script type="text/javascript" src="./node_modules/timecraftjs/preload_file_data.js"></script>
<script type="text/javascript" src="./node_modules/timecraftjs/spice.js"></script>
<script type="text/javascript" src="./node_modules/timecraftjs/timecraft.js"></script>
<script type="text/javascript" src="./node_modules/timecraftjs/cspice.js"></script>
```
**Note that the order of tags matters! If cspice.js runs before spice.js or timecraft.js it will set up incorrectly. If something similar to `pre-main prep time: 5 m` is printed to the console on startup and timecraft.is_ready never becomes true, this is why.**
This file is likely to be massive and will make it take upwards of 30 seconds to load the page for even the default kernels. As such it is heavily recommended that asynchronous loading is used. Kernels can only be loaded asynchronously after startup if synchronous loading on startup is used.
### Node
As node has access to the computer's file system, kernel files are always loaded and furnished synchronously. To load more kernels after startup, see `node_furnish(path)`.

## Recompiling cspice.js (JPL Internal only)
`cspice.js` is the massive Javascript file resulting from the automatic porting via Emscripten. As such, if CSPICE updates, this file will need to be recompiled. The current version of cspice.js was created from the [Mac/OSX 64 Bit Toolkit](https://naif.jpl.nasa.gov/naif/toolkit_C_MacIntel_OSX_AppleC_64bit.html) on July 25, 2017.

In order to recompile cspice.js, follow these steps:

* First, download and extract a relevant toolkit from [the NAIF website](https://naif.jpl.nasa.gov/naif/toolkit_C.html).
* Second, clone [the timecraft_recompiling branch of spice.js](https://github.jpl.nasa.gov/johnt/spice.js/tree/spicey_recompiling) into a folder.
* Third, delete the `cspice` directory from the newly downloaded spice.js and replace it with the toolkit you downloaded. Delete cspice.a from cspice/lib (this is not strictly necessary but occasionally causes problems). Optionally, also delete the `cspice.js` file as it will be replaced anyway.
* Fourth, run `./install.sh`. This will download and set up the required Emscripten files from archived version 1.34.1 and will take some time. We are using this version as the most recent version has problems in the final step. Make certain your have [everything required for Emscripten to run](https://kripken.github.io/emscripten-site/docs/building_from_source/toolchain_what_is_needed.html).
* Fifth, run `./cspice.sh`. This will move the required chronos files to be included in cspice, compile it, and then port it to a new cspice.js file.
* Finally, replace the cspice.js in TimeCraftJS with the newly compiled one.


