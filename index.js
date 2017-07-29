const fs = require('fs')

const crypto = require('crypto')
const fetch = require('node-fetch')
const querystring = require('querystring')
const base64url = require('base64-url')
const { spawn } = require('child_process')
require('dotenv').config()

function generateAuthTokenAndPrivKeyFile() {
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

    console.log(body.exp)


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
        response.text().then(text => console.log(text))
      }
    })

  })
}

function generateDump() {
  return new Promise((resolve, reject) => {
    const con = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      db: process.env.DB_NAME
    },
      mongodump = spawn('mongodump', [
        '--host', con.host,
        '--port', con.port,
        '--username', con.username,
        '--password', con.password,
        '--db',con.db
      ])

    mongodump.stdout.on('data', data => console.log(data)) 

    mongodump.stderr.on('data', data => reject(data.toString()))

    mongodump.on('close', code => {
      console.log(`Dump generated TALVEZ. Exit code ${code}`)
      resolve()

    })
  })
}

function createTarball() {
  return new Promise((resolve, reject) => {
    const tar = spawn('tar', [
      '-zcvf', 'dump.tar.gz', './dump/mflores'
    ])

    tar.stderr.on('data', data => reject(data.toString()))

    tar.stdout.on('data', data => console.log(data.toString()))

    tar.on('close', code => {
      console.log('Finished tarballing dump')
      resolve()
    })
  })
}

createTarball().then(() => console.log('foi'))
  .catch(err => console.log(err))


