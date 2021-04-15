const fs = require('fs');
const path = require('path');
const { Spice } = require('../cjs/index.js');

describe('Spice', () => {
    let spiceInstance = null;
    beforeAll(async () => {
        spiceInstance = await new Spice().init();
    });

    describe('async init', () => {
        it('should throw an error if init has not been called.', () => {
            const inst = new Spice();
            let caught = false;
            try {
                inst.et2lst(510593482.204611, 499, 0, 'planetocentric');
            } catch(e) {
                caught = true;
            }
            expect(caught).toBeTruthy();
        });

        it('should throw an error if init has not resolved.', () => {
            const inst = new Spice();
            inst.init();

            let caught = false;
            try {
                inst.et2lst(510593482.204611, 499, 0, 'planetocentric');
            } catch(e) {
                caught = true;
            }
            expect(caught).toBeTruthy();
        });

        it('should resolve whenReady when compleete.', async () => {
            const inst = new Spice();

            let resolved = false;
            inst.whenReady.then(() => {
                resolved = true;
            });

            await inst.init();
            expect(resolved).toBeTruthy();
        });

        it('should resolve with the class instance.', async () => {
            const inst = new Spice();
            const results = await Promise.all([inst.whenReady, inst.init()]);

            expect(results[0]).toBe(inst);
            expect(results[1]).toBe(inst);
        });
    });

    describe('loading kernels', () => {
        it('should throw an error if two kernels are loaded with the same key.', () => {
            const kernelPath = path.resolve(__dirname, '../kernels/lsk/naif0012.tls');
            const buffer = fs.readFileSync(kernelPath);

            spiceInstance.loadKernel(buffer, 'key');
            let caught = false;
            try {
                spiceInstance.loadKernel(buffer, 'key');
            } catch(err) {
                caught = true;
            }
            expect(caught).toBeTruthy();
            spiceInstance.unloadKernel('key');
        });

        it('should throw an error if unloading a key that hasn not been loaded', () => {
            let caught = false;
            try {
                spiceInstance.unloadKernel('key');
            } catch(err) {
                caught = true;
            }
            expect(caught).toBeTruthy();
        });

        it('should be able to unload a loaded kernel.', () => {
            const kernelPath = path.resolve(__dirname, '../kernels/lsk/naif0012.tls');
            const buffer = fs.readFileSync(kernelPath);

            const kernelPath2 = path.resolve(__dirname, '../kernels/pck/pck00010.tpc');
            const buffer2 = fs.readFileSync(kernelPath2);

            spiceInstance.loadKernel(buffer, 'key');
            spiceInstance.loadKernel(buffer2, 'key2');
            spiceInstance.unloadKernel('key');
        });
    });

    describe('Spice', () => {
        let kernelPaths;
        beforeEach(() => {
            kernelPaths = [
                '../kernels/lsk/naif0012.tls',
                '../kernels/spk/de425s.bsp',
                '../kernels/sclk/msl_lmst_ops120808_v1.tsc',
                '../kernels/sclk/msl_76_sclkscet_00016.tsc',
                '../kernels/pck/pck00008.tpc',
                '../kernels/spk/msl_ls_ops120808_iau2000_v1.bsp',
                '../kernels/spk/msl_atls_ops120808_v1.bsp',
                '../kernels/fk/msl_v08.tf',
            ];
            kernelPaths.forEach(p => {
                const buffer = fs.readFileSync(path.resolve(__dirname, p));
                spiceInstance.loadKernel(buffer, p);
            });
        });

        it('should be able to get and set error reporting state', () => {
            expect(spiceInstance.erract('GET')).toEqual('DEFAULT');
            spiceInstance.erract('SET', 'IGNORE');
            expect(spiceInstance.erract('GET')).toEqual('IGNORE');

            expect(spiceInstance.errprt('GET')).toEqual('SHORT, LONG, EXPLAIN, TRACEBACK, DEFAULT');
            spiceInstance.errprt('SET', 'NONE');
            expect(spiceInstance.errprt('GET')).toEqual('');
            spiceInstance.errprt('SET', 'ALL');
            expect(spiceInstance.errprt('GET')).toEqual('SHORT, LONG, EXPLAIN, TRACEBACK');
        });

        it('should return expected values', () => {
            expect(spiceInstance.bodc2n(-76)).toEqual({ found: 1, name: 'MSL' });
            expect(spiceInstance.bodc2n(499)).toEqual({ found: 1, name: 'MARS' });
            expect(spiceInstance.bodn2c('MARS')).toEqual({ found: 1, code: 499 });
            expect(spiceInstance.et2utc(43523178.23, 'ISOC', 4)).toEqual('2001-05-19T05:45:14.0448');

            // et 2 lst
            expect(spiceInstance.et2lst(510593482.204611, 499, 0, 'planetocentric')).toEqual({
                hr: 3,
                mn: 58,
                sc: 32,
                time: '03:58:32',
                ampm: '03:58:32 A.M.',
            });

            // et 2 utc
            expect(spiceInstance.et2utc(510593482.204611, 'ISOC', 3)).toEqual('2016-03-07T03:30:14.019');

            // utc 2 et
            expect(parseFloat(spiceInstance.utc2et('2016-03-07T03:30:14.019').toFixed(3))).toEqual(510593482.204);

            // et 2 lmst
            expect(spiceInstance.sce2s(-76900, 510593482.204611)).toEqual('1/01274:12:44:53:49604');

            // et 2 sclk
            expect(spiceInstance.sce2s(-76, 510593482.204611)).toEqual('1/0510592221-24314');

            const sunPos = spiceInstance.spkpos('SUN', 510593482.204611, 'MSL_LOCAL_LEVEL', 'LT+S', 'MARS').ptarg;
            const maxVal = Math.max(...sunPos.map(v => Math.abs(v)));
            let sunDir = sunPos.map(v => v / maxVal);

            const dirLen = Math.sqrt(sunDir[0] ** 2 + sunDir[1] ** 2 + sunDir[2] ** 2);
            sunDir = sunDir.map(v => v / dirLen);

            expect(sunDir.map(v => parseFloat(v.toFixed(4)))).toEqual([0.4431, -0.2725, -0.8540]);
        });

        it('should perform chronos conversions.', () => {
            expect(spiceInstance.chronos('510593482.204611', '-from et -to utc -fromtype SECONDS')).toEqual('2016-03-07 03:30:14.019');
            expect(spiceInstance.chronos('510593482.204611', '-from et -to sclk -fromtype SECONDS -sc -76')).toEqual('1/0510592221-24314');
        });

        afterEach(() => {
            kernelPaths.forEach(p => {
                spiceInstance.unloadKernel(p);
            });
        });
    });
});
