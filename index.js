const fs = require('fs')
const path = require('path')
const asciiTable = require('ascii-table')
const parser = require('solidity-parser-antlr')
const utils = require('./utils.js')
const report = require('./parsers')

let contract
let parsedContract

function generateReportForDir (dir) {
  const files = utils.getAllFiles(dir)
  files
    .filter(filepath => filepath.split('.').pop() === 'sol')
    .forEach(filepath => {
      try {
        contract = fs.readFileSync(filepath, 'utf8')
        generateReport(filepath, contract)
      } catch (e) {
        console.log(`Error reading contract ${contract} :`, e)
      }
    })
}

function generateReport (filepath, contract) {
  // write output to file
  let filename = path.basename(filepath)
  let reportName = `./output/${filename}.md`
  let writeStream = fs.createWriteStream(reportName)

  try {
    parsedContract = parser.parse(contract)
  } catch (e) {
    if (e instanceof parser.ParserError) {
      console.log(e.errors)
    }
  }

  let functionRows = []
  let eventRows = []
  let modifierRows = []
  let importRows = []
  let contractInfo = ''
  for (const node of parsedContract.children) {
    const type = node.type
    switch (type) {
      // Contract solidity version
      case 'PragmaDirective':
        const contractPragma = node.name
        const contractPragmaVersion = node.value
        contractInfo += `pragma ${contractPragma} ${contractPragmaVersion}`
        break
      // Contract name and type
      case 'ContractDefinition':
        const contractName = node.name
        const contractType = node.kind
        contractInfo += ` ${contractType} ${contractName}`
        for (const subNode of node.subNodes) {
          switch (subNode.type) {
            // Contract Functions
            case 'FunctionDefinition':
              functionRows.push(report.parseFunction(subNode))
              break
            // Contract Events
            case 'EventDefinition':
              eventRows.push(report.parseEvent(subNode))
              break
            // Contract Modifiers
            case 'ModifierDefinition':
              modifierRows.push(report.parseModifier(subNode))
              break
          }
        }
        break
      // Contract Imports
      case 'ImportDirective':
        importRows.push(report.parseImport(node))
        break
    }
  }

  let generalInfoTable = asciiTable.factory({
    heading: [contractInfo],
    rows: [filepath]
  })

  let functionTable = asciiTable.factory({
    title: 'functions',
    heading: ['name', 'visibility', 'return', 'modifiers'],
    rows: functionRows
  })

  let eventTable = asciiTable.factory({
    heading: ['events'],
    rows: eventRows
  })

  let modifierTable = asciiTable.factory({
    heading: ['modifiers'],
    rows: modifierRows
  })

  let importTable = asciiTable.factory({
    heading: ['imports'],
    rows: importRows
  })

  // very fancy markdown ;)
  writeStream.write('```' + '\r\n')

  writeStream.write(generalInfoTable.toString() + '\r\n')

  if (importRows.length > 0) {
    writeStream.write(importTable.toString() + '\r\n')
  }

  if (functionRows.length > 0) {
    writeStream.write(functionTable.toString() + '\r\n')
  }

  if (modifierRows.length > 0) {
    writeStream.write(modifierTable.toString() + '\r\n')
  }

  if (eventRows.length > 0) {
    writeStream.write(eventTable.toString() + '\r\n')
  }

  writeStream.write('```' + '\r\n')

  // the finish event is emitted when all data has been flushed from the stream
  writeStream.on('finish', function () {
    console.log(`written ${reportName}`)
  })

  // close the stream
  writeStream.end()
}

module.exports = {
  generateReport,
  generateReportForDir
}
