var fs = require('fs')

var rmdir = module.exports = function(dirPath) {
  var files = fs.readdirSync(dirPath)
  if (files.length > 0)
    for (var i = 0; i < files.length; i++) {
      var filePath = dirPath + '/' + files[i]
      if (fs.statSync(filePath).isFile())
        fs.unlinkSync(filePath)
      else
        rmdir(filePath)
    }
  fs.rmdirSync(dirPath)
}
