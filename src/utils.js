// https://www.geeksforgeeks.org/check-string-substring-another/
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
