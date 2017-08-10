const FormData = require('form-data'),
  moment = require('moment'),
  path = require('path'),
  fs = require('fs'),
  fetch = require('node-fetch'),
  appendFileId = require('./appendFileId'),
  setPermission = require('./setPermission')

module.exports = function(token, filename, db) {
  return new Promise((resolve, reject) => {
    const content_length = fs.statSync('dump.tar.gz').size,
      url = 
        db.fileId ? `https://www.googleapis.com/upload/drive/v2/files/${db.fileId}`
        : 'https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart',
      method = db.fileId ? 'PUT' : 'POST',

      headers = {
        'Content-Type': db.fileId ? 'application/gzip' : 'multipart/related; boundary=foo_bar',
        'Content-Length': content_length,
        'Authorization': `Bearer ${token.access_token}`
      },
      readStream = fs.createReadStream('dump.tar.gz')
    let body = null, gzip_data = null
    


    readStream.on('data', data => {
      gzip_data += data
    })

    readStream.on('end', () => {
      body = db.fileId ? gzip_data
        :
`--foo_bar
Content-Type: application/json; charset=UTF-8

{
   "title": "${db.db}"
}

--foo_bar
Content-Type: application/gzip

${gzip_data}
--foo_bar--`
      headers['Content-Length'] = Buffer.byteLength(body, 'utf8')
      console.log(`method: ${method}`)

      fetch(url, {
        body,
        headers,
        method
      }).then(response => response.json())
        .then(fileData => {
          console.log(fileData)
          if (!db.fileId) {
          console.log('appending fileId')
            appendFileId(db.id, fileData.id, fileData.webContentLink).then((text) => {
              console.log('setting permissions')
              setPermission(token, fileData.id).then(permission => {
                console.log(permission)
              resolve(permission)
              })
            }).catch(err => reject(err))
          } else {
            console.log(`${db.db} file updated`)
            resolve()
          }
        }).catch(err => reject(err))

    })
  })
}
