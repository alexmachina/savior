const fs = require('fs')

module.exports = function () {
  return new Promise((resolve, reject) => {
    fs.readFile('db.json', 'utf8', (err, db) => {
      if (err)
        return reject(err)

      const dbList = JSON.parse(db).databases

      resolve(dbList)
    })
  })
}
