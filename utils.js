const fs = require('fs')

function getAllFiles (dir) {
  var filesystem = require('fs')
  var results = []

  filesystem.readdirSync(dir).forEach(function (file) {
    file = dir + '/' + file
    var stat = filesystem.statSync(file)

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(file))
    } else results.push(file)
  })

  return results
}

function recreateFolder (path) {
  deleteFolderRecursive(path)
  try {
    fs.mkdirSync(path)
  } catch (e) {
    throw e
  }
}

function deleteFolderRecursive (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + '/' + file
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(path)
  }
}

module.exports = {
  getAllFiles,
  recreateFolder,
  deleteFolderRecursive
}
