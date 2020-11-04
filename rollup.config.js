import commonjs from '@rollup/plugin-commonjs';
import builtins from 'rollup-plugin-node-builtins';

export default {
    input: 'example/index.js',
    output: {
        dir: 'example/bundle',
        format: 'iife'
    },
};
