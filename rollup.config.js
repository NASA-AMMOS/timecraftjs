import path from 'path';

export default {
    input: path.resolve(__dirname, 'src', 'index.js'),
    output: {
        dir: path.resolve(__dirname, 'cjs'),
        format: 'commonjs',
        preserveModules: true,
    },
};
