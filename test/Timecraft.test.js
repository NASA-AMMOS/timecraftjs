const fs = require('fs');
const path = require('path');
const TimeCraft = require('../cjs/index.js');

describe('TimeCraft', () => {
    describe('isMetakernel', () => {
        it('should return true if a metakernel is detected.', () => {
            const encoded = new TextEncoder('utf-8').encode('__KERNELS_TO_LOAD')
            expect(TimeCraft.isMetakernel('__KERNELS_TO_LOAD')).toEqual(true);
            expect(TimeCraft.isMetakernel(encoded)).toEqual(true);

            const metaPath = path.resolve(__dirname, '../kernels/extras/mk/msl_chronos_v07.tm');
            let bufferContents = new Uint8Array(fs.readFileSync(metaPath));
            let strContents = fs.readFileSync(metaPath, { encoding: 'utf-8' });
            expect(TimeCraft.isMetakernel(bufferContents)).toEqual(true);
            expect(TimeCraft.isMetakernel(strContents)).toEqual(true);

            const kernelPath = path.resolve(__dirname, '../kernels/sclk/msl_76_sclkscet_00016.tsc');
            bufferContents = new Uint8Array(fs.readFileSync(kernelPath));
            strContents = fs.readFileSync(kernelPath, { encoding: 'utf-8' });
            expect(TimeCraft.isMetakernel(bufferContents)).toEqual(false);
            expect(TimeCraft.isMetakernel(strContents)).toEqual(false);
        });
    });

    describe('parseMetakernel', () => {
        it('should parse a buffer the same as a string.', () => {
            const metaPath = path.resolve(__dirname, '../kernels/extras/mk/msl_chronos_v07.tm');
            const strContents = fs.readFileSync(metaPath, { encoding: 'utf8' });
            const bufferContents = fs.readFileSync(metaPath);
            expect(
                TimeCraft.parseMetakernel(strContents),
            ).toEqual(
                TimeCraft.parseMetakernel(bufferContents),
            );
        });

        it('should parse metakernal fields.', () => {
            const metaPath = path.resolve(__dirname, '../kernels/extras/mk/msl_chronos_v07.tm');
            const contents = fs.readFileSync(metaPath, { encoding: 'utf8' });
            const data = TimeCraft.parseMetakernel(contents);

            expect(data.paths).toEqual([
                './data/lsk/naif0012.tls',
                './data/sclk/msl_76_sclkscet_00016.tsc',
                './data/sclk/msl_lmst_ops120808_v1.tsc',
                './data/pck/pck00008.tpc',
                './data/spk/de425s.bsp',
                './data/spk/msl_cruise_v1.bsp',
                './data/spk/msl_edl_v01.bsp',
                './data/spk/msl_ls_ops120808_iau2000_v1.bsp',
                './data/spk/msl_atls_ops120808_v1.bsp',
                './data/fk/msl_v08.tf',
            ]);
            expect(data.fields).toEqual( {
                PATH_SYMBOLS: [
                    'KERNELS',
                ],
                PATH_VALUES: [
                    './data',
                ],
                KERNELS_TO_LOAD: [
                    '$KERNELS/lsk/naif0012.tls',
                    '$KERNELS/sclk/msl_76_sclkscet_00016.tsc',
                    '$KERNELS/sclk/msl_lmst_ops120808_v1.tsc',
                    '$KERNELS/pck/pck00008.tpc',
                    '$KERNELS/spk/de425s.bsp',
                    '$KERNELS/spk/msl_cruise_v1.bsp',
                    '$KERNELS/spk/msl_edl_v01.bsp',
                    '$KERNELS/spk/msl_ls_ops120808_iau2000_v1.bsp',
                    '$KERNELS/spk/msl_atls_ops120808_v1.bsp',
                    '$KERNELS/fk/msl_v08.tf',
                ],
                BODY10_GM: 132712440035.0199,
                CENTER_ID: 499,
                LANDING_SOL_INDEX: 0,
                LANDING_TIME: '2012-08-06T05:17:57',
                SPACECRAFT_ID: -76,
            });
        });
    });

    describe('loading kernels', () => {
        it('should throw an error if two kernels are loaded with the same key.', () => {
            const kernelPath = path.resolve(__dirname, '../kernels/lsk/naif0012.tls');
            const buffer = fs.readFileSync(kernelPath);

            TimeCraft.loadKernel(buffer, 'key');
            let caught = false;
            try {
                TimeCraft.loadKernel(buffer, 'key');
            } catch(err) {
                caught = true;
            }
            expect(caught).toBeTruthy();
            TimeCraft.unloadKernel('key');
        });

        it('should throw an error if unloading a key that hasn not been loaded', () => {
            let caught = false;
            try {
                TimeCraft.unloadKernel('key');
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

            TimeCraft.loadKernel(buffer, 'key');
            TimeCraft.loadKernel(buffer2, 'key2');
            TimeCraft.unloadKernel('key');
        });
    });

    describe('Spice', () => {
        let kernelPaths;
        beforeAll(() => {
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
                TimeCraft.loadKernel(buffer, p);
            });
        });

        it('should be able to get and set error reporting state', () => {
            expect(TimeCraft.Spice.erract('GET')).toEqual('DEFAULT');
            TimeCraft.Spice.erract('SET', 'IGNORE');
            expect(TimeCraft.Spice.erract('GET')).toEqual('IGNORE');

            expect(TimeCraft.Spice.errprt('GET')).toEqual('SHORT, LONG, EXPLAIN, TRACEBACK, DEFAULT');
            TimeCraft.Spice.errprt('SET', 'NONE');
            expect(TimeCraft.Spice.errprt('GET')).toEqual('');
            TimeCraft.Spice.errprt('SET', 'ALL');
            expect(TimeCraft.Spice.errprt('GET')).toEqual('SHORT, LONG, EXPLAIN, TRACEBACK');
        });

        it('should return expected values', () => {
            expect(TimeCraft.Spice.bodc2n(-76)).toEqual({ found: 1, name: 'MSL' });
            expect(TimeCraft.Spice.bodc2n(499)).toEqual({ found: 1, name: 'MARS' });
            expect(TimeCraft.Spice.bodn2c('MARS')).toEqual({ found: 1, code: 499 });
            expect(TimeCraft.Spice.et2utc(43523178.23, 'ISOC', 4)).toEqual('2001-05-19T05:45:14.0448');

            // et 2 lst
            expect(TimeCraft.Spice.et2lst(510593482.204611, 499, 0, 'planetocentric')).toEqual({
                hr: 3,
                mn: 58,
                sc: 32,
                time: '03:58:32',
                ampm: '03:58:32 A.M.',
            });

            // et 2 utc
            expect(TimeCraft.Spice.et2utc(510593482.204611, 'ISOC', 3)).toEqual('2016-03-07T03:30:14.019');

            // utc 2 et
            expect(parseFloat(TimeCraft.Spice.utc2et('2016-03-07T03:30:14.019').toFixed(3))).toEqual(510593482.204);

            // et 2 lmst
            expect(TimeCraft.Spice.sce2s(-76900, 510593482.204611)).toEqual('1/01274:12:44:53:49604');

            // et 2 sclk
            expect(TimeCraft.Spice.sce2s(-76, 510593482.204611)).toEqual('1/0510592221-24314');

            const sunPos = TimeCraft.Spice.spkpos('SUN', 510593482.204611, 'MSL_LOCAL_LEVEL', 'LT+S', 'MARS').ptarg;
            const maxVal = Math.max(...sunPos.map(v => Math.abs(v)));
            let sunDir = sunPos.map(v => v / maxVal);

            const dirLen = Math.sqrt(sunDir[0] ** 2 + sunDir[1] ** 2 + sunDir[2] ** 2);
            sunDir = sunDir.map(v => v / dirLen);

            expect(sunDir.map(v => parseFloat(v.toFixed(4)))).toEqual([0.4431, -0.2725, -0.8540]);
        });

        it('should perform chronos conversions.', () => {
            expect(TimeCraft.chronos('510593482.204611', '-from et -to utc -fromtype SECONDS')).toEqual('2016-03-07 03:30:14.019');
            expect(TimeCraft.chronos('510593482.204611', '-from et -to sclk -fromtype SECONDS -sc -76')).toEqual('1/0510592221-24314');
        });

        afterAll(() => {
            kernelPaths.forEach(p => {
                TimeCraft.unloadKernel(p);
            });
        });
    });
});
