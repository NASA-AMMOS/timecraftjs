import * as TimeCraft from '../src/index.js';
window.TimeCraft = TimeCraft;

( async function() {

    const buffers = await Promise.all([
        // kernels from
        // https://naif.jpl.nasa.gov/pub/naif/pds/data/msl-m-spice-6-v1.0/mslsp_1000/extras/mk/msl_chronos_v07.tm
        '../kernels/lsk/naif0012.tls',
        '../kernels/spk/de425s.bsp',

        // '../kernels/sclk/msl_76_sclkscet_00016.tsc',
        '../kernels/sclk/msl_lmst_ops120808_v1.tsc',

        '../kernels/pck/pck00008.tpc',

        // '../kernels/spk/msl_cruise_v1.bsp',
        // '../kernels/spk/msl_edl_v01.bsp',
        '../kernels/spk/msl_ls_ops120808_iau2000_v1.bsp',
        '../kernels/spk/msl_atls_ops120808_v1.bsp',

        '../kernels/fk/msl_v08.tf',
    ].map( p => fetch( p ).then( res => res.arrayBuffer() ) ) );

    buffers.forEach( buffer => {

        TimeCraft.loadKernel( buffer );

    } );

    const utcEl = document.querySelector('[name="utc"]');
    const etEl = document.querySelector('[name="et"]');
    const lstEl = document.querySelector('[name="mars lst"]');
    const lmstEl = document.querySelector('[name="msl lmst"]');
    const sclkEl = document.querySelector('[name="msl sclk"]');
    const sunEl = document.querySelector('[name="msl sun direction"]');

    setInterval(() => {

        let utc = new Date().toISOString();
        utc = utc.slice(0, utc.length - 1);

        const et = TimeCraft.Spice.utc2et(utc);

        const lst = TimeCraft.Spice.et2lst(et, 499, 0, 'planetocentric');

        const lmst = TimeCraft.Spice.sce2s(-76900, et);

        const sclk = TimeCraft.Spice.sce2c(-76900, et);

        const sunPos = TimeCraft.Spice.spkpos('SUN', et, 'MSL_TOPO', 'LT+S', '-76').ptarg;
        let sunDir = sunPos.map(e => e / sunPos[0]);
        let sunLen = Math.sqrt(sunDir[0]**2 + sunDir[1]**2 + sunDir[2]**2);
        sunDir[0] /= sunLen;
        sunDir[1] /= sunLen;
        sunDir[2] /= sunLen;

        utcEl.childNodes[0].textContent = utc;
        etEl.childNodes[0].textContent = et;
        lstEl.childNodes[0].textContent = lst.time;
        lmstEl.childNodes[0].textContent = lmst;
        sclkEl.childNodes[0].textContent = sclk;
        sunEl.childNodes[0].textContent = `${sunDir[0].toFixed(4)}, ${sunDir[1].toFixed(4)}, ${sunDir[2].toFixed(4)}`;

    }, 100);

} )();
