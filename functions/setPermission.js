const fetch = require('node-fetch')

function permissionUrl(fileId) {
  return `https://www.googleapis.com/drive/v2/files/${fileId}/permissions`
}
module.exports = function setPermission(token, fileId) {
  return new Promise((resolve, reject) => {
    const url = permissionUrl(fileId),
      headers = {
        'Accept' : 'application/json',
        'Content-Type' : 'application/json',
        'Authorization' : `Bearer ${token.access_token}`

        
      },
      body = {
        role: 'reader',
        type: 'anyone',
      },
      method = 'POST'

    fetch(url, {
      headers,
      body: JSON.stringify(body),
      method,

    }).then(response => response.json())
      .then(permission => resolve(permission))
  })
}
