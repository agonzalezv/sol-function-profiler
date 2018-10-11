#! /usr/bin/env node

const fs = require('fs')
const profiler = require('./index.js')
const argv = require('yargs').argv
const parser = require('solidity-parser-antlr')

if (argv.dir) {
  // is a directory?
  profiler.generateReportForDir(argv.dir)
} else {
  // is a single contract?
  let arg_index = argv._.length - 1
  let filepath = argv._[arg_index] // argv puts the final arguments in an array named "_"
  try {
    contract = fs.readFileSync(filepath, 'utf8')
    try {
      const parsedContract = parser.parse(contract)
      profiler.generateReport(filepath, parsedContract)
    } catch (e) {
      if (e instanceof parser.ParserError) {
        console.log(e.errors)
      }
    }
  } catch (e) {
    throw e
  }
}
