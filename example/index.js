import * as Timecraft from '../src/index.js';

Promise.all([
    '../kernels/lsk/naif0012.tls',
    '../kernels/pck/pck00010.tpc',
    '../kernels/spk/de425s.bsp',
].map( p => fetch( p ).then( res => res.arrayBuffer() ) ) )
    .then( buffers => {

        window.Timecraft = Timecraft;

        buffers.forEach( buffer => {

            Timecraft.loadKernelFromBuffer( buffer );
        
        } );
        // console.log( buffers );


    } );