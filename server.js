const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 3700
const server = require('http').createServer(app)

// Require our models
const User = require('./app/models').User
const Message = require('./app/models').Message

// Connect to database
mongoose.Promise = require('bluebird')
mongoose.connect('mongodb://posthaste:posthaste@ds017726.mlab.com:17726/posthaste', (err) => {
	if (err) throw err
})

// Socket.io setup
const io = require('socket.io')(server)

// App configuration
app.use(express.static(path.join(__dirname,'/public')))

server.listen(port, () => {
	console.log(`Listening on port ${port}`)
})

// Socket.io events
const connections = []
const messages = []

io.on('connection', (socket) => {
	Message.find().sort('-created_at').limit(10).populate('user').then(messages => {
		socket.emit('init', {
			connections: connections,
			messages: messages
		})
	})

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
			io.sockets.emit('notify', connections)
			io.sockets.emit('update count', connections.length)
		}).catch(err => {
			console.log(err)
		})
	})

  socket.on('new msg', (msg) => {
	if (socket.user) {
		const newMsg = new Message({ user: socket.user._id, msg: msg })
		newMsg.save().then(msg => {
			return Message.populate(msg, {path:'user'})
		}).then(msg => {
			io.sockets.emit('new msg', msg)
		})
	} else {
		console.log('no user specified')
	}
  })

  socket.on('disconnect', () => {
	if (socket.user) {
		const index = connections.indexOf(socket.user)
		connections.splice(index, 1)
		io.sockets.emit('notify', connections)
		io.sockets.emit('update count', connections.length)
	}

  })
})




