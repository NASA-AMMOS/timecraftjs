import Module from './cspice.js';
import * as Spice from './spice2.js';

let bufferFileCount = 0;

const FS = Module.get_fs();

function mkdirRecursive(parts) {
    const tempParts = parts.slice();

    let currPath = '';
    while (tempParts.length) {
        if (currPath !== '') {
            currPath += '/';
        }
        currPath += tempParts.shift();
        try {
            FS.mkdir(currPath);
        } catch (e) {
            // do nothing
        }
    }
}

// file system manipulation
// https://emscripten.org/docs/api_reference/Filesystem-API.html
export function prepareFileFromBuffer(path, buffer) {
    if (buffer instanceof ArrayBuffer) {
        buffer = new Uint8Array(buffer);
    }

    const parts = path.split(/[\\/]/g);
    parts.pop();
    mkdirRecursive(parts);

    FS.writeFile(path, buffer, { encoding: 'binary' });
}

export function removeFile(path) {
    FS.unlink(path);
}

// loading kernels
export function loadKernel(path) {
    Spice.furnsh(path);
}

export function loadKernelFromBuffer(buffer) {
    const path = `__buffer_files__/buffer_${ bufferFileCount }.bin`;
    bufferFileCount++;

    prepareFileFromBuffer(path, buffer);
    loadKernel(path);
}

// unloading kernel
export function unloadKernel(key) {
    Spice.unload(key);
}

// Chronos CLI
// https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/ug/chronos.html

export function chronos(inptim, cmdlin) {

    const outtim_ptr = Module._malloc(256);
    const intptr = Module._malloc(8);

    Module.setValue(intptr, 1, 'i32');
    Module.ccall(
        'cronos_',
        'number',
        ['string', 'number', 'string', 'number', 'number', 'number', 'number'],
        [cmdlin, intptr, inptim, outtim_ptr, cmdlin.length, inptim.length, 256],
    );

    const ret = Module.Pointer_stringify(outtim_ptr);
    Module._free(outtim_ptr);

    return ret;

}
