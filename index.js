const fs = require('fs')
const asciiTable = require('ascii-table')
const parser = require('solidity-parser-antlr')

if (process.argv.length < 3) {
  console.log('Error: Missing argument for sol file to scan')
  process.exit(1)
}

const target = process.argv[2]
let contract

let table = new asciiTable(target)
table.setHeading(
  'Function',
  'Visibility',
  'Returns',
  'Modifiers'
)

fs.readFile(target, 'utf8', (err, data) => {
  if (err) throw err
  try {
    contract = parser.parse(data)
    generateReport(contract)
  } catch (e) {
    if (e instanceof parser.ParserError) {
      console.log(e.errors)
    }
  }
})

function generateReport (contract) {
  contract.children.forEach(function (part) {
    if (part.type == 'ContractDefinition') {
      part.subNodes.forEach(function (subNode) {
        if (subNode.type == 'FunctionDefinition') {
          const tbl = parseFunctionPart(subNode)
          table.addRow(
            tbl.function,
            tbl.visibility,
            tbl.returns,
            tbl.modifiers
          )
        }
      })
    }
  })
  console.log(table.toString())
}

function parseFunctionPart (subNode) {
  let funcName = subNode.name || ''
  let params = []
  let modifiers = []
  let returns = []

  if (subNode.isConstructor) {
    funcName = 'constructor'
  }

  if (subNode.parameters) {
    subNode.parameters.parameters.forEach(function (param) {
      params.push(param.name)
    })
    funcName += '(' + params.join(',') + ')'
  } else {
    funcName += '()'
  }

  if (subNode.returnParameters) {
    subNode.returnParameters.parameters.forEach(function (ret) {
      returns.push(ret.name || ret.typeName.name)
    })
  }

  if (subNode.modifiers) {
    subNode.modifiers.forEach(function (mod) {
      modifiers.push(mod.name)
    })
  }

  const visibility = subNode.visibility || 'default'

  return {
    function: funcName,
    visibility: visibility,
    returns: returns,
    modifiers: modifiers
  }
}
