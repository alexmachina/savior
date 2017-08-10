const fetchToken = require('./functions/fetchToken'),
  createTarball = require('./functions/createTarball'),
  generateDump = require('./functions/generateDump'),
  sendFile = require('./functions/sendFile'),
  server = require('./server.js'),
  readDBs = require('./functions/readDBs.js'),
  cron = require('node-cron')
  
require('dotenv').config()

async function run() {
  try {
    await server(process.env.PORT)
    const token = await fetchToken()
      , dbs = await readDBs()

    let proms = []
    dbs.forEach(db => {
      proms.push(new Promise( (resolve, reject) => {
        generateDump(db)
          .then(dump_path => createTarball(dump_path))
          .then(tarball_path => sendFile(token, tarball_path, db))
          .then(() => resolve())
      }))

      Promise.all(proms).then(() => {
        console.log('Acabou')
      })


    })

  } catch (ex) {
    console.error(ex.message)
  }
}
console.log('scheduling database task')
cron.schedule('01 00 * * *', function () { 
  console.log('Running database backup...')
  run()
})
