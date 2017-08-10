const crypto = require('crypto'),
  fetch = require('node-fetch'),
  querystring = require('querystring'),
  base64url = require('base64-url'),
  fs = require('fs')

function generateTokenRequest() {
  return new Promise((resolve, reject) => {
    const header = {alg: 'RS256',typ: 'JWT'}
    fs.readFile('private_key.json', 'utf8', (err, file) => {
      if (err)
        return reject(err)

      const priv_key_file = JSON.parse(file),
        body = {
          iss: priv_key_file.client_email,
          scope: 'https://www.googleapis.com/auth/drive',
          aud: 'https://www.googleapis.com/oauth2/v4/token',
          exp: (Date.now() / 1000 | 0) + 1000,
          iat: (Date.now() / 1000 | 0)
        },

        base64Header = base64url.encode(JSON.stringify(header))
      base64Body = base64url.encode(JSON.stringify(body))
      sign = crypto.createSign('RSA-SHA256')

      sign.update(`${base64Header}.${base64Body}`)

      const signature = sign.sign(priv_key_file.private_key, 'base64'),
        auth_payload = `${base64Header}.${base64Body}.${signature}`

      resolve({auth_payload, priv_key_file})

    })
  })

}

function fetchAuthToken(auth_payload, priv_key_file) {
  return new Promise((resolve, reject) => {
    const url = 'https://www.googleapis.com/oauth2/v4/token'
    grant_type = 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      body = `grant_type=${querystring.escape(grant_type)}&assertion=${base64url.escape(auth_payload)}`
    headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/x-www-form-urlencoded'
    }


    fetch(url, {
      method:'POST',
      body,
      headers,
    }).then(response => {
      if(response.ok){
        response.json().then(token =>{
          resolve(token)
        })
      }
      else {
        response.text().then(text => reject(text))
      }
    })

  })
}

function refreshToken() {
  fs.readFile('private_key.json', 'utf8', (err, file) => {
    const data = JSON.parse(file).web,
      body = `client_id=${data.client_id},
              client_secret=${data.client_secret},
              refresh_token=${process.env.REFRESH_TOKEN}
              grant_type=refresh_token`


  })
}

module.exports = function() { 
  return new Promise((resolve, reject) => {
    generateTokenRequest().then(result => {
      const {auth_payload, priv_key_file} = result
        fetchAuthToken(auth_payload, priv_key_file).then(token => resolve(token))
        .catch(err => reject(err))
    })
  })
}

