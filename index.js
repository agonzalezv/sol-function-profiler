const fs = require('fs')
const asciiTable = require('ascii-table')
const parser = require('solidity-parser-antlr')

if (process.argv.length < 3) {
  console.log('Error: Missing argument for .sol file to scan')
  process.exit(1)
}

const target = process.argv[2]
let contract
let parsedContract

try {
  contract = fs.readFileSync(target, 'utf8')
} catch (e) {
  throw e
}

try {
  parsedContract = parser.parse(contract)
  generateReport(parsedContract)
} catch (e) {
  if (e instanceof parser.ParserError) {
    console.log(e.errors)
  }
}

function generateReport (contract) {
  let functionRows = []
  let eventRows = []
  let modifierRows = []
  let importRows = []
  let contractInfo = ''
  for (const node of contract.children) {
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
    rows: [target]
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
  console.log(importTable.toString())
  console.log(functionTable.toString())
  console.log(modifierTable.toString())
  console.log(eventTable.toString())
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
