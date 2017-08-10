const { spawn } = require('child_process')

function createTarball() {
  return new Promise((resolve, reject) => {
    const tar = spawn('tar', [
      '-zcvf', 'dump.tar.gz', './dump/mflores'
    ])

    tar.stderr.on('data', data => reject(data.toString()))

    tar.stdout.on('data', data => console.log(data.toString()))

    tar.on('close', code => {
      console.log('Finished tarballing dump')
      resolve('dump.tar.gz')
    })
  })
}

module.exports = createTarball

