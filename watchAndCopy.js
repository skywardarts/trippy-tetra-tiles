var fs = require('fs-extra');
var watch = require('node-watch');
var rimraf = require('rimraf');
var exec = require('child_process').exec;

var packageName = 'nextgen';
var packagePath = '/ude/em/repos/'+packageName;

console.log('Cleaning node_modules/'+packageName)
rimraf('node_modules/'+packageName, function () {
  console.log('Copying '+packageName)
  fs.copy(packagePath, 'node_modules/'+packageName, function (err) {
    if (err) return console.error(err)
  })

  // Couldn't get rimraf to delete .git via function call.
  // This seems to work, though.
  exec('rimraf node_modules/'+packageName+'/.git', function () {
    console.log('Watching '+packageName)
    watch(packagePath, function(filename) {
      var localPath = filename.split(packageName).pop()
      var destination = 'node_modules/'+packageName+localPath
      console.log('Copying '+filename+' to '+destination)
      fs.copy(filename, destination, function (err) {
        if (err) return console.error(err)
      })
    })
  })
})