const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 3700
const server = require('http').createServer(app)
const routes = require('./app/routes')
// Require our models
const User = require('./app/models').User
const Message = require('./app/models').Message

// Connect to database
mongoose.Promise = require('bluebird')
mongoose.connect('mongodb://localhost/posthaste', (err) => {
  if (err) throw err
})

// Socket.io setup
const io = require('socket.io')(server)

// Static folder setup
app.use(express.static(path.join(__dirname,'/public')))

// Set up router
app.use('/', routes)


server.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

const connections = []
// Socket.io events
io.on('connection', (socket) => {
  socket.on('login', (username) => {
    var promise = User.findOne({ username: username }).exec()

    promise.then(user => {
      if (!user) {
        const newUser = new User({ username: username })
        return newUser.save()
      }
      return user
    }).then(user => {
      socket.user = user
      connections.push(user)
      const notification = `${user.username} has logged in`
      io.sockets.emit('notify', notification)
      io.sockets.emit('update count', connections.length)
    }).catch(err => {
      console.log(err)
    })
  })

  // New message arrives -- timestamp and push to clients
  socket.on('new msg', (msg) => {
    console.log(socket.user)
    const newMsg = new Message({ user: socket.user._id, msg: msg })
    newMsg.save().then(msg => {
      io.sockets.emit('new msg', msg, socket.user.username)
    })
  })

  socket.on('disconnect', () => {
    console.log(socket)
    if (socket.user) {
      notification = `${socket.user.username} has disconnected`
      const index = connections.indexOf(socket.user)
      console.log(index)
      connections.splice(index, 1)
      io.sockets.emit('notify', notification)
      io.sockets.emit('update count', connections.length)
    }

  })
})




