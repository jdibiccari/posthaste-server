const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 3700
const server = require('http').createServer(app)

// Require our models
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
io.on('connection', (socket) => {
	Message.find().sort('-created_at').limit().populate('user').then(messages => {
		socket.emit('init', {
			connections: connections,
			messages: messages
		})
	})

	require('./app/handlers/login')(socket, io, connections)
	require('./app/handlers/new_message')(socket, io)
	require('./app/handlers/disconnect')(socket, io, connections)
})




