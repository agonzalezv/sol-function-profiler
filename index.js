const fs = require('fs')
const asciiTable = require('ascii-table')
const parser = require('solidity-parser-antlr')

if (process.argv.length < 3) {
  console.log('Error: Missing argument for sol file to scan')
  process.exit(1)
}

const target = process.argv[2]

fs.readFile(target, 'utf8', (err, data) => {
  if (err) throw err
  try {
    generateReport(parser.parse(data))
  } catch (e) {
    if (e instanceof parser.ParserError) {
      console.log(e.errors)
    }
  }
})

function generateReport (contract) {
  const doc = contract.children
    .filter(child => child.type === 'ContractDefinition')
    .map(contract => ({
      name: contract.name,
      functions: contract.subNodes
      .filter(node => node.type === 'FunctionDefinition')
      .map(func => parseFunction(func))
    }))

  doc.map(contract => {
    const table = new asciiTable(target + ": " + contract.name)

    table.setHeading(
      'Function',
      'Visibility',
      'Mutability',
      'Modifiers',
      'Returns')

    contract.functions.map(
      func => table.addRow(
        `${func.name}(${func.params})`,
        func.visibility,
        func.mutability,
        func.modifiers,
        func.returns
      )
    )
    console.log(table.toString() + '\n')
  })

}

function parseFunction (node) {
  return {
    name: node.isConstructor ? 'constructor' : node.name || '',
    params: node.parameters.parameters
      .map(({ typeName }) => typeName.name || typeName.baseTypeName.namePath + "[]") || [],
    visibility: node.visibility || '',
    modifiers: node.modifiers
      .map(modifier => modifier.name) || [],
    mutability: node.stateMutability || '',
    returns: node.returnParameters && node.returnParameters.parameters
      .map(({ typeName }) => typeName.name || typeName.baseTypeName.name + "[]") || []
  }
}