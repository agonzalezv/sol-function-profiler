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
  parseFunction,
  parseEvent,
  parseModifier,
  parseImport
}
