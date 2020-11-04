import * as Timecraft from '../src/index.js';

( async function() {

    const buffers = await Promise.all([
        '../kernels/lsk/naif0012.tls',
        '../kernels/pck/pck00010.tpc',
        '../kernels/spk/de425s.bsp',

        // https://naif.jpl.nasa.gov/pub/naif/pds/data/msl-m-spice-6-v1.0/mslsp_1000/data/fk/msl_v08.tf
        '../kernels/msl_v08.tf',

        // https://naif.jpl.nasa.gov/pub/naif/MSL/kernels/sclk/msl_lmst_gc120806_v2.tsc
        '../kernels/msl_lmst_gc120806_v2.tsc',
    ].map( p => fetch( p ).then( res => res.arrayBuffer() ) ) );

    buffers.forEach( buffer => {

        Timecraft.loadKernelFromBuffer( buffer );

    } );

    window.Timecraft = Timecraft;
    const utcEl = document.querySelector('[name="utc"]');
    const etEl = document.querySelector('[name="et"]');
    const lstEl = document.querySelector('[name="mars lst"]');
    const lmstEl = document.querySelector('[name="msl lmst"]');
    const sclkEl = document.querySelector('[name="msl sclk"]');

    setInterval(() => {

        let utc = new Date().toISOString();
        utc = utc.slice(0, utc.length - 1);

        const et = Timecraft.Spice.utc2et(utc);

        const lst = Timecraft.Spice.et2lst(et, 499, 0, 'planetocentric');

        const lmst = Timecraft.Spice.sce2s(-76900, et);

        const sclk = Timecraft.Spice.sce2c(-76900, et);

        // TODO: We need to other kernels for this?
        // const sunPos = Timecraft.Spice.spkpos('SUN', et, 'MSL_TOPO', 'LT+S', 'earth')
        // console.log( sunPos )

        utcEl.childNodes[0].textContent = utc;
        etEl.childNodes[0].textContent = et;
        lstEl.childNodes[0].textContent = lst.time;
        lmstEl.childNodes[0].textContent = lmst;
        sclkEl.childNodes[0].textContent = sclk;

    }, 100);

} )();
