import Module from './cspice.js';
import * as Spice from './spice.js';

const FS = Module.get_fs();

const fileMap = {};
let bufferFileCount = 0;

// loading kernels
export function loadKernel(buffer, key = null) {
    if (key !== null && key in fileMap) {
        throw new Error();
    }

    if (buffer instanceof ArrayBuffer) {
        buffer = new Uint8Array(buffer);
    }

    const path = `_buffer_${ bufferFileCount }.bin`;
    bufferFileCount++;

    if (key !== null) {
        fileMap[key] = path;
    }

    FS.writeFile(path, buffer, { encoding: 'binary' });
    Spice.furnsh(path);
    FS.unlink(path);
}

// unloading kernel
export function unloadKernel(key) {
    if (!(key in fileMap)) {
        throw new Error();
    }

    Spice.unload(fileMap[key]);
    delete fileMap[key];
}

// Chronos CLI
// https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/ug/chronos.html

export function chronos(inptim, cmdlin) {
    const outtim_ptr = Module._malloc(256);
    const intptr = Module._malloc(4);

    Module.setValue(intptr, 1, 'i32');
    Module.ccall(
        'cronos_',
        'number',
        ['string', 'number', 'string', 'number', 'number', 'number', 'number'],
        [cmdlin, intptr, inptim, outtim_ptr, cmdlin.length, inptim.length, 256],
    );

    const ret = Module.Pointer_stringify(outtim_ptr, 256);
    Module._free(outtim_ptr);
    Module._free(intptr);

    return ret.trim();
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

    return result;
}
