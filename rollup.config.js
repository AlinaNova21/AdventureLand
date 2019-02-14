// rollup.config.js
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import rootImport from 'rollup-plugin-root-import'
import upload from './upload'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
  },
  plugins: [
    rootImport({
      root: `${__dirname}/src`,
      useEntry: 'prepend',
      extensions: '.js'
    }),
    commonjs(),
    resolve({
      module: true
    }),
    upload()
  ]
}
