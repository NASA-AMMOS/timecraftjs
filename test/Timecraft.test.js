const fs = require('fs');
const path = require('path');
const TimeCraft = require('../cjs/index.js');

describe('TimeCraft', () => {
    describe('parseMetakernel', () => {
        it('should parse metakernal fields.', () => {
            const metaPath = path.resolve(__dirname, '../kernels/extras/mk/msl_chronos_v07.tm');
            const contents = fs.readFileSync(metaPath, { encoding: 'utf8' });
            const data = TimeCraft.parseMetakernel(contents);

            expect(data).toEqual( {
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

            const paths = TimeCraft.getMetakernelPaths(contents);
            expect(paths).toEqual([
                './data/lsk/naif0012.tls',
                './data/sclk/msl_76_sclkscet_00016.tsc',
                './data/sclk/msl_lmst_ops120808_v1.tsc',
                './data/pck/pck00008.tpc',
                './data/spk/de425s.bsp',
                './data/spk/msl_cruise_v1.bsp',
                './data/spk/msl_edl_v01.bsp',
                './data/spk/msl_ls_ops120808_iau2000_v1.bsp',
                './data/spk/msl_atls_ops120808_v1.bsp',
                './data/fk/msl_v08.tf'
            ]);
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

        it('should return expected values', () => {
            expect(TimeCraft.Spice.bodc2n(-76)).toEqual({ found: 1, name: 'MSL' });
            expect(TimeCraft.Spice.bodc2n(499)).toEqual({ found: 1, name: 'MARS' });
            expect(TimeCraft.Spice.bodn2c('MARS')).toEqual({ found: 1, code: 499 });
            expect(TimeCraft.Spice.et2utc(43523178.23, 'ISOC', 4)).toEqual('2001-05-19T05:45:14.0448');
        });

        afterAll(() => {
            kernelPaths.forEach(p => {
                TimeCraft.unloadKernel(p);
            });
        });
    });
});
