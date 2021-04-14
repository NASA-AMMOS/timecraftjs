// https://www.geeksforgeeks.org/check-string-substring-another/
// exported for testing
export function arrayIndexOf(array, subarray) {
    let t = 0;
    const len = array.length;
    const subLength = subarray.length;
    let i;

    for (i = 0; i < len; i++) {
        if (t === subLength) {
            break;
        } else if (array[i] === subarray[t]) {
            t++;
        } else {
            t = 0;
        }
    }

    return t < subLength ? -1 : i - t;
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
    if (txt instanceof ArrayBuffer) {
        txt = new Uint8Array(txt);
    }

    if (txt instanceof Uint8Array) {
        txt = new TextDecoder('utf-8').decode(txt);
    }

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
    const fields = {};
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

            fields[name] = fixedTokens;
        } else {
            fields[name] = processTokenValue(token);
        }
    });

    // preprocess the paths to replace the symbols
    const {
        KERNELS_TO_LOAD,
        PATH_VALUES,
        PATH_SYMBOLS,
    } = fields;

    let paths;
    if (PATH_VALUES && PATH_VALUES && KERNELS_TO_LOAD) {
        paths = KERNELS_TO_LOAD.map(path => {
            let newPath = path;
            for (let i = 0; i < PATH_VALUES.length; i++) {
                newPath = newPath.replace(new RegExp('\\$' + PATH_SYMBOLS[i], 'g'), PATH_VALUES[i]);
            }
            return newPath;
        });
    } else {
        paths = KERNELS_TO_LOAD || null;
    }

    return { paths, fields };
}

export function isMetakernel(contents) {
    if (typeof contents === 'string') {
        return contents.indexOf('KERNELS_TO_LOAD') !== - 1;
    } else {
        if (contents instanceof ArrayBuffer) {
            contents = new Uint8Array(contents);
        }

        const subarray = new TextEncoder('utf-8').encode('KERNELS_TO_LOAD');
        return arrayIndexOf(contents, subarray) !== -1;
    }
}
