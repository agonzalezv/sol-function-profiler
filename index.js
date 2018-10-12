const fs = require('fs')
const asciiTable = require('ascii-table')
const parser = require('solidity-parser-antlr')
const getAllFiles = require('./utils.js').getAllFiles

let contract
let parsedContract

function generateReportForDir (dir) {
  const files = getAllFiles(dir)
  files
    .filter(filepath => filepath.split('.').pop() == 'sol')
    .forEach(filepath => {
      // console.log(`Report for ${filepath}`)
      try {
        contract = fs.readFileSync(filepath, 'utf8')
        generateReport(filepath, contract)
      } catch (e) {
        console.log(`Error reading contract ${contract} :`, e)
      }
    })
}

function generateReport (filepath, contract) {
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
              functionRows.push(parseFunction(subNode))
              break
            // Contract Events
            case 'EventDefinition':
              eventRows.push(parseEvent(subNode))
              break
            // Contract Modifiers
            case 'ModifierDefinition':
              modifierRows.push(parseModifier(subNode))
              break
          }
        }
        break
      // Contract Imports
      case 'ImportDirective':
        importRows.push(parseImport(node))
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

  console.log(generalInfoTable.toString())
  if (importRows.length > 0) {
    console.log(importTable.toString())
  }
  if (functionRows.length > 0) {
    console.log(functionTable.toString())
  }
  if (modifierRows.length > 0) {
    console.log(modifierTable.toString())
  }
  if (eventRows.length > 0) {
    console.log(eventTable.toString())
  }
}

// builds function report table
function parseFunction (subNode) {
  let params
  let returns
  let modifiers
  let funcName = subNode.name || ''
  // function visibility (e.g public, external...)
  const visibility = subNode.visibility || 'default'

  if (subNode.isConstructor) {
    funcName += 'constructor'
  }
  // add parameters to the function name
  if (subNode.parameters && subNode.parameters.parameters) {
    params = subNode.parameters.parameters.map(function (param) {
      return param.name
    })
    funcName += '(' + params.join(', ') + ') '
  } else {
    funcName += '() '
  }

  // add payable to function name
  funcName += subNode.stateMutability || ''

  // adds returns
  if (subNode.returnParameters && subNode.returnParameters.parameters) {
    // parameter name of parameter type if unnamed (e.g boolean)
    returns = subNode.returnParameters.parameters.map(function (ret) {
      return ret.name || ret.typeName.name
    })
  }

  // add modifiers
  if (subNode.modifiers) {
    modifiers = subNode.modifiers.map(function (mod) {
      return mod.name
    })
  }

  return [funcName, visibility, returns, modifiers]
}

// builds event report table
function parseEvent (subNode) {
  let funcName = subNode.name || ''
  let params

  // add parameters to the function name
  if (subNode.parameters && subNode.parameters.parameters) {
    params = subNode.parameters.parameters.map(function (param) {
      return param.name
    })
    funcName += '(' + params.join(', ') + ') '
  } else {
    funcName += '() '
  }
  return funcName
}

function parseModifier (subNode) {
  let funcName = subNode.name || ''
  let params

  // add parameters to the function name
  if (subNode.parameters && subNode.parameters.parameters) {
    params = subNode.parameters.parameters.map(function (param) {
      return param.name
    })
    funcName += '(' + params.join(', ') + ') '
  } else {
    funcName += '() '
  }
  return funcName
}

function parseImport (subNode) {
  let funcName = subNode.path || ''
  return funcName
}

module.exports = {
  generateReport,
  generateReportForDir
}
