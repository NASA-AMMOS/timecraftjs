import Module from './cspice.js';
import * as Spice from './spice.js';

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

function processTokenValue(value) {
    if (/^'/.test(value)) {
        return value.slice(1, value.length - 1);
    } else if (isNaN(value)) {
        return value;
    } else {
        return Number(value);
    }
}

export function parseMetakernel(txt) {
    // find the data section
    const matches = txt.match(/\\begindata([\w\W]+?)\\/);
    if (!matches) {

        return null;

    }

    // remove all newlines per variable and array values
    const data =
        matches[1]
            .replace(/=[\s\n\r]+/g, '= ')
            .replace(/\([\w\W]*?\)/g, txt => txt.replace(/[\n\r]/g, ' '));

    // get all meaningful lines
    const lines = data.split(/[\n\r]/g ).filter( l => !!l.trim());

    // parse the variables
    const result = {};
    lines.forEach(line => {
        // get the variable name and value
        const split = line.split(/=/);
        const name = split[0].trim();
        const token = split[1].trim();

        if (token[0] === '(') {
            // if the value is an array
            const tokenArray = token.slice(1, token.length - 1).trim();
            const strings = [];

            // substitute all string values so we don't split on their spaces
            const replacedToken = tokenArray.replace(/'[\s\S]*?'/g, txt => {
                const index = strings.length;
                strings.push(txt);
                return `$${index}`;
            });

            // split, resubstitute, and parse the array values
            const splitTokens = replacedToken.split(/\s+/g);
            const fixedTokens = splitTokens.map(token => {
                if (token[0] === '$') {
                    const index = parseInt(token.replace(/^\$/, ''));
                    return processTokenValue(strings[index]);
                } else {
                    return processTokenValue(token);
                }
            });

            result[name] = fixedTokens;
        } else {
            result[name] = processTokenValue(token);
        }
    });
}
