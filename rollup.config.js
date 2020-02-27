import resolve from 'rollup-plugin-node-resolve';
import ts from 'rollup-plugin-typescript2';
import glsl from 'rollup-plugin-glsl';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';

const BUNDLE_NAME = 'bundle.js';

export default {
  input: './src/app.ts',
  output: {
    file: `dist/js/${BUNDLE_NAME}`,
    format: 'iife'
  },
  plugins: [
    resolve(),
    glsl({
      include: './src/shaders/**/*.glsl',
      compress: true
    }),
    ts(),
    copy({
      targets: [{
        src: './src/public/index.html',
        dest: './dist',
        transform: (ctn) => ctn.toString().replace('__SCRIPT__', `/js/${BUNDLE_NAME}`)
      }]
    }),
    terser()
  ]
};
