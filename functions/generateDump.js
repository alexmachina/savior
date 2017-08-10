const { spawn } = require('child_process')
require('dotenv').config()
module.exports = function generateDump(db) {
  return new Promise((resolve, reject) => {
    const mongodump = spawn('mongodump', [
      '--host', db.host,
      '--port', db.port,
      '--username', db.username,
      '--password', db.password,
      '--db', db.db
    ])

    mongodump.stdout.on('data', data => console.log('hi'))

    //Strange, this function shows the natural output of the command
    //instead of errors. 
    mongodump.stderr.on('data', data => console.log(data.toString()))

    mongodump.on('close', code => {
      console.log(`dump command Exit code: ${code}`)
      resolve('dump')

    })
  })
}
