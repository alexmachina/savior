const fetch = require('node-fetch')


function url (ip, port, dbId) {
  return `http://${ip}:${port}/databases/${dbId}`
}

function body (fileId, link) {
  return JSON.stringify({ fileId, link })
  
}

function headers() {
  return  {
    'Content-Type': 'application/json',
    'Accept': 'application/json' 
  }
}

module.exports = function (dbId, fileId, link) {
  return new Promise((resolve, reject) => {
    console.log(body(fileId))

    fetch(url 
      (process.env.IP, process.env.PORT, dbId), {
      headers: headers(),
      body: body(fileId, link),
      method : "PATCH"
    }).then(response => response.text())
      .then(text => {
          resolve(text)
      })
  })

}
