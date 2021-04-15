const fs = require('fs');
const path = require('path');
const { arrayIndexOf, isMetakernel, parseMetakernel } = require('../cjs/utils.js');

describe('arrayIndexOf', () => {
    it('should fail if the target is larger than the source.', () => {
        expect(arrayIndexOf([1,1,1], [1,1,1,1])).toEqual(-1);
    });

    it('should return the correct index.', () => {
        expect(arrayIndexOf([1,1,1], [1,1])).toEqual(0);
        expect(arrayIndexOf([2,1,1,1], [1,1])).toEqual(1);
        expect(arrayIndexOf([1,1,1,4,1], [1,4])).toEqual(2);
    });
});

describe('isMetakernel', () => {
    it('should return true if a metakernel is detected.', () => {
        const encoded = new TextEncoder('utf-8').encode('__KERNELS_TO_LOAD')
        expect(isMetakernel('__KERNELS_TO_LOAD')).toEqual(true);
        expect(isMetakernel(encoded)).toEqual(true);

        const metaPath = path.resolve(__dirname, '../kernels/extras/mk/msl_chronos_v07.tm');
        let bufferContents = new Uint8Array(fs.readFileSync(metaPath));
        let strContents = fs.readFileSync(metaPath, { encoding: 'utf-8' });
        expect(isMetakernel(bufferContents)).toEqual(true);
        expect(isMetakernel(strContents)).toEqual(true);

        const kernelPath = path.resolve(__dirname, '../kernels/sclk/msl_76_sclkscet_00016.tsc');
        bufferContents = new Uint8Array(fs.readFileSync(kernelPath));
        strContents = fs.readFileSync(kernelPath, { encoding: 'utf-8' });
        expect(isMetakernel(bufferContents)).toEqual(false);
        expect(isMetakernel(strContents)).toEqual(false);
    });
});

describe('parseMetakernel', () => {
    it('should parse a buffer the same as a string.', () => {
        const metaPath = path.resolve(__dirname, '../kernels/extras/mk/msl_chronos_v07.tm');
        const strContents = fs.readFileSync(metaPath, { encoding: 'utf8' });
        const bufferContents = fs.readFileSync(metaPath);
        expect(
            parseMetakernel(strContents),
        ).toEqual(
            parseMetakernel(bufferContents),
        );
    });

    it('should parse metakernal fields.', () => {
        const metaPath = path.resolve(__dirname, '../kernels/extras/mk/msl_chronos_v07.tm');
        const contents = fs.readFileSync(metaPath, { encoding: 'utf8' });
        const data = parseMetakernel(contents);

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
