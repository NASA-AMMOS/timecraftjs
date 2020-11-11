import Module from './cspice.js';

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
export function b1900() {
    return Module.ccall(
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
export function b1950() {
    return Module.ccall(
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
export function bodc2n(code) {
    const name_ptr = Module._malloc(100);
    const found_ptr = Module._malloc(INT_SIZE);
    Module.ccall(
        'bodc2n_c',
        null,
        ['number', 'number', 'number', 'number'],
        [code, 100, name_ptr, found_ptr],
    );
    const found = Module.getValue(found_ptr, INT_TYPE);
    const name = Module.Pointer_stringify(name_ptr);
    Module._free(name_ptr);
    Module._free(found_ptr);

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
export function bodc2s(code) {
    const name_ptr = Module._malloc(100);
    Module.ccall(
        'bodc2s_c',
        null,
        ['number', 'number', 'number'],
        [code, 100, name_ptr],
    );
    const name = Module.Pointer_stringify(name_ptr);
    Module._free(name_ptr);
    return name;
}

/* boddef:    Define a body name/ID code pair for later translation via
bodn2c_c or bodc2n_c.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
export function boddef(name, code) {
    Module.ccall(
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
export function bodfnd(body, item) {
    return Module.ccall(
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
export function bodn2c(name) {
    const code_ptr = Module._malloc(INT_SIZE);
    const found_ptr = Module._malloc(INT_SIZE);
    Module.ccall(
        'bodn2c_c',
        null,
        ['string', 'number', 'number'],
        [name, code_ptr, found_ptr],
    );
    const found = Module.getValue(found_ptr, INT_TYPE);
    const code = Module.getValue(code_ptr, INT_TYPE);
    Module._free(found_ptr);
    Module._free(code_ptr);

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
export function bods2c(name) {
    const code_ptr = Module._malloc(INT_SIZE);
    const found_ptr = Module._malloc(INT_SIZE);
    Module.ccall(
        'bods2c_c',
        null,
        ['string', 'number', 'number'],
        [name, code_ptr, found_ptr],
    );
    const found = Module.getValue(found_ptr, INT_TYPE);
    const code = Module.getValue(code_ptr, INT_TYPE);
    Module._free(code_ptr);
    Module._free(found_ptr);

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
export function bodvcd(bodyid, item, maxn) {
    const dim_ptr = Module._malloc(DOUBLE_SIZE);
    const values_ptr = Module._malloc(DOUBLE_SIZE * maxn);
    Module.ccall(
        'bodvcd_c',
        null,
        ['number', 'string', 'number', 'number', 'number'],
        [bodyid, item, maxn, dim_ptr, values_ptr],
    );
    const ret = [];
    for (let i = 0; i < Module.getValue(dim_ptr, INT_TYPE); i++) {
        ret.push(Module.getValue(values_ptr + i * DOUBLE_SIZE, DOUBLE_TYPE));
    }
    Module._free(dim_ptr);
    Module._free(values_ptr);

    return ret;
}

/* bodvrd:
Fetch from the kernel pool the double precision values
of an item associated with a body.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
export function bodvrd(body, item, maxn) {
    const valuesptr = Module._malloc(DOUBLE_SIZE * maxn);
    const dimptr = Module._malloc(INT_SIZE);
    Module.ccall(
        'bodvrd_c',
        null,
        ['string', 'string', 'number', 'number', 'number'],
        [body, item, maxn, dimptr, valuesptr],
    );
    const ret = [];
    for (let i = 0; i < Module.getValue(dimptr, INT_TYPE); i++) {
        ret.push(Module.getValue(valuesptr + i * DOUBLE_SIZE, DOUBLE_TYPE));
    }
    Module._free(valuesptr);
    Module._free(dimptr);

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
export function convrt(x, in_var, out) {
    const y_ptr = Module._malloc(DOUBLE_SIZE);
    Module.ccall(
        'convrt_c',
        null,
        ['number', 'string', 'string', 'number'],
        [x, in_var, out, y_ptr],
    );
    const ret = Module.getValue(y_ptr, DOUBLE_TYPE);
    Module._free(y_ptr);
    return ret;
}

/** @memberof SPICE
 * @func deltet
 * @desc Return the value of Delta ET (ET-UTC) for an input epoch.
 * @param {number} epoch - Input epoch (seconds past J2000).
 * @param {string} eptype - Type of input epoch ("UTC" or "ET"). "UTC": epoch is in UTC seconds past J2000 UTC. "ET": epoch is in Ephemeris seconds past J2000 TDB.
 * @returns {number} Delta ET (ET-UTC) at input epoch
 */
export function deltet(epoch, eptype) {
    const delta_ptr = Module._malloc(DOUBLE_SIZE);
    Module.ccall(
        'deltet_c',
        null,
        ['number', 'string', 'number'],
        [epoch, eptype, delta_ptr],
    );
    const delta = Module.getValue(delta_ptr, DOUBLE_TYPE);
    Module._free(delta_ptr);
    return delta;
}

/* erract:    Retrieve or set the default error action.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
export function erract(op, action) {
    return Module.ccall(
        'erract_c',
        null,
        ['string', 'number', 'string'],
        [op, 100, action],
    );
}

export function errprt(op, list) {
    const list_ptr = Module._malloc(100);
    Module.stringToUTF8(list, list_ptr, 100);

	Module.ccall(
		'errprt_c',
		null,
		/* ConstSpiceChar op, SpiceInt lenout, SpiceChar list */
		['string', 'number', 'number' ],
		[op, 100, list_ptr],
	);

    const result = Module.UTF8ToString(list_ptr, 200);
    Module._free(list_ptr);
	return result;
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
export function et2lst(et, body, lon, type) {
    const hr_ptr = Module._malloc(INT_SIZE);
    const mn_ptr = Module._malloc(INT_SIZE);
    const sc_ptr = Module._malloc(INT_SIZE);
    const time_ptr = Module._malloc(100);
    const ampm_ptr = Module._malloc(100);
    Module.ccall(
        'et2lst_c',
        null,
        ['number', 'number', 'number', 'string', 'number', 'number', 'number', 'number', 'number', 'number', 'number'],
        [et, body, lon, type, 100, 100, hr_ptr, mn_ptr, sc_ptr, time_ptr, ampm_ptr],
    );
    const ampm = Module.Pointer_stringify(ampm_ptr);
    const time = Module.Pointer_stringify(time_ptr);
    const sc = Module.getValue(sc_ptr, INT_TYPE);
    const mn = Module.getValue(mn_ptr, INT_TYPE);
    const hr = Module.getValue(hr_ptr, INT_TYPE);
    Module._free(hr_ptr);
    Module._free(mn_ptr);
    Module._free(sc_ptr);
    Module._free(time_ptr);
    Module._free(ampm_ptr);

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
export function et2utc(et, format, prec) {
    const utcstr_ptr = Module._malloc(100);
    Module.ccall(
        'et2utc_c',
        null,
        ['number', 'string', 'number', 'number', 'number'],
        [et, format, prec, 100, utcstr_ptr],
    );
    const utcstr = Module.Pointer_stringify(utcstr_ptr);
    Module._free(utcstr_ptr);
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
export function etcal(et) {
    const string_ptr = Module._malloc(100);
    Module.ccall(
        'etcal_c',
        null,
        ['number', 'number', 'number'],
        [et, 100, string_ptr],
    );
    const string = Module.Pointer_stringify(string_ptr);
    Module._free(string_ptr);
    return string;
}

/* failed: True if an error condition has been signaled via sigerr_c.
failed_c is the CSPICE status indicator
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
export function failed() {
    return Module.ccall(
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
export function furnsh(kernelPath) {
    Module.ccall(
        'furnsh_c',
        null,
        ['string'],
        [kernelPath],
    );
}

export function unload(kernelPath) {
    Module.ccall(
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
export function getmsg(option) {
    const msg_ptr = Module._malloc(1841);
    Module.ccall(
        'getmsg_c',
        null,
        ['string', 'number', 'number'],
        [option, 1841, msg_ptr],
    );
    const msg = Module.Pointer_stringify(msg_ptr);
    Module._free(msg_ptr);
    return msg;
}

/* j1900:    Return the Julian Date of 1899 DEC 31 12:00:00 (1900 JAN 0.5).
*/
/** @memberof SPICE
 * @func j1900
 * @desc Return the Julian Date of 1899 DEC 31 12:00:00 (1900 JAN 0.5).
 * @returns {number} 2415020.0
*/
export function j1900() {
    return Module.ccall(
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
export function j1950() {
    return Module.ccall(
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
export function j2000() {
    return Module.ccall(
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
export function j2100() {
    return Module.ccall(
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
export function jyear() {
    return Module.ccall(
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
export function ltime(etobs, obs, dir, targ) {
    const ettarg_ptr = Module._malloc(8);
    const elapsd_ptr = Module._malloc(8);
    Module.ccall(
        'ltime_c',
        null,
        ['number', 'number', 'string', 'number', 'number', 'number'],
        [etobs, obs, dir, targ, ettarg_ptr, elapsd_ptr],
    );
    const elapsd = Module.getValue(elapsd_ptr, 'double');
    const ettarg = Module.getValue(ettarg_ptr, 'double');
    Module._free(elapsd_ptr);
    Module._free(ettarg_ptr);
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
export function reset() {
    Module.ccall(
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
export function scdecd(sc, sclkdp) {
    const sclkch_ptr = Module._malloc(100);
    Module.ccall(
        'scdecd_c',
        null,
        ['number', 'number', 'number', 'number'],
        [sc, sclkdp, 100, sclkch_ptr],
    );
    const sclkch = Module.Pointer_stringify(sclkch_ptr);
    Module._free(sclkch_ptr);
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
export function sce2c(sc, et) {
    const sclkdp_ptr = Module._malloc(DOUBLE_SIZE);
    Module.ccall(
        'sce2c_c',
        null,
        ['number', 'number', 'number'],
        [sc, et, sclkdp_ptr],
    );
    const sclkdp = Module.getValue(sclkdp_ptr, DOUBLE_TYPE);
    Module._free(sclkdp_ptr);
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
export function sce2s(sc, et) {
    const sclkch_ptr = Module._malloc(100);
    Module.ccall(
        'sce2s_c',
        null,
        ['number', 'number', 'number', 'number'],
        [sc, et, 100, sclkch_ptr],
    );
    const sclkch = Module.Pointer_stringify(sclkch_ptr);
    Module._free(sclkch_ptr);
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
export function sce2t(sc, et) {
    const sclkdp_ptr = Module._malloc(DOUBLE_SIZE);
    Module.ccall(
        'sce2t_c',
        null,
        ['number', 'number', 'number'],
        [sc, et, sclkdp_ptr],
    );
    const ret = Module.getValue(sclkdp_ptr, DOUBLE_TYPE);
    Module._free(sclkdp_ptr);
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
export function scencd(sc, sclkch) {
    const sclkdp_ptr = Module._malloc(DOUBLE_SIZE);
    Module.ccall(
        'scencd_c',
        null,
        ['number', 'string', 'number'],
        [sc, sclkch, sclkdp_ptr],
    );
    const sclkdp = Module.getValue(sclkdp_ptr, DOUBLE_TYPE);
    Module._free(sclkdp_ptr);
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
export function scfmt(sc, ticks) {
    const clkstr_ptr = Module._malloc(100);
    Module.ccall(
        'scfmt_c',
        null,
        ['number', 'number', 'number', 'number'],
        [sc, ticks, 100, clkstr_ptr],
    );
    const clkstr = Module.Pointer_stringify(clkstr_ptr);
    Module._free(clkstr_ptr);
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
export function scpart(sc) {
    const nparts_ptr = Module._malloc(INT_SIZE);
    const pstart_ptr = Module._malloc(9999 * DOUBLE_SIZE);
    const pstop_ptr = Module._malloc(9999 * DOUBLE_SIZE);
    Module.ccall(
        'scpart_c',
        null,
        ['number', 'number', 'number', 'number'],
        [sc, nparts_ptr, pstart_ptr, pstop_ptr],
    );
    const pstop = [];
    const pstart = [];
    for (let i = 0; i < Module.getValue(nparts_ptr, INT_TYPE); i++) {
        pstop.push(Module.getValue(pstop_ptr + i * DOUBLE_SIZE, DOUBLE_TYPE));
        pstart.push(Module.getValue(pstart_ptr + i * DOUBLE_SIZE, DOUBLE_TYPE));
    }
    Module._free(nparts_ptr);
    Module._free(pstart_ptr);
    Module._free(pstop_ptr);

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
export function scs2e(sc, sclkch) {
    const et_ptr = Module._malloc(DOUBLE_SIZE);
    Module.ccall(
        'scs2e_c',
        null,
        ['number', 'string', 'number'],
        [sc, sclkch, et_ptr],
    );
    const et = Module.getValue(et_ptr, DOUBLE_TYPE);
    Module._free(et_ptr);
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
export function sct2e(sc, sclkdp) {
    const et_ptr = Module._malloc(DOUBLE_SIZE);
    Module.ccall(
        'sct2e_c',
        null,
        ['number', 'number', 'number'],
        [sc, sclkdp, et_ptr],
    );
    const et = Module.getValue(et_ptr, DOUBLE_TYPE);
    Module._free(et_ptr);
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
export function sctiks(sc, clkstr) {
    const ticks_ptr = Module._malloc(DOUBLE_SIZE);
    Module.ccall(
        'sctiks_c',
        null,
        ['number', 'string', 'number'],
        [sc, clkstr, ticks_ptr],
    );
    const ticks = Module.getValue(ticks_ptr, DOUBLE_TYPE);
    Module._free(ticks_ptr);
    return ticks;
}

/* spd:    Return the number of seconds in a day.
*/
/** @memberof SPICE
 * @func spd
 * @desc Return the number of seconds in a day.
 * @returns {number} 86400
*/
export function spd() {
    return Module.ccall(
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
export function str2et(str) {
    const et_ptr = Module._malloc(DOUBLE_SIZE);
    Module.ccall(
        'str2et_c',
        null,
        ['string', 'number'],
        [str, et_ptr],
    );
    const et = Module.getValue(et_ptr, DOUBLE_TYPE);
    Module._free(et_ptr);
    return et;
}

/* timdef:
Set and retrieve the defaults associated with calendar
input strings.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
export function timdef(action, item, value) {
    const value_ptr = Module._malloc(100);
    Module.writeStringToMemory(value, value_ptr);
    Module.ccall(
        'timdef_c',
        null,
        ['string', 'string', 'number', 'number'],
        [action, item, 100, value_ptr],
    );

    const valueOut = Module.Pointer_stringify(value_ptr);
    Module._free(value_ptr);
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
export function timout(et, pictur) {
    const output_ptr = Module._malloc(100);
    Module.ccall(
        'timout_c',
        null,
        ['number', 'string', 'number', 'number'],
        [et, pictur, 100, output_ptr],
    );
    const output = Module.Pointer_stringify(output_ptr);
    Module._free(output_ptr);
    return output;
}

/* tparse:
Parse a time string and return seconds past the J2000 epoch
on a formal calendar.
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
export function tparse(string) {
    const sp2000_ptr = Module._malloc(DOUBLE_SIZE);
    const errmsg_ptr = Module._malloc(2000);
    Module.ccall(
        'tparse_c',
        null,
        ['string', 'number', 'number', 'number'],
        [string, 2000, sp2000_ptr, errmsg_ptr],
    );
    const errmsg = Module.Pointer_stringify(errmsg_ptr);
    const sp2000 = Module.getValue(sp2000_ptr, DOUBLE_TYPE);
    Module._free(errmsg_ptr);
    Module._free(sp2000_ptr);

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
export function tpictr(sample) {
    const picture_ptr = Module._malloc(100);
    const ok_ptr = Module._malloc(INT_SIZE);
    const errmsg_ptr = Module._malloc(2000);
    Module.ccall(
        'tpictr_c',
        null,
        ['string', 'number', 'number', 'number', 'number', 'number'],
        [sample, 100, 2000, picture_ptr, ok_ptr, errmsg_ptr],
    );
    const picture = Module.Pointer_stringify(picture_ptr);
    const ok = Module.getValue(ok_ptr, INT_TYPE);
    const errmsg = Module.Pointer_stringify(errmsg_ptr);
    Module._free(picture_ptr);
    Module._free(ok_ptr);
    Module._free(errmsg_ptr);

    return { picture, ok, errmsg };
}

/* tsetyr:   Set the lower bound on the 100 year range
*/
/** @memberof SPICE
 * @todo Document and test this!
 */
export function tsetyr(year) {
    Module.ccall(
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
export function tyear() {
    return Module.ccall(
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
export function unitim(epoch, insys, outsys) {
    return Module.ccall(
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
export function utc2et(utcstr) {
    const et_ptr = Module._malloc(DOUBLE_SIZE);
    Module.ccall(
        'utc2et_c',
        null,
        ['string', 'number'],
        [utcstr, et_ptr],
    );
    const et = Module.getValue(et_ptr, DOUBLE_TYPE);
    Module._free(et_ptr);
    return et;
}

export function spkpos(targ, et, ref, abcorr, obs) {
	// create output pointers
	const ptarg_ptr = Module._malloc(DOUBLE_SIZE * 3);
	const lt_ptr = Module._malloc(DOUBLE_SIZE);

    Module.ccall(
		'spkpos_c',
		null,
		/* ConstSpiceChar targ, SpiceDouble et, ConstSpiceChar ref, ConstSpiceChar abcorr, ConstSpiceChar obs, SpiceDouble ptarg, SpiceDouble lt */
		[ 'string', 'number', 'string', 'string', 'string', 'number', 'number' ],
		[ targ, et, ref, abcorr, obs, ptarg_ptr, lt_ptr ],
	);

	// read and free output pointers
	const ptarg = [
        Module.getValue( ptarg_ptr + DOUBLE_SIZE * 0, 'double' ),
        Module.getValue( ptarg_ptr + DOUBLE_SIZE * 1, 'double' ),
        Module.getValue( ptarg_ptr + DOUBLE_SIZE * 2, 'double' ),
    ];
	Module._free( ptarg_ptr );

	const lt = Module.getValue( lt_ptr, 'double' );
	Module._free( lt_ptr );

	return { ptarg, lt };
}
