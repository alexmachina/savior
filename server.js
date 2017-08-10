const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(router)

module.exports = function(port) {
  return new Promise((resolve, reject) => {

    server.listen(port, () => {
      console.log('JSON Server is running on port ' + port)
      resolve()
    })
  })
}
