'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var cspice = require('./cspice.js');
var spice = require('./spice.js');

const FS = cspice.get_fs();

const fileMap = {};
let bufferFileCount = 0;

// loading kernels
function loadKernel(buffer, key = null) {
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
    spice.furnsh(path);
}

// unloading kernel
function unloadKernel(key) {
    if (!(key in fileMap)) {
        throw new Error();
    }

    spice.unload(fileMap[key]);
    FS.unlink(fileMap[key]);
    delete fileMap[key];
}

// Chronos CLI
// https://naif.jpl.nasa.gov/pub/naif/toolkit_docs/C/ug/chronos.html

function chronos(inptim, cmdlin) {
    const outtim_ptr = cspice._malloc(256);
    const intptr = cspice._malloc(4);

    cspice.setValue(intptr, 1, 'i32');
    cspice.ccall(
        'cronos_',
        'number',
        ['string', 'number', 'string', 'number', 'number', 'number', 'number'],
        [cmdlin, intptr, inptim, outtim_ptr, cmdlin.length, inptim.length, 256],
    );

    const ret = cspice.Pointer_stringify(outtim_ptr, 256);
    cspice._free(outtim_ptr);
    cspice._free(intptr);

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

function parseMetakernel(txt) {
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

exports.chronos = chronos;
exports.loadKernel = loadKernel;
exports.parseMetakernel = parseMetakernel;
exports.unloadKernel = unloadKernel;
