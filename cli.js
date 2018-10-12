#! /usr/bin/env node

const fs = require('fs')
const profiler = require('./index.js')
const argv = require('yargs').argv

if (argv.dir) {
  // is a directory?
  profiler.generateReportForDir(argv.dir)
} else {
  // is a single contract?
  let arg_index = argv._.length - 1
  let filepath = argv._[arg_index] // argv puts the final arguments in an array named "_"

  if (!filepath) {
    console.log('usage: --dir <dir> or path to .sol file')
    process.exit(1)
  }
  let contract
  try {
    contract = fs.readFileSync(filepath, 'utf8')
  } catch (e) {
    throw e
  }
  profiler.generateReport(filepath, contract)
}
