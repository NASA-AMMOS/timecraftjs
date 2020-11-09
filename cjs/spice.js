'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var cspice = require('./cspice.js');

const INT_SIZE = 4;
const INT_TYPE = 'i32';

const DOUBLE_SIZE = 8;
const DOUBLE_TYPE = 'double';

/**
 * @memberof SPICE
 * @func b1900
 * @desc Return the Julian Date corresponding to Besselian Date 1900.0.
 * @returns {number} 2415020.31352
 */
function b1900() {
    return cspice.ccall(
        'b1900_c',
        'number',
        [],
        [],
    );
}

/**
 * @memberof SPICE
 * @func b1950
 * @desc Return the Julian Date corresponding to Besselian Date 1950.0.
 * @returns {number} 2433282.42345905
*/
function b1950() {
    return cspice.ccall(
        'b1950_c',
        'number',
        [],
        [],
    );
}

/**
 * @memberof SPICE
 * @func bodc2n
 * @desc Translate the SPICE integer code of a body into a common name
 * @param {number} code - The NAIF ID code of then body.
 * @returns {string | undefined} The name of the body if it exists, otherwise undefined.
 */
function bodc2n(code) {
    const name_ptr = cspice._malloc(100);
    const found_ptr = cspice._malloc(INT_SIZE);
    cspice.ccall(
        'bodc2n_c',
        null,
        ['number', 'number', 'number', 'number'],
        [code, 100, name_ptr, found_ptr],
    );
    const found = cspice.getValue(found_ptr, INT_TYPE);
    const name = cspice.Pointer_stringify(name_ptr);
    cspice._free(name_ptr);
    cspice._free(found_ptr);

    return { name, found };
}

/**
 * @memberof SPICE
 * @func bodc2s
 * @desc Translate a body ID code to either the corresponding name or if no
name to ID code mapping exists, the string representation of the
body ID value.
 * @param {number} code - The NAIF ID code of then body.
 * @returns {string} The name of the body if it exists, otherwise the number as a string.
*/
function bodc2s(code) {
    const name_ptr = cspice._malloc(100);
    cspice.ccall(
        'bodc2s_c',
        null,
        ['number', 'number', 'number'],
        [code, 100, name_ptr],
    );
    const name = cspice.Pointer_stringify(name_ptr);
    cspice._free(name_ptr);
    return name;
}

/* boddef:    Define a body name/ID code pair for later translation via
bodn2c_c or bodc2n_c.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
function boddef(name, code) {
    cspice.ccall(
        'boddef_c',
        null,
        ['string', 'number'],
        [name, code],
    );
}

/* bodfnd:    Determine whether values exist for some item for any body
in the kernel pool.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
function bodfnd(body, item) {
    return cspice.ccall(
        'bodfnd_c',
        'number',
        ['number', 'string'],
        [body, item],
    );
}

/* bodn2c:    Translate the name of a body or object to the corresponding SPICE
integer ID code.
*/
/** @memberof SPICE
 * @func bodn2c
 * @desc Translate the name of a body or object to the corresponding SPICE integer ID code.
 * @param {name} name - The common name of the body.
 * @returns {number | undefined} The SPICE ID of the body if it exists, otherwise undefined.
 */
function bodn2c(name) {
    const code_ptr = cspice._malloc(INT_SIZE);
    const found_ptr = cspice._malloc(INT_SIZE);
    cspice.ccall(
        'bodn2c_c',
        null,
        ['string', 'number', 'number'],
        [name, code_ptr, found_ptr],
    );
    const found = cspice.getValue(found_ptr, INT_TYPE);
    const code = cspice.getValue(code_ptr, INT_TYPE);
    cspice._free(found_ptr);
    cspice._free(code_ptr);

    return { code, found };
}

/* bods2c:    Translate a string containing a body name or ID code to an integer
code.
*/
/** @memberof SPICE
 * @func bods2c
 * @desc Translate the name of a body or object to the corresponding SPICE integer ID code.
 * @param {name} name - The common name of a body or its code as a string.
 * @returns {number | undefined} If a body name was passed in, the SPICE ID of the body if it exists, otherwise undefined. If a string number was passed in, the number as an integer.
 */
function bods2c(name) {
    const code_ptr = cspice._malloc(INT_SIZE);
    const found_ptr = cspice._malloc(INT_SIZE);
    cspice.ccall(
        'bods2c_c',
        null,
        ['string', 'number', 'number'],
        [name, code_ptr, found_ptr],
    );
    const found = cspice.getValue(found_ptr, INT_TYPE);
    const code = cspice.getValue(code_ptr, INT_TYPE);
    cspice._free(code_ptr);
    cspice._free(found_ptr);

    return { code, found };
}

/* bodvcd:
Fetch from the kernel pool the double precision values of an item
associated with a body, where the body is specified by an integer ID
code.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
function bodvcd(bodyid, item, maxn) {
    const dim_ptr = cspice._malloc(DOUBLE_SIZE);
    const values_ptr = cspice._malloc(DOUBLE_SIZE * maxn);
    cspice.ccall(
        'bodvcd_c',
        null,
        ['number', 'string', 'number', 'number', 'number'],
        [bodyid, item, maxn, dim_ptr, values_ptr],
    );
    const ret = [];
    for (let i = 0; i < cspice.getValue(dim_ptr, INT_TYPE); i++) {
        ret.push(cspice.getValue(values_ptr + i * DOUBLE_SIZE, DOUBLE_TYPE));
    }
    cspice._free(dim_ptr);
    cspice._free(values_ptr);

    return ret;
}

/* bodvrd:
Fetch from the kernel pool the double precision values
of an item associated with a body.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
function bodvrd(body, item, maxn) {
    const valuesptr = cspice._malloc(DOUBLE_SIZE * maxn);
    const dimptr = cspice._malloc(INT_SIZE);
    cspice.ccall(
        'bodvrd_c',
        null,
        ['string', 'string', 'number', 'number', 'number'],
        [body, item, maxn, dimptr, valuesptr],
    );
    const ret = [];
    for (let i = 0; i < cspice.getValue(dimptr, INT_TYPE); i++) {
        ret.push(cspice.getValue(valuesptr + i * DOUBLE_SIZE, DOUBLE_TYPE));
    }
    cspice._free(valuesptr);
    cspice._free(dimptr);

    return ret;
}

/* convrt:
    Take a measurement X, the units associated with
    X, and units to which X should be converted; return Y ---
    the value of the measurement in the output units.
*/
/** @memberof SPICE
 * @func convrt
 * @desc Take a measurement X, the units associated with X, and units to which X should be converted; return the value of the measurement in the output units.
 * @param {number} x - The number in units of in_var to convert.
 * @param {string} in_var - The kind of units x is in. Acceptable units are:

    Angles:                 "RADIANS"
                            "DEGREES"
                            "ARCMINUTES"
                            "ARCSECONDS"
                            "HOURANGLE"
                            "MINUTEANGLE"
                            "SECONDANGLE"

    Metric Distances:       "METERS"
                            "KM"
                            "CM"
                            "MM"

    English Distances:      "FEET"
                            "INCHES"
                            "YARDS"
                            "STATUTE_MILES"
                            "NAUTICAL_MILES"

    Astrometric Distances:  "AU"
                            "PARSECS"
                            "LIGHTSECS"
                            "LIGHTYEARS" julian lightyears

    Time:                   "SECONDS"
                            "MINUTES"
                            "HOURS"
                            "DAYS"
                            "JULIAN_YEARS"
                            "TROPICAL_YEARS"
                            "YEARS" (same as julian years)

    The case of the string in is not significant.
 * @param {string} out - The kind of units for the output to be in. The same kinds of units are valid.
 * @returns {number} The value of x measure in the new units.
*/
function convrt(x, in_var, out) {
    const y_ptr = cspice._malloc(DOUBLE_SIZE);
    cspice.ccall(
        'convrt_c',
        null,
        ['number', 'string', 'string', 'number'],
        [x, in_var, out, y_ptr],
    );
    const ret = cspice.getValue(y_ptr, DOUBLE_TYPE);
    cspice._free(y_ptr);
    return ret;
}

/** @memberof SPICE
 * @func deltet
 * @desc Return the value of Delta ET (ET-UTC) for an input epoch.
 * @param {number} epoch - Input epoch (seconds past J2000).
 * @param {string} eptype - Type of input epoch ("UTC" or "ET"). "UTC": epoch is in UTC seconds past J2000 UTC. "ET": epoch is in Ephemeris seconds past J2000 TDB.
 * @returns {number} Delta ET (ET-UTC) at input epoch
 */
function deltet(epoch, eptype) {
    const delta_ptr = cspice._malloc(DOUBLE_SIZE);
    cspice.ccall(
        'deltet_c',
        null,
        ['number', 'string', 'number'],
        [epoch, eptype, delta_ptr],
    );
    const delta = cspice.getValue(delta_ptr, DOUBLE_TYPE);
    cspice._free(delta_ptr);
    return delta;
}

/* erract:    Retrieve or set the default error action.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
function erract(op, action) {
    return cspice.ccall(
        'erract_c',
        null,
        ['string', 'number', 'string'],
        [op, 100, action],
    );
}

/* et2lst:
Given an ephemeris epoch, compute the local solar time for
an object on the surface of a body at a specified longitude.
*/
/** @memberof SPICE
 * @func et2lst
 * @summary Given an ephemeris epoch, compute the local true solar time for an object on the surface of a body at a specified longitude.
 * @desc  In the planetographic coordinate system, longitude is defined using
the spin sense of the body.  Longitude is positive to the west if
the spin is prograde and positive to the east if the spin is
retrograde.  The spin sense is given by the sign of the first degree
term of the time-dependent polynomial for the body's prime meridian
Euler angle "W":  the spin is retrograde if this term is negative
and prograde otherwise.  For the sun, planets, most natural
satellites, and selected asteroids, the polynomial expression for W
may be found in a SPICE PCK kernel.

The earth, moon, and sun are exceptions: planetographic longitude
is measured positive east for these bodies.
 * @param {number} et - The time to convert in Ephemeris seconds past J2000.
 * @param {number} body - The NAIF ID of the body to find the local solar time on.
 * @param {number} lon - The longitude to observe from, measured in radians.
 * @param {string} type - "PLANETOCENTRIC" or "PLANETOGRAPHIC".
 * @returns {object} An object with the following valued: hr - the number of hours (24 hours lock), mn - the number of minutes, sc - the number of seconds, time - the local true solar time string in a 24 hour clock, and ampm - then local true solar time string in a 12 hour clock.
*/
function et2lst(et, body, lon, type) {
    const hr_ptr = cspice._malloc(INT_SIZE);
    const mn_ptr = cspice._malloc(INT_SIZE);
    const sc_ptr = cspice._malloc(INT_SIZE);
    const time_ptr = cspice._malloc(100);
    const ampm_ptr = cspice._malloc(100);
    cspice.ccall(
        'et2lst_c',
        null,
        ['number', 'number', 'number', 'string', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
        [et, body, lon, type, 100, 100, hr_ptr, mn_ptr, sc_ptr, time_ptr, ampm_ptr],
    );
    const ampm = cspice.Pointer_stringify(ampm_ptr);
    const time = cspice.Pointer_stringify(time_ptr);
    const sc = cspice.getValue(sc_ptr, INT_TYPE);
    const mn = cspice.getValue(mn_ptr, INT_TYPE);
    const hr = cspice.getValue(hr_ptr, INT_TYPE);
    cspice._free(hr_ptr);
    cspice._free(mn_ptr);
    cspice._free(sc_ptr);
    cspice._free(time_ptr);
    cspice._free(ampm_ptr);

    return { hr, mn, sc, time, ampm };
}

/** @memberof SPICE
 * @func et2utc
 * @desc Convert an input time from ephemeris seconds past J2000 to Calendar, Day-of-Year, or Julian Date format, UTC.
 * @param {number} et - Input epoch, given in ephemeris seconds past J2000.
 * @param {string} format - Format of output epoch. May be any of the following:
 *
 *        "C" - Calendar format, UTC.
 *
 *        "D" - Day-of-Year format, UTC.
 *
 *        "J" - Julian Date format, UTC.
 *
 *        "ISOC" - ISO Calendar format, UTC.
 *
 *        "ISOD" - ISO Day-of-Year format, UTC.
 * @param {number} prec - Digits of precision in fractional seconds or days. Must be between 0 and 14, inclusive. Determines to how many decimal places the UTC time will be calculated.
 * @returns {string} The corresponding time in UTC.
 */
function et2utc(et, format, prec) {
    const utcstr_ptr = cspice._malloc(100);
    cspice.ccall(
        'et2utc_c',
        null,
        ['number', 'string', 'number', 'number', 'number'],
        [et, format, prec, 100, utcstr_ptr],
    );
    const utcstr = cspice.Pointer_stringify(utcstr_ptr);
    cspice._free(utcstr_ptr);
    return utcstr;
}

/* etcal:    Convert from an ephemeris epoch measured in seconds past
the epoch of J2000 to a calendar string format using a
formal calendar free of leapseconds.
*/
/** @memberof SPICE
 * @func etcal
 * @desc Convert from an ephemeris epoch measured in seconds past the epoch of J2000 to a calendar string format using a formal calendar free of leapseconds.
 * @param {number} et - An ephemeris epoch in seconds past J2000
 * @ returns {string} The corresponding time in calendar format (Year Month Day Time)
 */
function etcal(et) {
    const string_ptr = cspice._malloc(100);
    cspice.ccall(
        'etcal_c',
        null,
        ['number', 'number', 'number'],
        [et, 100, string_ptr],
    );
    const string = cspice.Pointer_stringify(string_ptr);
    cspice._free(string_ptr);
    return string;
}

/* failed: True if an error condition has been signaled via sigerr_c.
failed_c is the CSPICE status indicator
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
function failed() {
    return cspice.ccall(
        'failed_c',
        'number',
        [],
        [],
    );
}

// Provide SPICE one or more kernels to load
/** @memberof SPICE
 * @func furnsh(kernelPaths)/furnish
 * @desc Load one or more SPICE kernels into a program. Files must exists in the memory system or an error will occur.
 * @param {string | array} kernelPaths - Path or array of paths to kernel files.
 */
function furnsh(kernelPath) {
    cspice.ccall(
        'furnsh_c',
        null,
        ['string'],
        [kernelPath],
    );
}

function unload(kernelPath) {
    cspice.ccall(
        'unload_c',
        null,
        ['string'],
        [kernelPath],
    );
}

/* getmsg:
Retrieve the current short error message,
the explanation of the short error message, or the
long error message.
*/
function getmsg(option) {
    const msg_ptr = cspice._malloc(1841);
    cspice.ccall(
        'getmsg_c',
        null,
        ['string', 'number', 'number'],
        [option, 1841, msg_ptr],
    );
    const msg = cspice.Pointer_stringify(msg_ptr);
    cspice._free(msg_ptr);
    return msg;
}

/* j1900:    Return the Julian Date of 1899 DEC 31 12:00:00 (1900 JAN 0.5).
*/
/** @memberof SPICE
 * @func j1900
 * @desc Return the Julian Date of 1899 DEC 31 12:00:00 (1900 JAN 0.5).
 * @returns {number} 2415020.0
*/
function j1900() {
    return cspice.ccall(
        'j1900_c',
        'number',
        [],
        [],
    );
}

/* j1950:    Return the Julian Date of 1950 JAN 01 00:00:00 (1950 JAN 1.0).
*/
/** @memberof SPICE
 * @func j1950
 * @desc Return the Julian Date of 1950 JAN 01 00:00:00 (1950 JAN 1.0).
 * @returns {number} 2433282.5
*/
function j1950() {
    return cspice.ccall(
        'j1950_c',
        'number',
        [],
        [],
    );
}

/* j2000:    Return the Julian Date of 2000 JAN 01 12:00:00 (2000 JAN 1.5).
*/
/** @memberof SPICE
 * @func j2000
 * @desc Return the Julian Date of 2000 JAN 01 12:00:00 (2000 JAN 1.5).
 * @returns {number} 2451545.0
*/
function j2000() {
    return cspice.ccall(
        'j2000_c',
        'number',
        [],
        [],
    );
}

/* j2100:    Return the Julian Date of 2100 JAN 01 12:00:00 (2100 JAN 1.5).
*/
/** @memberof SPICE
 * @func j2100
 * @desc Return the Julian Date of 2100 JAN 01 12:00:00 (2100 JAN 1.5).
 * @returns {number} 2488070.0
*/
function j2100() {
    return cspice.ccall(
        'j2100_c',
        'number',
        [],
        [],
    );
}

/* jyear:    Return the number of seconds in a julian year.
*/
/** @memberof SPICE
 * @func jyear
 * @desc Return the number of seconds in a julian year.
 * @returns {number} 31557600
*/
function jyear() {
    return cspice.ccall(
        'jyear_c',
        'number',
        [],
        [],
    );
}

/* ltime:
This routine computes the transmit (or receive) time
of a signal at a specified target, given the receive
(or transmit) time at a specified observer. The elapsed
time between transmit and receive is also returned.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
function ltime(etobs, obs, dir, targ) {
    const ettarg_ptr = cspice._malloc(8);
    const elapsd_ptr = cspice._malloc(8);
    cspice.ccall(
        'ltime_c',
        null,
        ['number', 'number', 'string', 'number', 'number', 'number'],
        [etobs, obs, dir, targ, ettarg_ptr, elapsd_ptr],
    );
    const elapsd = cspice.getValue(elapsd_ptr, 'double');
    const ettarg = cspice.getValue(ettarg_ptr, 'double');
    cspice._free(elapsd_ptr);
    cspice._free(ettarg_ptr);
    return { ettarg, elapsd };
}

/* reset:
Reset the CSPICE error status to a value of "no error."
As a result, the status routine, failed_c, will return a value
of SPICEFALSE
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
function reset() {
    cspice.ccall(
        'reset_c',
        null,
        [],
        [],
    );
}

/* scdecd:
Convert double precision encoding of spacecraft clock time into
a character representation.
*/
/** @memberof SPICE
 * @func scdecd
 * @desc Spacecraft - decode: Convert double precision encoding of spacecraft clock time into a character representation.
 * @param {number} sc - NAIF ID of the spacecraft.
 * @param {number} sclkdp - SCLK time to convert in ticks.
 * @returns {string} The character encoding of time sclkdp for spacecraft sc.
 */
function scdecd(sc, sclkdp) {
    const sclkch_ptr = cspice._malloc(100);
    cspice.ccall(
        'scdecd_c',
        null,
        ['number', 'number', 'number', 'number'],
        [sc, sclkdp, 100, sclkch_ptr],
    );
    const sclkch = cspice.Pointer_stringify(sclkch_ptr);
    cspice._free(sclkch_ptr);
    return sclkch;
}

/* sce2c:
Convert ephemeris seconds past J2000 (ET) to continuous encoded
spacecraft clock (`ticks').  Non-integral tick values may be
returned.
*/
/** @memberof SPICE
 * @func sce2c
 * @desc Spacecraft - ephemeris to clock: Convert ephemeris seconds past J2000 (ET) to continuous encoded spacecraft clock (`ticks').  Non-integral tick values may be returned.
 * @param {number} sc - NAIF ID of the spacecraft.
 * @param {number} et - Ephemeris seconds past J2000
 * @returns {number} The corresponding SCLK time for spacecraft sc in clock ticks.
 */
function sce2c(sc, et) {
    const sclkdp_ptr = cspice._malloc(DOUBLE_SIZE);
    cspice.ccall(
        'sce2c_c',
        null,
        ['number', 'number', 'number'],
        [sc, et, sclkdp_ptr],
    );
    const sclkdp = cspice.getValue(sclkdp_ptr, DOUBLE_TYPE);
    cspice._free(sclkdp_ptr);
    return sclkdp;
}

/* sce2s:
Convert an epoch specified as ephemeris seconds past J2000 (ET) to a
character string representation of a spacecraft clock value (SCLK).
*/
/** @memberof SPICE
 * @func sce2s
 * @desc Spacecraft - ephemeris to clock string: Convert an epoch specified as ephemeris seconds past J2000 (ET) to a character string representation of a spacecraft clock value (SCLK).
 * @param {number} sc - NAIF ID of the spacecraft.
 * @param {number} et - Ephemeris seconds past J2000
 * @returns {string} The corresponding SCLK time for spacecraft sc in SLCK string encoding.
 */
function sce2s(sc, et) {
    const sclkch_ptr = cspice._malloc(100);
    cspice.ccall(
        'sce2s_c',
        null,
        ['number', 'number', 'number', 'number'],
        [sc, et, 100, sclkch_ptr],
    );
    const sclkch = cspice.Pointer_stringify(sclkch_ptr);
    cspice._free(sclkch_ptr);
    return sclkch;
}

/* sce2t:
Convert ephemeris seconds past J2000 (ET) to integral
encoded spacecraft clock (`ticks'). For conversion to
fractional ticks, (required for C-kernel production), see
the routine sce2c_c.
*/
/** @memberof SPICE
 * @func sce2t
 * @desc Spacecraft - ephemeris to ticks: Convert ephemeris seconds past J2000 (ET) to integral encoded spacecraft clock (`ticks'). For conversion to fractional ticks, (required for C-kernel production), see the routine sce2c.
 * @param {number} sc - NAIF ID of the spacecraft.
 * @param {number} et - Ephemeris seconds past J2000
 * @returns {number} The corresponding SCLK time for spacecraft sc in clock ticks to the closest integer.
 */
function sce2t(sc, et) {
    const sclkdp_ptr = cspice._malloc(DOUBLE_SIZE);
    cspice.ccall(
        'sce2t_c',
        null,
        ['number', 'number', 'number'],
        [sc, et, sclkdp_ptr],
    );
    const ret = cspice.getValue(sclkdp_ptr, DOUBLE_TYPE);
    cspice._free(sclkdp_ptr);
    return ret;
}

/* scencd:
Encode character representation of spacecraft clock time into a
double precision number.
*/
/** @memberof SPICE
 * @func scencd
 * @desc Spacecraft - encode: Encode character representation of spacecraft clock time into a double precision number.
 * @param {number} sc - NAIF ID of the spacecraft.
 * @param {number} sclkch - SCLK time in character encoding.
 * @returns {number} Sclkch in spacecraft ticks.
 */
function scencd(sc, sclkch) {
    const sclkdp_ptr = cspice._malloc(DOUBLE_SIZE);
    cspice.ccall(
        'scencd_c',
        null,
        ['number', 'string', 'number'],
        [sc, sclkch, sclkdp_ptr],
    );
    const sclkdp = cspice.getValue(sclkdp_ptr, DOUBLE_TYPE);
    cspice._free(sclkdp_ptr);
    return sclkdp;
}

/* scfmt:
Convert encoded spacecraft clock ticks to character clock format.
*/
/** @memberof SPICE
 * @func scfmt
 * @desc Spacecraft - format: Convert encoded spacecraft clock ticks to character clock format.
 * @param {number} sc - NAIF ID of the spacecraft.
 * @param {number} ticks - SCLK time (in ticks) to convert.
 * @returns {string} A string encoding of time ticks for spacecraft sc. Note the important difference between scfmt and scdecd. scdecd converts some number of ticks since the spacecraft clock start
 * time to a character string which includes a partition number. scfmt, which is called by scdecd, does not make use of partition information.
 */
function scfmt(sc, ticks) {
    const clkstr_ptr = cspice._malloc(100);
    cspice.ccall(
        'scfmt_c',
        null,
        ['number', 'number', 'number', 'number'],
        [sc, ticks, 100, clkstr_ptr],
    );
    const clkstr = cspice.Pointer_stringify(clkstr_ptr);
    cspice._free(clkstr_ptr);
    return clkstr;
}

/* scpart:
Get spacecraft clock partition information from a spacecraft
clock kernel file.
*/
/** @memberof SPICE
 * @func scpart
 * @desc Get spacecraft clock partition information from a spacecraft clock kernel file.
 * @param {number} sc - NAIF ID of the spacecraft.
 * @returns {object} An object containing two arrays: pstart and pstop. pstart contains the list of partition start times for spacecraft sc and pstop contains the partition stop times.
 */
function scpart(sc) {
    const nparts_ptr = cspice._malloc(INT_SIZE);
    const pstart_ptr = cspice._malloc(9999 * DOUBLE_SIZE);
    const pstop_ptr = cspice._malloc(9999 * DOUBLE_SIZE);
    cspice.ccall(
        'scpart_c',
        null,
        ['number', 'number', 'number', 'number'],
        [sc, nparts_ptr, pstart_ptr, pstop_ptr],
    );
    const pstop = [];
    const pstart = [];
    for (let i = 0; i < cspice.getValue(nparts_ptr, INT_TYPE); i++) {
        pstop.push(cspice.getValue(pstop_ptr + i * DOUBLE_SIZE, DOUBLE_TYPE));
        pstart.push(cspice.getValue(pstart_ptr + i * DOUBLE_SIZE, DOUBLE_TYPE));
    }
    cspice._free(nparts_ptr);
    cspice._free(pstart_ptr);
    cspice._free(pstop_ptr);

    return { pstart, pstop };
}

/* scs2e:
Convert a spacecraft clock string to ephemeris seconds past
J2000 (ET).
*/
/** @memberof SPICE
 * @func scs2e
 * @desc Spacecraft - string to ephemeris. Convert a spacecraft clock string to ephemeris seconds past J2000 (ET).
 * @param {number} sc - NAIF ID of the spacecraft.
 * @param {string} sclkch - String encoded SCLK time
 * @returns {number} The corresponding time in ET seconds past J2000
 */
function scs2e(sc, sclkch) {
    const et_ptr = cspice._malloc(DOUBLE_SIZE);
    cspice.ccall(
        'scs2e_c',
        null,
        ['number', 'string', 'number'],
        [sc, sclkch, et_ptr],
    );
    const et = cspice.getValue(et_ptr, DOUBLE_TYPE);
    cspice._free(et_ptr);
    return et;
}

/* sct2e:
Convert encoded spacecraft clock (`ticks') to ephemeris
seconds past J2000 (ET).
*/
/** @memberof SPICE
 * @func sct2e
 * @desc Spacecraft - ticks to ephemeris. Convert encoded spacecraft clock (`ticks') to ephemeris seconds past J2000 (ET).
 * @param {number} sc - NAIF ID of the spacecraft.
 * @param {number} sclkdp - SCLK time in ticks
 * @returns {number} The corresponding time in ET seconds past J2000
 */
function sct2e(sc, sclkdp) {
    const et_ptr = cspice._malloc(DOUBLE_SIZE);
    cspice.ccall(
        'sct2e_c',
        null,
        ['number', 'number', 'number'],
        [sc, sclkdp, et_ptr],
    );
    const et = cspice.getValue(et_ptr, DOUBLE_TYPE);
    cspice._free(et_ptr);
    return et;
}

/* sctiks:
Convert a spacecraft clock format string to number of "ticks".
*/
/** @memberof SPICE
 * @func sctiks
 * @desc Spacecraft - ticks: Convert character representation of spacecraft clock time into a double precision number of ticks.
 * @param {number} sc - NAIF ID of the spacecraft.
 * @param {number} clkstr - SCLK time in character encoding.
 * @returns {number} Corresponding time in SCLK ticks. Note the important difference between scencd and sctiks. scencd converts a clock string to the number of ticks it represents
 * since the beginning of the mission, and so uses partition information. sctiks_c just converts to absolute ticks.
 */
function sctiks(sc, clkstr) {
    const ticks_ptr = cspice._malloc(DOUBLE_SIZE);
    cspice.ccall(
        'sctiks_c',
        null,
        ['number', 'string', 'number'],
        [sc, clkstr, ticks_ptr],
    );
    const ticks = cspice.getValue(ticks_ptr, DOUBLE_TYPE);
    cspice._free(ticks_ptr);
    return ticks;
}

/* spd:    Return the number of seconds in a day.
*/
/** @memberof SPICE
 * @func spd
 * @desc Return the number of seconds in a day.
 * @returns {number} 86400
*/
function spd() {
    return cspice.ccall(
        'spd_c',
        'number',
        [],
        [],
    );
}

/* str2et:    Convert a string representing an epoch to a double precision
value representing the number of TDB seconds past the J2000
epoch corresponding to the input epoch.
*/
/** @memberof SPICE
 * @func str2et
 * @desc Convert a string representing an epoch in UTC to a double precision value representing the number of TDB seconds past the J2000 epoch corresponding to the input epoch.
 * @param {string} str - A UTC epoch in calendar format
 * @returns {number} The corresponding time in ET seconds past J2000.
 */
function str2et(str) {
    const et_ptr = cspice._malloc(DOUBLE_SIZE);
    cspice.ccall(
        'str2et_c',
        null,
        ['string', 'number'],
        [str, et_ptr],
    );
    const et = cspice.getValue(et_ptr, DOUBLE_TYPE);
    cspice._free(et_ptr);
    return et;
}

/* timdef:
Set and retrieve the defaults associated with calendar
input strings.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
function timdef(action, item, value) {
    const value_ptr = cspice._malloc(100);
    cspice.writeStringToMemory(value, value_ptr);
    cspice.ccall(
        'timdef_c',
        null,
        ['string', 'string', 'number', 'number'],
        [action, item, 100, value_ptr],
    );

    const valueOut = cspice.Pointer_stringify(value_ptr);
    cspice._free(value_ptr);
    return valueOut;
}

/* timout:
This routine converts an input epoch represented in TDB seconds
past the TDB epoch of J2000 to a character string formatted to
the specifications of a user's format picture.
*/
/** @memberof SPICE
 * @func timout
 * @desc This routine converts an input epoch represented in TDB seconds past the TDB epoch of J2000 to a character string formatted to the specifications of a user's format picture.
 * @param {number} et - Time in ET seconds past J2000.
 * @param {string} pictur - The format describing how the time should returned. For example, "Mon DD, YYYY AP:MN:SC AMPM" might result in "Nov 19, 2014 06:12:08 P.M.".
 * @returns {string} The time formatted to fit to pictur.
 */
function timout(et, pictur) {
    const output_ptr = cspice._malloc(100);
    cspice.ccall(
        'timout_c',
        null,
        ['number', 'string', 'number', 'number'],
        [et, pictur, 100, output_ptr],
    );
    const output = cspice.Pointer_stringify(output_ptr);
    cspice._free(output_ptr);
    return output;
}

/* tparse:
Parse a time string and return seconds past the J2000 epoch
on a formal calendar.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
function tparse(string) {
    const sp2000_ptr = cspice._malloc(DOUBLE_SIZE);
    const errmsg_ptr = cspice._malloc(2000);
    cspice.ccall(
        'tparse_c',
        null,
        ['string', 'number', 'number', 'number'],
        [string, 2000, sp2000_ptr, errmsg_ptr],
    );
    const errmsg = cspice.Pointer_stringify(errmsg_ptr);
    const sp2000 = cspice.getValue(sp2000_ptr, DOUBLE_TYPE);
    cspice._free(errmsg_ptr);
    cspice._free(sp2000_ptr);

    return { sp2000, errmsg };
}

/* tpictr:
Given a sample time string, create a time format picture
suitable for use by the routine timout_c.
*/
/** @memberof SPICE
 * @func tpictr
 * @desc Given a sample time string, create a time format picture suitable for use by the routine timout.
 * @param {string} sample - A time string that conforms to the desired format. For example, "Oct 24, 1994 23:45:12 PM" becomes "Mon DD, YYYY AP:MN:SC AMPM".
 * @returns {string} A correctly formatted picture to be passed into timout for time conversion.
 */
function tpictr(sample) {
    const picture_ptr = cspice._malloc(100);
    const ok_ptr = cspice._malloc(INT_SIZE);
    const errmsg_ptr = cspice._malloc(2000);
    cspice.ccall(
        'tpictr_c',
        null,
        ['string', 'number', 'number', 'number', 'number', 'number'],
        [sample, 100, 2000, picture_ptr, ok_ptr, errmsg_ptr],
    );
    const picture = cspice.Pointer_stringify(picture_ptr);
    const ok = cspice.getValue(ok_ptr, INT_TYPE);
    const errmsg = cspice.Pointer_stringify(errmsg_ptr);
    cspice._free(picture_ptr);
    cspice._free(ok_ptr);
    cspice._free(errmsg_ptr);

    return { picture, ok, errmsg };
}

/* tsetyr:   Set the lower bound on the 100 year range
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
function tsetyr(year) {
    cspice.ccall(
        'tsetyr_c',
        null,
        ['number' ],
        [year],
    );
}

/* tyear:
Return the number of seconds in a tropical year.
*/
/** @memberof SPICE
 * @func tyear
 * @desc Return the number of seconds in a tropical year.
 * @returns {number} 31556925.9747
*/
function tyear() {
    return cspice.ccall(
        'tyear_c',
        'number',
        [],
        [],
    );
}

/* unitim:    Transform time from one uniform scale to another.  The uniform
time scales are TAI, TDT, TDB, ET, JED, JDTDB, JDTDT.
*/
/** @memberof SPICE
 * @fund unitim
 * @desc Transform time from one uniform scale to another. The uniform time scales are TAI, TDT, TDB, ET, JED, JDTDB, JDTDT.
 * @param {number} epoch - The epoch to convert from
 * @param {string} insys - The time system the input epoch is in ("TAI", "TDT", "TDB", "ET", "JED", "JDTDB", or "JDTDT").
 * @param {string} outsys - The time system the output should be in ("TAI", "TDT", "TDB", "ET", "JED", "JDTDB", or "JDTDT").
 * @returns {number} The corresponding time in the outsys scale.
 */
function unitim(epoch, insys, outsys) {
    return cspice.ccall(
        'unitim_c',
        'number',
        ['number', 'string', 'string'],
        [epoch, insys, outsys],
    );
}

/* utc2et:    Convert an input time from Calendar or Julian Date format, UTC,
to ephemeris seconds past J2000.
*/
/** @memberof SPICE
 * @func utc2et
 * @desc Convert an input time from Calendar or Julian Date format, UTC, to ephemeris seconds past J2000.
 * @param {string} utcstr - A UTC time in calendar or Julian date format
 * @returns {number} The corresponding time in ET seconds past J2000.
 */
function utc2et(utcstr) {
    const et_ptr = cspice._malloc(DOUBLE_SIZE);
    cspice.ccall(
        'utc2et_c',
        null,
        ['string', 'number'],
        [utcstr, et_ptr],
    );
    const et = cspice.getValue(et_ptr, DOUBLE_TYPE);
    cspice._free(et_ptr);
    return et;
}

function spkpos(targ, et, ref, abcorr, obs) {
	// create output pointers
	const ptarg_ptr = cspice._malloc(DOUBLE_SIZE * 3);
	const lt_ptr = cspice._malloc(DOUBLE_SIZE);

    cspice.ccall(
		'spkpos_c',
		null,
		/* ConstSpiceChar targ, SpiceDouble et, ConstSpiceChar ref, ConstSpiceChar abcorr, ConstSpiceChar obs, SpiceDouble ptarg, SpiceDouble lt */
		[ 'string', 'number', 'string', 'string', 'string', 'number', 'number' ],
		[ targ, et, ref, abcorr, obs, ptarg_ptr, lt_ptr ],
	);

	// read and free output pointers
	const ptarg = [
        cspice.getValue( ptarg_ptr + DOUBLE_SIZE * 0, 'double' ),
        cspice.getValue( ptarg_ptr + DOUBLE_SIZE * 1, 'double' ),
        cspice.getValue( ptarg_ptr + DOUBLE_SIZE * 2, 'double' ),
    ];
	cspice._free( ptarg_ptr );

	const lt = cspice.getValue( lt_ptr, 'double' );
	cspice._free( lt_ptr );

	return { ptarg, lt };
}

exports.b1900 = b1900;
exports.b1950 = b1950;
exports.bodc2n = bodc2n;
exports.bodc2s = bodc2s;
exports.boddef = boddef;
exports.bodfnd = bodfnd;
exports.bodn2c = bodn2c;
exports.bods2c = bods2c;
exports.bodvcd = bodvcd;
exports.bodvrd = bodvrd;
exports.convrt = convrt;
exports.deltet = deltet;
exports.erract = erract;
exports.et2lst = et2lst;
exports.et2utc = et2utc;
exports.etcal = etcal;
exports.failed = failed;
exports.furnsh = furnsh;
exports.getmsg = getmsg;
exports.j1900 = j1900;
exports.j1950 = j1950;
exports.j2000 = j2000;
exports.j2100 = j2100;
exports.jyear = jyear;
exports.ltime = ltime;
exports.reset = reset;
exports.scdecd = scdecd;
exports.sce2c = sce2c;
exports.sce2s = sce2s;
exports.sce2t = sce2t;
exports.scencd = scencd;
exports.scfmt = scfmt;
exports.scpart = scpart;
exports.scs2e = scs2e;
exports.sct2e = sct2e;
exports.sctiks = sctiks;
exports.spd = spd;
exports.spkpos = spkpos;
exports.str2et = str2et;
exports.timdef = timdef;
exports.timout = timout;
exports.tparse = tparse;
exports.tpictr = tpictr;
exports.tsetyr = tsetyr;
exports.tyear = tyear;
exports.unitim = unitim;
exports.unload = unload;
exports.utc2et = utc2et;
