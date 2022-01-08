// rollup.config.js

import merge from 'deepmerge';
import { terser } from "rollup-plugin-terser";
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import fs from 'fs';

const name = JSON.parse(fs.readFileSync('package.json')).name;
const env = process.env.NODE_ENV  || 'development';

const baseConfig = {
  input: './src/index.ts',
  output: {
    name: 'VectorTextProtocol'
  },
  treeshake: env === 'production',
  plugins: [typescript(), nodeResolve(), commonjs()]
};

const configs = [{
  environments: ['development', 'production'],
  output: {
    format: 'umd',
    file: `./dist/${name}.js`
  }
}, {
  environments: ['production'],
  output: {
    format: 'umd',
    file: `./dist/${name}.min.js`,
    sourcemap: true
  },
  plugins: [terser()]
}, {
  environments: ['production'],
  output: {
    format: 'esm',
    file: `./dist/${name}.es.js`
  }
}]
  .filter(config => config.environments === undefined || config.environments.indexOf(env) > -1)
  .map(config => {delete config.environments; return config;})
  .map(config => merge(baseConfig, config));

console.log(configs);

export default configs;