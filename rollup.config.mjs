// rollup.config.js

import merge from 'deepmerge';
import terser from "@rollup/plugin-terser";
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';

import { readFileSync, readdirSync, writeFileSync } from 'fs';

const { main, module, browser, devDependencies } = JSON.parse(readFileSync('package.json'));
const env = process.env.NODE_ENV || 'development';

const updateMaplibreVersion = () => {
  const updateVersion = (fileContent) => {
    const maplibreVersion = devDependencies['maplibre-gl'].replace(/[\^~]/g, '');
    const regex = /https:\/\/unpkg\.com\/maplibre-gl@[^]?\d+\.\d+\.\d+\/dist\/maplibre-gl/g;
    const newVersionString = `https://unpkg.com/maplibre-gl@${maplibreVersion}/dist/maplibre-gl`;
    return fileContent.replace(regex, newVersionString);
  };
  readdirSync('./examples').map(item => {
    if (item.match(/.+?\.html/) && item !== 'indexv3.html') {
      const fileContent = readFileSync('./examples/' + item, { encoding: 'utf8', flag: 'r' });
      const newFileContent = updateVersion(fileContent);
      writeFileSync('./examples/' + item, newFileContent);
    }
  });
};
updateMaplibreVersion();

const baseConfig = {
  input: './src/index.ts',
  output: {
    name: 'VectorTextProtocol'
  },
  treeshake: env === 'production',
  plugins: [webWorkerLoader({
    'extensions': ['.ts']
  }), typescript(), nodeResolve(), commonjs(), json()]
};

const configs = [{
  environments: ['development', 'production'],
  output: {
    format: 'umd',
    file: main
  }
}, {
  environments: ['production'],
  output: {
    format: 'umd',
    file: browser,
    sourcemap: true
  },
  plugins: [terser()]
}, {
  environments: ['production'],
  output: {
    format: 'esm',
    file: module
  }
}]
  .filter(config => config.environments === undefined || config.environments.indexOf(env) > -1)
  .map(config => { delete config.environments; return config; })
  .map(config => merge(baseConfig, config));

console.log(configs);

export default configs;
